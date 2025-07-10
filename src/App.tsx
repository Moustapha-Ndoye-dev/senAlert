import React, { useEffect, useState, useRef } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ReportPage from "./pages/ReportPage";
import MyReportsPage from "./pages/MyReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AnonymousReportsPage from "./pages/AnonymousReportsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import AdminRegisterSuccessPage from "./pages/admin/AdminRegisterSuccessPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStatisticsPage from "./pages/admin/AdminStatisticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminOrganizationsPage from "./pages/admin/AdminOrganizationsPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import { toast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PopulationRoute, AdminRoute, SuperAdminRoute, AdminOrSuperAdminRoute } from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant pour rediriger selon le type d'utilisateur
const AdminRedirect = () => {
  const { user } = useAuth();
  
  if (user?.type === 'superadmin') {
    return <Navigate to="/admin/super" replace />;
  } else if (user?.type === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/admin/login" replace />;
  }
};

const App: React.FC = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [hasLocation, setHasLocation] = useState(!!localStorage.getItem('user_location'));
  const watchIdRef = useRef<number | null>(null);

  // Fonction pour vérifier si la localisation est bien stockée
  const checkLocation = () => {
    const loc = localStorage.getItem('user_location');
    setHasLocation(!!loc);
    setShowLocationModal(!loc);
  };

  useEffect(() => {
    checkLocation();
    const interval = setInterval(checkLocation, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour demander la localisation et la mettre à jour en temps réel
  const handleRequestLocation = () => {
    setLocationError('');
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('user_location', JSON.stringify({ latitude, longitude, timestamp: Date.now() }));
          setHasLocation(true);
          setShowLocationModal(false);
          setLocationError('');
          toast({
            title: 'Localisation activée',
            description: 'Votre position a bien été prise en compte.',
          });
        },
        (error) => {
          setLocationError("Impossible d'obtenir la localisation. Veuillez autoriser l'accès à votre position.");
          setShowLocationModal(true);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setShowLocationModal(true);
    }
  };

  useEffect(() => {
    // Si la localisation n'est pas présente, tenter de la demander automatiquement
    if (!hasLocation) {
      handleRequestLocation();
    }
    // Nettoyage du watchPosition si le composant est démonté
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          {/* Modal de demande de localisation */}
          {showLocationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center">
                <h2 className="text-xl font-bold mb-4">Localisation</h2>
                <p className="text-gray-600 mb-6">
                  Pour utiliser la plateforme, veuillez autoriser la localisation dans la fenêtre de votre navigateur.<br />
                  <span className="text-sm text-gray-500">(Une demande système va apparaître automatiquement.)</span>
                </p>
                {locationError && <p className="text-red-600 mb-4 text-sm">{locationError}</p>}
              </div>
            </div>
          )}
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/signaler" element={<ReportPage />} />
            <Route path="/suivi" element={<AnonymousReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mes-signalements" element={<MyReportsPage />} />
            
            {/* Routes admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/register/success" element={<AdminRegisterSuccessPage />} />
            
            {/* Route de redirection admin */}
            <Route path="/admin" element={<AdminRedirect />} />
            
            {/* Routes protégées pour les administrateurs */}
            <Route path="/admin/dashboard" element={
              <AdminOrSuperAdminRoute>
                <AdminLayout />
              </AdminOrSuperAdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="statistics" element={<AdminStatisticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            
            {/* Routes protégées pour les super administrateurs uniquement */}
            <Route path="/admin/super" element={
              <SuperAdminRoute>
                <AdminLayout />
              </SuperAdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="organizations" element={<AdminOrganizationsPage />} />
              <Route path="system" element={<AdminSystemPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="statistics" element={<AdminStatisticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            
            {/* Route catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
