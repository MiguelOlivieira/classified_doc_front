export enum NivelAcesso {
  PUBLICO = 1,
  INTERNO = 2,
  CONFIDENCIAL = 3,
  SECRETO = 4,
  ULTRASSECRETO = 5,
}

export interface User {
  id: string;
  username: string;
  nome: string;
  cargo: string;
  departamento: string;
  nivelAcesso: NivelAcesso;
  avatarUrl?: string;
  dataCriacao: string;
  ultimoAcesso: string;
  status: 'ATIVO' | 'SUSPENSO' | 'EM_REVISAO';
  email: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  tipo: 'INFO' | 'AVISO' | 'BLOQUEIO' | 'AUDITORIA';
  mensagem: string;
  documentoCodigo?: string;
  nivelTentativa?: NivelAcesso;
}

export interface DemoAccount {
  user: User;
  senhaOriginal: string;
  descricao: string;
}

export interface AuthState {
  user: User | null;
  users: Record<string, DemoAccount>;
  isAuthenticated: boolean;
  rememberMe: boolean;
  securityAlerts: SecurityAlert[];
  lastLoginTime?: string;
  blockedUntil?: number;
}
