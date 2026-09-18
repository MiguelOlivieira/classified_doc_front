import { NivelAcesso, User } from '../types/auth';

export interface DemoAccount {
  user: User;
  senhaOriginal: string;
  descricao: string;
}

export const MOCK_USERS: Record<string, DemoAccount> = {
  admin: {
    user: {
      id: 'usr-001',
      username: 'admin',
      nome: 'Dr. Arthur Vance',
      cargo: 'Diretor de Inteligência & Segurança',
      departamento: 'Divisão de Operações Estratégicas',
      nivelAcesso: NivelAcesso.ULTRASSECRETO,
      email: 'a.vance@classified.gov.sec',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      dataCriacao: '2024-01-15',
      ultimoAcesso: '2026-08-26 17:15',
      status: 'ATIVO',
    },
    senhaOriginal: 'admin123',
    descricao: 'Acesso Irrestrito (Nível 5 - Ultrassecreto)',
  },
  agente: {
    user: {
      id: 'usr-002',
      username: 'agente',
      nome: 'Capitã Elena Ramos',
      cargo: 'Oficial de Inteligência Tática',
      departamento: 'Defesa Cibernética e Monitoramento',
      nivelAcesso: NivelAcesso.SECRETO,
      email: 'e.ramos@classified.gov.sec',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      dataCriacao: '2024-06-10',
      ultimoAcesso: '2026-08-26 16:40',
      status: 'ATIVO',
    },
    senhaOriginal: '123456',
    descricao: 'Acesso Alto (Nível 4 - Secreto)',
  },
  analista: {
    user: {
      id: 'usr-003',
      username: 'analista',
      nome: 'Lucas Mendonça',
      cargo: 'Analista Financeiro e de Riscos Sênior',
      departamento: 'Controladoria & Compliance',
      nivelAcesso: NivelAcesso.CONFIDENCIAL,
      email: 'l.mendonca@classified.corp',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      dataCriacao: '2025-02-01',
      ultimoAcesso: '2026-08-26 14:22',
      status: 'ATIVO',
    },
    senhaOriginal: '123456',
    descricao: 'Acesso Médio (Nível 3 - Confidencial)',
  },
  usuario: {
    user: {
      id: 'usr-004',
      username: 'usuario',
      nome: 'Mariana Duarte',
      cargo: 'Assistente Administrativa Integrada',
      departamento: 'Recursos Humanos & Logística',
      nivelAcesso: NivelAcesso.INTERNO,
      email: 'm.duarte@classified.corp',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      dataCriacao: '2025-08-12',
      ultimoAcesso: '2026-08-26 11:05',
      status: 'ATIVO',
    },
    senhaOriginal: '123456',
    descricao: 'Acesso Operacional (Nível 2 - Interno)',
  },
  visitante: {
    user: {
      id: 'usr-005',
      username: 'visitante',
      nome: 'Visitante Institucional',
      cargo: 'Consultor Externo / Público',
      departamento: 'Relações Institucionais',
      nivelAcesso: NivelAcesso.PUBLICO,
      email: 'visitante@classified.corp',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      dataCriacao: '2026-01-10',
      ultimoAcesso: '2026-08-26 09:30',
      status: 'ATIVO',
    },
    senhaOriginal: '123456',
    descricao: 'Acesso Básico (Nível 1 - Público)',
  },
};
