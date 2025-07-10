import React, { useState } from 'react';
import { Menu, User, Bell, Info, Home, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useDepartment } from '@/hooks/useDepartment';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { departmentName } = useDepartment();
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications non lues depuis Supabase
  const loadUnreadNotifications = async () => {
    try {
      // Pour l'instant, on ne peut pas charger les notifications sans code d'authentification
      // Cette fonction sera utilisée quand l'utilisateur sera authentifié
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setUnreadCount(0);
    }
  };

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: MessageCircle, label: "Mes signalements", href: "/mes-signalements" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Info, label: "À propos", href: "/about" },
  ];

  const handleMenuItemClick = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    console.log('Navigation vers notifications');
    navigate('/notifications');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 pb-4 border-b border-gray-100">
              <SheetTitle className="text-left text-lg font-semibold text-gray-800">
                Menu Principal
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col py-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item.href)}
                  className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500 text-left"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-gray-600 bg-white rounded-full p-1.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Département de</p>
                    <p className="text-xs text-gray-600">{departmentName}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-bold text-blue-700">SenAlert</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleNotificationClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
