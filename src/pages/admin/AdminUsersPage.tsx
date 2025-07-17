import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  FileText,
  Activity,
  TrendingUp,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Award,
  Building2,
  Crown,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { superAdminService, SuperAdmin, adminService, organizationService, Admin, Organization } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<SuperAdmin[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SuperAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [adminUser, setAdminUser] = useState<SuperAdmin | null>(null);
  const [showCreateSuperModal, setShowCreateSuperModal] = useState(false);
  const [newSuperAdmin, setNewSuperAdmin] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    status: 'active'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ open: boolean, userId: string | null }>({ open: false, userId: null });
  const [editUser, setEditUser] = useState<SuperAdmin | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', name: '', status: 'active' });
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }
    loadSuperAdmins();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadSuperAdmins = async () => {
    const superAdmins = await superAdminService.getAll();
    setUsers(superAdmins);
  };

  // CRUD handlers
  const handleCreate = async (newSuperAdmin) => {
    await superAdminService.create(newSuperAdmin);
    await loadSuperAdmins();
  };
  const handleUpdate = async (id, updates) => {
    await superAdminService.update(id, updates);
    await loadSuperAdmins();
  };
  const handleDelete = async (id) => {
    setShowDeleteConfirm({ open: true, userId: id });
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm.userId) {
      await superAdminService.delete(showDeleteConfirm.userId);
      await loadSuperAdmins();
      toast({
        title: 'Suppression réussie',
        description: 'Le super administrateur a bien été supprimé.',
      });
    }
    setShowDeleteConfirm({ open: false, userId: null });
  };

  const handleEdit = (user: SuperAdmin) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name,
      status: user.status || 'active',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      await superAdminService.update(editUser.id, editForm);
      setEditUser(null);
      await loadSuperAdmins();
    }
  };

  const handleCreateSuperAdmin = async () => {
    await superAdminService.create(newSuperAdmin);
    setShowCreateSuperModal(false);
    await loadSuperAdmins();
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Statistiques
  const stats = {
    total: users.length,
    actifs: users.filter(u => u.status === 'active').length
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          color: 'text-purple-600',
          bg: 'bg-purple-100',
          icon: Crown
        };
      case 'org_admin':
        return {
          label: 'Admin Organisation',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          icon: Shield
        };
      default:
        return {
          label: 'Utilisateur',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: Users
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Actif',
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: UserCheck
        };
      case 'inactive':
        return {
          label: 'Inactif',
          color: 'text-red-600',
          bg: 'bg-red-100',
          icon: UserX
        };
      default:
        return {
          label: 'Inconnu',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: Users
        };
    }
  };

  useRealtimeTable('admin', loadSuperAdmins);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
          <p className="text-gray-600">Gestion des utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateSuperModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg"><Crown className="inline w-4 h-4 mr-2" />Créer un Super Admin</button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins Orgs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => {
                const statusInfo = getStatusInfo(user.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-2"><Edit className="inline w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="inline w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> sur{' '}
                  <span className="font-medium">{filteredUsers.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {showCreateSuperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl relative">
            <button onClick={() => setShowCreateSuperModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Créer un super administrateur</h2>
            <form onSubmit={e => { e.preventDefault(); handleCreateSuperAdmin(); }} className="space-y-4">
              <input type="text" placeholder="Nom d'utilisateur" value={newSuperAdmin.username} onChange={e => setNewSuperAdmin({ ...newSuperAdmin, username: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <input type="email" placeholder="Email" value={newSuperAdmin.email} onChange={e => setNewSuperAdmin({ ...newSuperAdmin, email: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <input type="text" placeholder="Nom complet" value={newSuperAdmin.name} onChange={e => setNewSuperAdmin({ ...newSuperAdmin, name: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <input type="password" placeholder="Mot de passe" value={newSuperAdmin.password} onChange={e => setNewSuperAdmin({ ...newSuperAdmin, password: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded">Créer</button>
            </form>
          </div>
        </div>
      )}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl relative">
            <button onClick={() => setEditUser(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Modifier le super administrateur</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="text" placeholder="Nom d'utilisateur" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <input type="email" placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <input type="text" placeholder="Nom complet" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border rounded" required />
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2 border rounded">
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded">Enregistrer</button>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl relative">
            <button onClick={() => setShowDeleteConfirm({ open: false, userId: null })} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
            <p className="mb-6">Voulez-vous vraiment supprimer ce super administrateur ? Cette action est irréversible.</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowDeleteConfirm({ open: false, userId: null })} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage; 
