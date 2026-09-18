import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Documento, podeAcessar, NIVEIS_INFO } from '../../types/document';
import { NivelAcesso } from '../../types/auth';
import { SecurityBadge } from '../SecurityBadge/SecurityBadge';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorito, registrarAcessoDocumento } from '../../store/documentSlice';
import { logSecurityEvent, blockUser } from '../../store/authSlice';
import {
  FileText,
  Lock,
  Eye,
  Star,
  Calendar,
  Building2,
  User as UserIcon,
  ShieldAlert,
  FileCheck2,
  Layers,
} from 'lucide-react';

interface DocumentCardProps {
  documento: Documento;
  viewMode?: 'grid' | 'table';
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  documento,
  viewMode = 'grid',
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const favoritos = useAppSelector((state) => state.documents.favoritos);

  const isFavorito = favoritos.includes(documento.id);
  const userNivel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;
  const isAccessible = podeAcessar(userNivel, documento.nivelAcesso);
  const docLevelInfo = NIVEIS_INFO[documento.nivelAcesso];
  const userLevelInfo = NIVEIS_INFO[userNivel];

  const [showMfaModal, setShowMfaModal] = React.useState(false);
  const [mfaToken, setMfaToken] = React.useState('');
  const [mfaError, setMfaError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const performFetch = async (token?: string) => {
    setIsLoading(true);
    setMfaError('');
    try {
      const headers: Record<string, string> = {
        'x-user-id': user?.id || 'anonymous'
      };
      
      if (token) {
        headers['x-mfa-token'] = token;
      }

      const res = await fetch(`/api/documentos/${documento.id}`, { headers });
      
      if (res.status === 403 || res.status === 401 || res.status === 429) {
        const errorText = await res.text();
        let errorData: any = { error: 'Acesso negado' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Resposta não-JSON (' + res.status + '):', errorText);
          // Fallback: se o proxy (Nginx/Cloud Run) sobrescrever o JSON com HTML 403/401/429
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
            // Se veio do cache/sem data explícita, block por 10s
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
          // If the backend requests MFA, open the modal
          setShowMfaModal(true);
          return false;
        }

        // Other security blocks (e.g., Honeytoken)
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
      console.error('Erro na API Fastify:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDocument = async () => {
    // Para todos os documentos ULTRASSECRETOs, forçamos a chamada ao backend para receber o challenge do Four Eyes
    if (isAccessible || documento.nivelAcesso === 'ULTRASSECRETO') {
      const success = await performFetch();
      if (success) {
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
    } else {
      // Registrar tentativa bloqueada e redirecionar para /acesso-negado
      dispatch(
        logSecurityEvent({
          tipo: 'BLOQUEIO',
          mensagem: `Tentativa de visualização não autorizada do documento ${documento.codigo} (${docLevelInfo.nome}) por ${user?.username} (Nível ${userNivel}).`,
          documentoCodigo: documento.codigo,
          nivelTentativa: userNivel,
        })
      );
      navigate('/acesso-negado', {
        state: {
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
          <h3 className="font-bold text-lg text-slate-100">Step-Up Auth</h3>
        </div>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          O back-end interceptou sua requisição. O acesso ao documento <strong className="text-white">{documento.codigo}</strong> exige <strong>Autenticação MFA</strong> em tempo real.
        </p>
        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Token MFA (Dica: 123456)
            </label>
            <input 
              type="text" 
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center tracking-widest text-lg"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            {mfaError && <p className="text-rose-400 text-xs mt-2 font-medium">{mfaError}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowMfaModal(false);
                setMfaToken('');
                setMfaError('');
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !mfaToken}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Validando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Table Row View
  if (viewMode === 'table') {
    return (
      <tr
        id={`document-row-${documento.id}`}
        className={`border-b border-slate-800 transition-colors ${
          isAccessible
            ? 'hover:bg-slate-900/60 cursor-pointer'
            : 'bg-slate-950/70 hover:bg-slate-950/90 cursor-not-allowed opacity-85'
        }`}
        onClick={handleOpenDocument}
      >
        <td className="py-3 px-4">
          <button
            id={`fav-btn-${documento.id}`}
            type="button"
            onClick={handleToggleFavorite}
            className="text-slate-500 hover:text-amber-400 transition-colors p-1"
            title={isFavorito ? 'Remover dos favoritos' : 'Favoritar documento'}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorito ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
              }`}
            />
          </button>
        </td>
        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            {isAccessible ? (
              <FileCheck2 className="w-4 h-4 text-slate-400" />
            ) : (
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{documento.codigo}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-col">
            <span
              className={`text-sm font-medium ${
                isAccessible ? 'text-slate-100' : 'text-slate-400 line-clamp-1'
              }`}
            >
              {documento.titulo}
            </span>
            <span className="text-xs text-slate-500 line-clamp-1">
              {documento.departamento}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          <SecurityBadge nivel={documento.nivelAcesso} size="xs" />
        </td>
        <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">
          {documento.autor}
        </td>
        <td className="py-3 px-4 text-xs text-slate-400 font-mono hidden lg:table-cell">
          {documento.ultimaAtualizacao}
        </td>
        <td className="py-3 px-4 text-right">
          {isAccessible ? (
            <button
              id={`view-btn-table-${documento.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDocument();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Visualizar
            </button>
          ) : (
            <button
              id={`restricted-btn-table-${documento.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDocument();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-900/60 rounded cursor-pointer hover:bg-rose-900/40 transition"
            >
              <Lock className="w-3 h-3 text-rose-400" />
              Restrito
            </button>
          )}
          {mfaModal}
        </td>
      </tr>
    );
  }

  // Grid Card View
  return (
    <div
      id={`document-card-${documento.id}`}
      className={`group relative border transition-colors flex flex-col justify-between overflow-hidden ${
        isAccessible
          ? 'bg-[var(--color-surface-bg)] border-[var(--color-surface-border)] hover:border-[var(--color-text-muted)]'
          : 'bg-[#111] border-[#333]'
      }`}
    >
      {/* Top Security Line indicator */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: docLevelInfo.hexColor }}
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Header: Code, Badges and Favorite */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-4 border-b border-[var(--color-surface-border)] pb-2">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
                {documento.codigo}
              </span>
              <SecurityBadge nivel={documento.nivelAcesso} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              {documento.status === 'ATIVO' && (
                <span className="text-[9px] font-mono uppercase px-1 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900">
                  ATIVO
                </span>
              )}
              <button
                id={`fav-btn-grid-${documento.id}`}
                type="button"
                onClick={handleToggleFavorite}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-amber)] transition-colors"
                title={isFavorito ? 'Remover dos favoritos' : 'Favoritar'}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isFavorito ? 'fill-[var(--color-accent-amber)] text-[var(--color-accent-amber)]' : 'text-inherit'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h4
            className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
              isAccessible
                ? 'text-white group-hover:text-[var(--color-accent-amber)] transition-colors'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            {documento.titulo}
          </h4>
          {documento.subtitulo && (
            <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 mb-4 leading-relaxed font-serif">
              {documento.subtitulo}
            </p>
          )}

          {/* Locked Overlay Banner if User Level < Document Level */}
          {!isAccessible && (
            <div
              id={`locked-warning-${documento.id}`}
              className="my-3 p-3 bg-red-950/20 border-l-2 border-[var(--color-accent-red)] flex items-start gap-3"
            >
              <Lock className="w-4 h-4 text-[var(--color-accent-red)] shrink-0" />
              <div className="text-[10px] font-mono text-[var(--color-text-muted)]">
                <p className="font-bold text-[var(--color-accent-red)] uppercase mb-1">ACESSO NEGADO</p>
                <p className="opacity-80">Req: {docLevelInfo.nome}</p>
                <p className="opacity-80">Usr: {userLevelInfo.nome}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {documento.tags && documento.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {documento.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono uppercase text-[var(--color-text-muted)]"
                >
                  #{tag}
                </span>
              ))}
              {documento.tags.length > 3 && (
                <span className="text-[9px] font-mono text-[var(--color-text-muted)] opacity-50">
                  +{documento.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-[var(--color-text-muted)] py-3 border-t border-[var(--color-surface-border)]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="opacity-50">DPT:</span>
              <span className="truncate">{documento.departamento}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="opacity-50">AUT:</span>
              <span className="truncate">{documento.autor}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="opacity-50">ATLZ:</span>
              <span>{documento.ultimaAtualizacao}</span>
            </div>
            {documento.paginas && (
              <div className="flex items-center gap-1.5 truncate">
                <span className="opacity-50">PAGS:</span>
                <span>{documento.paginas}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isAccessible ? (
              <button
                id={`btn-open-doc-${documento.id}`}
                type="button"
                onClick={handleOpenDocument}
                className="w-full flex items-center justify-between py-2 px-3 bg-[var(--color-text-main)] text-[var(--color-surface-bg)] hover:bg-[var(--color-accent-amber)] transition-colors text-[10px] font-mono font-bold uppercase tracking-widest group-hover:bg-[var(--color-accent-amber)]"
              >
                <span>ABRIR_ARQUIVO</span>
                <Eye className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id={`btn-restricted-doc-${documento.id}`}
                type="button"
                onClick={handleOpenDocument}
                className="w-full flex items-center justify-between py-2 px-3 bg-[#111] text-[#666] border border-[#333] transition-colors text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer hover:bg-[#222]"
                title="Clique para inspecionar restrição RBAC"
              >
                <span>RESTRITO</span>
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      {mfaModal}
    </div>
  );
};
