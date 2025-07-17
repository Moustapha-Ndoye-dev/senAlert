import React, { useEffect, useState } from 'react';
import { Users, FileText, Building2, BarChart3, AlertTriangle } from 'lucide-react';
import { superAdminService, reportService, organizationService } from '@/lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    reports: 0,
    users: 0,
    organizations: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentReports();
  }, []);

  const loadStats = async () => {
    const reports = await reportService.getAll();
    const users = await superAdminService.getAll();
    const orgs = await organizationService.getAll();
    setStats({
      reports: reports.length,
      users: users.length,
      organizations: orgs.length,
      pending: reports.filter(r => r.status === 'en-attente').length,
      resolved: reports.filter(r => r.status === 'termine' || r.status === 'resolu').length,
      rejected: reports.filter(r => r.status === 'rejete').length,
    });
  };

  const loadRecentReports = async () => {
    const reports = await reportService.getAll();
    setRecentReports(reports.slice(0, 5));
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tableau de bord Super Admin</h1>
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border flex flex-col items-center shadow">
          <FileText className="w-8 h-8 text-indigo-600 mb-2" />
          <div className="text-2xl font-bold">{stats.reports}</div>
          <div className="text-gray-500">Signalements</div>
            </div>
        <div className="bg-white rounded-xl p-6 border flex flex-col items-center shadow">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <div className="text-2xl font-bold">{stats.users}</div>
          <div className="text-gray-500">Super Admins</div>
        </div>
        <div className="bg-white rounded-xl p-6 border flex flex-col items-center shadow">
          <Building2 className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-2xl font-bold">{stats.organizations}</div>
          <div className="text-gray-500">Organisations</div>
        </div>
        <div className="bg-white rounded-xl p-6 border flex flex-col items-center shadow">
          <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-yellow-600">{stats.pending} en attente</span>
            <span className="text-lg font-semibold text-green-600">{stats.resolved} résolus</span>
            <span className="text-lg font-semibold text-red-600">{stats.rejected} rejetés</span>
          </div>
        </div>
      </div>
      {/* Accès rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <a href="/admin/super/reports" className="bg-indigo-50 hover:bg-indigo-100 rounded-xl p-6 flex flex-col items-center transition">
          <FileText className="w-8 h-8 text-indigo-600 mb-2" />
          <span className="font-semibold text-indigo-700">Gérer les signalements</span>
        </a>
        <a href="/admin/super/users" className="bg-purple-50 hover:bg-purple-100 rounded-xl p-6 flex flex-col items-center transition">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <span className="font-semibold text-purple-700">Gérer les super admins</span>
        </a>
        <a href="/admin/super/organizations" className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 flex flex-col items-center transition">
          <Building2 className="w-8 h-8 text-blue-600 mb-2" />
          <span className="font-semibold text-blue-700">Gérer les organisations</span>
        </a>
              </div>
      {/* Derniers signalements */}
      <div className="bg-white rounded-xl p-6 border mt-8 shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />Derniers signalements</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500">{report.created_at ? new Date(report.created_at).toLocaleDateString('fr-FR') : ''}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{report.type}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{report.description}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
    </div>
  );
};

export default AdminDashboard;