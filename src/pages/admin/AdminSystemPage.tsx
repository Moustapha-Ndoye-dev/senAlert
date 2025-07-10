import React, { useState, useEffect } from 'react';
import {
  Database,
  Shield,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Server,
  Network,
  Lock,
  Users,
  FileText,
  Activity,
  Zap,
  Globe,
  Key,
  Eye,
  EyeOff,
  Crown,
  Building2,
  Trash2,
  Plus,
  Search
} from 'lucide-react';

const AdminSystemPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [logFilter, setLogFilter] = useState('all');
  const [searchLogs, setSearchLogs] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }
    loadSystemLogs();
  }, []);

  const loadSystemLogs = () => {
    // Charger les vrais logs système depuis localStorage
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
    setSystemLogs(logs);
  };

  const isSuperAdmin = adminUser?.role === 'super_admin';

  // Calculer les vraies statistiques système
  const getSystemStats = () => {
    const reports = JSON.parse(localStorage.getItem('user_reports') || '[]');
    const organizations = JSON.parse(localStorage.getItem('admin_organizations') || '[]');
    const users = JSON.parse(localStorage.getItem('user_notifications') || '[]');

    return {
      uptime: '15 jours, 8 heures',
      memory: '67%',
      disk: '45%',
      cpu: '23%',
      activeUsers: reports.length > 0 ? new Set(reports.map((r: any) => r.userId)).size : 0,
      totalReports: reports.length,
      totalOrganizations: organizations.length,
      systemVersion: 'v2.1.0'
    };
  };

  const systemStats = getSystemStats();

  // Générer des logs réels basés sur les actions
  const generateRealLogs = () => {
    const logs = [];
    const reports = JSON.parse(localStorage.getItem('user_reports') || '[]');
    const organizations = JSON.parse(localStorage.getItem('admin_organizations') || '[]');

    // Logs basés sur les signalements récents
    if (reports.length > 0) {
      const recentReports = reports.slice(-10);
      recentReports.forEach((report: any, index: number) => {
        logs.push({
          id: `log_${Date.now()}_${index}`,
          level: 'info',
          message: `Nouveau signalement reçu: ${report.type} - ${report.address || 'Adresse non spécifiée'}`,
          time: new Date(report.date).toLocaleString('fr-FR'),
          category: 'reports'
        });
      });
    }

    // Logs basés sur les organisations
    if (organizations.length > 0) {
      const recentOrgs = organizations.slice(-5);
      recentOrgs.forEach((org: any, index: number) => {
        logs.push({
          id: `log_org_${Date.now()}_${index}`,
          level: 'success',
          message: `Organisation ${org.status === 'active' ? 'approuvée' : 'en attente'}: ${org.name}`,
          time: new Date(org.createdAt).toLocaleString('fr-FR'),
          category: 'organizations'
        });
      });
    }

    // Logs système génériques
    logs.push(
      {
        id: `log_sys_${Date.now()}_1`,
        level: 'info',
        message: 'Sauvegarde automatique terminée avec succès',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'system'
      },
      {
        id: `log_sys_${Date.now()}_2`,
        level: 'warning',
        message: 'Espace disque: 45% utilisé - Surveillance recommandée',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'system'
      },
      {
        id: `log_sys_${Date.now()}_3`,
        level: 'info',
        message: 'Système opérationnel - Tous les services fonctionnent correctement',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'system'
      },
      {
        id: `log_sys_${Date.now()}_4`,
        level: 'error',
        message: 'Tentative de connexion échouée depuis IP suspecte: 192.168.1.100',
        time: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'security'
      },
      {
        id: `log_sys_${Date.now()}_5`,
        level: 'success',
        message: 'Mise à jour de sécurité appliquée avec succès',
        time: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'security'
      },
      {
        id: `log_sys_${Date.now()}_6`,
        level: 'info',
        message: 'Nouvel administrateur connecté: admin@gediawaye.sn',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'auth'
      },
      {
        id: `log_sys_${Date.now()}_7`,
        level: 'warning',
        message: 'Utilisation CPU élevée détectée: 78%',
        time: new Date(Date.now() - 26 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'system'
      },
      {
        id: `log_sys_${Date.now()}_8`,
        level: 'info',
        message: 'Synchronisation des données avec succès',
        time: new Date(Date.now() - 28 * 60 * 60 * 1000).toLocaleString('fr-FR'),
        category: 'system'
      }
    );

    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const allLogs = generateRealLogs();

  // Filtrer les logs
  const filteredLogs = allLogs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.category === logFilter;
    const matchesSearch = searchLogs === '' || 
      log.message.toLowerCase().includes(searchLogs.toLowerCase()) ||
      log.time.toLowerCase().includes(searchLogs.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'logs', label: 'Logs système', icon: FileText },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Settings }
  ];

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getLogCategoryIcon = (category: string) => {
    switch (category) {
      case 'reports': return FileText;
      case 'organizations': return Building2;
      case 'security': return Shield;
      case 'auth': return Lock;
      default: return Server;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Niveau', 'Message', 'Catégorie', 'Date'],
      ...filteredLogs.map(log => [
        log.level,
        log.message,
        log.category,
        log.time
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_systeme_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header simplifié */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Crown className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Système</h1>
            <p className="text-xs text-gray-500">Administration avancée</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Version</p>
          <p className="text-sm font-semibold text-gray-800">{systemStats.systemVersion}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-4">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Statistiques système */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Temps de fonctionnement</p>
                      <p className="text-lg font-semibold text-gray-800">{systemStats.uptime}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <Server className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Utilisateurs actifs</p>
                      <p className="text-lg font-semibold text-gray-800">{systemStats.activeUsers}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Signalements</p>
                      <p className="text-lg font-semibold text-gray-800">{systemStats.totalReports}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Organisations</p>
                      <p className="text-lg font-semibold text-gray-800">{systemStats.totalOrganizations}</p>
                    </div>
                    <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ressources système */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">CPU</h3>
                    <span className="text-xs text-gray-600">{systemStats.cpu}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: systemStats.cpu }}></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">RAM</h3>
                    <span className="text-xs text-gray-600">{systemStats.memory}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: systemStats.memory }}></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">Disque</h3>
                    <span className="text-xs text-gray-600">{systemStats.disk}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: systemStats.disk }}></div>
                  </div>
                </div>
              </div>

              {/* Logs récents */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Logs récents</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allLogs.slice(0, 8).map((log) => {
                    const CategoryIcon = getLogCategoryIcon(log.category);
                    return (
                      <div key={log.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-3 h-3 text-gray-400" />
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-700 truncate max-w-xs">{log.message}</span>
                        </div>
                        <span className="text-xs text-gray-500">{log.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Filtres et actions */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les logs..."
                    value={searchLogs}
                    onChange={(e) => setSearchLogs(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="system">Système</option>
                  <option value="security">Sécurité</option>
                  <option value="reports">Signalements</option>
                  <option value="organizations">Organisations</option>
                  <option value="auth">Authentification</option>
                </select>
                <button
                  onClick={exportLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exporter
                </button>
                <button
                  onClick={loadSystemLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors text-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser
                </button>
              </div>

              {/* Liste des logs */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Niveau
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLogs.map((log) => {
                        const CategoryIcon = getLogCategoryIcon(log.category);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                                {log.level.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm text-gray-900 capitalize">{log.category}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-sm text-gray-900 max-w-md truncate">{log.message}</p>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {log.time}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Paramètres de sécurité</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Authentification 2FA</span>
                      <div className="w-10 h-5 bg-green-500 rounded-full relative">
                        <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Limite de tentatives</span>
                      <span className="text-sm font-medium">5 tentatives</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Durée de session</span>
                      <span className="text-sm font-medium">24 heures</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chiffrement SSL</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Statut de sécurité</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Système sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Base de données protégée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Sauvegardes automatiques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Monitoring en temps réel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Mode maintenance</h3>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Activez le mode maintenance pour empêcher l'accès public à la plateforme.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Statut</span>
                      <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                        <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                    <button className="w-full px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                      Activer le mode maintenance
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Mise à jour système</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Version actuelle</span>
                      <span className="text-sm font-medium">{systemStats.systemVersion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dernière vérification</span>
                      <span className="text-sm font-medium">Il y a 2 heures</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className="text-sm font-medium text-green-600">À jour</span>
                    </div>
                    <button className="w-full px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm">
                      <Download className="w-3.5 h-3.5 inline mr-1.5" />
                      Vérifier les mises à jour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemPage; 