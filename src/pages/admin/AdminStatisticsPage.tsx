import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Crown,
  Map
} from 'lucide-react';

const AdminStatisticsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }
    loadReports();
  }, []);

  const loadReports = () => {
    const allReports = JSON.parse(localStorage.getItem('user_reports') || '[]');
    setReports(allReports);
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';

  // Calculer les statistiques
  const getStats = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filteredReports = reports;
    switch (timeRange) {
      case 'day':
        filteredReports = reports.filter(r => new Date(r.date) >= lastDay);
        break;
      case 'week':
        filteredReports = reports.filter(r => new Date(r.date) >= lastWeek);
        break;
      case 'month':
        filteredReports = reports.filter(r => new Date(r.date) >= lastMonth);
        break;
    }

    const totalReports = filteredReports.length;
    const pendingReports = filteredReports.filter(r => r.status === 'en-attente').length;
    const inProgressReports = filteredReports.filter(r => r.status === 'en-cours').length;
    const resolvedReports = filteredReports.filter(r => r.status === 'resolu' || r.status === 'termine').length;
    const rejectedReports = filteredReports.filter(r => r.status === 'rejete').length;

    // Par type
    const typeStats = {
      voirie: filteredReports.filter(r => r.type === 'voirie').length,
      eclairage: filteredReports.filter(r => r.type === 'eclairage').length,
      proprete: filteredReports.filter(r => r.type === 'proprete').length,
      mobilier: filteredReports.filter(r => r.type === 'mobilier').length,
      autre: filteredReports.filter(r => r.type === 'autre').length
    };

    // Par région (zones chaudes)
    const regionStats = {
      dakar: filteredReports.filter(r => r.address?.toLowerCase().includes('dakar')).length,
      thies: filteredReports.filter(r => r.address?.toLowerCase().includes('thies')).length,
      saintLouis: filteredReports.filter(r => r.address?.toLowerCase().includes('saint-louis')).length,
      kaolack: filteredReports.filter(r => r.address?.toLowerCase().includes('kaolack')).length,
      ziguinchor: filteredReports.filter(r => r.address?.toLowerCase().includes('ziguinchor')).length
    };

    // Par jour (pour le graphique)
    const dailyStats = {};
    filteredReports.forEach(report => {
      const date = new Date(report.date).toLocaleDateString('fr-FR');
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Taux de résolution
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Temps moyen de résolution (simulation)
    const avgResolutionTime = 3.2; // jours

    return {
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      typeStats,
      regionStats,
      dailyStats,
      resolutionRate,
      avgResolutionTime
    };
  };

  const stats = getStats();

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'voirie': 'Problème de voirie',
      'eclairage': 'Éclairage public',
      'proprete': 'Propreté urbaine',
      'mobilier': 'Mobilier urbain',
      'autre': 'Autre'
    };
    return typeMap[type] || 'Non spécifié';
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'voirie': 'bg-blue-100 text-blue-700',
      'eclairage': 'bg-yellow-100 text-yellow-700',
      'proprete': 'bg-green-100 text-green-700',
      'mobilier': 'bg-purple-100 text-purple-700',
      'autre': 'bg-gray-100 text-gray-700'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voirie': return <MapPin className="w-4 h-4" />;
      case 'eclairage': return <Activity className="w-4 h-4" />;
      case 'proprete': return <AlertTriangle className="w-4 h-4" />;
      case 'mobilier': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const exportStats = () => {
    const csvContent = [
      ['Période', 'Total', 'En attente', 'En cours', 'Résolus', 'Rejetés', 'Taux de résolution'],
      [
        timeRange === 'day' ? 'Aujourd\'hui' : timeRange === 'week' ? 'Cette semaine' : 'Ce mois',
        stats.totalReports,
        stats.pendingReports,
        stats.inProgressReports,
        stats.resolvedReports,
        stats.rejectedReports,
        `${stats.resolutionRate}%`
      ]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Composant de graphique simple
  const SimpleBarChart = ({ data, title, color = 'bg-blue-500' }: any) => {
    const maxValue = Math.max(...Object.values(data));
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600">{key}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`${color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-sm font-medium text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant de carte du Sénégal simplifiée
  const SenegalMap = ({ regionStats }: any) => {
    const getRegionColor = (count: number) => {
      if (count === 0) return 'fill-gray-200';
      if (count <= 5) return 'fill-green-300';
      if (count <= 10) return 'fill-yellow-300';
      if (count <= 20) return 'fill-orange-300';
      return 'fill-red-300';
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Zones chaudes - Sénégal</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Carte simplifiée du Sénégal */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Régions simplifiées */}
              <path
                d="M50 30 L150 30 L140 80 L60 80 Z"
                className={getRegionColor(regionStats.dakar)}
                stroke="white"
                strokeWidth="2"
              />
              <text x="100" y="55" textAnchor="middle" className="text-xs font-medium">Dakar</text>
              <text x="100" y="70" textAnchor="middle" className="text-xs">{regionStats.dakar}</text>

              <path
                d="M40 90 L120 90 L110 140 L50 140 Z"
                className={getRegionColor(regionStats.thies)}
                stroke="white"
                strokeWidth="2"
              />
              <text x="80" y="115" textAnchor="middle" className="text-xs font-medium">Thiès</text>
              <text x="80" y="130" textAnchor="middle" className="text-xs">{regionStats.thies}</text>

              <path
                d="M20 150 L100 150 L90 180 L30 180 Z"
                className={getRegionColor(regionStats.saintLouis)}
                stroke="white"
                strokeWidth="2"
              />
              <text x="60" y="170" textAnchor="middle" className="text-xs font-medium">Saint-Louis</text>
              <text x="60" y="185" textAnchor="middle" className="text-xs">{regionStats.saintLouis}</text>
            </svg>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <span>1-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-300 rounded"></div>
            <span>6-10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-300 rounded"></div>
            <span>11-20</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <span>20+</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-600">Analyse complète des données de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-indigo-500" />
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportStats}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalReports}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résolus</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgressReports}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et carte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={stats.typeStats}
          title="Signalements par type"
          color="bg-blue-500"
        />
        <SenegalMap regionStats={stats.regionStats} />
      </div>

      {/* Statistiques détaillées */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques détaillées</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.resolutionRate}%</p>
            <p className="text-sm text-gray-600">Taux de résolution</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.avgResolutionTime} jours</p>
            <p className="text-sm text-gray-600">Temps moyen de résolution</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.rejectedReports}</p>
            <p className="text-sm text-gray-600">Signalements rejetés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage; 