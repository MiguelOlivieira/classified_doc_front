import React from 'react';
import { NivelAcesso } from '../../types/auth';
import { NIVEIS_INFO, podeAcessar } from '../../types/document';
import { Shield, CheckCircle2, Lock, ArrowDown } from 'lucide-react';

interface SecurityHierarchyProps {
  userNivel: NivelAcesso;
  className?: string;
}

export const SecurityHierarchy: React.FC<SecurityHierarchyProps> = ({
  userNivel,
  className = '',
}) => {
  const levels = [
    NivelAcesso.PUBLICO,
    NivelAcesso.INTERNO,
    NivelAcesso.CONFIDENCIAL,
    NivelAcesso.SECRETO,
    NivelAcesso.ULTRASSECRETO,
  ];

  return (
    <div
      id="security-hierarchy-component"
      className={`bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-5 relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-surface-border)] relative z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
          <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest">
            HIERARQUIA RBAC
          </h3>
        </div>
        <span className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
          NÍVEL ATUAL: <strong className="text-[var(--color-accent-amber)]">LVL_{userNivel}</strong>
        </span>
      </div>

      <div className="space-y-0 relative z-10">
        {levels.map((nivel, index) => {
          const info = NIVEIS_INFO[nivel];
          const isCurrent = userNivel === nivel;
          const hasAccess = podeAcessar(userNivel, nivel);
          
          return (
            <React.Fragment key={nivel}>
              <div
                id={`hierarchy-item-${nivel}`}
                className={`relative flex items-center justify-between p-3 border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#111] border-[var(--color-accent-amber)]'
                    : hasAccess
                    ? 'bg-[#0a0a0a] border-[var(--color-surface-border)]'
                    : 'bg-[#050505] border-[#222] opacity-50'
                }`}
              >
                {isCurrent && (
                   <div className="absolute top-0 left-0 h-full w-1 bg-[var(--color-accent-amber)]"></div>
                )}
                
                <div className="flex items-center gap-3 ml-2">
                  <div
                    className={`w-7 h-7 flex items-center justify-center font-mono font-bold text-[10px] ${
                      isCurrent 
                        ? 'bg-[var(--color-accent-amber)] text-black' 
                        : hasAccess 
                          ? 'bg-[#222] text-white border border-[#333]' 
                          : 'bg-[#111] text-[#444] border border-[#222]'
                    }`}
                  >
                    0{nivel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isCurrent ? 'text-[var(--color-accent-amber)]' : hasAccess ? 'text-white' : 'text-[#666]'}`}>
                        {info.nome}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-bold uppercase bg-[var(--color-accent-amber)] text-black px-1.5 py-0.5">
                          ATUAL
                        </span>
                      )}
                    </div>
                    <p className={`text-[9px] font-mono mt-1 ${isCurrent ? 'text-[#999]' : 'text-[#555]'}`}>
                      {info.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasAccess ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      LIBERADO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[var(--color-accent-red)] uppercase tracking-widest">
                      <Lock className="w-3.5 h-3.5" />
                      NEGADO
                    </span>
                  )}
                </div>
              </div>

              {index < levels.length - 1 && (
                <div className="flex justify-center h-4 relative">
                  <div className="absolute top-0 w-px h-full bg-[var(--color-surface-border)]"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
