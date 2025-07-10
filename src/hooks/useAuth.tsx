import { useState, useEffect, createContext, useContext } from 'react';
import { 
  populationService, 
  adminService, 
  superAdminService,
  Population,
  Admin,
  SuperAdmin
} from '@/lib/supabase';

// Types d'utilisateurs
export type UserType = 'population' | 'admin' | 'superadmin';

// Interface pour l'utilisateur authentifié
export interface AuthUser {
  id: string;
  type: UserType;
  name: string;
  email?: string;
  phone?: string;
  permissions?: string[];
  organization_id?: string;
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginPopulation: (authCode: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  loginSuperAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// Contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser l'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Vérifier l'authentification population
      const populationAuth = localStorage.getItem('population_auth');
      if (populationAuth) {
        const authData = JSON.parse(populationAuth);
        setUser({
          id: authData.id,
          type: 'population',
          name: authData.name,
          phone: authData.phone
        });
        setLoading(false);
        return;
      }

      // Vérifier l'authentification admin
      const adminAuth = localStorage.getItem('admin_auth');
      if (adminAuth) {
        const authData = JSON.parse(adminAuth);
        setUser({
          id: authData.id,
          type: 'admin',
          name: authData.name,
          email: authData.email,
          permissions: authData.permissions,
          organization_id: authData.organization_id
        });
        setLoading(false);
        return;
      }

      // Vérifier l'authentification super admin
      const superAdminAuth = localStorage.getItem('superadmin_auth');
      if (superAdminAuth) {
        const authData = JSON.parse(superAdminAuth);
        setUser({
          id: authData.id,
          type: 'superadmin',
          name: authData.name,
          email: authData.email,
          permissions: authData.permissions
        });
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setLoading(false);
    }
  };

  // Connexion population
  const loginPopulation = async (authCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      const population = await populationService.verifyAuthCode(authCode);
      
      if (population) {
        // Mettre à jour l'activité
        await populationService.updateActivity(population.id);
        
        // Sauvegarder l'authentification
        const authData = {
          id: population.id,
          name: population.name,
          phone: population.phone,
          auth_code: population.auth_code
        };
        localStorage.setItem('population_auth', JSON.stringify(authData));
        
        setUser({
          id: population.id,
          type: 'population',
          name: population.name,
          phone: population.phone
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion population:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Connexion admin
  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const admin = await adminService.login(username, password);
      
      if (admin) {
        // Sauvegarder l'authentification
        const authData = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          permissions: admin.permissions,
          organization_id: admin.organization_id
        };
        localStorage.setItem('admin_auth', JSON.stringify(authData));
        
        setUser({
          id: admin.id,
          type: 'admin',
          name: admin.name,
          email: admin.email,
          permissions: admin.permissions,
          organization_id: admin.organization_id
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion admin:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Connexion super admin
  const loginSuperAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const superAdmin = await superAdminService.login(username, password);
      
      if (superAdmin) {
        // Sauvegarder l'authentification
        const authData = {
          id: superAdmin.id,
          name: superAdmin.name,
          email: superAdmin.email,
          permissions: superAdmin.permissions
        };
        localStorage.setItem('superadmin_auth', JSON.stringify(authData));
        
        setUser({
          id: superAdmin.id,
          type: 'superadmin',
          name: superAdmin.name,
          email: superAdmin.email,
          permissions: superAdmin.permissions
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion super admin:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('population_auth');
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('superadmin_auth');
    setUser(null);
  };

  // Vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    loading,
    loginPopulation,
    loginAdmin,
    loginSuperAdmin,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 