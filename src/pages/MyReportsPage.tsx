import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Phone, MapPin, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCodeInput } from '@/components/AuthCodeInput';
import { reportService, Report, supabase } from '@/lib/supabase';
import { MediaViewer } from '@/components/MediaViewer';
import { Footer } from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const MyReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAnonymousCode, setCurrentAnonymousCode] = useState<string | null>(null);

  const handleCodeSubmit = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      // Vérifier si le code existe en cherchant des signalements
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('anonymous_code')
        .eq('anonymous_code', code)
        .limit(1);

      if (reportsError || !reports || reports.length === 0) {
        setError('Code d\'authentification introuvable. Vérifiez votre code ou faites un nouveau signalement.');
        return;
      }

      // Authentification réussie
      setCurrentAnonymousCode(code);
      setIsAuthenticated(true);

      // Charger les signalements de l'utilisateur
      await loadReports(code);

    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      setError('Erreur lors de la vérification du code. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (anonymousCode: string) => {
    try {
      setLoading(true);
      const data = await reportService.getByAnonymousCode(anonymousCode);
      setReports(data);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      setError('Erreur lors du chargement des signalements');
      toast({
        title: "Erreur",
        description: "Impossible de charger vos signalements.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-cours':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolu':
        return 'text-green-600 bg-green-100';
      case 'en-attente':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en-cours':
        return <Clock className="w-4 h-4" />;
      case 'resolu':
        return <CheckCircle className="w-4 h-4" />;
      case 'en-attente':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en-cours':
        return 'En cours';
      case 'resolu':
        return 'Terminé';
      case 'en-attente':
        return 'En attente';
      default:
        return 'Nouveau';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'voirie': 'Problème de voirie',
      'eclairage': 'Éclairage public',
      'proprete': 'Propreté urbaine',
      'mobilier': 'Mobilier urbain',
      'autre': 'Autre'
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useRealtimeTable('reports', loadReports);

  // Si pas authentifié, afficher le formulaire de saisie du code
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthCodeInput
          onCodeSubmit={handleCodeSubmit}
          title="Mes Signalements"
          description="Entrez votre code d'authentification pour voir vos signalements"
          error={error}
        />
        <Footer />
      </div>
    );
  }

  if (loading) {
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
            <h1 className="text-xl font-bold text-gray-800">Mes Signalements</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px] flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-gray-800">Mes Signalements</h1>
        </div>
      </header>

      <main className="p-6 flex-1">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun signalement</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore fait de signalement.</p>
              <Button onClick={() => navigate('/signaler')}>
                Faire un signalement
            </Button>
          </div>
          ) : (
          <div className="space-y-4">
                {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                          <span className="ml-1">{getStatusText(report.status)}</span>
                          </span>
                        <span className="text-sm text-gray-500">{getTypeLabel(report.type)}</span>
                        </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {report.description}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{report.address}</span>
                        </div>
                        <span>•</span>
                        <span>{report.department}</span>
                        <span>•</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      
                      {/* Affichage des médias */}
                      <MediaViewer 
                        photoUrl={report.photo_url} 
                        audioUrl={report.audio_url}
                        className="mt-3"
                      />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyReportsPage;
