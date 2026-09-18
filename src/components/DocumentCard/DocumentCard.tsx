import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Documento, NIVEIS_INFO } from '../../types/document';
import { NivelAcesso } from '../../types/auth';
import { SecurityBadge } from '../SecurityBadge/SecurityBadge';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logSecurityEvent, blockUser } from '../../store/authSlice';
import { registrarAcessoDocumento, toggleFavorito } from '../../store/documentSlice';
import { apiFetch } from '../../lib/api';
import {
  FileText,
  Clock,
  User,
  Shield,
  Tag,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  Layers,
  QrCode,
  ArrowRight,
} from 'lucide-react';

interface DocumentCardProps {
  documento: Documento;
  compact?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  documento,
  compact = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const userNivel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;
  const hasAccess = userNivel >= documento.nivelAcesso;
  const docLevelInfo = NIVEIS_INFO[documento.nivelAcesso];
  const userLevelInfo = NIVEIS_INFO[userNivel];

  const [showMfaModal, setShowMfaModal] = React.useState(false);
  const [hasMfaConfigured, setHasMfaConfigured] = React.useState(true);
  const [mfaToken, setMfaToken] = React.useState('');
  const [mfaError, setMfaError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Mapeamento de cor do nível para CSS var
  const levelAccentVar =
    documento.nivelAcesso === NivelAcesso.PUBLICO
      ? 'var(--color-level-publico)'
      : documento.nivelAcesso === NivelAcesso.INTERNO
      ? 'var(--color-level-interno)'
      : documento.nivelAcesso === NivelAcesso.CONFIDENCIAL
      ? 'var(--color-level-confidencial)'
      : documento.nivelAcesso === NivelAcesso.SECRETO
      ? 'var(--color-level-secreto)'
      : 'var(--color-level-ultrassecreto)';

  const performFetch = async (token?: string) => {
    setIsLoading(true);
    setMfaError('');
    try {
      const headers: Record<string, string> = {
        'x-user-id': user?.id || 'usr-002',
      };
      if (token) {
        headers['x-mfa-token'] = token;
      }

      const res = await apiFetch(`/api/documents/${documento.id}`, { headers });
      
      if (res.status === 403 || res.status === 401 || res.status === 429) {
        const errorText = await res.text();
        let errorData: any = { error: 'Acesso negado' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Resposta não-JSON (' + res.status + '):', errorText);
          if (res.status === 429) {
            errorData = { action: 'force_logout', error: 'Múltiplas falhas no MFA. Sua conta foi bloqueada.' };
          } else if (res.status === 401) {
            errorData = { challenge: 'mfa_required', error: 'Autenticação adaptativa acionada' };
          } else if (documento.codigo === 'DOC-SECRET-PAYROLL-HONEYTOKEN') {
            errorData = { error: 'Alerta de Segurança Acionado.' };
          }
        }

        if (errorData.action === 'force_logout') {
          dispatch(
            logSecurityEvent({
              tipo: 'BLOQUEIO',
              mensagem: `Conta bloqueada por múltiplas falhas de MFA.`,
              documentoCodigo: documento.codigo,
              nivelTentativa: userNivel,
            })
          );
          
          if (errorData.blockedUntil) {
            dispatch(blockUser(errorData.blockedUntil));
          } else {
            dispatch(blockUser(Date.now() + 10000));
          }
          
          navigate('/login');
          return false;
        }

        if (token && (errorData.error === 'Credencial MFA inválida.' || res.status === 401)) {
          if (errorData.remainingAttempts !== undefined) {
            setMfaError(`Token inválido. Restam ${errorData.remainingAttempts} tentativas.`);
          } else {
            setMfaError('Token inválido. Tente novamente.');
          }
          return false;
        }

        if (errorData.challenge === 'mfa_required') {
          setHasMfaConfigured(errorData.hasMfaConfigured ?? false);
          setShowMfaModal(true);
          return false;
        }

        dispatch(
          logSecurityEvent({
            tipo: 'BLOQUEIO',
            mensagem: `API BACK-END: ${errorData.error || 'Acesso negado pela Defesa Ativa.'}`,
            documentoCodigo: documento.codigo,
            nivelTentativa: userNivel,
          })
        );
        navigate('/acesso-negado', {
          state: {
            docId: documento.id,
            docCodigo: documento.codigo,
            docTitulo: errorData.error,
            nivelExigido: documento.nivelAcesso,
            nivelUsuario: userNivel,
            challenge: errorData.challenge,
          },
        });
        return false;
      }
      return true;
    } catch (err) {
      console.error('Falha na API de documentos:', err);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDoc = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Step-up Auth para documentos com nível restrito (CONFIDENCIAL, SECRETO ou ULTRASSECRETO)
    if (documento.nivelAcesso >= NivelAcesso.CONFIDENCIAL) {
      try {
        const response = await apiFetch(`/api/documents/${documento.id}`, {
          headers: {
            'x-user-id': user?.id || 'usr-001',
            ...(mfaToken ? { 'x-mfa-token': mfaToken } : {})
          }
        });

        if (response.status === 429) {
          const errorData = await response.json();
          if (errorData.action === 'force_logout') {
            if (errorData.blockedUntil) {
              dispatch(blockUser(errorData.blockedUntil));
            } else {
              dispatch(blockUser(Date.now() + 10000));
            }
            navigate('/login');
            return;
          }
        }

        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.remainingAttempts !== undefined) {
            setMfaError(`Token incorreto! Tentativas restantes: ${errorData.remainingAttempts}`);
            return;
          }
        }

        const errorData = await response.json();
        if (errorData.circuit_breaker) {
          navigate(`/documentos/${documento.id}`, { state: { fallback: true } });
          return;
        }

        if (errorData.challenge === 'mfa_required') {
          setHasMfaConfigured(errorData.hasMfaConfigured ?? false);
          setShowMfaModal(true);
          return;
        }
      } catch (err) {
        console.error('Falha ao validar Step-up Auth:', err);
      }
    }

    if (hasAccess) {
      const allowed = await performFetch();
      if (!allowed) return;

      if (user) {
        dispatch(
          registrarAcessoDocumento({
            docId: documento.id,
            usuario: `${user.username} (${user.nome})`,
            usuarioId: user.id,
            cargo: user.cargo,
            nivel: user.nivelAcesso,
          })
        );
      }
      navigate(`/documentos/${documento.id}`);
    } else {
      dispatch(
        logSecurityEvent({
          tipo: 'BLOQUEIO',
          mensagem: `Tentativa de acesso não autorizado ao doc ${documento.codigo} (${docLevelInfo.nome}) por ${user?.nome || 'Anônimo'} (Nível ${userNivel}).`,
          documentoCodigo: documento.codigo,
          nivelTentativa: documento.nivelAcesso,
        })
      );
      navigate('/acesso-negado', {
        state: {
          docId: documento.id,
          docCodigo: documento.codigo,
          docTitulo: documento.titulo,
          nivelExigido: documento.nivelAcesso,
          nivelUsuario: userNivel,
        },
      });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavorito(documento.id));
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;
    
    const success = await performFetch(mfaToken);
    if (success) {
      setShowMfaModal(false);
      if (user) {
        dispatch(
          registrarAcessoDocumento({
            docId: documento.id,
            usuario: `${user.username} (${user.nome})`,
            usuarioId: user.id,
            cargo: user.cargo,
            nivel: user.nivelAcesso,
          })
        );
      }
      navigate(`/documentos/${documento.id}`);
    }
  };

