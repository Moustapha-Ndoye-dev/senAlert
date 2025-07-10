import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Activity,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  Building2,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { reportService } from '@/lib/supabase';

const AdminReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Charger les données de l'admin connecté
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }
    loadReports();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, statusFilter, typeFilter, dateFilter, sortBy, sortOrder]);

  const loadReports = async () => {
    const allReports = await reportService.getAll();
    setReports(allReports);
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        switch (dateFilter) {
          case 'today':
            return reportDate >= today;
          case 'yesterday':
            return reportDate >= yesterday && reportDate < today;
          case 'week':
            return reportDate >= lastWeek;
          case 'month':
            return reportDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'address':
          aValue = a.address || '';
          bValue = b.address || '';
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  };

  const updateReportStatus = (reportId: string, newStatus: string) => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    );
    setReports(updatedReports);
    localStorage.setItem('user_reports', JSON.stringify(updatedReports));
  };

  const updateMultipleReports = (newStatus: string) => {
    const updatedReports = reports.map(report => 
      selectedReports.includes(report.id) ? { ...report, status: newStatus } : report
    );
    setReports(updatedReports);
    setSelectedReports([]);
    localStorage.setItem('user_reports', JSON.stringify(updatedReports));
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('user_reports', JSON.stringify(updatedReports));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'en-attente':
        return {
          label: 'En attente',
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          icon: Clock
        };
      case 'en-cours':
        return {
          label: 'En cours',
          color: 'text-blue-700',
          bg: 'bg-blue-100',
          icon: Activity
        };
      case 'termine':
      case 'resolu':
        return {
          label: 'Résolu',
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: CheckCircle
        };
      case 'rejete':
        return {
          label: 'Rejeté',
          color: 'text-red-700',
          bg: 'bg-red-100',
          icon: XCircle
        };
      default:
        return {
          label: 'Inconnu',
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: AlertTriangle
        };
    }
  };

  const getTypeInfo = (type: string) => {
    const typeData = {
      voirie: { name: 'Problème de voirie', color: 'from-blue-500 to-blue-600' },
      eclairage: { name: 'Éclairage public', color: 'from-yellow-500 to-yellow-600' },
      proprete: { name: 'Propreté urbaine', color: 'from-green-500 to-green-600' },
      mobilier: { name: 'Mobilier urbain', color: 'from-purple-500 to-purple-600' },
      autre: { name: 'Autre', color: 'from-gray-500 to-gray-600' }
    };

    const iconMap = {
      voirie: MapPin,
      eclairage: Activity,
      proprete: AlertTriangle,
      mobilier: FileText,
      autre: FileText
    };
    
    return {
      name: typeData[type]?.name || 'Non spécifié',
      color: typeData[type]?.color || 'from-gray-500 to-gray-600',
      icon: iconMap[type] || FileText
    };
  };

  const exportReports = () => {
    const csvContent = [
      ['ID', 'Type', 'Adresse', 'Description', 'Statut', 'Date', 'Utilisateur'],
      ...filteredReports.map(report => [
        report.id,
        getTypeInfo(report.type).name,
        report.address || '',
        report.description || '',
        report.status,
        new Date(report.date).toLocaleDateString('fr-FR'),
        report.userId || 'Anonyme'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signalements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  const stats = {
    total: reports.length,
    enAttente: reports.filter(report => report.status === 'en-attente').length,
    enCours: reports.filter(report => report.status === 'en-cours').length,
    resolu: reports.filter(report => report.status === 'resolu' || report.status === 'termine').length
  };

  useRealtimeTable('reports', loadReports);

  return (
    <div className="space-y-4">
      {/* Header simplifié */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
              <Crown className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Historique des signalements</h1>
            <p className="text-xs text-gray-500">Tous les signalements enregistrés dans la plateforme</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-800">{reports.length}</p>
        </div>
      </div>

      {/* Tableau historique des signalements */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mt-4">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  const typeInfo = getTypeInfo(report.type);
                  return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{report.created_at ? new Date(report.created_at).toLocaleDateString('fr-FR') : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{typeInfo.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{report.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                      </span>
                  </td>
                </tr>
              );
            })}
              </tbody>
            </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
            <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
        <span className="text-sm">Page {currentPage} / {totalPages}</span>
            <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
            </div>
    </div>
  );
};

export default AdminReportsPage;
