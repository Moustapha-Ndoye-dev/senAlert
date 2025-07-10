import React, { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, MapPin, Activity, Building2, Crown } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    recentReports: []
  });
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Charger les données de l'admin connecté
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }

    // Charger les statistiques depuis localStorage
    const allReports = JSON.parse(localStorage.getItem('user_reports') || '[]');
    const users = new Set();
    
    // Filtrer les signalements selon le rôle
    let filteredReports = allReports;
    if (adminUser?.role === 'org_admin') {
      // Pour les admin d'organisation, on simule qu'ils ne voient que certains signalements
      // En réalité, ce serait basé sur la zone géographique ou l'organisation
      filteredReports = allReports.filter((report: any, index: number) => index % 3 === 0); // Simulation
    }
    
    filteredReports.forEach((report: any) => {
      if (report.userId) users.add(report.userId);
    });

    const pendingReports = filteredReports.filter((r: any) => r.status === 'en-attente' || r.status === 'en-cours');
    const resolvedReports = filteredReports.filter((r: any) => r.status === 'termine' || r.status === 'resolu');
    
    const recentReports = filteredReports
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setStats({
      totalReports: filteredReports.length,
      pendingReports: pendingReports.length,
      resolvedReports: resolvedReports.length,
      totalUsers: users.size,
      recentReports
    });
  }, [adminUser]);

  const isSuperAdmin = adminUser?.role === 'super_admin';

  const statCards = [
    {
      title: isSuperAdmin ? 'Total Signalements' : 'Mes Signalements',
      value: stats.totalReports,
      icon: FileText,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'En Attente',
      value: stats.pendingReports,
      icon: Clock,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Résolus',
      value: stats.resolvedReports,
      icon: CheckCircle,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: isSuperAdmin ? 'Tous Utilisateurs' : 'Utilisateurs Actifs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en-attente':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">En attente</span>;
      case 'en-cours':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">En cours</span>;
      case 'termine':
      case 'resolu':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Résolu</span>;
      case 'rejete':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Rejeté</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Inconnu</span>;
    }
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

  return (
    <div className="space-y-6">
      {/* Header avec gradient adaptatif */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {isSuperAdmin ? (
                <Crown className="w-8 h-8" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-indigo-100">
                {isSuperAdmin ? 'Gestion de la plateforme' : 'Gestion des signalements'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Dernière mise à jour</p>
            <p className="text-2xl font-bold">{new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards adaptatives */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className={`w-8 h-8 ${card.iconColor}`} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+15%</span>
              <span className="text-sm text-gray-500 ml-1">ce mois</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity adaptatif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isSuperAdmin ? 'Signalements Récents' : 'Mes Signalements Récents'}
            </h2>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {stats.recentReports.length > 0 ? (
              stats.recentReports.map((report: any, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="p-3 rounded-xl mr-4 bg-blue-100">
                    {getTypeIcon(report.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{getTypeLabel(report.type)}</p>
                    <p className="text-gray-600 text-xs truncate">{report.address || 'Adresse non spécifiée'}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(report.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  {isSuperAdmin ? 'Aucun signalement récent' : 'Aucun signalement dans votre zone'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Actions Rapides</h2>
          <div className="space-y-4">
            <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-4" />
                <div>
                  <p className="font-semibold text-blue-800 text-sm">
                    {isSuperAdmin ? 'Tous les signalements' : 'Nouveaux signalements'}
                  </p>
                  <p className="text-blue-600 text-xs">
                    {isSuperAdmin ? 'Voir tous les signalements' : 'Voir les derniers signalements'}
                  </p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-4" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">Signalements résolus</p>
                  <p className="text-green-600 text-xs">Marquer comme terminé</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-4" />
                <div>
                  <p className="font-semibold text-purple-800 text-sm">
                    {isSuperAdmin ? 'Gestion utilisateurs' : 'Utilisateurs actifs'}
                  </p>
                  <p className="text-purple-600 text-xs">
                    {isSuperAdmin ? 'Voir tous les utilisateurs' : 'Voir les utilisateurs de votre zone'}
                  </p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-4" />
                <div>
                  <p className="font-semibold text-orange-800 text-sm">
                    {isSuperAdmin ? 'Statistiques globales' : 'Mes statistiques'}
                  </p>
                  <p className="text-orange-600 text-xs">
                    {isSuperAdmin ? 'Voir les analyses globales' : 'Voir vos analyses'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Section spécifique au super admin */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Gestion Plateforme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800 text-sm">Organisations</span>
              </div>
              <p className="text-blue-600 text-xs">Gérer les organisations inscrites</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 text-sm">Tous Utilisateurs</span>
              </div>
              <p className="text-green-600 text-xs">Voir tous les utilisateurs de la plateforme</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800 text-sm">Système</span>
              </div>
              <p className="text-purple-600 text-xs">Configuration système avancée</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
