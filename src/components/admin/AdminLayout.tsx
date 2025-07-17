import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Building2,
  Heart,
  Globe,
  Database,
  Key,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [urgentReports, setUrgentReports] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadNotifications();
    loadUrgentReports();
  }, []);

  const loadNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
    const recentNotifications = allNotifications.filter((n: any) => {
      const notificationDate = new Date(n.date);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return notificationDate > yesterday;
    });
    setNotifications(recentNotifications);
  };

  const loadUrgentReports = () => {
    const allReports = JSON.parse(localStorage.getItem('user_reports') || '[]');
    const urgent = allReports.filter((r: any) => {
      const reportDate = new Date(r.date);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return r.status === 'en-attente' && reportDate < yesterday;
    });
    setUrgentReports(urgent);
  };

  const getEntityTypeInfo = (entityType: string) => {
    const entityMap: { [key: string]: { name: string; color: string; icon: any } } = {
      'mairie': { name: 'Mairie', color: 'from-blue-500 to-blue-600', icon: Building2 },
      'ong': { name: 'ONG', color: 'from-green-500 to-green-600', icon: Heart },
      'prive': { name: 'Structure Privée', color: 'from-purple-500 to-purple-600', icon: Building2 },
      'benevolat': { name: 'Bénévolat', color: 'from-orange-500 to-orange-600', icon: Activity }
    };
    return entityMap[entityType] || { name: 'Organisation', color: 'from-gray-500 to-gray-600', icon: Building2 };
  };

  // Menus selon le type d'admin
  const getMenuItems = () => {
    if (user?.type === 'superadmin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/super' },
        { icon: Building2, label: 'Organisations', href: '/admin/super/organizations' },
        { icon: FileText, label: 'Signalements', href: '/admin/super/reports' },
        { icon: Users, label: 'Utilisateurs', href: '/admin/super/users' },
        { icon: BarChart3, label: 'Statistiques', href: '/admin/super/statistics' },
        { icon: Database, label: 'Catégories', href: '/admin/super/categories' },
        { icon: Database, label: 'Système', href: '/admin/super/system' },
        { icon: Settings, label: 'Paramètres', href: '/admin/super/settings' },
      ];
    } else {
      // Admin d'organisation
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: FileText, label: 'Signalements', href: '/admin/dashboard/reports' },
        { icon: Bell, label: 'Notifications', href: '/admin/dashboard/notifications' },
        { icon: Users, label: 'Utilisateurs', href: '/admin/dashboard/users' },
        { icon: BarChart3, label: 'Statistiques', href: '/admin/dashboard/statistics' },
        { icon: Database, label: 'Catégories', href: '/admin/dashboard/categories' },
        { icon: Settings, label: 'Paramètres', href: '/admin/dashboard/settings' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('superadmin_auth');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const entityInfo = getEntityTypeInfo('mairie'); // Par défaut
  const EntityIcon = entityInfo.icon;
  const isSuperAdmin = user?.type === 'superadmin';

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header Sidebar */}
        <div className="bg-indigo-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                {isSuperAdmin ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <EntityIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Admin</h1>
                <p className="text-white/80 text-xs">
                  {isSuperAdmin ? 'Super Admin' : entityInfo.name}
                </p>
              </div>
            </div>
          <button
            onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
              <X className="w-4 h-4" />
          </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
                className={`w-full group relative`}
              >
                <div className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                  <item.icon className={`w-4 h-4 mr-3 ${
                    isActive(item.href) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <span className={`font-medium text-sm ${
                    isActive(item.href) ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
              {item.label}
                  </span>
                </div>
            </button>
          ))}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-gray-200 mt-auto">
          {/* Alertes urgentes */}
          {urgentReports.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">{urgentReports.length} urgent(s)</p>
                  <p className="text-xs text-red-600">En attente +24h</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {isSuperAdmin ? 'Administration Générale' : 'Administration'}
            </h1>
            <p className="text-sm text-gray-600">
              {user?.name} • {isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}
            </p>
          </div>
          </div>

          {/* Notifications et actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Profil */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
