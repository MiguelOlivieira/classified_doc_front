import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import { SecurityRoute } from '../components/SecurityRoute/SecurityRoute';
import { LoginPage } from '../pages/Login/LoginPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { DocumentsPage } from '../pages/Documents/DocumentsPage';
import { DocumentDetailsPage } from '../pages/DocumentDetails/DocumentDetailsPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { AccessDeniedPage } from '../pages/AccessDenied/AccessDeniedPage';
import { AuditLogsPage } from '../pages/AuditLogs/AuditLogsPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        
        {/* Security Route checks if user has clearance for specific document */}
        <Route
          path="documentos/:id"
          element={
            <SecurityRoute>
              <DocumentDetailsPage />
            </SecurityRoute>
          }
        />
        
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="auditoria" element={<AuditLogsPage />} />
        <Route path="acesso-negado" element={<AccessDeniedPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
