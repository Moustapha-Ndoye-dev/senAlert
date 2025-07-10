import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MapLibreMap } from '@/components/MapLibreMap';
import { IncidentList } from '@/components/IncidentList';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Carte avec bouton flottant */}
        <section className="relative">
          <div className="overflow-hidden rounded-b-3xl w-full h-[340px] bg-gray-200">
          <MapLibreMap />
          </div>
          {/* Bouton flottant centré sous la carte */}
          <div className="absolute left-1/2 -bottom-7 transform -translate-x-1/2 z-20">
            <button
              onClick={() => navigate('/signaler')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full shadow-xl font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(245,158,11,0.4)' }}
            >
              + Signaler
            </button>
          </div>
        </section>
        {/* Espace sous le bouton */}
        <div className="h-10" />
        {/* Section incidents */}
        <section className="px-4">
          <IncidentList />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
