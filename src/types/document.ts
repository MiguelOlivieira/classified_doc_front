import { NivelAcesso } from './auth';

export type DocumentStatus = 'ATIVO' | 'ARQUIVADO' | 'REVISAO' | 'REVOGADO';

export interface DocumentoHistorico {
  id: string;
  data: string;
  usuario: string;
  cargo: string;
  nivel: NivelAcesso;
  acao: string;
}

export interface Documento {
  id: string;
  codigo: string;
  titulo: string;
  subtitulo?: string;
  nivelAcesso: NivelAcesso;
  departamento: string;
  autor: string;
  cargoAutor: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
  status: DocumentStatus;
  resumo: string;
  conteudo: string;
  paginas?: number;
  tamanho?: string;
  tags: string[];
  protocoloSeguranca?: string;
  contemDadosSensiveis?: boolean;
  historicoAcesso: DocumentoHistorico[];
}

export interface NivelInfo {
  nivel: NivelAcesso;
  nome: string;
  corNome: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  hexColor: string;
  descricao: string;
}

export function podeAcessar(
  nivelUsuario: NivelAcesso,
  nivelDocumento: NivelAcesso
): boolean {
  return nivelUsuario >= nivelDocumento;
}

export const NIVEIS_INFO: Record<NivelAcesso, NivelInfo> = {
  [NivelAcesso.PUBLICO]: {
    nivel: NivelAcesso.PUBLICO,
    nome: 'Público',
    corNome: 'Verde',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-500',
    accentBorder: 'border-emerald-500',
    hexColor: '#10B981',
    descricao: 'Acesso irrestrito a todos os colaboradores e partes interessadas.',
  },
  [NivelAcesso.INTERNO]: {
    nivel: NivelAcesso.INTERNO,
    nome: 'Interno',
    corNome: 'Azul',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
    accentBg: 'bg-blue-500',
    accentText: 'text-blue-500',
    accentBorder: 'border-blue-500',
    hexColor: '#3B82F6',
    descricao: 'Restrito ao quadro de colaboradores e parceiros autorizados.',
  },
  [NivelAcesso.CONFIDENCIAL]: {
    nivel: NivelAcesso.CONFIDENCIAL,
    nome: 'Confidencial',
    corNome: 'Amarelo',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-500',
    accentBorder: 'border-amber-500',
    hexColor: '#F59E0B',
    descricao: 'Informações sensíveis restritas a analistas e gestores com credencial.',
  },
  [NivelAcesso.SECRETO]: {
    nivel: NivelAcesso.SECRETO,
    nome: 'Secreto',
    corNome: 'Laranja',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20',
    accentBg: 'bg-orange-500',
    accentText: 'text-orange-500',
    accentBorder: 'border-orange-500',
    hexColor: '#F97316',
    descricao: 'Alto grau de sigilo para operações estratégicas e diretoria.',
  },
  [NivelAcesso.ULTRASSECRETO]: {
    nivel: NivelAcesso.ULTRASSECRETO,
    nome: 'Ultrassecreto',
    corNome: 'Vermelho',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/30',
    glowColor: 'shadow-red-500/20',
    accentBg: 'bg-red-500',
    accentText: 'text-red-500',
    accentBorder: 'border-red-500',
    hexColor: '#EF4444',
    descricao: 'Nível máximo de compartimentação. Acesso restrito ao comando de segurança.',
  },
};