  const mfaModal = showMfaModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4 text-indigo-400">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="font-bold text-lg text-slate-100">Step-Up Auth (MFA)</h3>
        </div>
        
        {!hasMfaConfigured ? (
          <div className="space-y-4">
            <div className="bg-amber-950/40 border border-amber-800/60 p-3.5 rounded-lg flex items-start gap-3">
              <QrCode className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong className="block text-amber-300 font-semibold mb-1">MFA Não Configurado</strong>
                Para acessar documentos <strong className="text-white">{docLevelInfo.nome} (LVL_{documento.nivelAcesso})</strong>, é obrigatório registrar o aplicativo autenticador com QR Code em seu perfil.
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Dica: Você também pode digitar o token padrão de homologação <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded font-mono">123456</code> abaixo, ou configurar o QR Code agora:
            </p>
            <button
              type="button"
              onClick={() => {
                setShowMfaModal(false);
                navigate('/perfil');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow"
            >
              <QrCode className="w-4 h-4" />
              <span>Configurar QR Code no Perfil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            O back-end interceptou sua requisição. O acesso ao documento <strong className="text-white">{documento.codigo}</strong> exige <strong>Autenticação MFA</strong> em tempo real.
          </p>
        )}

        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Token MFA (Dica: 123456 ou App TOTP)
            </label>
            <input 
              type="text" 
              value={mfaToken} 
              onChange={(e) => setMfaToken(e.target.value)} 
              placeholder="Ex: 123456" 
              autoFocus
              maxLength={6}
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono tracking-widest text-center text-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {mfaError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2 rounded">
              {mfaError}
            </p>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={() => setShowMfaModal(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow"
            >
              {isLoading ? 'Validando...' : 'Confirmar Acesso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        {mfaModal}
        <div
          id={`doc-card-compact-${documento.id}`}
          onClick={handleOpenDoc}
          className={`group p-4 border transition-all duration-150 cursor-pointer ${
            hasAccess
              ? 'bg-[var(--color-surface-panel)] border-[var(--color-surface-border)] hover:border-[#444]'
              : 'bg-[#0a0808] border-[#221515] opacity-75 hover:opacity-100 hover:border-[#442222]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 flex items-center justify-center shrink-0 border"
                style={{
                  borderColor: hasAccess ? '#2a2a2a' : '#331515',
                  backgroundColor: hasAccess ? '#111' : '#1a0808',
                }}
              >
                <FileText
                  className="w-4 h-4"
                  style={{
                    color: hasAccess
                      ? 'var(--color-text-muted)'
                      : 'var(--color-accent-red)',
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider">
                    {documento.codigo}
                  </span>
                  {!hasAccess && (
                    <span className="text-[8px] font-mono font-bold text-[var(--color-accent-red)] bg-red-950/40 px-1 py-0.5 border border-red-900/40 uppercase">
                      ACESSO RESTRITO
                    </span>
                  )}
                </div>
                <h4 className="text-[11px] font-semibold text-white truncate group-hover:text-[var(--color-accent-amber)] transition-colors mt-0.5 uppercase tracking-wide">
                  {documento.titulo}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SecurityBadge nivel={documento.nivelAcesso} size="xs" />
              <ArrowUpRight className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {mfaModal}
      <div
        id={`doc-card-${documento.id}`}
        onClick={handleOpenDoc}
        className={`group relative border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
          hasAccess
            ? 'bg-[var(--color-surface-panel)] border-[var(--color-surface-border)] hover:border-[#444]'
            : 'bg-[#080606] border-[#221010] opacity-80 hover:opacity-100 hover:border-[#441818]'
        }`}
      >
        {/* Top accent bar based on security level */}
        <div
          className="h-1 w-full"
          style={{
            backgroundColor: hasAccess ? levelAccentVar : '#441515',
          }}
        />

        <div className="p-5 flex-1 flex flex-col justify-between">
          {/* Header: Code + Security Badge */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] font-semibold uppercase">
                {documento.codigo}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="text-slate-500 hover:text-amber-400 p-1"
                  title="Favoritar"
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <SecurityBadge nivel={documento.nivelAcesso} size="xs" />
              </div>
            </div>

            {/* Title */}
            <h3
              className={`text-[12px] font-bold tracking-wide uppercase line-clamp-2 mb-2 transition-colors ${
                hasAccess
                  ? 'text-white group-hover:text-[var(--color-accent-amber)]'
                  : 'text-[#888] group-hover:text-[#aaa]'
              }`}
            >
              {documento.titulo}
            </h3>

            {/* Subtitle / Ementa */}
            {documento.subtitulo && (
              <p className="text-[10px] text-[#666] line-clamp-1 font-mono uppercase mb-3">
                {documento.subtitulo}
              </p>
            )}

            {/* Summary / Redacted preview */}
            <div className="mt-2 mb-4">
              {hasAccess ? (
                <p className="text-[10px] text-[#888] line-clamp-3 font-mono leading-relaxed">
                  {documento.resumo}
                </p>
              ) : (
                <div className="p-3 bg-[#110808] border border-[#2a1010] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[var(--color-accent-red)]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                      CONTEÚDO BLOQUEADO
                    </span>
                  </div>
                  <p className="text-[9px] text-[#775555] font-mono uppercase leading-relaxed">
                    Exige credencial {docLevelInfo.nome} (LVL {documento.nivelAcesso}). Seu nível: {userLevelInfo.nome} (LVL {userNivel}).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata section */}
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {documento.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[8px] font-mono uppercase px-1.5 py-0.5 bg-[#111] border border-[#222] text-[#777]"
                >
                  <Tag className="w-2.5 h-2.5 text-[#555]" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer details: Author, Date, Actions */}
            <div className="pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-between text-[9px] font-mono text-[#555] uppercase">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#444]" />
                  {documento.autor}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#444]" />
                  {documento.dataCriacao}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[var(--color-text-muted)] group-hover:text-white transition-colors">
                <span className="text-[9px] font-mono font-bold tracking-widest">
                  {hasAccess ? 'ABRIR' : 'DETALHES'}
                </span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};