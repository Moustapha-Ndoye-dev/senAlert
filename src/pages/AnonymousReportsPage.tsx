import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { reportService } from '@/lib/supabase';
import { MediaViewer } from '../components/MediaViewer';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const AnonymousReportsPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!code.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez entrer votre code de suivi.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const reportsData = await reportService.getByAnonymousCode(code.trim());
      setReports(reportsData);
      setSearched(true);
      
      if (reportsData.length === 0) {
        toast({
          title: "Aucun signalement trouvé",
          description: "Aucun signalement n'a été trouvé avec ce code.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signalements trouvés",
          description: `${reportsData.length} signalement(s) trouvé(s).`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en-cours':
        return 'bg-blue-100 text-blue-800';
      case 'resolu':
        return 'bg-green-100 text-green-800';
      case 'rejete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en-attente':
        return 'En attente';
      case 'en-cours':
        return 'En cours';
      case 'resolu':
        return 'Résolu';
      case 'rejete':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'voirie': 'Problème de voirie',
      'eclairage': 'Éclairage public',
      'proprete': 'Propreté urbaine',
      'mobilier': 'Mobilier urbain',
      'autre': 'Autre'
    };
    return types[type as keyof typeof types] || type;
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

  const loadReports = async () => {
    try {
      const reportsData = await reportService.getAll();
      setReports(reportsData);
      setSearched(true);
      
      if (reportsData.length === 0) {
        toast({
          title: "Aucun signalement trouvé",
          description: "Aucun signalement n'a été trouvé.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signalements trouvés",
          description: `${reportsData.length} signalement(s) trouvé(s).`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive"
      });
    }
  };

  useRealtimeTable('reports', loadReports);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Suivi de signalements</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Consulter vos signalements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Entrez le code que vous avez reçu lors de l'envoi de votre signalement pour consulter son statut.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Code de suivi (ex: ABC123)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={6}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {searched && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Aucun signalement trouvé avec ce code.</p>
                      <p className="text-sm mt-2">Vérifiez que le code est correct.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Vos signalements ({reports.length})
                  </h2>
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {getTypeLabel(report.type)}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(report.created_at)}
                              </div>
                              {report.department && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {report.department}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-3">{report.description}</p>
                        {report.address && (
                          <p className="text-sm text-gray-600">
                            <strong>Adresse :</strong> {report.address}
                          </p>
                        )}
                        
                        {/* Affichage des médias */}
                        <MediaViewer 
                          photoUrl={report.photo_url} 
                          audioUrl={report.audio_url}
                          className="mt-4"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnonymousReportsPage; 