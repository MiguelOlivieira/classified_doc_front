import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/authSlice';
import { MOCK_USERS } from '../../data/mockUsers';
import { SecurityBadge } from '../../components/SecurityBadge/SecurityBadge';
import {
  Shield,
  Lock,
  UserCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import bgImage from '../../assets/images/classified_terminal_bg_1789610478662.jpg';
import { apiFetch } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, users: storeUsers, blockedUntil } = useAppSelector((state) => state.auth);

  const users = storeUsers || MOCK_USERS;

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    if (blockedUntil && blockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setBlockTimeLeft(0);
          clearInterval(interval);
        } else {
          setBlockTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setBlockTimeLeft(0);
    }
  }, [blockedUntil]);

  useEffect(() => {
    if (isAuthenticated) {
      const origin = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockTimeLeft > 0) return;
    
    setErrorMessage('');
    setIsLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();
      
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: `${cleanUser}@sentinela.gov`, 
          password: password,
          fingerprint: navigator.userAgent
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.requires2FA) {
          setRequires2FA(true);
          setTempToken(responseData.tempToken);
          setIsLoading(false);
          return;
        }

        const account = users[cleanUser];
        if (account) {
          dispatch(login({ user: account.user, rememberMe }));
          const origin = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(origin, { replace: true });
        }
      } else {
        const errorText = await response.text();
        let errorData = { error: 'Erro de autenticação' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Resposta não-JSON na API de Login:', errorText);
        }
        setErrorMessage(`Bloqueio de Segurança: ${errorData.error}`);
      }
    } catch (err) {
      setErrorMessage('Erro Crítico: Falha de conexão com o servidor Fastify.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode) return;
    
    setErrorMessage('');
    setIsLoading(true);
    try {
      const cleanUser = username.trim().toLowerCase();
      const response = await apiFetch('/api/auth/login/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tempToken,
          code: mfaCode
        })
      });

      if (response.ok) {
        const account = users[cleanUser];
        if (account) {
          dispatch(login({ user: account.user, rememberMe }));
          const origin = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(origin, { replace: true });
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(`MFA Erro: ${errorData.error}`);
      }
    } catch (err) {
      setErrorMessage('Erro de conexão ao verificar 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (userKey: string) => {
    const demo = users[userKey];
    if (demo) {
      setUsername(demo.user.username);
      setPassword(demo.senhaOriginal);
      setErrorMessage('');
    }
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans"
    >
      {/* Left Image Side (hidden on very small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 border-r border-[#222]">
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="Classified System Server" className="w-full h-full object-cover opacity-60 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505] opacity-90"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#111] border border-[#333] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <h1 className="text-[12px] font-bold text-white uppercase tracking-widest">
              SISTEMA CORPORATIVO RBAC
            </h1>
            <h2 className="text-[9px] text-[var(--color-text-muted)] font-mono uppercase tracking-[0.2em] mt-1">
              Terminal de Acesso Restrito
            </h2>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex flex-col border-l-2 border-[var(--color-text-muted)] pl-4">
             <p className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Protocolo de Segurança Ativo</p>
             <p className="text-[11px] font-mono text-[#666] uppercase leading-relaxed max-w-md">O acesso a esta infraestrutura é estritamente monitorado. Todas as atividades estão sendo registradas. O uso não autorizado resultará em sanções imediatas.</p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen">
        {/* Subtle grid background on the right side */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>
        
        <main className="w-full max-w-[420px] z-10 my-auto">
          <div className="bg-[#0a0a0a] border border-[#222] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-text-muted)] opacity-20"></div>
             
             {/* Header Title (Mobile only, hidden on Desktop since it's on left panel) */}
            <div className="lg:hidden bg-[#111] border-b border-[#222] p-6 flex flex-col items-center">
              <Shield className="w-8 h-8 text-[var(--color-text-muted)] mb-3" />
              <h1 className="text-[12px] font-bold text-white uppercase tracking-widest">
                SISTEMA CORPORATIVO RBAC
              </h1>
              <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mt-1">
                Acesso Restrito
              </h2>
            </div>
            
            <div className="p-6 sm:p-8">
              <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-[#222] pb-3">
                <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                AUTENTICAÇÃO_DE_OPERADOR
              </h3>

              {/* Error Message */}
              {errorMessage && (
                <div
                  id="login-error-alert"
                  className="mb-6 p-3 bg-red-950/20 border-l-2 border-[var(--color-accent-red)] text-white text-[10px] font-mono uppercase flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-accent-red)]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              {requires2FA ? (
                <form onSubmit={handle2FALogin} className="space-y-5">
                  <div>
                    <label
                      htmlFor="mfacode"
                      className="block text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2"
                    >
                      CÓDIGO DE AUTENTICAÇÃO 2FA
                    </label>
                    <div className="relative">
                      <input
                        id="mfacode"
                        type="text"
                        required
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#333] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
                      />
                      <Lock className="w-4 h-4 text-[#555] absolute left-3.5 top-3" />
                    </div>
                  </div>
                  <button
                    id="mfa-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-[var(--color-surface-bg)] text-[10px] font-mono font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? <span>VERIFICANDO...</span> : <span>VERIFICAR 2FA</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRequires2FA(false); setMfaCode(''); }}
                    className="w-full py-2 px-4 bg-transparent border border-[#333] hover:border-[#555] text-[var(--color-text-muted)] text-[10px] font-mono font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    VOLTAR
                  </button>
                </form>
              ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2"
                  >
                    ID DO OPERADOR (E-MAIL OU USERNAME)
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="EX: ADMIN"
                      className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#333] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
                    />
                    <UserCheck className="w-4 h-4 text-[#555] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2"
                  >
                    CHAVE DE ACESSO (SENHA)
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#333] text-white text-[11px] font-mono focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
                    />
                    <KeyRound className="w-4 h-4 text-[#555] absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-2 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <div className="relative flex items-center justify-center">
                      <input
                        id="remember-me-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border border-[#444] bg-[#111] peer-checked:bg-[var(--color-text-main)] peer-checked:border-[var(--color-text-main)] transition-colors"></div>
                      <div className="absolute hidden peer-checked:block text-[#0a0a0a]">
                        <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                          <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#666] group-hover:text-white transition-colors">MANTER SESSÃO</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading || blockTimeLeft > 0}
                  className="w-full py-3 px-4 bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-[var(--color-surface-bg)] text-[10px] font-mono font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <span>AUTENTICANDO...</span>
                  ) : blockTimeLeft > 0 ? (
                    <span>BLOQUEADO ({blockTimeLeft}s)</span>
                  ) : (
                    <>
                      <span>INICIAR SESSÃO</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              )}

              {/* Quick Demo Accounts Selection */}
              <div className="mt-8 pt-6 border-t border-[#222]">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#555] mb-4 flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5" />
                  OPERADORES_DE_TESTE
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(users).map(([key, demo]) => (
                    <button
                      key={key}
                      id={`demo-user-btn-${key}`}
                      type="button"
                      onClick={() => handleFillDemo(key)}
                      className={`px-4 py-3 border text-left flex items-center justify-between transition-colors ${
                        username === demo.user.username
                          ? 'bg-[#111] border-[var(--color-accent-amber)]'
                          : 'bg-[#0a0a0a] border-[#222] hover:border-[#444]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${username === demo.user.username ? 'text-[var(--color-accent-amber)]' : 'text-white'}`}>
                          {demo.user.nome}
                        </span>
                        <span className="text-[9px] text-[#555] font-mono uppercase mt-1">
                          ID: {demo.user.username} | LVL_{demo.user.nivelAcesso}
                        </span>
                      </div>
                      <SecurityBadge nivel={demo.user.nivelAcesso} size="xs" showLevel={false} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="w-full text-center mt-6">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#444]">
              USO EXCLUSIVO PARA OPERADORES CREDENCIADOS
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
