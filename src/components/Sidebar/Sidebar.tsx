import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Star,
  User,
  Settings,
  FilePlus,
  ShieldCheck,
} from 'lucide-react';
import { NivelAcesso } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewDocModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenNewDocModal,
}) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documentos', path: '/documentos', icon: FileText },
    { label: 'Recentes', path: '/documentos?filtro=recentes', icon: Clock },
    { label: 'Favoritos', path: '/documentos?filtro=favoritos', icon: Star },
    { label: 'Meu Perfil', path: '/perfil', icon: User },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  if (user && user.nivelAcesso >= NivelAcesso.ULTRASSECRETO) {
    navItems.push({ label: 'AUDITORIA', path: '/auditoria', icon: ShieldCheck });
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-56 bg-[var(--color-surface-bg)] border-r border-[var(--color-surface-border)] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 pt-[57px] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
          
          {user && onOpenNewDocModal && (
            <div className="px-6">
              <button
                onClick={() => {
                  onOpenNewDocModal();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[10px] uppercase font-mono tracking-widest bg-[var(--color-text-main)] text-[var(--color-surface-bg)] hover:bg-[var(--color-text-muted)] transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>CRIAR_DOC</span>
              </button>
            </div>
          )}

          <nav className="px-4 space-y-1">
            <p className="px-3 mb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">OPERAÇÕES</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent =
                item.path.includes('?')
                  ? location.pathname + location.search === item.path
                  : location.pathname === item.path && !location.search.includes('filtro');

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-wide uppercase transition-colors border-l-2 ${
                    isCurrent
                      ? 'border-[var(--color-accent-amber)] bg-[#1a1a1a] text-white'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-white hover:bg-[#111111]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[var(--color-accent-amber)]' : 'opacity-60'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
