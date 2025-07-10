
import React from 'react';

export const MapView: React.FC = () => {
  return (
    <div className="relative h-80 bg-gradient-to-br from-blue-100 to-green-100">
      {/* Simplified map representation */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Streets */}
          <path
            d="M0 150 L400 150 M200 0 L200 300 M100 50 L300 250 M100 250 L300 50"
            stroke="#6B7280"
            strokeWidth="2"
            opacity="0.3"
          />
          {/* Buildings */}
          <rect x="50" y="100" width="30" height="40" fill="#9CA3AF" opacity="0.4" />
          <rect x="120" y="80" width="25" height="50" fill="#9CA3AF" opacity="0.4" />
          <rect x="300" y="120" width="35" height="30" fill="#9CA3AF" opacity="0.4" />
          <rect x="250" y="90" width="20" height="60" fill="#9CA3AF" opacity="0.4" />
        </svg>
      </div>
      
      {/* Location Marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Map Labels */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm text-gray-600">
        Rue de Dégagement Nord
      </div>
      <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm text-gray-600">
        Centre-ville
      </div>
    </div>
  );
};
