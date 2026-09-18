import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Documento, podeAcessar, NIVEIS_INFO } from '../../types/document';
import { NivelAcesso } from '../../types/auth';
import { SecurityBadge } from '../SecurityBadge/SecurityBadge';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorito, registrarAcessoDocumento } from '../../store/documentSlice';
import { logSecurityEvent } from '../../store/authSlice';
import { apiFetch } from '../../lib/api';
import {
  Lock,
  Eye,
  Star,
  ShieldAlert,
  FileCheck2,
  QrCode,
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
  const [showSetupWarning, setShowSetupWarning] = React.useState(false);
  const [mfaToken, setMfaToken] = React.useState('');
  const [mfaError, setMfaError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

const performFetch = async (token?: string) => {
    setIsLoading(true);
    setMfaError('');
    try {
      const headers: Record<string, string> = {
        'x-user-id': user?.username || user?.id || 'anonymous',
        'x-device-fingerprint': navigator.userAgent,
        'x-document-level': docLevelInfo?.nome || String(documento.nivelAcesso),
      };
      
      if (token) {
        headers['x-mfa-token'] = token;
      }

      console.log(`[Sentinela] Solicitando acesso ao documento ${documento.id}...`, headers);

      // Chama o backend na Render
      const res = await apiFetch(`/api/documentos/${documento.id}`, { 
        method: 'GET',
        headers 
      });

      console.log(`[Sentinela] Status da resposta:`, res.status);
      
      // Se a resposta for 200 OK -> Acesso liberado!
      if (res.ok) {
        return true;
      }

      // Lê a resposta como texto primeiro para nunca estourar erro de parsing
      const responseText = await res.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }

      console.log(`[Sentinela] Dados do erro da API:`, errorData);

      // 🚨 CASO 1: NÃO CONFIGUROU O 2FA AINDA -> Exibe o modal de aviso para configurar
      const isMfaSetupRequired = 
        errorData.challenge === 'mfa_setup_required' ||
        (res.status === 403 && String(errorData.error).toLowerCase().includes('configurar'));

      if (isMfaSetupRequired) {
        setShowMfaModal(false);
        setShowSetupWarning(true);
        return false;
      }

      // 🚨 CASO 2: PEDE O CÓDIGO DO CELULAR (Google Authenticator)
      const isMfaChallenge = 
        errorData.challenge === 'mfa_required' || 
        (res.status === 401 && !token);

      if (isMfaChallenge) {
        setShowSetupWarning(false);
        setShowMfaModal(true);
        return false;
      }

      // 🚨 CASO 3: DIGITOU O CÓDIGO E ESTAVA ERRADO
      if (token) {
        setMfaError(errorData.error || 'Código 2FA incorreto. Tente novamente.');
        return false;
      }

      // 🚨 CASO 4: Regra dos Quatro Olhos
      if (errorData.challenge === 'four_eyes_required') {
        alert('Este documento exige aprovação prévia de outro administrador (Regra dos Quatro Olhos).');
        return false;
      }

      // Bloqueio por outras diretivas de segurança
      navigate('/acesso-negado', {
        state: {
          docId: documento.id,
          docCodigo: documento.codigo,
          docTitulo: errorData.error || documento.titulo,
          nivelExigido: documento.nivelAcesso,
          nivelUsuario: userNivel,
        },
      });
      return false;

    } catch (err) {
      console.error('[Sentinela] Falha de conexão:', err);
      setMfaError('Erro de comunicação com o servidor.');
      alert('Erro ao conectar com a API de segurança. Verifique se o backend na Render está online.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };


 const handleOpenDocument = async () => {
    // Se o documento for acessível pelo RBAC OU for de nível crítico que exige challenge no backend
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

  // Modal para quando o 2FA AINDA NÃO FOI CONFIGURADO
  const setupWarningModal = showSetupWarning && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#333] p-6 w-full max-w-sm shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-amber)]">
          <QrCode className="w-6 h-6" />
          <h3 className="font-bold text-sm uppercase tracking-widest text-white">2FA Obrigatório</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4 font-mono leading-relaxed">
          O documento <strong className="text-white">{documento.codigo}</strong> é de nível crítico ({docLevelInfo.nome}).
        </p>
        <div className="p-3 bg-amber-950/20 border-l-2 border-[var(--color-accent-amber)] mb-6 text-[11px] font-mono text-[var(--color-accent-amber)]">
          Você precisa escanear o QR Code e habilitar o 2FA nas configurações do seu perfil antes de acessar este documento.
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowSetupWarning(false)}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSetupWarning(false);
              navigate('/perfil'); // Leva direto para configurar o 2FA
            }}
            className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-[var(--color-text-main)] text-[var(--color-surface-bg)] hover:bg-[var(--color-accent-amber)] transition-colors"
          >
            Configurar 2FA
          </button>
        </div>
      </div>
    </div>
  );

  // Modal para digitar o código de 6 dígitos do Google Authenticator
  const mfaModal = showMfaModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-[#333] p-6 w-full max-w-sm shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-amber)]">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="font-bold text-sm uppercase tracking-widest text-white">Step-Up Auth (2FA)</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-6 font-mono leading-relaxed">
          O acesso ao documento <strong className="text-white">{documento.codigo}</strong> exige a reconfirmação do <strong>código do seu aplicativo autenticador</strong>.
        </p>
        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-[var(--color-text-muted)] mb-1.5 uppercase tracking-widest">
              CÓDIGO DE 6 DÍGITOS (GOOGLE AUTHENTICATOR)
            </label>
            <input 
              type="text" 
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full bg-[#111] border border-[#333] px-3 py-2 text-white focus:outline-none focus:border-[var(--color-accent-amber)] font-mono text-center tracking-widest text-base uppercase"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            {mfaError && <p className="text-[var(--color-accent-red)] text-[10px] font-mono mt-2">{mfaError}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowMfaModal(false);
                setMfaToken('');
                setMfaError('');
              }}
              className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !mfaToken}
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-[var(--color-text-main)] text-[var(--color-surface-bg)] hover:bg-[var(--color-accent-amber)] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Liberar Acesso'}
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
        className={`border-b border-[#222] transition-colors ${
          isAccessible
            ? 'hover:bg-[#111] cursor-pointer'
            : 'bg-[#0a0a0a] hover:bg-[#111] cursor-not-allowed opacity-85'
        }`}
        onClick={handleOpenDocument}
      >
        <td className="py-3 px-4">
          <button
            id={`fav-btn-${documento.id}`}
            type="button"
            onClick={handleToggleFavorite}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-amber)] transition-colors p-1"
            title={isFavorito ? 'Remover dos favoritos' : 'Favoritar documento'}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorito ? 'fill-[var(--color-accent-amber)] text-[var(--color-accent-amber)]' : 'text-inherit'
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
        <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell font-mono">
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
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[#111] hover:bg-[#222] text-white border border-[#333] transition uppercase"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
              Visualizar
            </button>
          ) : (
            <button
              id={`restricted-btn-table-${documento.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDocument();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-red-950/40 text-red-300 border border-red-900/60 cursor-pointer hover:bg-red-900/40 transition uppercase"
            >
              <Lock className="w-3 h-3 text-[var(--color-accent-red)]" />
              Restrito
            </button>
          )}
          {mfaModal}
          {setupWarningModal}
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
          : 'bg-[#0e0e0e] border-[#222]'
      }`}
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: docLevelInfo.hexColor }}
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
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
      {setupWarningModal}
    </div>
  );
};