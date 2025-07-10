
// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for default markers in Leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// interface LeafletMapProps {
//   center?: [number, number];
//   zoom?: number;
//   markers?: Array<{
//     position: [number, number];
//     title: string;
//     type: 'active' | 'resolved';
//   }>;
// }

// export const LeafletMap: React.FC<LeafletMapProps> = ({ 
//   center = [14.7167, -17.4677], // Dakar coordinates
//   zoom = 12,
//   markers = []
// }) => {
//   const mapRef = useRef<HTMLDivElement>(null);
//   const mapInstanceRef = useRef<L.Map | null>(null);
//   const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

//   useEffect(() => {
//     console.log('LeafletMap component mounted');
    
//     // Demander la géolocalisation de l'utilisateur
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           console.log('Géolocalisation obtenue:', latitude, longitude);
//           setUserLocation([latitude, longitude]);
//         },
//         (error) => {
//           console.log('Géolocalisation refusée ou non disponible:', error);
//           // Utiliser la position par défaut (Dakar)
//           setUserLocation(center);
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 600000 // 10 minutes
//         }
//       );
//     } else {
//       console.log('Géolocalisation non supportée');
//       setUserLocation(center);
//     }
//   }, [center]);

//   useEffect(() => {
//     if (!mapRef.current || !userLocation) {
//       console.log('Map ref ou userLocation manquant:', { mapRef: !!mapRef.current, userLocation });
//       return;
//     }

//     console.log('Initialisation de la carte avec position:', userLocation);

//     // Clear any existing map
//     if (mapInstanceRef.current) {
//       mapInstanceRef.current.remove();
//     }

//     // Initialize map
//     const map = L.map(mapRef.current, {
//       center: userLocation,
//       zoom: zoom,
//       zoomControl: true,
//       attributionControl: true
//     });

//     console.log('Carte initialisée');

//     // Add OpenStreetMap tiles
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '© OpenStreetMap contributors',
//       maxZoom: 19
//     }).addTo(map);

//     console.log('Tiles ajoutées');

//     mapInstanceRef.current = map;

//     // Créer l'icône de localisation de l'utilisateur
//     const userLocationIcon = L.divIcon({
//       className: 'user-location-marker',
//       html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);"></div>',
//       iconSize: [26, 26],
//       iconAnchor: [13, 13]
//     });

//     // Ajouter le marqueur de localisation de l'utilisateur
//     L.marker(userLocation, {
//       icon: userLocationIcon
//     }).addTo(map).bindPopup('<div class="p-2"><strong>Votre position</strong></div>');

//     // Add default markers if none provided
//     const defaultMarkers = [
//       {
//         position: [14.7167, -17.4677] as [number, number],
//         title: 'Incident résolu - Éclairage public',
//         type: 'resolved' as const
//       },
//       {
//         position: [14.7267, -17.4577] as [number, number],
//         title: 'Incident en cours - Problème de voirie',
//         type: 'active' as const
//       }
//     ];

//     const allMarkers = markers.length > 0 ? markers : defaultMarkers;

//     // Create custom icons
//     const activeIcon = L.divIcon({
//       className: 'custom-marker',
//       html: '<div style="background-color: #F59E0B; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
//       iconSize: [20, 20],
//       iconAnchor: [10, 10]
//     });

//     const resolvedIcon = L.divIcon({
//       className: 'custom-marker',
//       html: '<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
//       iconSize: [20, 20],
//       iconAnchor: [10, 10]
//     });

//     // Add markers
//     allMarkers.forEach((marker) => {
//       const leafletMarker = L.marker(marker.position, {
//         icon: marker.type === 'resolved' ? resolvedIcon : activeIcon
//       }).addTo(map);

//       leafletMarker.bindPopup(`<div class="p-2"><strong>${marker.title}</strong></div>`);
//     });

//     console.log('Marqueurs ajoutés');

//     // Force map to resize after a small delay
//     setTimeout(() => {
//       map.invalidateSize();
//       console.log('Carte redimensionnée');
//     }, 100);

//     // Cleanup function
//     return () => {
//       console.log('Nettoyage de la carte');
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.remove();
//         mapInstanceRef.current = null;
//       }
//     };
//   }, [userLocation, zoom, markers]);

//   return (
//     <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
//       <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
//       <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm text-gray-600 shadow-sm z-[1000]">
//         Incidents signalés
//       </div>
//     </div>
//   );
// };
