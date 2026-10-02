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
      apiFetch('/api/documentos', {
        headers: { 'x-user-id': user.id, 'x-user-role': user.cargo }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'Success' && data.documents) {
            // Mapa para converter strings de nível para o enum numérico
            const nivelMap: Record<string, number> = {
              'PUBLICO': 1, 'INTERNO': 2, 'CONFIDENCIAL': 3,
              'SECRETO': 4, 'ULTRASSECRETO': 5,
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
            };

            // A API retorna do banco dados mais simples, então mapeamos para a tipagem do frontend
            const docsMapped = data.documents.map((d: any) => {
              const nivel = nivelMap[String(d.nivelAcesso).toUpperCase()] || 1;
              const createdDate = d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
              return {
                id: d.id,
                codigo: `${d.id}-G${nivel}`,
                titulo: d.titulo,
                subtitulo: '',
                departamento: d.departamento || 'GERAL',
                nivelAcesso: nivel,
                autor: 'SISTEMA',
                cargoAutor: 'GESTOR',
                dataCriacao: createdDate,
                ultimaAtualizacao: createdDate,
                status: 'ATIVO',
                tags: [],
                resumo: d.titulo,
                conteudo: 'Acesse o documento para visualizar o conteúdo criptografado.',
                contemDadosSensiveis: false,
                paginas: 1,
                historicoAcesso: []
              };
            });
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
