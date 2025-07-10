import React, { useEffect, useState } from 'react';
import {
  Building2, Heart, Users, Search, Clock, CheckCircle, XCircle, Eye, Shield, Mail, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, X, RefreshCw
} from 'lucide-react';
import { organizationService } from '@/lib/supabase';
import { useLoading } from '@/hooks/useLoading';

interface Organization {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: string;
  is_active: boolean;
  created_at: string;
  approved_at?: string;
}

const PAGE_SIZE = 10;

const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const { loading, withLoading } = useLoading();
  const [confirmStatus, setConfirmStatus] = useState<{org: Organization, nextActive: boolean} | null>(null);
  const [successMsg, setSuccessMsg] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    withLoading(async () => {
      const orgs = await organizationService.getAll();
      setOrganizations(orgs);
    });
  }, []);

  useEffect(() => {
    let filtered = organizations;
    if (search) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.email.toLowerCase().includes(search.toLowerCase()) ||
        org.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') filtered = filtered.filter(org => org.is_active);
      else if (statusFilter === 'pending') filtered = filtered.filter(org => org.status === 'pending');
      else if (statusFilter === 'suspended') filtered = filtered.filter(org => !org.is_active && org.status !== 'pending');
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type === typeFilter);
    }
    setFilteredOrgs(filtered);
    setCurrentPage(1);
  }, [organizations, search, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrgs.length / PAGE_SIZE);
  const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Statistiques
  const stats = {
    total: organizations.length,
    active: organizations.filter(org => org.is_active).length,
    pending: organizations.filter(org => org.status === 'pending').length,
    suspended: organizations.filter(org => !org.is_active && org.status !== 'pending').length
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'mairie': return { label: 'Mairie', color: 'text-blue-600', bg: 'bg-blue-100', icon: Building2 };
      case 'ong': return { label: 'ONG', color: 'text-green-600', bg: 'bg-green-100', icon: Heart };
      case 'prive': return { label: 'Privé', color: 'text-purple-600', bg: 'bg-purple-100', icon: Building2 };
      case 'benevolat': return { label: 'Bénévolat', color: 'text-orange-600', bg: 'bg-orange-100', icon: Users };
      default: return { label: 'Organisation', color: 'text-gray-600', bg: 'bg-gray-100', icon: Building2 };
    }
  };
  const getStatusInfo = (status: string, isActive: boolean) => {
    if (status === 'pending') return { label: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock };
    if (isActive) return { label: 'Active', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
    return { label: 'Suspendue', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
  };

  const handleToggleActive = async (org: Organization) => {
    try {
      await organizationService.update(org.id, { is_active: !org.is_active });
      const updatedOrgs = organizations.map(o =>
        o.id === org.id ? { ...o, is_active: !o.is_active } : o
      );
      setOrganizations(updatedOrgs);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état d'activation de l'organisation:", error);
    }
  };

  const handleStatusChange = async (org: Organization, nextActive: boolean) => {
    await withLoading(async () => {
      try {
        console.log(`🔄 Début du changement de statut pour l'organisation: ${org.name} (ID: ${org.id})`);
        console.log(`📊 Statut actuel: is_active=${org.is_active}, status=${org.status}`);
        console.log(`🎯 Nouveau statut souhaité: is_active=${nextActive}`);
        
        if (nextActive) {
          await organizationService.setActive(org.id);
        } else {
          await organizationService.setInactive(org.id);
        }
        
        // Recharger les données depuis la base de données
        console.log('🔄 Rechargement des données depuis la base de données...');
        const orgs = await organizationService.getAll();
        setOrganizations(orgs);
        
        // Vérifier que le changement a bien été appliqué
        const updatedOrg = orgs.find(o => o.id === org.id);
        if (updatedOrg) {
          console.log(`✅ Vérification: Organisation ${org.name} - is_active=${updatedOrg.is_active}`);
        }
        
        setSuccessMsg({
          message: `Organisation "${org.name}" ${nextActive ? 'activée' : 'suspendue'} avec succès.`,
          type: 'success'
        });
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (error) {
        console.error('❌ Erreur lors du changement de statut:', error);
        setSuccessMsg({
          message: `Erreur lors du changement de statut de l'organisation "${org.name}". Veuillez réessayer.`,
          type: 'error'
        });
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Organisations</h1>
          <p className="text-gray-600">Gestion des organisations partenaires</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Synchronisé</span>
          </div>
          <button
            onClick={() => withLoading(async () => {
              console.log('🔄 Rafraîchissement manuel des données...');
              const orgs = await organizationService.getAll();
              setOrganizations(orgs);
              console.log(`✅ ${orgs.length} organisations rechargées`);
            })}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Building2 className="w-8 h-8 text-indigo-500" />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Actives</p>
              <p className="text-lg font-semibold text-green-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-lg font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Suspendues</p>
              <p className="text-lg font-semibold text-red-600">{stats.suspended}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendues</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
        >
          <option value="all">Tous les types</option>
          <option value="mairie">Mairies</option>
          <option value="ong">ONG</option>
          <option value="prive">Privé</option>
          <option value="benevolat">Bénévolat</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chargement...</td></tr>
              ) : paginatedOrgs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucune organisation trouvée</td></tr>
              ) : paginatedOrgs.map(org => {
                const typeInfo = getTypeInfo(org.type);
                const statusInfo = getStatusInfo(org.status, org.is_active);
                return (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 ${typeInfo.bg} rounded-md flex items-center justify-center mr-2`}>
                          <typeInfo.icon className={`w-3 h-3 ${typeInfo.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-xs text-gray-500">{org.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`text-sm font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.email}</div>
                      <div className="text-xs text-gray-500">{org.phone}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {org.approved_at ? new Date(org.approved_at).toLocaleDateString('fr-FR') : (org.created_at ? new Date(org.created_at).toLocaleDateString('fr-FR') : '')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} cursor-pointer hover:opacity-80`}
                        title="Changer le statut"
                        onClick={() => setConfirmStatus({ org, nextActive: !org.is_active })}
                      >
                        {React.createElement(statusInfo.icon, { className: "w-3.5 h-3.5 mr-1" })}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-500">Page {currentPage} / {totalPages || 1}</span>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 text-xs disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >Précédent</button>
          <button
            className="px-2 py-1 rounded bg-gray-200 text-xs disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >Suivant</button>
        </div>
      </div>

      {/* Modale d'infos */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Détails organisation</h2>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${getTypeInfo(selectedOrg.type).bg} rounded-lg flex items-center justify-center`}>
                  {React.createElement(getTypeInfo(selectedOrg.type).icon, { className: `w-4 h-4 ${getTypeInfo(selectedOrg.type).color}` })}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{selectedOrg.name}</h3>
                  <p className="text-xs text-gray-600">{getTypeInfo(selectedOrg.type).label}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedOrg.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedOrg.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedOrg.address}, {selectedOrg.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Créée le {selectedOrg.created_at ? new Date(selectedOrg.created_at).toLocaleDateString('fr-FR') : ''}
                  </span>
                </div>
                {selectedOrg.approved_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Approuvée le {new Date(selectedOrg.approved_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {/* Affichage du nombre d'admins si dispo */}
                {selectedOrg.adminUsers && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedOrg.adminUsers.length} administrateur(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up de confirmation de changement de statut */}
      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">Confirmer le changement de statut</h2>
            <p>Voulez-vous vraiment {confirmStatus.nextActive ? 'activer' : 'suspendre'} l'organisation <b>{confirmStatus.org.name}</b> ?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setConfirmStatus(null)} className="px-3 py-1 rounded bg-gray-200">Annuler</button>
              <button
                onClick={async () => {
                  await handleStatusChange(confirmStatus.org, confirmStatus.nextActive);
                  setConfirmStatus(null);
                }}
                className={`px-3 py-1 rounded ${confirmStatus.nextActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              >{confirmStatus.nextActive ? 'Activer' : 'Suspendre'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Message de succès/erreur */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className={`text-lg font-semibold mb-2 ${successMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {successMsg.type === 'success' ? 'Succès' : 'Erreur'}
            </h2>
            <p className="text-gray-700">{successMsg.message}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSuccessMsg(null)}
                className={`px-3 py-1 rounded ${
                  successMsg.type === 'success' 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizationsPage; 