import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { NivelAcesso } from '../../types/auth';
import { logout, logSecurityEvent } from '../../store/authSlice';
import { SecurityBadge } from '../../components/SecurityBadge/SecurityBadge';
import { podeAcessar } from '../../types/document';
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  Shield,
  Download,
  AlertTriangle
} from 'lucide-react';

export const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const documents = useAppSelector((state) => state.documents.documents);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [canaryResult, setCanaryResult] = useState<{ message: string; canaryUrl: string; content: string } | null>(null);
  const [blackout, setBlackout] = useState(false);

  // Proteção contra Print Screen e Cópia (Software-level DRM)
  React.useEffect(() => {
    const reportViolation = async (type: string) => {
      setBlackout(true);
      
      // Envia evento para o backend
      try {
        await fetch('/api/documentos/drm-violation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'anonymous'
          },
          body: JSON.stringify({ docId: id, type })
        });
      } catch (e) {
        console.error('Erro ao reportar DRM:', e);
      }

      // Log no painel frontend
      dispatch(logSecurityEvent({
        tipo: 'BLOQUEIO',
        mensagem: `Ação de ${type} detectada no documento ${id}. Sessão encerrada.`,
        documentoCodigo: id,
        nivelTentativa: user?.nivelAcesso || NivelAcesso.PUBLICO,
      }));

      // Tenta sobrescrever clipboard
      navigator.clipboard.writeText('ALERTA DE SEGURANÇA: Ação bloqueada e incidente reportado.').catch(() => {});
      
      // Desloga o usuário e redireciona
      setTimeout(() => {
        dispatch(logout());
        navigate('/login');
      }, 3000);
    };

    const handleKey = (e: KeyboardEvent) => {
      // Tecla PrintScreen (Windows/Linux)
      if (e.key === 'PrintScreen') {
        reportViolation('PrintScreen');
      }
      // Atalhos de captura do Mac (Meta + Shift + 3/4/5) ou Windows (Win + Shift + S)
      if ((e.metaKey && e.shiftKey) || (e.key === 's' && e.shiftKey && e.metaKey)) {
        reportViolation('PrintScreen Atalho');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('Copy Text');
    };

    window.addEventListener('keyup', handleKey);
    window.addEventListener('keydown', handleKey);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  const doc = documents.find(
    (d) =>
      (d.id === id || d.codigo.toLowerCase() === id?.toLowerCase()) &&
      (podeAcessar(user?.nivelAcesso ?? NivelAcesso.PUBLICO, d.nivelAcesso) || d.nivelAcesso === NivelAcesso.ULTRASSECRETO)
  );

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <p>Documento não encontrado.</p>
        <button
          onClick={() => navigate('/documentos')}
          className="mt-4 text-blue-400 hover:underline"
        >
          Voltar para listagem
        </button>
      </div>
    );
  }


  const handleDownload = async () => {
    if (!doc) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/documentos/${doc.id}/download`, {
        headers: {
          'x-user-id': user?.id || 'anonymous'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCanaryResult(data);

        // Gera o arquivo HTML com o Canary Token embutido e dispara o download real
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Documento: ${doc.codigo}</title>
  <style>
    body { font-family: 'Courier New', Courier, monospace; padding: 40px; background: #fff; color: #000; max-width: 800px; margin: 0 auto; }
    h1 { color: #b91c1c; border-bottom: 2px solid #b91c1c; padding-bottom: 10px; }
    .meta { font-size: 12px; color: #555; margin-bottom: 30px; }
    .classified-box { border: 2px dashed #b91c1c; padding: 20px; background: #fff5f5; white-space: pre-wrap; font-size: 14px; }
    .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${doc.titulo}</h1>
  <div class="meta">
    <strong>Código:</strong> ${doc.codigo}<br>
    <strong>Nível de Acesso:</strong> ${doc.nivelAcesso}<br>
    <strong>Autor:</strong> ${doc.autor}<br>
    <strong>Data de Geração:</strong> ${new Date().toLocaleString()}
  </div>
  
  <div class="classified-box">
${doc.conteudo}
  </div>
  
  <div class="footer">
    DOCUMENTO CONFIDENCIAL - PROPRIEDADE RESTRITA<br>
    O compartilhamento não autorizado está sujeito a penalidades criminais.
  </div>

  <!-- CANARY TOKEN INVISÍVEL -->
  <img src="${data.canaryUrl}" width="1" height="1" style="display:none; position:absolute; left:-9999px;" alt="" />
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.codigo}_SECRETO.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(data.error || 'Erro ao realizar o download.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao baixar o documento.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* BLACKOUT SCREEN */}
      {blackout && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-none">
          <Shield className="w-24 h-24 text-[var(--color-accent-red)] mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-[var(--color-accent-red)] tracking-widest uppercase mb-2">SECURITY VIOLATION DETECTED</h2>
          <p className="text-[var(--color-text-muted)] font-mono text-center max-w-md uppercase">
            SCREEN CAPTURE ATTEMPT BLOCKED. INCIDENT LOGGED. TERMINATING SESSION.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] hover:text-white transition-colors border border-transparent hover:border-[var(--color-text-muted)] px-3 py-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          RETURN
        </button>
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-[var(--color-surface-bg)] text-[10px] font-mono font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {isDownloading ? 'ENCRYPTING...' : 'SECURE_DOWNLOAD [CANARY_TOKEN]'}
        </button>
      </div>

      {canaryResult && (
        <div className="bg-[#111] border border-[var(--color-accent-amber)] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent-amber)]"></div>
          <h3 className="text-[var(--color-accent-amber)] font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            FILE DOWNLOADED [TRACKING ENABLED]
          </h3>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)] mb-4 leading-relaxed uppercase">
            The document has been securely downloaded with an embedded, invisible Canary Token. If this file is opened on an unauthorized network, a fatal alert will be logged.
          </p>
          <div className="bg-black p-4 font-mono text-[10px] text-emerald-500 break-all border border-[#222] mb-4 whitespace-pre-wrap selection:bg-emerald-900 selection:text-white">
            {canaryResult.content}
          </div>
          <p className="text-[9px] text-[var(--color-text-muted)] mb-1 font-bold uppercase tracking-widest">HIDDEN TOKEN URL [FOR TESTING]:</p>
          <div className="flex gap-2">
            <div className="bg-black p-2 text-[10px] font-mono text-[#777] border border-[#222] select-all cursor-text overflow-x-auto whitespace-nowrap flex-1">
              {canaryResult.canaryUrl}
            </div>
            <button 
              onClick={() => {
                const url = new URL(canaryResult.canaryUrl);
                fetch(url.pathname, { method: 'GET' })
                  .then(() => alert('Ping simulado enviado com sucesso! Verifique a Dashboard de Monitoramento.'))
                  .catch(() => alert('Erro ao simular o ping.'));
              }}
              className="bg-[var(--color-accent-red)] hover:bg-[#aa0000] text-white px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-colors"
            >
              TRIGGER_LEAK
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] overflow-hidden print:hidden">
        {/* Header */}
        <div className="bg-[var(--color-surface-panel)] p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-mono text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">RECORD_ID: {doc.codigo}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
                {doc.titulo}
              </h1>
              {doc.subtitulo && (
                <p className="text-[12px] font-serif text-[var(--color-text-muted)] mt-2 italic">{doc.subtitulo}</p>
              )}
            </div>
            <div className="shrink-0">
              <SecurityBadge nivel={doc.nivelAcesso} size="lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-mono text-[var(--color-text-muted)] pt-4 border-t border-[var(--color-surface-border)] uppercase tracking-wider">
            <div>
              <span className="opacity-50 block mb-1">Author</span>
              <span className="text-white">{doc.autor}</span>
            </div>
            <div>
              <span className="opacity-50 block mb-1">Department</span>
              <span className="text-white">{doc.departamento}</span>
            </div>
            <div>
              <span className="opacity-50 block mb-1">Last Update</span>
              <span className="text-white">{doc.ultimaAtualizacao}</span>
            </div>
            <div>
              <span className="opacity-50 block mb-1">Security Protocol</span>
              <span className="text-white">{doc.protocoloSeguranca}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative p-8 sm:p-12 bg-[#050505] min-h-[400px] overflow-hidden">
          {/* Watermark para Proteção contra Print Screen */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex flex-wrap opacity-[0.03] transform -rotate-12 scale-150">
             {Array.from({ length: 150 }).map((_, i) => (
               <div key={i} className="p-4 text-[10px] font-mono text-white whitespace-nowrap">
                 ID:{user?.id} • {user?.email} • {new Date().toISOString().split('T')[0]}
               </div>
             ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden z-0">
            <span className="text-[120px] font-black tracking-widest uppercase transform -rotate-12 whitespace-nowrap">
              CLASSIFIED
            </span>
            <span className="text-4xl font-bold uppercase mt-4 tracking-widest">
              LEVEL {doc.nivelAcesso}
            </span>
          </div>

          {/* Actual content */}
          <div className="relative z-10 text-[#d4d4d8] font-mono text-[13px] leading-loose whitespace-pre-wrap max-w-3xl mx-auto selection:bg-[var(--color-accent-amber)] selection:text-black">
            {doc.conteudo}
          </div>
        </div>

        {/* Footer info / Audit logs stub */}
        <div className="p-5 bg-[var(--color-surface-panel)] border-t border-[var(--color-surface-border)]">
          <h3 className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Audit_Trail
          </h3>
          <div className="space-y-1">
            {doc.historicoAcesso.slice(0, 3).map((hist) => (
              <div key={hist.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono py-2 border-b border-[#222] last:border-0">
                <div className="text-[#888]">
                  <span className="font-bold text-[#ccc] uppercase">{hist.usuario}</span>
                  <span className="mx-2 opacity-50">/</span>
                  <span className="uppercase">{hist.acao}</span>
                </div>
                <span className="text-[#555] mt-1 sm:mt-0">{hist.data}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
