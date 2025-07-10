import React, { useState, useEffect } from 'react';
import { reportService, Report } from '@/lib/supabase';
import { useDepartment } from '@/hooks/useDepartment';

interface Incident {
  id: string;
  address: string;
  status: 'en-cours' | 'termine' | 'en-attente';
  description: string;
  color: 'yellow' | 'green' | 'blue';
  department: string;
  created_at: string;
}

export const IncidentList: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { departmentName } = useDepartment();

  useEffect(() => {
    loadIncidents();
  }, [departmentName]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger tous les signalements
      const allReports = await reportService.getAll();
      
      // Filtrer par département si disponible
      let filteredReports = allReports;
      if (departmentName && departmentName !== 'Localisation inconnue') {
        filteredReports = allReports.filter(report => 
          report.department.toLowerCase().includes(departmentName.toLowerCase())
        );
      }

      // Limiter aux 5 plus récents
      const recentReports = filteredReports.slice(0, 5);

      // Convertir en format Incident
      const incidentsData: Incident[] = recentReports.map(report => ({
        id: report.id,
        address: report.address,
        status: getStatusFromReport(report.status),
        description: getStatusDescription(report.status),
        color: getStatusColor(report.status),
        department: report.department,
        created_at: report.created_at
      }));

      setIncidents(incidentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des incidents:', error);
      setError('Impossible de charger les incidents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromReport = (status: string): 'en-cours' | 'termine' | 'en-attente' => {
    switch (status) {
      case 'en-cours':
        return 'en-cours';
      case 'resolu':
        return 'termine';
      case 'en-attente':
      default:
        return 'en-attente';
    }
  };

  const getStatusDescription = (status: string): string => {
    switch (status) {
      case 'en-cours':
        return 'En cours de traitement';
      case 'resolu':
        return 'Problème résolu';
      case 'en-attente':
        return 'En attente de traitement';
      default:
        return 'Nouveau signalement';
    }
  };

  const getStatusColor = (status: string): 'yellow' | 'green' | 'blue' => {
    switch (status) {
      case 'en-cours':
        return 'yellow';
      case 'resolu':
        return 'green';
      case 'en-attente':
      default:
        return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-t-3xl mt-4 p-6 shadow-lg relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-gray-800 rounded-full mr-3"></div>
          <span className="text-gray-800 font-medium">Chargement des incidents...</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-t-3xl mt-4 p-6 shadow-lg relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-gray-800 rounded-full mr-3"></div>
          <span className="text-gray-800 font-medium">Erreur de chargement</span>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const zoneText = departmentName && departmentName !== 'Localisation inconnue' 
    ? `dans le département de ${departmentName}`
    : 'dans cette zone';

  return (
    <div className="bg-white rounded-t-3xl mt-4 p-6 shadow-lg relative z-10">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-gray-800 rounded-full mr-3"></div>
        <span className="text-gray-800 font-medium">
          {incidents.length} incident{incidents.length > 1 ? 's' : ''} rapporté{incidents.length > 1 ? 's' : ''} {zoneText}
        </span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        {incidents.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-500 text-2xl">📋</span>
            </div>
            <p className="text-gray-600 text-sm">Aucun incident signalé {zoneText}</p>
            <p className="text-gray-500 text-xs mt-1">Soyez le premier à signaler un problème !</p>
          </div>
        ) : (
          incidents.map((incident, idx) => (
            <div key={incident.id} className={idx !== incidents.length - 1 ? 'mb-4' : ''}>
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-2 ${
                  incident.color === 'yellow' ? 'bg-yellow-500' : 
                  incident.color === 'green' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{incident.address}</p>
                <p className={`text-sm ${
                    incident.status === 'en-cours' ? 'text-yellow-600' : 
                    incident.status === 'termine' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {incident.description}
                </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Signalé le {formatDate(incident.created_at)}
                  </p>
                </div>
              </div>
              {idx !== incidents.length - 1 && <hr className="my-3 border-gray-200" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
