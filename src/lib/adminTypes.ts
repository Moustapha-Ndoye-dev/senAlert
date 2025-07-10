export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'org_admin';
  entityType?: string;
  organizationId?: string;
  organizationName?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'mairie' | 'ong' | 'prive' | 'benevolat';
  email: string;
  phone: string;
  address: string;
  city: string;
  status: 'pending' | 'active' | 'suspended';
  adminUsers: string[];
  createdAt: string;
  approvedAt?: string;
}

// Permissions par rôle
export const SUPER_ADMIN_PERMISSIONS = [
  'manage_platform',
  'manage_organizations',
  'manage_super_admins',
  'view_all_reports',
  'manage_system_settings',
  'view_platform_statistics',
  'manage_notifications',
  'export_data',
  'manage_backups'
];

export const ORG_ADMIN_PERMISSIONS = [
  'view_own_reports',
  'manage_own_reports',
  'send_notifications',
  'view_own_statistics',
  'manage_own_users',
  'export_own_data'
];

// Types d'organisations
export const ORGANIZATION_TYPES = {
  mairie: {
    name: 'Mairie / Collectivité',
    description: 'Administration locale et services municipaux',
    color: 'from-blue-500 to-blue-600',
    examples: ['Mairie de Guédiawaye', 'Communauté urbaine', 'Département']
  },
  ong: {
    name: 'ONG / Association',
    description: 'Organisations non gouvernementales et associations',
    color: 'from-green-500 to-green-600',
    examples: ['ONG environnementale', 'Association de quartier', 'Organisation humanitaire']
  },
  prive: {
    name: 'Structure Privée',
    description: 'Entreprises et services privés',
    color: 'from-purple-500 to-purple-600',
    examples: ['Senelec', 'Sen\'eau', 'UCG', 'Société de transport']
  },
  benevolat: {
    name: 'Bénévolat',
    description: 'Groupes de bénévoles et volontaires',
    color: 'from-orange-500 to-orange-600',
    examples: ['Groupe de bénévoles', 'Volontaires communautaires', 'Équipe locale']
  }
}; 