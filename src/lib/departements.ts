// Liste des départements du Sénégal avec coordonnées approximatives du chef-lieu
export const departements = [
  { name: "Dakar", lat: 14.6928, lon: -17.4467 },
  { name: "Pikine", lat: 14.7645, lon: -17.3907 },
  { name: "Guédiawaye", lat: 14.7841, lon: -17.4065 },
  { name: "Rufisque", lat: 14.7156, lon: -17.2736 },
  { name: "Diourbel", lat: 14.6556, lon: -16.2346 },
  { name: "Bambey", lat: 14.7000, lon: -16.4667 },
  { name: "Mbacké", lat: 14.7901, lon: -15.9086 },
  { name: "Fatick", lat: 14.3396, lon: -16.4102 },
  { name: "Foundiougne", lat: 14.1333, lon: -16.4667 },
  { name: "Gossas", lat: 14.4956, lon: -16.0656 },
  { name: "Kaffrine", lat: 14.1050, lon: -15.5500 },
  { name: "Birkilane", lat: 14.3581, lon: -15.3497 },
  { name: "Koungheul", lat: 13.9950, lon: -14.8000 },
  { name: "Malem Hoddar", lat: 14.1833, lon: -15.1167 },
  { name: "Kaolack", lat: 14.1460, lon: -16.0726 },
  { name: "Guinguinéo", lat: 14.2667, lon: -15.9500 },
  { name: "Nioro du Rip", lat: 13.7500, lon: -15.8000 },
  { name: "Kédougou", lat: 12.5556, lon: -12.1744 },
  { name: "Salémata", lat: 12.7042, lon: -12.6997 },
  { name: "Saraya", lat: 12.8581, lon: -11.8667 },
  { name: "Kolda", lat: 12.8833, lon: -14.9500 },
  { name: "Médina Yoro Foulah", lat: 13.2167, lon: -14.0833 },
  { name: "Vélingara", lat: 13.1500, lon: -14.1167 },
  { name: "Louga", lat: 15.6144, lon: -16.2286 },
  { name: "Kébémer", lat: 15.3333, lon: -16.4167 },
  { name: "Linguère", lat: 15.3833, lon: -15.1167 },
  { name: "Matam", lat: 15.6559, lon: -13.2554 },
  { name: "Kanel", lat: 15.2261, lon: -13.1806 },
  { name: "Ranérou Ferlo", lat: 15.5000, lon: -13.7000 },
  { name: "Saint-Louis", lat: 16.0179, lon: -16.4897 },
  { name: "Dagana", lat: 16.0167, lon: -15.0500 },
  { name: "Podor", lat: 16.6667, lon: -14.9667 },
  { name: "Sédhiou", lat: 12.7081, lon: -15.5569 },
  { name: "Bounkiling", lat: 12.8000, lon: -15.2333 },
  { name: "Goudomp", lat: 12.5167, lon: -15.3667 },
  { name: "Tambacounda", lat: 13.7707, lon: -13.6673 },
  { name: "Bakel", lat: 14.9000, lon: -12.4667 },
  { name: "Goudiry", lat: 14.2000, lon: -12.8833 },
  { name: "Koumpentoum", lat: 13.9833, lon: -13.1167 },
  { name: "Thiès", lat: 14.7910, lon: -16.9256 },
  { name: "Mbour", lat: 14.4205, lon: -16.9644 },
  { name: "Tivaouane", lat: 15.1500, lon: -16.8167 },
  { name: "Ziguinchor", lat: 12.5833, lon: -16.2719 },
  { name: "Bignona", lat: 12.8081, lon: -16.2269 },
  { name: "Oussouye", lat: 12.4850, lon: -16.5461 },
];

// Fonction utilitaire pour trouver le département le plus proche d'un point GPS
export function getClosestDepartement(lat: number, lon: number) {
  let minDist = Infinity;
  let closest = null;
  for (const dep of departements) {
    const dist = Math.sqrt(
      Math.pow(dep.lat - lat, 2) + Math.pow(dep.lon - lon, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = dep.name;
    }
  }
  return closest;
} 