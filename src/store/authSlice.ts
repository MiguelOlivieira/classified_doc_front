import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, SecurityAlert, NivelAcesso, DemoAccount } from '../types/auth';
import { MOCK_USERS } from '../data/mockUsers';

// Inicia com o usuário Administrador por padrão para uma experiência rica imediata,
// mas totalmente navegável e comutável entre os níveis de acesso
const defaultUser = MOCK_USERS.admin.user;

const initialState: AuthState = {
  user: defaultUser,
  users: MOCK_USERS,
  isAuthenticated: true,
  rememberMe: true,
  lastLoginTime: new Date().toISOString(),
  securityAlerts: [
    {
      id: 'alt-01',
      timestamp: 'Hoje, 17:15',
      tipo: 'AUDITORIA',
      mensagem: 'Sessão criptografada estabelecida sob canal TLS 1.3 Seguro.',
    },
    {
      id: 'alt-02',
      timestamp: 'Hoje, 15:42',
      tipo: 'BLOQUEIO',
      mensagem: 'Tentativa de acesso não autorizado ao doc REL-2026-001 interceptada pelo RBAC.',
      documentoCodigo: 'REL-2026-001',
      nivelTentativa: NivelAcesso.INTERNO,
    },
    {
      id: 'alt-03',
      timestamp: 'Hoje, 11:20',
      tipo: 'INFO',
      mensagem: 'Políticas de sigilo de documentos atualizadas com sucesso.',
    },
  ],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: User; rememberMe: boolean }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.rememberMe = action.payload.rememberMe;
      state.lastLoginTime = new Date().toISOString();
      state.securityAlerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: 'Agora',
        tipo: 'INFO',
        mensagem: `Autenticação bem-sucedida para o usuário ${action.payload.user.username} (${action.payload.user.cargo}).`,
      });
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    blockUser: (state, action: PayloadAction<number>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.blockedUntil = action.payload;
    },
    switchUserDirect: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.securityAlerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: 'Agora',
        tipo: 'INFO',
        mensagem: `Alternância de perfil RBAC para ${action.payload.nome} (Nível: ${action.payload.nivelAcesso}).`,
      });
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logSecurityEvent: (
      state,
      action: PayloadAction<{
        tipo: 'INFO' | 'AVISO' | 'BLOQUEIO' | 'AUDITORIA';
        mensagem: string;
        documentoCodigo?: string;
        nivelTentativa?: NivelAcesso;
      }>
    ) => {
      state.securityAlerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: 'Agora',
        ...action.payload,
      });
      // Mantém no máximo 20 alertas
      if (state.securityAlerts.length > 20) {
        state.securityAlerts.pop();
      }
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.securityAlerts = state.securityAlerts.filter(
        (a) => a.id !== action.payload
      );
    },
    clearAlerts: (state) => {
      state.securityAlerts = [];
    },
    registerUser: (state, action: PayloadAction<{ username: string; demoAccount: DemoAccount }>) => {
      state.users[action.payload.username] = action.payload.demoAccount;
      state.securityAlerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: 'Agora',
        tipo: 'AUDITORIA',
        mensagem: `Novo usuário registrado: ${action.payload.demoAccount.user.nome} (${action.payload.demoAccount.user.cargo}).`,
      });
    },
  },
});

export const {
  login,
  logout,
  blockUser,
  switchUserDirect,
  updateProfile,
  logSecurityEvent,
  dismissAlert,
  clearAlerts,
  registerUser,
} = authSlice.actions;

export default authSlice.reducer;
