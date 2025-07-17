import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart as PieIcon, MapPin, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import { reportService, organizationService } from '@/lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { MapLibreMap } from '@/components/MapLibreMap';
import { departements, getClosestDepartement } from '@/lib/departements';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const header = Object.keys(data[0]);
  const csvRows = [header.join(',')];
  for (const row of data) {
    csvRows.push(header.map(field => '"' + String(row[field] ?? '').replace(/"/g, '""') + '"').join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

function generateReportText(reports, startDate, endDate) {
  if (!reports.length) return 'Aucun signalement pour cette période.';
  const total = reports.length;
  const types = {};
  const status = {};
  const depts = {};
  let minDate = null, maxDate = null;
  reports.forEach(r => {
    types[r.type] = (types[r.type] || 0) + 1;
    status[r.status] = (status[r.status] || 0) + 1;
    depts[r.department] = (depts[r.department] || 0) + 1;
    const d = new Date(r.created_at);
    if (!minDate || d < minDate) minDate = d;
    if (!maxDate || d > maxDate) maxDate = d;
  });
  const typeList = Object.entries(types).map(([k, v]) => `${k}: ${v}`).join(', ');
  const statusList = Object.entries(status).map(([k, v]) => `${k}: ${v}`).join(', ');
  const deptList = Object.entries(depts).map(([k, v]) => `${k}: ${v}`).join(', ');
  return `
État des lieux des signalements

Période : ${startDate || minDate?.toLocaleDateString('fr-FR') || '...'} au ${endDate || maxDate?.toLocaleDateString('fr-FR') || '...'}

Nombre total de signalements : ${total}

Répartition par type : ${typeList}
Répartition par statut : ${statusList}
Répartition par département : ${deptList}

Résumé :
Sur la période sélectionnée, la plateforme a enregistré ${total} signalement(s). Les types les plus fréquents sont : ${typeList}. Les départements les plus concernés sont : ${deptList}. Statuts des signalements : ${statusList}.
`;
}

function downloadPDF(reportText, filename) {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(reportText, 180);
  doc.text(lines, 15, 20);
  doc.save(filename);
}

const COLORS = ['#6366f1', '#a21caf', '#059669', '#f59e42', '#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#eab308'];

const AdminStatisticsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    byMonth: [],
    byType: {},
    byStatus: {},
    byDepartment: {},
    topOrgs: [],
  });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([14.5, -14.5]);
  const [zoom, setZoom] = useState(6);

  // Filtres rapport
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('global');

  // Filtrage des signalements selon les filtres
  const filteredReports = reports.filter(r => {
    const date = new Date(r.created_at);
    const afterStart = !startDate || date >= new Date(startDate);
    const beforeEnd = !endDate || date <= new Date(endDate + 'T23:59:59');
    return afterStart && beforeEnd;
  });

  // Découpage selon le type de rapport
  let displayedReports = filteredReports;
  if (reportType === 'journalier') {
    // Grouper par jour
    // (pour l'affichage, on garde la liste brute, mais on pourrait grouper si besoin)
  } else if (reportType === 'hebdomadaire') {
    // Grouper par semaine
  } else if (reportType === 'mensuel') {
    // Grouper par mois
  }
  // Sinon global : tout afficher

  // Colonnes à afficher/exporter
  const columns = [
    { key: 'created_at', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Statut' },
    { key: 'department', label: 'Département' },
    { key: 'address', label: 'Adresse' },
  ];

  // Préparer les données à exporter
  const exportData = displayedReports.map(r => ({
    Date: r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '',
    Type: r.type,
    Description: r.description,
    Statut: r.status,
    Département: r.department,
    Adresse: r.address,
  }));

  // Contrôles de zoom et recentrage
  const handleZoomIn = () => setZoom(z => Math.min(z + 1, 20));
  const handleZoomOut = () => setZoom(z => Math.max(z - 1, 2));
  const handleRecenter = () => {
    setCenter([14.5, -14.5]);
    setZoom(6);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const reports = await reportService.getAll();
    const orgs = await organizationService.getAll();
    setReports(reports);
    setOrganizations(orgs);
    setStats({
      byMonth: getReportsByMonth(reports),
      byType: getReportsByType(reports),
      byStatus: getReportsByStatus(reports),
      byDepartment: getReportsByDepartment(reports),
      topOrgs: getTopOrganizations(reports, orgs),
    });
  };

  // Helpers pour stats
  const getReportsByMonth = (reports: any[]) => {
    const months: { [key: string]: number } = {};
    reports.forEach(r => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  };
  const getReportsByType = (reports: any[]) => {
    const types: { [key: string]: number } = {};
    reports.forEach(r => {
      types[r.type] = (types[r.type] || 0) + 1;
    });
    return types;
  };
  const getReportsByStatus = (reports: any[]) => {
    const statuses: { [key: string]: number } = {};
    reports.forEach(r => {
      statuses[r.status] = (statuses[r.status] || 0) + 1;
    });
    return statuses;
  };
  const getReportsByDepartment = (reports: any[]) => {
    const depts: { [key: string]: number } = {};
    reports.forEach(r => {
      let deptName = 'Département inconnu';
      if (r.latitude && r.longitude) {
        deptName = getClosestDepartement(r.latitude, r.longitude);
      } else if (r.department) {
        deptName = r.department;
      }
      depts[deptName] = (depts[deptName] || 0) + 1;
    });
    return depts;
  };
  const getTopOrganizations = (reports: any[], orgs: any[]) => {
    const orgCount: { [key: string]: number } = {};
    reports.forEach(r => {
      if (r.organization_id) orgCount[r.organization_id] = (orgCount[r.organization_id] || 0) + 1;
    });
    return Object.entries(orgCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([orgId, count]) => {
        const org = orgs.find((o: any) => o.id === orgId);
        return { name: org?.name || orgId, count };
      });
  };

  // Suggestions d'analyse
  const getSuggestions = () => {
    const suggestions = [];
    // Pic d'activité ?
    if (stats.byMonth.length > 1) {
      const last = stats.byMonth[stats.byMonth.length - 1].count;
      const prev = stats.byMonth[stats.byMonth.length - 2].count;
      if (last > prev * 1.5) suggestions.push("Pic d'activité sur le dernier mois : surveiller les causes.");
    }
    // Catégorie dominante ?
    const maxType = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0];
    if (maxType && maxType[1] > (reports.length / 2)) suggestions.push(`La catégorie "${maxType[0]}" représente plus de 50% des signalements.`);
    // Organisation la plus active ?
    if (stats.topOrgs[0] && stats.topOrgs[0].count > 10) suggestions.push(`L'organisation "${stats.topOrgs[0].name}" est particulièrement active.`);
    return suggestions;
  };

  // Préparation des datas pour les graphiques
  const typeData = Object.entries(stats.byType).map(([type, value]) => ({ name: type, value }));
  const statusData = Object.entries(stats.byStatus).map(([status, value]) => ({ name: status, value }));
  const orgData = stats.topOrgs.map(org => ({ name: org.name, value: org.count }));

  // Grouper les signalements par département
  const reportsByDept: { [dept: string]: any[] } = {};
  reports.forEach(r => {
    let deptName = 'Département inconnu';
    if (r.latitude && r.longitude) {
      deptName = getClosestDepartement(r.latitude, r.longitude);
    } else if (r.department) {
      deptName = r.department;
    }
    if (!reportsByDept[deptName]) reportsByDept[deptName] = [];
    reportsByDept[deptName].push(r);
  });

  // Préparer les marqueurs de département
  const departmentMarkers = departements
    .filter(dep => reportsByDept[dep.name] && reportsByDept[dep.name].length > 0)
    .map(dep => ({
      lat: dep.lat,
      lng: dep.lon,
      department: dep.name,
      count: reportsByDept[dep.name].length,
      onClick: () => setSelectedDept(dep.name),
    }));

  // Génère une couleur hex stable à partir d'un nom de département
  function getDeptColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }
  // Marqueurs des signalements du département sélectionné
  const selectedDeptReports = selectedDept ? reportsByDept[selectedDept] || [] : [];
  const deptColor = selectedDept ? getDeptColor(selectedDept) : '#3B82F6';
  const signalementMarkers = selectedDeptReports.map(r => ({
    lat: r.latitude,
    lng: r.longitude,
    color: deptColor,
    message: `<div><b>${selectedDept}</b><br/>${r.description || ''}<br/><span style='font-size:11px;'>${r.status || ''} - ${r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : ''}</span></div>`
  }));

  // Coordonnées centrales des départements du Sénégal (exemple, à compléter/ajuster si besoin)
  const DEPARTMENT_CENTERS: Record<string, { lat: number; lng: number }> = {
    "Dakar": { lat: 14.7167, lng: -17.4677 },
    "Thiès": { lat: 14.7910, lng: -16.9256 },
    "Saint-Louis": { lat: 16.0179, lng: -16.4896 },
    "Kaolack": { lat: 14.1461, lng: -16.0726 },
    "Ziguinchor": { lat: 12.5833, lng: -16.2667 },
    "Diourbel": { lat: 14.6559, lng: -16.2334 },
    "Louga": { lat: 15.6144, lng: -16.2286 },
    "Fatick": { lat: 14.3396, lng: -16.4102 },
    "Kaffrine": { lat: 14.1057, lng: -15.5506 },
    "Kolda": { lat: 12.8833, lng: -14.9500 },
    "Kédougou": { lat: 12.5556, lng: -12.1743 },
    "Matam": { lat: 15.6559, lng: -13.2556 },
    "Sédhiou": { lat: 12.7081, lng: -15.5569 },
    "Tambacounda": { lat: 13.7707, lng: -13.6673 },
    "Podor": { lat: 16.6833, lng: -14.9667 },
    // ... ajoute d'autres départements si besoin
  };

  // Aperçu textuel du rapport
  const reportText = generateReportText(displayedReports, startDate, endDate);

    return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Rapport signalements */}
      <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="#2563EB" opacity="0.15"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="#2563EB" strokeWidth="2"/><path d="M7 9h10M7 13h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/></svg>
          <h2 className="text-xl font-bold text-blue-800">Rapport des signalements</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">Filtrez, visualisez et téléchargez un état des lieux synthétique des signalements selon vos critères.</p>
        {/* Filtres et export rapport */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="border rounded px-2 py-1">
              <option value="global">Global</option>
              <option value="journalier">Journalier</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
            </select>
          </div>
          <div className="flex-1 flex items-end">
            <button
              onClick={() => downloadPDF(reportText, `rapport_signalements_${reportType}_${startDate || 'debut'}_${endDate || 'fin'}.pdf`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow"
            >
              Télécharger PDF
            </button>
          </div>
        </div>
        {/* Aperçu textuel du rapport */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm whitespace-pre-line font-mono">
          {reportText}
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Statistiques & Analyse</h1>
      {/* Graphique évolution signalements/mois */}
      <div className="bg-white rounded-xl p-6 border shadow mb-8">
        <h2 className="text-xl font-bold mb-2 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />Évolution des signalements par mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.byMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
            </div>
      {/* Répartition par type/catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow">
          <h2 className="text-xl font-bold mb-2 flex items-center"><PieIcon className="w-5 h-5 mr-2 text-purple-500" />Répartition par catégorie</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 border shadow">
          <h2 className="text-xl font-bold mb-2 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-green-500" />Répartition par statut</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
            </div>
      {/* Top organisations */}
      <div className="bg-white rounded-xl p-6 border shadow">
        <h2 className="text-xl font-bold mb-2 flex items-center"><Building2 className="w-5 h-5 mr-2 text-blue-500" />Top organisations contributrices</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={orgData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
            </div>
      {/* Heatmap départements */}
      <div className="bg-white rounded-xl p-6 border shadow">
        <h2 className="text-xl font-bold mb-2 flex items-center"><MapPin className="w-5 h-5 mr-2 text-orange-500" />Répartition géographique des signalements</h2>
        <div className="overflow-hidden rounded-3xl w-full h-[400px] mb-4 relative">
          <MapLibreMap
            center={center}
            zoom={zoom}
            // Afficher un marqueur par signalement, même sans sélection
            markers={reports.filter(r => r.latitude && r.longitude).map(r => ({
              lat: r.latitude,
              lng: r.longitude,
              color: getDeptColor(getClosestDepartement(r.latitude, r.longitude)),
              message: `<div><b>${getClosestDepartement(r.latitude, r.longitude)}</b><br/>${r.description || ''}<br/><span style='font-size:11px;'>${r.status || ''} - ${r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : ''}</span></div>`
            }))}
            onMapClick={() => setSelectedDept(null)}
          />
          {/* Contrôles de zoom et recentrage */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition" title="Zoom +">
              <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#2563EB" strokeWidth="2" fill="none"/><line x1="10" y1="6" x2="10" y2="14" stroke="#2563EB" strokeWidth="2"/><line x1="6" y1="10" x2="14" y2="10" stroke="#2563EB" strokeWidth="2"/></svg>
            </button>
            <button onClick={handleZoomOut} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition" title="Zoom -">
              <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#2563EB" strokeWidth="2" fill="none"/><line x1="6" y1="10" x2="14" y2="10" stroke="#2563EB" strokeWidth="2"/></svg>
            </button>
            <button onClick={handleRecenter} className="bg-white shadow p-2 rounded-full hover:bg-blue-100 transition" title="Recentrer">
              <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#2563EB" strokeWidth="2" fill="none"/><circle cx="10" cy="10" r="3" stroke="#2563EB" strokeWidth="2" fill="#2563EB"/></svg>
            </button>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-2">Nombre de signalements par département :</p>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(stats.byDepartment)
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([dept, count]) => (
                <li key={dept} className="bg-blue-50 rounded px-3 py-1 text-xs text-blue-800 font-semibold flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-400" /> {dept} : {count}
                </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Suggestions */}
      <div className="bg-white rounded-xl p-6 border shadow">
        <h2 className="text-xl font-bold mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" />Suggestions & points d'attention</h2>
        <ul className="list-disc pl-6">
          {getSuggestions().length === 0 && <li>Aucune alerte particulière ce mois-ci.</li>}
          {getSuggestions().map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default AdminStatisticsPage; 