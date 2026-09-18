import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Documento } from '../types/document';
import { NivelAcesso } from '../types/auth';
import { INITIAL_DOCUMENTS } from '../data/mockDocuments';

interface DocumentState {
  documents: Documento[];
  favoritos: string[]; // IDs de documentos favoritos
  // Modificado: Documentos recentes passa a ser um dicionário onde a chave é o ID do usuário
  documentosRecentesPorUsuario: Record<string, string[]>; 
  searchTerm: string;
  selectedClassification: NivelAcesso | 'TODOS';
  selectedDepartment: string;
  selectedStatus: string;
  sortBy: 'data' | 'nivel' | 'codigo' | 'titulo';
  sortOrder: 'asc' | 'desc';
}

const initialState: DocumentState = {
  documents: INITIAL_DOCUMENTS,
  favoritos: ['doc-001', 'doc-003'],
  documentosRecentesPorUsuario: {
    // Inicialização mock para manter compatibilidade, assumindo que alguns já viram algo
    'usr-001': ['doc-001', 'doc-002', 'doc-003', 'doc-004'],
  },
  searchTerm: '',
  selectedClassification: 'TODOS',
  selectedDepartment: 'TODOS',
  selectedStatus: 'TODOS',
  sortBy: 'nivel',
  sortOrder: 'desc',
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedClassification: (
      state,
      action: PayloadAction<NivelAcesso | 'TODOS'>
    ) => {
      state.selectedClassification = action.payload;
    },
    setSelectedDepartment: (state, action: PayloadAction<string>) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedStatus: (state, action: PayloadAction<string>) => {
      state.selectedStatus = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'data' | 'nivel' | 'codigo' | 'titulo'>
    ) => {
      state.sortBy = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    toggleFavorito: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoritos.includes(id)) {
        state.favoritos = state.favoritos.filter((favId) => favId !== id);
      } else {
        state.favoritos.push(id);
      }
    },
    registrarAcessoDocumento: (
      state,
      action: PayloadAction<{
        docId: string;
        usuario: string;
        usuarioId: string;
        cargo: string;
        nivel: NivelAcesso;
      }>
    ) => {
      const { docId, usuario, usuarioId, cargo, nivel } = action.payload;
      
      if (!state.documentosRecentesPorUsuario) {
        state.documentosRecentesPorUsuario = {};
      }

      // Inicializa array para o usuário caso não exista
      if (!state.documentosRecentesPorUsuario[usuarioId]) {
        state.documentosRecentesPorUsuario[usuarioId] = [];
      }
      
      // Atualiza recentes específico para esse usuário
      state.documentosRecentesPorUsuario[usuarioId] = [
        docId,
        ...state.documentosRecentesPorUsuario[usuarioId].filter((id) => id !== docId),
      ].slice(0, 10);

      // Adiciona registro ao histórico do documento
      const doc = state.documents.find((d) => d.id === docId);
      if (doc) {
        doc.historicoAcesso.unshift({
          id: `h-${Date.now()}`,
          data: new Date().toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          usuario,
          cargo,
          nivel,
          acao: 'Visualização de Documento Autenticado',
        });
      }
    },
    criarDocumento: (state, action: PayloadAction<{ documento: Documento, usuarioId: string }>) => {
      state.documents.unshift(action.payload.documento);
      
      if (!state.documentosRecentesPorUsuario) {
        state.documentosRecentesPorUsuario = {};
      }

      const userId = action.payload.usuarioId;
      if (!state.documentosRecentesPorUsuario[userId]) {
        state.documentosRecentesPorUsuario[userId] = [];
      }
      state.documentosRecentesPorUsuario[userId].unshift(action.payload.documento.id);
    },
    atualizarDocumento: (
      state,
      action: PayloadAction<{ id: string; dados: Partial<Documento> }>
    ) => {
      const index = state.documents.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = {
          ...state.documents[index],
          ...action.payload.dados,
          ultimaAtualizacao: new Date().toISOString().split('T')[0],
        };
      }
    },
    excluirDocumento: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
      state.favoritos = state.favoritos.filter((id) => id !== action.payload);
      
      if (!state.documentosRecentesPorUsuario) {
        state.documentosRecentesPorUsuario = {};
      }

      Object.keys(state.documentosRecentesPorUsuario).forEach((userId) => {
        state.documentosRecentesPorUsuario[userId] = state.documentosRecentesPorUsuario[userId].filter(
          (id) => id !== action.payload
        );
      });
    },
    resetarDocumentosPadrao: (state) => {
      state.documents = INITIAL_DOCUMENTS;
    },
  },
});

export const {
  setSearchTerm,
  setSelectedClassification,
  setSelectedDepartment,
  setSelectedStatus,
  setSortBy,
  toggleSortOrder,
  toggleFavorito,
  registrarAcessoDocumento,
  criarDocumento,
  atualizarDocumento,
  excluirDocumento,
  resetarDocumentosPadrao,
} = documentSlice.actions;

export default documentSlice.reducer;
