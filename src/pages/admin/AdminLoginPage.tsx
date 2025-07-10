import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Building2, 
  Users, 
  Heart, 
  Zap, 
  Droplets,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Crown,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginSuperAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Essayer d'abord la connexion super admin
      let success = await loginSuperAdmin(email, password);
      
      if (success) {
        navigate('/admin/super');
        return;
      }

      // Si ce n'est pas un super admin, essayer la connexion admin
      success = await loginAdmin(email, password);
      
      if (success) {
        navigate('/admin/dashboard');
        return;
      }

      // Si aucune connexion n'a fonctionné
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/admin/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
          </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion Administration
            </h1>
            <p className="text-gray-600 text-sm">
              Accédez à votre espace d'administration
            </p>
        </div>

          <form onSubmit={handleLogin} className="space-y-6">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ou nom d'utilisateur
              </label>
              <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com ou nom_utilisateur"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
              </label>
              <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
            type="submit"
            disabled={isLoading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
        </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">
              Vous n'avez pas encore de compte ?
            </p>
            <button
              onClick={handleRegister}
              className="w-full py-3 border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 rounded-xl font-medium transition-colors"
            >
              Demander un accès
            </button>
          </div>

          {/* Informations de test */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">Comptes de test :</h3>
            <div className="space-y-2 text-xs text-blue-700">
              <div>
                <strong>Super Admin :</strong> superadmin / superpass123
              </div>
              <div>
                <strong>Admin Organisation :</strong> admin_dakar / password123
              </div>
              <div>
                <strong>Admin ONG :</strong> admin_ong / password456
              </div>
              <div>
                <strong>Admin Privé :</strong> admin_eps / password789
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                <strong>Note :</strong> Ces comptes sont pour les tests uniquement. 
                En production, utilisez des mots de passe sécurisés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
