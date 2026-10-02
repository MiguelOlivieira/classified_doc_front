import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDocuments } from '../../store/documentSlice';
import { apiFetch } from '../../lib/api';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { NewDocumentModal } from '../NewDocumentModal/NewDocumentModal';
import { InactivityTimeout } from '../InactivityTimeout/InactivityTimeout';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      apiFetch('/api/documents', {
        headers: { 'x-user-id': user.id, 'x-user-role': user.role }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'Success' && data.documents) {
            // A API retorna do banco dados mais simples, então mapeamos para a tipagem do frontend
            const docsMapped = data.documents.map((d: any) => ({
              id: d.id,
              codigo: `${d.id}-G${d.nivelAcesso}`,
              titulo: d.titulo,
              subtitulo: '',
              departamento: d.departamento || 'GERAL',
              nivelAcesso: Number(d.nivelAcesso) || 1,
              autor: 'SISTEMA',
              cargoAutor: 'GESTOR',
              dataCriacao: new Date(d.createdAt).toISOString().split('T')[0],
              ultimaAtualizacao: new Date(d.createdAt).toISOString().split('T')[0],
              status: 'ATIVO',
              tags: [],
              resumo: d.titulo,
              conteudo: 'Acesse o documento para visualizar o conteúdo criptografado.',
              contemDadosSensiveis: false,
              paginas: 1,
              historicoAcesso: []
            }));
            dispatch(setDocuments(docsMapped));
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <div className="min-h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-main)] flex flex-col font-sans">
      <InactivityTimeout />
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenNewDocModal={() => setIsNewDocModalOpen(true)}
        />

        <main className="flex-1 lg:pl-56 w-full overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet context={{ onOpenNewDocModal: () => setIsNewDocModalOpen(true) }} />
          </div>
        </main>
      </div>

      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
      />
    </div>
  );
};
