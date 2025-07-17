import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';

interface MapLibreMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: { lat: number; lng: number; message: string; color?: string }[];
  onMarkerClick?: (index: number) => void;
  onMapClick?: () => void;
}

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  center = [14.7167, -17.4677],
  zoom = 14,
  markers = [],
  onMarkerClick,
  onMapClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<any[]>([]);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentBounds, setCurrentBounds] = useState<any>(null);
  const [supercluster, setSupercluster] = useState<any>(null);

  // Initialisation unique de la carte
  useEffect(() => {
    if (mapRef.current) return;
    const styleUrl = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: styleUrl,
      center: [center[1], center[0]],
        zoom: zoom,
        attributionControl: false,
        interactive: true
      });
      mapRef.current = map;
    // Gestion du clic sur la carte
    if (onMapClick) {
      map.on('click', (e) => {
        if (!(e.originalEvent.target as HTMLElement).classList.contains('custom-marker')) {
          onMapClick();
        }
      });
    }
    map.on('moveend', () => {
      setCurrentZoom(map.getZoom());
      setCurrentBounds(map.getBounds());
    });
    setCurrentZoom(map.getZoom());
    setCurrentBounds(map.getBounds());
    return () => {
      map.remove();
        mapRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // Mettre à jour supercluster à chaque changement de markers
  useEffect(() => {
    const points = markers.map((m, i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: { index: i, message: m.message, color: m.color || '#f59e42' }
    }));
    const sc = new Supercluster({ radius: 40, maxZoom: 18 });
    sc.load(points);
    setSupercluster(sc);
  }, [markers]);

  // Mise à jour des marqueurs quand markers, supercluster, currentZoom, currentBounds changent
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !supercluster) return;
    markerRefs.current.forEach(m => m.remove());
    markerRefs.current = [];
    const bbox = currentBounds
      ? [currentBounds.getWest(), currentBounds.getSouth(), currentBounds.getEast(), currentBounds.getNorth()]
      : [-180, -85, 180, 85];
    const clusters = supercluster.getClusters(bbox, Math.round(currentZoom || zoom));
    clusters.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      if (feature.properties.cluster) {
        // Marqueur de cluster
        const el = document.createElement('div');
        el.className = 'custom-marker cluster-marker';
        el.style.background = '#2563EB';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.border = '4px solid #fff';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#fff';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '15px';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        el.innerText = feature.properties.point_count_abbreviated;
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          new maplibregl.Popup({ offset: 18 })
            .setLngLat([lng, lat])
            .setHTML(`<div class='font-semibold text-blue-700'>${feature.properties.point_count} signalements</div>`)
            .addTo(map);
        });
        const markerObj = new maplibregl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(`<div class='font-semibold text-blue-700'>${feature.properties.point_count} signalements</div>`))
          .addTo(map);
        markerRefs.current.push(markerObj);
      } else {
        // Marqueur individuel
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.background = feature.properties.color || '#f59e42';
        el.style.width = '22px';
        el.style.height = '22px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid #fff';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        el.style.cursor = onMarkerClick ? 'pointer' : 'default';
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
        if (onMarkerClick) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onMarkerClick(feature.properties.index);
            new maplibregl.Popup({ offset: 18 })
              .setLngLat([lng, lat])
              .setHTML(`<div class='font-semibold text-orange-700'>1 signalement</div>`)
              .addTo(map);
          });
        }
        const markerObj = new maplibregl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(`<div class='font-semibold text-orange-700'>1 signalement</div>`))
          .addTo(map);
        markerRefs.current.push(markerObj);
      }
    });
  }, [markers, supercluster, currentZoom, currentBounds, onMarkerClick, zoom]);

  // Mise à jour du center/zoom quand ils changent
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [center[1], center[0]], zoom: zoom, speed: 1.2 });
  }, [center, zoom]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <style>{`
        .custom-marker {
          transition: none;
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