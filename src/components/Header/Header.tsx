import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, switchUserDirect, dismissAlert, clearAlerts } from '../../store/authSlice';
import { SecurityBadge } from '../SecurityBadge/SecurityBadge';
import {
  Shield,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  Info,
  Check,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, securityAlerts } = useAppSelector((state) => state.auth);

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface-bg)] border-b border-[var(--color-surface-border)] px-4 lg:px-6 py-3 flex items-center justify-between uppercase tracking-wider text-[11px] font-mono">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-[var(--color-text-muted)] hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[var(--color-accent-red)] animate-pulse"></div>
          <span className="font-bold text-white tracking-[0.2em]">SYS//CLASSIFIED</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] border-b border-transparent pb-0.5">
          <span className="hidden sm:inline">ID_OP:</span>
          <span className="font-bold text-white">{user?.username}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlertsDropdown(!showAlertsDropdown);
            }}
            className={`relative flex items-center gap-2 transition-colors pb-0.5 border-b border-transparent ${securityAlerts.length > 0 ? 'text-[var(--color-accent-amber)] hover:border-[var(--color-accent-amber)]' : 'text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-text-muted)]'}`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ALERTAS [{securityAlerts.length}]</span>
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-panel)]">
                <span className="text-[10px] text-[var(--color-text-muted)]">REGISTRO DE EVENTOS</span>
                {securityAlerts.length > 0 && (
                  <button
                    onClick={() => dispatch(clearAlerts())}
                    className="text-[10px] text-[var(--color-text-muted)] hover:text-white transition-colors"
                  >
                    [ LIMPAR TUDO ]
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {securityAlerts.length === 0 ? (
                  <p className="text-[10px] text-[var(--color-text-muted)] p-6 text-center italic">NENHUMA AMEAÇA ATIVA</p>
                ) : (
                  securityAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border-b border-[var(--color-surface-border)] flex items-start gap-3">
                      {alert.tipo === 'BLOQUEIO' ? (
                        <Lock className="w-4 h-4 text-[var(--color-accent-red)] shrink-0" />
                      ) : alert.tipo === 'AVISO' ? (
                        <AlertTriangle className="w-4 h-4 text-[var(--color-accent-amber)] shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                      )}
                      <div>
                        <p className="text-[11px] text-white leading-relaxed normal-case font-sans tracking-normal">{alert.mensagem}</p>
                        <p className="text-[9px] text-[var(--color-text-muted)] mt-2 font-mono uppercase">DATA_HORA: {alert.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User simple info */}
        <div className="hidden sm:flex items-center gap-4 pl-6 border-l border-[var(--color-surface-border)]">
          <div className="text-right">
            <p className="text-[11px] font-bold text-white">{user?.nome}</p>
            <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">NIVEL_{user?.nivelAcesso}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-colors ml-2"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
