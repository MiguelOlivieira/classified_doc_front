import React, { useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { NivelAcesso } from '../../types/auth';
import { logSecurityEvent } from '../../store/authSlice';
import { Activity, ShieldCheck, Eye, PlusCircle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const documents = useAppSelector((state) => state.documents.documents);

  const isUnauthorized = !user || user.nivelAcesso < NivelAcesso.ULTRASSECRETO;

  useEffect(() => {
    if (isUnauthorized) {
      // Print honeypot message directly to console
      console.error(
        `🚨 [HONEYPOT TRIGGERED] Tentativa de acesso não autorizado ao endpoint /auditoria por usuário sem privilégios de administrador! Usuário: ${user?.username || 'anônimo'} (Nível: ${user?.nivelAcesso ?? 'Desconhecido'}).`
      );

      // Trigger backend honeypot endpoint
      fetch('/api/auditoria', {
        headers: {
          'x-user-id': user?.id || 'anonymous'
        }
      }).catch(() => {});

      // Dispatch security alert in Redux
      dispatch(
        logSecurityEvent({
          tipo: 'BLOQUEIO',
          mensagem: `🚨 HONEYPOT ATIVADO: Tentativa não autorizada de acessar /auditoria por ${user?.username || 'anônimo'}.`,
          nivelTentativa: user?.nivelAcesso || NivelAcesso.PUBLICO,
        })
      );

      // Redirect to Access Denied
      navigate('/acesso-negado', {
        state: {
          docCodigo: 'HONEYPOT-AUDITORIA',
          docTitulo: 'ALERTA DE HONEYPOT: Acesso não autorizado ao módulo restrito de logs (/auditoria). A tentativa foi interceptada e registrada pelo sistema de Defesa Ativa.',
          nivelExigido: NivelAcesso.ULTRASSECRETO,
          nivelUsuario: user?.nivelAcesso || NivelAcesso.PUBLICO,
          challenge: 'honeypot_triggered'
        },
        replace: true
      });
    }
  }, [isUnauthorized, user, navigate, dispatch]);

  // Security barrier: only admin
  if (isUnauthorized) {
    return null;
  }

  const allLogs = useMemo(() => {
    const logs: any[] = [];
    
    // Extract logs from all documents
    documents.forEach((doc) => {
      // Creation Log
      logs.push({
        id: `c-${doc.id}`,
        timestamp: doc.dataCriacao, // The timestamp on the document is YYYY-MM-DD usually, so let's rely on historicoAcesso if possible
        data: doc.historicoAcesso[doc.historicoAcesso.length - 1]?.data || doc.dataCriacao,
        acao: 'CRIADO',
        usuario: doc.autor,
        documentoCodigo: doc.codigo,
        documentoTitulo: doc.titulo,
        nivel: doc.nivelAcesso
      });

      // Access Logs
      doc.historicoAcesso.forEach((hist, index) => {
        // Skip the last one if it's the creation log
        if (index === doc.historicoAcesso.length - 1 && hist.acao.includes('Criação')) return;
        
        logs.push({
          id: hist.id,
          data: hist.data,
          acao: 'ACESSADO',
          usuario: hist.usuario,
          documentoCodigo: doc.codigo,
          documentoTitulo: doc.titulo,
          nivel: doc.nivelAcesso
        });
      });
    });

    // Sort by most recent parsed date
    return logs.sort((a, b) => {
      const parseDate = (dateStr: string) => {
        if (!dateStr) return 0;
        // YYYY-MM-DD HH:MM
        if (dateStr.includes('-')) {
          return new Date(dateStr).getTime();
        }
        // DD/MM/YYYY, HH:MM
        if (dateStr.includes('/')) {
          const parts = dateStr.split(/[, ]+/);
          if (parts.length >= 1) {
            const [day, month, year] = parts[0].split('/');
            const timePart = parts[1] || '00:00';
            const [hour, minute] = timePart.split(':');
            return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
          }
        }
        return 0;
      };

      const timeA = parseDate(a.data);
      const timeB = parseDate(b.data);

      if (timeA === timeB) {
        // ID fallback for same date/time
        // Convert to numbers if they are pure timestamps, else use string compare
        const numA = Number(a.id.replace(/\D/g, ''));
        const numB = Number(b.id.replace(/\D/g, ''));
        if (numA && numB) return numB - numA;
        return b.id.localeCompare(a.id);
      }
      return timeB - timeA;
    });
  }, [documents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="border-b border-[#222] pb-4 mb-6">
        <h1 className="text-[12px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="text-[var(--color-text-muted)] w-4 h-4" />
          REGISTRO_DE_AUDITORIA_GLOBAL
        </h1>
        <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-2">
          LOG DE ATIVIDADES DO SISTEMA. ACESSO ESTRITAMENTE RESTRITO A OPERADORES NÍVEL ADMINISTRADOR.
        </p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] overflow-hidden relative">
        {/* Subtle grid background on the table container */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#111] border-b border-[#333] text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
                <th className="px-4 py-3 font-bold">DATA / HORA</th>
                <th className="px-4 py-3 font-bold">OPERAÇÃO</th>
                <th className="px-4 py-3 font-bold">OPERADOR</th>
                <th className="px-4 py-3 font-bold">ALVO (ID/NOME)</th>
                <th className="px-4 py-3 font-bold">CLASSIFICAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {allLogs.length > 0 ? (
                allLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#222] hover:bg-[#111] transition-colors group">
                    <td className="px-4 py-4 text-[10px] font-mono text-[#666] whitespace-nowrap">
                      {log.data}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border ${
                        log.acao === 'CRIADO' 
                          ? 'bg-transparent text-[var(--color-text-main)] border-[var(--color-text-main)]/30 group-hover:border-[var(--color-text-main)]' 
                          : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-text-muted)]/30 group-hover:border-[var(--color-text-muted)]'
                      }`}>
                        {log.acao === 'CRIADO' ? <PlusCircle className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[10px] font-mono text-[#aaa] uppercase tracking-widest">
                      {log.usuario}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">{log.documentoCodigo}</span>
                        <span className="text-[11px] font-mono text-white uppercase tracking-wider truncate max-w-[200px] sm:max-w-[300px]">{log.documentoTitulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-mono font-bold text-[#555] uppercase tracking-widest">LVL_{log.nivel}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#444] text-[10px] font-mono uppercase tracking-widest">
                    <Activity className="w-6 h-6 mx-auto mb-3 opacity-30" />
                    NENHUM_REGISTRO_ENCONTRADO
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
