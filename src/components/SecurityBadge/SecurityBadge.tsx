import React from 'react';
import { NivelAcesso } from '../../types/auth';
import { NIVEIS_INFO } from '../../types/document';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock } from 'lucide-react';

interface SecurityBadgeProps {
  nivel: NivelAcesso;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLevel?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  nivel,
  size = 'sm',
  showIcon = true,
  showLevel = true,
  showDescription = false,
  className = '',
}) => {
  const info = NIVEIS_INFO[nivel] || NIVEIS_INFO[NivelAcesso.PUBLICO];

  const getIcon = () => {
    switch (nivel) {
      case NivelAcesso.ULTRASSECRETO:
        return <ShieldAlert className={iconSizeClasses[size]} />;
      case NivelAcesso.SECRETO:
        return <Lock className={iconSizeClasses[size]} />;
      case NivelAcesso.CONFIDENCIAL:
        return <Shield className={iconSizeClasses[size]} />;
      case NivelAcesso.INTERNO:
        return <Unlock className={iconSizeClasses[size]} />;
      case NivelAcesso.PUBLICO:
      default:
        return <ShieldCheck className={iconSizeClasses[size]} />;
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 uppercase font-medium rounded border ${info.badgeBg} ${info.badgeText} ${info.badgeBorder} ${sizeClasses[size]}`}
        title={`Nível ${info.nivel}: ${info.nome} - ${info.descricao}`}
      >
        {showIcon && getIcon()}
        <span>{info.nome}</span>
        {showLevel && (
          <span className="opacity-75 font-mono text-[0.9em] border-l border-current pl-1.5 ml-0.5">
            Lvl.{info.nivel}
          </span>
        )}
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 mt-1">{info.descricao}</span>
      )}
    </div>
  );
};
