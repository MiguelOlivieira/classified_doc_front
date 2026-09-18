import React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Bell, Moon, LogOut } from 'lucide-react';
import { UserManagement } from '../../components/UserManagement/UserManagement';
import { CircuitBreakerPanel } from '../../components/CircuitBreakerPanel/CircuitBreakerPanel';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-400">
          Preferências do sistema e segurança da conta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation/Tabs mockup */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-slate-800 text-slate-200 rounded">
            <Settings className="w-4 h-4" /> Geral
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors">
            <Shield className="w-4 h-4" /> Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors">
            <Bell className="w-4 h-4" /> Notificações
          </button>
        </div>

        {/* Forms Area */}
        <div className="md:col-span-3 space-y-6">
          <UserManagement />

          <div className="bg-[#1e293b] border border-slate-700 rounded p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
              Preferências de Interface
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Tema Escuro</p>
                    <p className="text-xs text-slate-400">Forçar tema escuro em toda a aplicação.</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                  <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition" />
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700 rounded p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
              Segurança e Alertas
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-200">Confirmar acesso classificado</p>
                  <p className="text-xs text-slate-400">Solicitar confirmação antes de abrir documentos Nível 4+.</p>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-slate-700">
                  <span className="translate-x-1 inline-block w-4 h-4 transform bg-white rounded-full transition" />
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-200">Notificar bloqueios</p>
                  <p className="text-xs text-slate-400">Receber alerta quando acesso for negado.</p>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                  <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition" />
                </div>
              </label>
            </div>
          </div>

          <CircuitBreakerPanel />

          <div className="bg-[#1e293b] border border-slate-700 rounded p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
              Gerenciamento de Sessão
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Encerre sua sessão atual no sistema de forma segura. Todas as credenciais ativas serão invalidadas localmente.
            </p>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 text-sm font-medium rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Encerrar Sessão (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
