import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { Lock, ArrowLeft, ShieldAlert, Key } from 'lucide-react';
import { NivelAcesso } from '../../types/auth';
import { NIVEIS_INFO } from '../../types/document';
import { SecurityBadge } from '../../components/SecurityBadge/SecurityBadge';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');
  const [actionId, setActionId] = useState('');

  const state = location.state as {
    docId?: string;
    docCodigo?: string;
    docTitulo?: string;
    nivelExigido?: NivelAcesso;
    nivelUsuario?: NivelAcesso;
    challenge?: string;
  } | null;

  const nivelUsuario = state?.nivelUsuario || user?.nivelAcesso || NivelAcesso.PUBLICO;
  const isFourEyes = state?.challenge === 'four_eyes_required';

  const handleRequestAccess = async () => {
    const targetId = state?.docId || state?.docCodigo;
    if (!targetId) return;
    setRequestStatus('loading');
    try {
      const res = await fetch(`/api/documentos/${targetId}/request-access`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || 'anonymous'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRequestStatus('success');
        setActionId(data.actionId);
        setResponseMsg(`Sucesso! ID da Requisição: ${data.actionId}. Informe este código ao Aprovador.`);
      } else {
        setRequestStatus('error');
        setResponseMsg(data.error || 'Erro ao solicitar acesso.');
      }
    } catch (err) {
      setRequestStatus('error');
      setResponseMsg('Erro de conexão.');
    }
  };

  const handleApproveAccess = async () => {
    if (!actionId) return;
    try {
      // Simula a aprovação por um SEGUNDO administrador (ex: usr-002)
      await fetch(`/api/documentos/approve-access/${actionId}`, {
        method: 'POST',
        headers: { 'x-user-id': 'usr-002' }
      });
      // Após aprovação, redireciona para o documento
      navigate(`/documentos/${state?.docId || state?.docCodigo}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-[#1e293b] border border-red-900/50 rounded max-w-xl w-full p-8 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-950 border border-red-900 text-red-500 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">ACESSO NEGADO</h1>
        <p className="text-slate-400 text-sm mb-4">
          {state?.docTitulo || 'Você não possui autorização para acessar esta área ou recurso.'}
        </p>

        {isFourEyes && (
          <div className="bg-slate-900/50 border border-indigo-900/50 rounded p-4 mb-8 text-left">
            <h3 className="text-indigo-400 font-bold text-sm mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Regra dos Quatro Olhos Exigida
            </h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Este é um documento de impacto crítico. Para acessá-lo, você deve solicitar aprovação formal. Outro administrador precisará aprovar sua solicitação.
            </p>
            {requestStatus === 'idle' && (
              <button
                onClick={handleRequestAccess}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold transition"
              >
                Solicitar Acesso (Four Eyes)
              </button>
            )}
            {requestStatus === 'loading' && (
              <div className="text-indigo-400 text-sm text-center font-semibold">Solicitando...</div>
            )}
            {(requestStatus === 'success' || requestStatus === 'error') && (
              <div className={`p-3 rounded text-xs border ${
                requestStatus === 'success' 
                  ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' 
                  : 'bg-rose-950/30 border-rose-900/50 text-rose-400'
              }`}>
                {responseMsg}
              </div>
            )}
            {requestStatus === 'success' && actionId && (
              <button
                onClick={handleApproveAccess}
                className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Simular Aprovação (Outro Admin)
              </button>
            )}
          </div>
        )}

        <div className="bg-[#0f172a] border border-slate-700 rounded p-4 text-left mb-8">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1 uppercase text-center">
              Seu Nível Atual
            </p>
            <div className="flex justify-center mt-2">
              <SecurityBadge nivel={nivelUsuario} />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/documentos')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para documentos
        </button>
      </div>
    </div>
  );
};
