import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour obtenir le nom du département en fonction des coordonnées GPS
export function getDepartmentName(latitude: number, longitude: number): string {
  // Debug: afficher les coordonnées reçues
  console.log('Coordonnées reçues:', { latitude, longitude });

  // Les 46 départements officiels du Sénégal avec leurs coordonnées GPS
  const departments = [
    // Région de Dakar
    { name: "Dakar", lat: 14.7167, lng: -17.4677 },
    { name: "Pikine", lat: 14.7500, lng: -17.4000 },
    { name: "Guédiawaye", lat: 14.7833, lng: -17.4000 },
    { name: "Rufisque", lat: 14.7167, lng: -17.2667 },
    
    // Région de Thiès
    { name: "Thiès", lat: 14.7833, lng: -16.9333 },
    { name: "Tivaouane", lat: 14.9500, lng: -16.8167 },
    { name: "Mbour", lat: 14.4167, lng: -16.9667 },
    
    // Région de Diourbel
    { name: "Diourbel", lat: 14.6500, lng: -16.2333 },
    { name: "Bambey", lat: 14.7000, lng: -16.4667 },
    { name: "Mbacké", lat: 14.8000, lng: -15.9000 },
    
    // Région de Fatick
    { name: "Fatick", lat: 14.3667, lng: -16.6667 },
    { name: "Foundiougne", lat: 14.1333, lng: -16.4667 },
    { name: "Gossas", lat: 14.5000, lng: -16.9167 },
    
    // Région de Kaolack
    { name: "Kaolack", lat: 14.1500, lng: -16.0833 },
    { name: "Nioro du Rip", lat: 13.7500, lng: -15.8000 },
    { name: "Guinguinéo", lat: 14.2667, lng: -15.9500 },
    
    // Région de Kaffrine
    { name: "Kaffrine", lat: 14.1167, lng: -15.5500 },
    { name: "Birkelane", lat: 14.1500, lng: -15.7000 },
    { name: "Malem Hodar", lat: 14.0667, lng: -15.3000 },
    { name: "Koungheul", lat: 13.9833, lng: -14.8000 },
    
    // Région de Tambacounda
    { name: "Tambacounda", lat: 13.7667, lng: -13.6667 },
    { name: "Bakel", lat: 14.9000, lng: -12.4500 },
    { name: "Goudiry", lat: 14.1833, lng: -12.7167 },
    { name: "Koumpentoum", lat: 13.9833, lng: -13.8833 },
    
    // Région de Kédougou
    { name: "Kédougou", lat: 12.5500, lng: -12.1833 },
    { name: "Salémata", lat: 12.6333, lng: -12.8167 },
    { name: "Saraya", lat: 12.7167, lng: -11.7833 },
    
    // Région de Kolda
    { name: "Kolda", lat: 12.8833, lng: -14.9500 },
    { name: "Vélingara", lat: 13.1500, lng: -14.1167 },
    { name: "Médina Yoro Foulah", lat: 13.3167, lng: -15.3167 },
    
    // Région de Sédhiou
    { name: "Sédhiou", lat: 12.7000, lng: -15.5500 },
    { name: "Bounkiling", lat: 12.9667, lng: -15.7167 },
    { name: "Goudomp", lat: 12.5667, lng: -15.8667 },
    
    // Région de Ziguinchor
    { name: "Ziguinchor", lat: 12.5833, lng: -16.2833 },
    { name: "Bignona", lat: 12.8167, lng: -16.2333 },
    { name: "Oussouye", lat: 12.4833, lng: -16.5500 },
    
    // Région de Saint-Louis
    { name: "Saint-Louis", lat: 16.0333, lng: -16.5000 },
    { name: "Dagana", lat: 16.4833, lng: -15.6000 },
    { name: "Podor", lat: 16.6500, lng: -14.9667 },
    { name: "Linguère", lat: 15.3833, lng: -15.1167 },
    
    // Région de Louga
    { name: "Louga", lat: 15.6167, lng: -16.2167 },
    { name: "Kébémer", lat: 15.3500, lng: -16.4333 },
    { name: "Dahra", lat: 15.3500, lng: -15.4833 },
    
    // Région de Matam
    { name: "Matam", lat: 15.6500, lng: -13.2500 },
    { name: "Kanel", lat: 15.4833, lng: -13.1667 },
    { name: "Ranérou", lat: 15.3000, lng: -13.9667 }
  ];

  // Calculer la distance entre deux points (formule de Haversine)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Trouver le département le plus proche
  let closestDepartment = departments[0];
  let minDistance = calculateDistance(latitude, longitude, departments[0].lat, departments[0].lng);

  // Debug: afficher les distances pour les départements proches
  const distances = [];

  for (const dept of departments) {
    const distance = calculateDistance(latitude, longitude, dept.lat, dept.lng);
    distances.push({ name: dept.name, distance: distance.toFixed(2) });
    
    if (distance < minDistance) {
      minDistance = distance;
      closestDepartment = dept;
    }
  }

  // Trier les distances et afficher les 5 plus proches
  distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  console.log('5 départements les plus proches:', distances.slice(0, 5));
  console.log('Département sélectionné:', closestDepartment.name, 'Distance:', minDistance.toFixed(2), 'km');

  // Logique spéciale pour la région de Dakar
  // Si on est dans la région de Dakar (distance < 20km), prioriser Dakar
  const dakarDistance = calculateDistance(latitude, longitude, 14.7167, -17.4677);
  const pikineDistance = calculateDistance(latitude, longitude, 14.7500, -17.4000);
  const guediawayeDistance = calculateDistance(latitude, longitude, 14.7833, -17.4000);
  
  if (dakarDistance < 20 || pikineDistance < 20 || guediawayeDistance < 20) {
    console.log('Région de Dakar détectée, utilisation de Dakar');
    return "Dakar";
  }

  // Si la distance est trop grande, retourner "Localisation inconnue"
  if (minDistance > 50) {
    return "Localisation inconnue";
  }

  return closestDepartment.name;
}
