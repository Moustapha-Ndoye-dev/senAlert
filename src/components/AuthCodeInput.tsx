import React, { useState } from 'react';
import { ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthCodeInputProps {
  onCodeSubmit?: (code: string) => void;
  title: string;
  description: string;
  error?: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

export const AuthCodeInput: React.FC<AuthCodeInputProps> = ({
  onCodeSubmit,
  title,
  description,
  error: externalError,
  onSuccess,
  redirectTo
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Utiliser la fonction onCodeSubmit fournie
      if (onCodeSubmit) {
        onCodeSubmit(code.trim());
        return;
      }

      // Si pas de onCodeSubmit, rediriger directement
      if (redirectTo) {
        navigate(redirectTo);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Erreur lors de la vérification du code. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = externalError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
              <p className="text-gray-600">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'authentification
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A2B4C8D9"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-center uppercase"
                  maxLength={8}
                  autoFocus
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format: 8 caractères alphanumériques (ex: A2B4C8D9)
                </p>
              </div>

              {displayError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{displayError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Vérification...' : 'Continuer'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Vous n'avez pas de code ?{' '}
                <button
                  onClick={() => navigate('/signaler')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Faire un signalement
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 