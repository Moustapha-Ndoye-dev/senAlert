import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserType } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes: UserType[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedTypes,
  redirectTo = '/',
  requireAuth = true
}) => {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si l'authentification n'est pas requise, afficher le contenu
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Si l'utilisateur n'est pas connecté, rediriger
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si le type d'utilisateur n'est pas autorisé, rediriger
  if (!allowedTypes.includes(user.type)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

// Composants spécialisés pour chaque type d'utilisateur
export const PopulationRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['population']} redirectTo="/">
    {children}
  </ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['admin']} redirectTo="/admin/login">
    {children}
  </ProtectedRoute>
);

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['superadmin']} redirectTo="/admin/login">
    {children}
  </ProtectedRoute>
);

export const AdminOrSuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['admin', 'superadmin']} redirectTo="/admin/login">
    {children}
  </ProtectedRoute>
);

export const AnyAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedTypes={['population', 'admin', 'superadmin']} redirectTo="/">
    {children}
  </ProtectedRoute>
); 