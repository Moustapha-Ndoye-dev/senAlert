import React from 'react';
import { Heart, Code, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo et nom */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-lg font-bold">S</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">SenAlert</h3>
              <p className="text-blue-200 text-sm">Plateforme citoyenne</p>
            </div>
          </div>

          {/* Développeur */}
          <div className="flex items-center space-x-2 text-center">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm">Fièrement développé par</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/10 px-3 py-1 rounded-full">
              <Globe className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-yellow-400">Digital Master Solution</span>
            </div>
          </div>

          {/* Année */}
          <div className="flex items-center space-x-1 text-blue-200 text-sm mt-4 md:mt-0">
            <span>© 2024</span>
            <Heart className="w-3 h-3 text-red-400 animate-pulse" />
            <span>SenAlert</span>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-blue-700 mt-6 pt-6">
          <div className="text-center text-blue-300 text-xs">
            <p>Plateforme de signalement citoyen pour le Sénégal</p>
            <p className="mt-1">Connectons les citoyens aux services publics</p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 