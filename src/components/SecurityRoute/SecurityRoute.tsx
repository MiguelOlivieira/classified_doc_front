import React, { useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { podeAcessar } from '../../types/document';
import { NivelAcesso } from '../../types/auth';
import { logSecurityEvent } from '../../store/authSlice';

interface SecurityRouteProps {
  children: React.ReactNode;
}

export const SecurityRoute: React.FC<SecurityRouteProps> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const documents = useAppSelector((state) => state.documents.documents);

  const userLevel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;

  const targetDoc = documents.find(
    (d) => (d.id === id || d.codigo.toLowerCase() === id?.toLowerCase()) && podeAcessar(userLevel, d.nivelAcesso)
  );

  // Removido useEffect de logSecurityEvent para evitar vazamento de existência
  // de documentos restritos se o usuário tentar adivinhar a URL.

  // Verifica se o documento não existe (ou se não há acesso, o que filtra acima)
  if (!targetDoc) {
    return <Navigate to="/documentos" replace />;
  }

  return <>{children}</>;
};
