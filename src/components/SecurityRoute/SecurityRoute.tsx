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
  const { user } = useAppSelector((state) => state.auth);
  const documents = useAppSelector((state) => state.documents.documents);

  const userLevel = user?.nivelAcesso ?? NivelAcesso.PUBLICO;

  // Se os documentos ainda não foram carregados no Redux (ex: refresh direto na URL),
  // permite a renderização para que o DocumentDetailsPage busque a autorização diretamente na API.
  if (documents.length === 0) {
    return <>{children}</>;
  }

  const docExists = documents.find(
    (d) => d.id === id || d.codigo.toLowerCase() === id?.toLowerCase()
  );

  // Se o documento existe mas o usuário não possui nível suficiente, redireciona para a tela de acesso negado
  if (docExists && !podeAcessar(userLevel, docExists.nivelAcesso)) {
    return (
      <Navigate
        to="/acesso-negado"
        state={{
          docId: docExists.id,
          docCodigo: docExists.codigo,
          docTitulo: docExists.titulo,
          nivelExigido: docExists.nivelAcesso,
          nivelUsuario: userLevel,
        }}
        replace
      />
    );
  }

  // Se o documento realmente não existe
  if (!docExists) {
    return <Navigate to="/documentos" replace />;
  }

  return <>{children}</>;
};
