import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser } from '../../store/authSlice';
import { NivelAcesso } from '../../types/auth';
import { NIVEIS_INFO } from '../../types/document';
import { UserPlus, Check, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<NivelAcesso>(NivelAcesso.PUBLICO);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Só admin ou Nível 5 (Ultrassecreto) pode cadastrar usuários
  if (!user || user.nivelAcesso < NivelAcesso.ULTRASSECRETO) {
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !nome || !senha || !cargo || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccess('');

    try {
      // Create backend request
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id // Mock admin token/header
        },
        body: JSON.stringify({
          username: username.toLowerCase().replace(/\s/g, ''),
          nome,
          email: `${username.toLowerCase().replace(/\s/g, '')}@classified.corp`,
          password: senha,
          cargo,
          departamento: departamento || 'Departamento Geral',
          nivelAcesso
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar usuário na rede estrutural.');
      }

      // Update Redux state to simulate the account being added to our mock store
      const demoAccount = {
        user: {
          id: `usr-${Date.now()}`,
          username: data.user.username,
          nome,
          cargo,
          departamento: departamento || 'Departamento Geral',
          nivelAcesso,
          email: `${data.user.username}@classified.corp`,
          dataCriacao: new Date().toISOString().split('T')[0],
          ultimoAcesso: 'Nunca',
          status: 'ATIVO' as const,
        },
        senhaOriginal: senha,
        descricao: `Adicionado pelo Admin (${NIVEIS_INFO[nivelAcesso].nome})`,
      };

      dispatch(registerUser({
        username: demoAccount.user.username,
        demoAccount
      }));

      setSuccess(data.message || 'OPERADOR REGISTRADO COM SUCESSO.');
      setUsername('');
      setNome('');
      setSenha('');
      setCargo('');
      setDepartamento('');
      setNivelAcesso(NivelAcesso.PUBLICO);

      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#222] p-6 relative overflow-hidden font-sans">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

      <div className="relative z-10">
        <div className="border-b border-[#222] pb-4 mb-6">
          <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--color-text-muted)]" />
            REGISTRO DE NOVO OPERADOR
          </h3>
          <p className="text-[9px] font-mono text-[#555] uppercase tracking-widest mt-2">
            PROVISIONAMENTO RESTRITO AO COMANDO DE SEGURANÇA.
          </p>
        </div>
        
        {success && (
          <div className="mb-6 p-3 bg-emerald-950/20 border-l-2 border-emerald-500 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/20 border-l-2 border-[var(--color-accent-red)] text-white text-[10px] font-mono flex items-center gap-2 uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--color-accent-red)]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                NOME COMPLETO *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-main)] transition-colors"
                placeholder="NOME DO OPERADOR"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                ID DE ACESSO (LOGIN) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono focus:outline-none focus:border-[var(--color-text-main)] transition-colors"
                placeholder="ID.USUARIO"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                SENHA INICIAL *
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono focus:outline-none focus:border-[var(--color-text-main)] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                CARGO *
              </label>
              <input
                type="text"
                required
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-main)] transition-colors"
                placeholder="ATRIBUIÇÃO"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                DEPARTAMENTO
              </label>
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-main)] transition-colors"
                placeholder="SETOR"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#888] mb-1.5">
                CREDENCIAL (NÍVEL DE ACESSO) *
              </label>
              <select
                value={nivelAcesso}
                onChange={(e) => setNivelAcesso(Number(e.target.value) as NivelAcesso)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-main)] transition-colors appearance-none"
              >
                <option value={NivelAcesso.PUBLICO}>LVL 1 - PÚBLICO</option>
                <option value={NivelAcesso.INTERNO}>LVL 2 - INTERNO</option>
                <option value={NivelAcesso.CONFIDENCIAL}>LVL 3 - CONFIDENCIAL</option>
                <option value={NivelAcesso.SECRETO}>LVL 4 - SECRETO</option>
                <option value={NivelAcesso.ULTRASSECRETO}>LVL 5 - ULTRASSECRETO</option>
              </select>
            </div>
          </div>
          <div className="pt-4 mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-[var(--color-surface-bg)] text-[10px] font-mono font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isSubmitting ? 'CADASTRANDO...' : 'EMITIR CREDENCIAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
