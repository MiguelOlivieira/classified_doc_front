import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { NewDocumentModal } from '../NewDocumentModal/NewDocumentModal';
import { InactivityTimeout } from '../InactivityTimeout/InactivityTimeout';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

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
