import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

export const InactivityTimeout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      setShowWarning(false);

      // Show warning 30 seconds before logout
      warningId = setTimeout(() => {
        setShowWarning(true);
      }, INACTIVITY_LIMIT_MS - 30000);

      // Logout after 5 minutes
      timeoutId = setTimeout(() => {
        dispatch(logout());
        navigate('/login', { replace: true });
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, dispatch, navigate]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-[#111] border border-[var(--color-accent-amber)] p-4 shadow-2xl flex items-start gap-3 max-w-sm">
        <ShieldAlert className="w-5 h-5 text-[var(--color-accent-amber)] shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-[var(--color-accent-amber)] uppercase tracking-widest">
            Alerta de Inatividade
          </span>
          <span className="text-[9px] text-[#aaa] font-mono mt-1 uppercase leading-relaxed">
            Sua sessão expira em 30 segundos por inatividade. Movimente o mouse ou pressione uma tecla para continuar.
          </span>
        </div>
      </div>
    </div>
  );
};
