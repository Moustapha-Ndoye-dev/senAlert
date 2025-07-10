import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, Clock, AlertTriangle, MessageSquare, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthCodeInput } from '@/components/AuthCodeInput';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

interface Notification {
  id: string;
  anonymous_code?: string;
  report_id?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAnonymousCode, setCurrentAnonymousCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

    // Charger les notifications de l'utilisateur
      await loadNotifications(code);

    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      setError('Erreur lors de la vérification du code. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (anonymousCode: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('anonymous_code', anonymousCode)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications.",
          variant: "destructive"
        });
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!currentAnonymousCode) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        return;
      }

      // Mettre à jour l'état local
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));

    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentAnonymousCode) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('anonymous_code', currentAnonymousCode)
        .eq('read', false);

      if (error) {
        console.error('Erreur lors du marquage de tout comme lu:', error);
        return;
      }

      // Mettre à jour l'état local
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues.",
      });

    } catch (error) {
      console.error('Erreur lors du marquage de tout comme lu:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (!read) {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'info':
        default:
          return 'bg-blue-50 border-blue-200';
      }
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
            <CheckCircle className="w-3 h-3" />
            Succès
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
            <AlertTriangle className="w-3 h-3" />
            Attention
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
            <AlertTriangle className="w-3 h-3" />
            Erreur
          </span>
        );
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useRealtimeTable('notifications', loadNotifications);

  // Si pas authentifié, afficher le formulaire de saisie du code
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthCodeInput
          onCodeSubmit={handleCodeSubmit}
          title="Mes Notifications"
          description="Entrez votre code d'authentification pour accéder à vos notifications"
          error={error}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto flex-1">
        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Non lues</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Mes notifications</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {unreadCount} non lues
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-md cursor-pointer ${getNotificationBg(notification.type, notification.read)}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                      )}
                    </h3>
                        {getNotificationBadge(notification.type)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
            <p className="text-sm text-gray-400 mt-2">Les notifications apparaîtront ici quand l'administration vous enverra des messages.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
