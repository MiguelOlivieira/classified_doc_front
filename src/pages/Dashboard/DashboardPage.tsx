import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { DocumentCard } from '../../components/DocumentCard/DocumentCard';
import { podeAcessar } from '../../types/document';
import { NivelAcesso } from '../../types/auth';
import {
  FileText,
  ShieldAlert,
  Clock,
  Lock,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, securityAlerts } = useAppSelector((state) => state.auth);
  const documents = useAppSelector(
    (state) => state.documents.documents
  ).filter((doc) => podeAcessar(user?.nivelAcesso ?? NivelAcesso.PUBLICO, doc.nivelAcesso));
  const documentosRecentesPorUsuario = useAppSelector(
    (state) => state.documents.documentosRecentesPorUsuario
  ) || {};
  
  const documentosRecentes = user?.id ? (documentosRecentesPorUsuario[user.id] || []) : [];

  const userLevel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;

  const totalDocuments = documents.length;
  const accessibleDocuments = documents.length; // all docs are now accessible docs
  const restrictedDocuments = 0; // restricted docs are not even counted

  const recentDocs = documents
    .filter((doc) => documentosRecentes.includes(doc.id))
    .sort(
      (a, b) =>
        documentosRecentes.indexOf(a.id) - documentosRecentes.indexOf(b.id)
    )
    .slice(0, 5);

  const recentAlerts = securityAlerts.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-surface-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">VISÃO_GERAL_SISTEMA</h1>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase mt-1">
            Status da rede global e métricas de atividade
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-text-muted)] opacity-20"></div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase mb-2">Total de Registros</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-mono text-white leading-none">{totalDocuments}</p>
            <FileText className="w-4 h-4 text-[var(--color-text-muted)] opacity-50 mb-1" />
          </div>
        </div>

        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-50"></div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase mb-2">Acessíveis</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-mono text-emerald-400 leading-none">{accessibleDocuments}</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-50 mb-1" />
          </div>
        </div>

        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent-red)] opacity-50"></div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase mb-2">Restritos</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-mono text-[var(--color-accent-red)] leading-none">{restrictedDocuments}</p>
            <Lock className="w-4 h-4 text-[var(--color-accent-red)] opacity-50 mb-1" />
          </div>
        </div>

        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent-amber)] opacity-50"></div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase mb-2">Acesso Recente</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-mono text-[var(--color-accent-amber)] leading-none">{recentDocs.length}</p>
            <Clock className="w-4 h-4 text-[var(--color-accent-amber)] opacity-50 mb-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] flex flex-col">
          <div className="p-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-panel)] flex items-center justify-between">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              ATIVIDADE_RECENTE
            </h2>
            <button
              onClick={() => navigate('/documentos')}
              className="text-[10px] font-mono text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              [ VER_TODOS ]
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-[var(--color-surface-border)] text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-mono">
                  <th className="px-4 py-2 font-normal w-8"></th>
                  <th className="px-4 py-2 font-normal">ID</th>
                  <th className="px-4 py-2 font-normal">Título</th>
                  <th className="px-4 py-2 font-normal">Classificação</th>
                  <th className="px-4 py-2 font-normal text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <DocumentCard key={doc.id} documento={doc} viewMode="table" />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)] text-[11px] font-mono uppercase">
                      NENHUMA ATIVIDADE RECENTE DETECTADA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-panel)]">
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-accent-red)]" />
              ALERTAS_DE_SEGURANÇA
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto bg-[#0a0a0a]">
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col gap-1 border-l-2 pl-3 pb-2 border-b border-b-[#1a1a1a]"
                    style={{ borderLeftColor: alert.tipo === 'BLOQUEIO' ? 'var(--color-accent-red)' : alert.tipo === 'AVISO' ? 'var(--color-accent-amber)' : 'var(--color-text-muted)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          alert.tipo === 'BLOQUEIO'
                            ? 'text-[var(--color-accent-red)]'
                            : alert.tipo === 'AVISO'
                            ? 'text-[var(--color-accent-amber)]'
                            : 'text-[var(--color-text-muted)]'
                        }`}
                      >
                        {alert.tipo}
                      </span>
                      <span className="text-[9px] text-[#555] font-mono">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-sans leading-relaxed">{alert.mensagem}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#444]">
                <ShieldAlert className="w-6 h-6 mb-3 opacity-50" />
                <p className="text-[11px] font-mono uppercase tracking-widest">NENHUMA AMEAÇA ATIVA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
