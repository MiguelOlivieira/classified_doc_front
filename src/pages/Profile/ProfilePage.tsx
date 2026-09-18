import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { SecurityHierarchy } from '../../components/SecurityHierarchy/SecurityHierarchy';
import { SecurityBadge } from '../../components/SecurityBadge/SecurityBadge';
import { User, Mail, Building2, Calendar, ShieldCheck, Download, Trash2, AlertTriangle, CheckCircle2, LockKeyhole, QrCode } from 'lucide-react';
import { NivelAcesso } from '../../types/auth';
import { apiFetch } from '../../lib/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 2FA states
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);

  if (!user) return null;

  const handleExportData = () => {
    setIsExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      const mockData = JSON.stringify({ userInfo: user, exportDate: new Date().toISOString() }, null, 2);
      const blob = new Blob([mockData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lgpd_export_${user.username}_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => setExportSuccess(false), 5000);
    }, 1500);
  };

  const handleDeleteAccount = () => {
    dispatch(logout());
    navigate('/login');
  };

  const startMfaSetup = async () => {
    try {
      setMfaError('');
      const response = await apiFetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: { 'x-user-id': user.id || 'usr-002' }
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        setMfaSecret(data.secret);
      } else {
        setMfaError('Erro ao iniciar MFA');
      }
    } catch (e) {
      setMfaError('Erro de conexão');
    }
  };

  const finishMfaSetup = async () => {
    try {
      setMfaError('');
      const response = await apiFetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id || 'usr-002' },
        body: JSON.stringify({ code: mfaCode })
      });
      if (response.ok) {
        setMfaSuccess(true);
        setQrCodeUrl('');
      } else {
        const err = await response.json();
        setMfaError(err.error || 'Código inválido');
      }
    } catch (e) {
      setMfaError('Erro de conexão');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-surface-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--color-text-muted)]" />
            MEU_PERFIL
          </h1>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase mt-1">
            Gerenciamento de credenciais e nível de acesso
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.nome}
                className="w-20 h-20 border border-[var(--color-surface-border)] bg-black object-cover grayscale opacity-80"
              />
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{user.nome}</h2>
                <p className="text-[12px] text-[var(--color-text-muted)] font-mono mt-1 mb-3 uppercase tracking-widest">ID_OP: {user.username}</p>
                <SecurityBadge nivel={user.nivelAcesso} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-surface-border)]">
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <User className="w-3.5 h-3.5" /> Cargo
                </p>
                <p className="text-[13px] text-white uppercase font-mono">{user.cargo}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <Building2 className="w-3.5 h-3.5" /> Departamento
                </p>
                <p className="text-[13px] text-white uppercase font-mono">{user.departamento}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <Mail className="w-3.5 h-3.5" /> E-mail Institucional
                </p>
                <p className="text-[13px] text-white uppercase font-mono">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono font-bold uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> Status da Conta
                </p>
                <p className="text-[13px] text-emerald-400 font-mono font-bold uppercase tracking-widest">ATIVO</p>
              </div>
            </div>
          </div>
          
          {/* 2FA SETUP SECTION */}
          <div className="bg-[#0a0a0a] border border-[#222] p-6 mt-6">
            <div className="border-b border-[#222] pb-4 mb-6">
              <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <LockKeyhole className="w-4 h-4 text-[var(--color-text-muted)]" />
                AUTENTICAÇÃO EM DUAS ETAPAS (2FA)
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-mono text-[#888] uppercase leading-relaxed mb-4">
                  Aumente a segurança da sua conta adicionando uma etapa extra no login utilizando um aplicativo autenticador como Google Authenticator ou Authy.
                </p>

                {!qrCodeUrl && !mfaSuccess && (
                  <button
                    onClick={startMfaSetup}
                    className="py-2.5 px-4 border border-[var(--color-text-main)] text-[var(--color-text-main)] hover:bg-[var(--color-text-main)] hover:text-black transition-colors text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    CONFIGURAR 2FA
                  </button>
                )}

                {mfaSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono font-bold uppercase p-3 bg-emerald-950/20 border border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4" />
                    MFA HABILITADO COM SUCESSO
                  </div>
                )}
                
                {mfaError && (
                  <div className="mt-3 text-red-400 text-[10px] font-mono uppercase">
                    Erro: {mfaError}
                  </div>
                )}

                {qrCodeUrl && (
                  <div className="mt-4 p-4 border border-[#333] bg-[#111]">
                    <p className="text-[10px] font-mono font-bold text-white uppercase mb-3">
                      1. ESCANEIE O CÓDIGO QR ABAIXO NO SEU APP AUTENTICADOR:
                    </p>
                    <div className="bg-white p-2 inline-block mb-4">
                      <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                    </div>
                    
                    <p className="text-[10px] font-mono font-bold text-white uppercase mb-2">
                      2. DIGITE O CÓDIGO GERADO:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="Ex: 123456"
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] text-white text-[11px] font-mono uppercase focus:outline-none focus:border-[var(--color-text-muted)]"
                      />
                      <button
                        onClick={finishMfaSetup}
                        disabled={!mfaCode}
                        className="py-2 px-4 bg-[var(--color-text-main)] hover:bg-[var(--color-accent-amber)] text-black text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-50"
                      >
                        CONFIRMAR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] p-6 mt-6">
            <div className="border-b border-[#222] pb-4 mb-6">
              <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-text-muted)]" />
                PRIVACIDADE DE DADOS (LGPD)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#222] p-4 bg-[#111] flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[var(--color-text-main)]" />
                    PORTABILIDADE (EXPORTAÇÃO)
                  </h4>
                  <p className="text-[9px] text-[#888] font-mono uppercase leading-relaxed mb-4">
                    Solicite uma cópia integral dos seus dados.
                  </p>
                </div>
                {exportSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono font-bold uppercase p-2 bg-emerald-950/20 border border-emerald-900/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    EXPORTAÇÃO CONCLUÍDA
                  </div>
                ) : (
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="w-full py-2.5 px-4 border border-[var(--color-text-main)] text-[var(--color-text-main)] hover:bg-[var(--color-text-main)] hover:text-black transition-colors text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isExporting ? 'PROCESSANDO...' : 'SOLICITAR EXPORTAÇÃO'}
                  </button>
                )}
              </div>
              
              <div className="border border-red-900/30 p-4 bg-red-950/10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent-red)] opacity-50"></div>
                <div>
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    DIREITO AO ESQUECIMENTO
                  </h4>
                </div>
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 py-2 bg-[var(--color-accent-red)] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                      >
                        CONFIRMAR
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 border border-[#444] text-[#888] hover:text-white hover:border-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                      >
                        CANCELAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 px-4 border border-[var(--color-accent-red)] text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)] hover:text-white transition-colors text-[10px] font-mono font-bold uppercase tracking-widest flex justify-center items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    REVOGAR ACESSO
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <SecurityHierarchy userNivel={user.nivelAcesso} />
        </div>
      </div>
    </div>
  );
};
