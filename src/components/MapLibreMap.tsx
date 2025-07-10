import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDepartment } from '@/hooks/useDepartment';

interface MapLibreMapProps {
  center?: [number, number];
  zoom?: number;
}

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  center = [14.7167, -17.4677], // Dakar
  zoom = 14
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { departmentName } = useDepartment();

  useEffect(() => {
    let userLocation: [number, number] = center;
    let map: maplibregl.Map;
    const styleUrl = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    // Fonction pour initialiser la carte
    const initializeMap = (location: [number, number]) => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: styleUrl,
        center: [location[1], location[0]], // [lng, lat]
        zoom: zoom,
        attributionControl: false,
        interactive: true
      });
      mapRef.current = map;

      // Marqueur utilisateur animé (halo pulsant)
      const el = document.createElement('div');
      el.className = 'user-location-marker-animated';
      el.innerHTML = `
        <span class="pulse"></span>
        <span class="dot"></span>
      `;
      new maplibregl.Marker(el)
        .setLngLat([location[1], location[0]])
        .setPopup(
          new maplibregl.Popup({ offset: 18, closeButton: false })
            .setHTML('<div class="font-semibold text-blue-700">Vous êtes ici</div>')
        )
        .addTo(map);

      // Centrage et animation
      map.flyTo({ center: [location[1], location[0]], zoom: zoom, speed: 1.2 });
    };

    // Géolocalisation utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = [position.coords.latitude, position.coords.longitude];
          initializeMap(userLocation);
        },
        () => {
          initializeMap(center);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    } else {
      initializeMap(center);
    }

    // Nettoyage
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [zoom]);

  // Ajout des styles personnalisés pour le marqueur animé
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <style>{`
        .user-location-marker-animated {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-location-marker-animated .pulse {
          position: absolute;
          width: 44px;
          height: 44px;
          background: radial-gradient(circle, #3B82F6 40%, #2563EB 100%, transparent 70%);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          opacity: 0.5;
        }
        .user-location-marker-animated .dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #3B82F6 60%, #2563EB 100%);
          border: 4px solid #fff;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(59,130,246,0.3);
          transform: translate(-50%, -50%);
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.7; }
          70% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.7; }
        }
      `}</style>
      <div
        ref={mapContainer}
        className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-300 rounded-3xl border-4 border-blue-300 shadow-2xl overflow-hidden"
        style={{ minHeight: '400px', minWidth: '300px', transition: 'box-shadow 0.3s' }}
      />
    </div>
  );
}; 