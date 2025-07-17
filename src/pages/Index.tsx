import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MapLibreMap } from '@/components/MapLibreMap';
import { IncidentList } from '@/components/IncidentList';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Crosshair2Icon, PlusIcon, MinusIcon } from '@radix-ui/react-icons';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>([14.7167, -17.4677]);
  const [zoom, setZoom] = useState(14);

  // Centrer la carte sur la position utilisateur dès qu'elle est connue
  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
      setZoom(15);
    }
  }, [userLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
      );
    }
  }, []);

  const markers = userLocation
    ? [{
        lat: userLocation.lat,
        lng: userLocation.lng,
        color: '#2563EB',
        message: "<b>Vous êtes ici</b>"
      }]
    : [];

  // Contrôles de zoom et recentrage
  const handleZoomIn = () => setZoom(z => Math.min(z + 1, 20));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 2));
  const handleRecenter = () => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
      setZoom(15);
    }
  };

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
            <MapLibreMap markers={markers} center={center} zoom={zoom} />
            {/* Contrôles de zoom et recentrage */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
              <button onClick={handleZoomIn} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition"><PlusIcon className="w-5 h-5" /></button>
              <button onClick={handleZoomOut} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition"><MinusIcon className="w-5 h-5" /></button>
              <button onClick={handleRecenter} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition"><Crosshair2Icon className="w-5 h-5" /></button>
            </div>
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
