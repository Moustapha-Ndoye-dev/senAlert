import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Vérification de la configuration
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ ERREUR DE CONFIGURATION SUPABASE');
  console.error('Les variables d\'environnement ne sont pas configurées correctement.');
  console.error('Créez un fichier .env.local avec vos vraies clés Supabase.');
  console.error('Voir ENV-SETUP.md pour les instructions.');
  
  // Afficher une alerte dans le navigateur
  if (typeof window !== 'undefined') {
    alert('❌ Erreur de configuration Supabase\n\nCréez un fichier .env.local avec vos vraies clés Supabase.\n\nVoir ENV-SETUP.md pour les instructions.');
  }
}

// Log temporaire pour vérifier les variables (à supprimer après)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface Population {
  id: string;
  phone: string;
  auth_code: string;
  name: string;
  status: string;
  created_at: string;
  last_activity?: string;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  name: string;
  organization_id: string;
  permissions: string[];
  status: string;
  created_at: string;
  last_login?: string;
}

export interface SuperAdmin {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
  last_login?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'mairie' | 'ong' | 'prive' | 'benevolat';
  email: string;
  phone: string;
  address: string;
  city: string;
  status: string;
  is_active: boolean;
  created_at: string;
  approved_at?: string;
}

export interface Report {
  id: string;
  population_id?: string; // Optionnel pour les signalements anonymes
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  department: string;
  address: string;
  photo_url?: string;
  audio_url?: string;
  status: string;
  assigned_admin_id?: string;
  // Champs pour les signalements anonymes
  anonymous_code?: string;
  anonymous_name?: string;
  anonymous_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  population_id: string;
  report_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

// Type pour la catégorie
export interface Categorie {
  id: string;
  nom: string;
}

// Type pour la liaison catégorie-organisation
export interface CategorieOrganization {
  categorie_id: string;
  organization_id: string;
}

// Service pour la population (citoyens)
export const populationService = {
  // Créer un nouveau citoyen
  async create(phone: string, name: string): Promise<Population> {
    const authCode = generateAuthCode();
    
    const { data, error } = await supabase
      .from('population')
      .insert({
        phone,
        auth_code: authCode,
        name,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Vérifier un code d'authentification
  async verifyAuthCode(authCode: string): Promise<Population | null> {
    const { data, error } = await supabase
      .from('population')
      .select('*')
      .eq('auth_code', authCode)
      .eq('status', 'active')
      .single();

    if (error) return null;
    return data;
  },

  // Obtenir un citoyen par ID
  async getById(id: string): Promise<Population | null> {
    const { data, error } = await supabase
      .from('population')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Mettre à jour l'activité
  async updateActivity(id: string): Promise<void> {
    await supabase
      .from('population')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', id);
  }
};

// Service pour les administrateurs
export const adminService = {
  // Connexion admin
  async login(usernameOrEmail: string, password: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    // Vérifier le mot de passe avec bcrypt
    try {
      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (isValidPassword) {
        // Vérifier que l'organisation est active
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('is_active')
          .eq('id', data.organization_id)
          .single();
        if (orgError || !org || org.is_active !== true) {
          return null;
        }
        // Mettre à jour la dernière connexion
        await supabase
          .from('admin')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
        return data;
      }
    } catch (bcryptError) {
      console.error('Erreur bcrypt:', bcryptError);
      // Fallback pour les mots de passe en clair (temporaire)
      if (data.password_hash === password) {
        // Vérifier que l'organisation est active
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('is_active')
          .eq('id', data.organization_id)
          .single();
        if (orgError || !org || org.is_active !== true) {
          return null;
        }
        // Mettre à jour la dernière connexion
        await supabase
          .from('admin')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
        return data;
      }
    }

    return null;
  },

  // Obtenir un admin par ID
  async getById(id: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Obtenir tous les admins d'une organisation
  async getByOrganization(organizationId: string): Promise<Admin[]> {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) return [];
    return data || [];
  },

  // Créer un admin
  async create(admin: Omit<Admin, 'id' | 'created_at' | 'last_login' | 'password_hash'> & { password: string }): Promise<Admin | null> {
    const password_hash = await bcrypt.hash(admin.password, 10);
    const { data, error } = await supabase
      .from('admin')
      .insert({
        username: admin.username,
        password_hash,
        email: admin.email,
        name: admin.name,
        organization_id: admin.organization_id,
        permissions: admin.permissions,
        status: admin.status || 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la création de l\'admin:', error);
      return null;
    }
    return data;
  }
};

// Service pour les super administrateurs
export const superAdminService = {
  // Connexion super admin
  async login(usernameOrEmail: string, password: string): Promise<SuperAdmin | null> {
    const { data, error } = await supabase
      .from('superadmin')
      .select('*')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    // Vérifier le mot de passe avec bcrypt
    try {
      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (isValidPassword) {
        // Mettre à jour la dernière connexion
        await supabase
          .from('superadmin')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        return data;
      }
    } catch (bcryptError) {
      console.error('Erreur bcrypt:', bcryptError);
      // Fallback pour les mots de passe en clair (temporaire)
      if (data.password_hash === password) {
        // Mettre à jour la dernière connexion
        await supabase
          .from('superadmin')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        return data;
      }
    }

    return null;
  },

  // Obtenir un super admin par ID
  async getById(id: string): Promise<SuperAdmin | null> {
    const { data, error } = await supabase
      .from('superadmin')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // Lister tous les super admins
  async getAll(): Promise<SuperAdmin[]> {
    const { data, error } = await supabase
      .from('superadmin')
      .select('*');
    if (error) {
      console.error('Erreur lors de la récupération des super admins:', error);
      return [];
    }
    return data || [];
  },

  // Créer un super admin
  async create(superAdmin: Omit<SuperAdmin, 'id' | 'created_at' | 'last_login' | 'password_hash'> & { password: string }): Promise<SuperAdmin | null> {
    // Hasher le mot de passe côté client
    const password_hash = await bcrypt.hash(superAdmin.password, 10);
    const { data, error } = await supabase
      .from('superadmin')
      .insert({
        username: superAdmin.username,
        password_hash,
        email: superAdmin.email,
        name: superAdmin.name,
        status: superAdmin.status || 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la création du super admin:', error);
      return null;
    }
    return data;
  },

  // Mettre à jour un super admin (hors mot de passe)
  async update(id: string, updates: Partial<Omit<SuperAdmin, 'id' | 'created_at' | 'last_login' | 'password_hash'>>): Promise<void> {
    const { error } = await supabase
      .from('superadmin')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error('Erreur lors de la mise à jour du super admin:', error);
      throw error;
    }
  },

  // Supprimer un super admin
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('superadmin')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Erreur lors de la suppression du super admin:', error);
      throw error;
    }
  },
};

// Service pour les organisations
export const organizationService = {
  // Obtenir toutes les organisations (sans filtrer par statut)
  async getAll(): Promise<Organization[]> {
    console.log('📋 Récupération de toutes les organisations depuis la base de données...');
    const { data, error } = await supabase
      .from('organizations')
      .select('*');
    if (error) {
      console.error('❌ Erreur lors de la récupération des organisations:', error);
      return [];
    }
    console.log(`✅ ${data?.length || 0} organisations récupérées depuis la base de données`);
    return data || [];
  },

  // Obtenir une organisation par ID
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  // Approuver une organisation (statut actif)
  async approve(id: string): Promise<void> {
    await supabase
      .from('organizations')
      .update({ 
        status: 'active',
        approved_at: new Date().toISOString()
      })
      .eq('id', id);
  },

  // Suspendre une organisation (bloquer)
  async suspend(id: string): Promise<void> {
    await supabase
      .from('organizations')
      .update({ status: 'suspended' })
      .eq('id', id);
  },

  // Activer une organisation (débloquer)
  async activate(id: string): Promise<void> {
    await supabase
      .from('organizations')
      .update({ status: 'active' })
      .eq('id', id);
  },

  // Activer une organisation (is_active = true)
  async setActive(id: string): Promise<void> {
    console.log(`🔵 Activation de l'organisation ${id} en base de données...`);
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: true })
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erreur lors de l\'activation de l\'organisation:', error);
      throw error;
    }
    console.log(`✅ Organisation ${id} activée avec succès`);
  },

  // Désactiver une organisation (is_active = false)
  async setInactive(id: string): Promise<void> {
    console.log(`🔴 Désactivation de l'organisation ${id} en base de données...`);
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erreur lors de la désactivation de l\'organisation:', error);
      throw error;
    }
    console.log(`✅ Organisation ${id} désactivée avec succès`);
  },

  // Mettre à jour une organisation avec des champs personnalisés
  async update(id: string, updates: Partial<Organization>): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'organisation:', error);
      throw error;
    }
  },
};

// Service pour les signalements
export const reportService = {
  // Créer un nouveau signalement (anonyme ou avec population_id)
  async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...report,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload d'une photo pour un signalement
  async uploadPhoto(file: File, reportId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${reportId}/photo_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('report-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('report-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Upload d'un fichier audio pour un signalement
  async uploadAudio(file: File, reportId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'wav';
    const fileName = `${reportId}/audio_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('report-audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('report-audio')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Créer un signalement avec upload de fichiers
  async createWithFiles(
    reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'photo_url' | 'audio_url'>,
    photoFile?: File,
    audioFile?: File
  ): Promise<Report> {
    // Créer d'abord le signalement sans les URLs de fichiers
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    let photoUrl: string | undefined;
    let audioUrl: string | undefined;

    // Upload de la photo si fournie
    if (photoFile) {
      try {
        photoUrl = await this.uploadPhoto(photoFile, report.id);
      } catch (error) {
        console.error('Erreur upload photo:', error);
        // Continuer même si l'upload de photo échoue
      }
    }

    // Upload de l'audio si fourni
    if (audioFile) {
      try {
        audioUrl = await this.uploadAudio(audioFile, report.id);
      } catch (error) {
        console.error('Erreur upload audio:', error);
        // Continuer même si l'upload d'audio échoue
      }
    }

    // Mettre à jour le signalement avec les URLs des fichiers
    if (photoUrl || audioUrl) {
      const updateData: Partial<Report> = {};
      if (photoUrl) updateData.photo_url = photoUrl;
      if (audioUrl) updateData.audio_url = audioUrl;

      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', report.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedReport;
    }

    return report;
  },

  // Supprimer les fichiers d'un signalement
  async deleteFiles(reportId: string): Promise<void> {
    // Supprimer la photo
    const { data: photoFiles } = await supabase.storage
      .from('report-photos')
      .list(reportId);
    
    if (photoFiles && photoFiles.length > 0) {
      const photoPaths = photoFiles.map(file => `${reportId}/${file.name}`);
      await supabase.storage
        .from('report-photos')
        .remove(photoPaths);
    }

    // Supprimer l'audio
    const { data: audioFiles } = await supabase.storage
      .from('report-audio')
      .list(reportId);
    
    if (audioFiles && audioFiles.length > 0) {
      const audioPaths = audioFiles.map(file => `${reportId}/${file.name}`);
      await supabase.storage
        .from('report-audio')
        .remove(audioPaths);
    }
  },

  // Obtenir tous les signalements
  async getAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Obtenir les signalements d'un citoyen (par population_id)
  async getByPopulation(populationId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('population_id', populationId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Obtenir les signalements anonymes (par code anonyme)
  async getByAnonymousCode(anonymousCode: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('anonymous_code', anonymousCode)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Obtenir les signalements assignés à un admin
  async getByAdmin(adminId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('assigned_admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Mettre à jour un signalement
  async update(id: string, updates: Partial<Report>): Promise<void> {
    await supabase
      .from('reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  },

  // Obtenir les statistiques
  async getStats() {
    const { data: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact' });

    const { data: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', 'pending');

    const { data: resolvedReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', 'resolved');

    return {
      total: totalReports?.length || 0,
      pending: pendingReports?.length || 0,
      resolved: resolvedReports?.length || 0
    };
  }
};

// Service pour les notifications
export const notificationService = {
  // Créer une notification
  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtenir les notifications d'un citoyen
  async getByPopulation(populationId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('population_id', populationId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Marquer une notification comme lue
  async markAsRead(id: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  },

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(populationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('population_id', populationId)
      .eq('read', false);

    if (error) return 0;
    return data?.length || 0;
  }
};

// Service pour les logs
export const logService = {
  // Créer un log admin
  async createAdminLog(adminId: string, action: string, details: string): Promise<void> {
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action,
        details,
        created_at: new Date().toISOString()
      });
  },

  // Créer un log super admin
  async createSuperAdminLog(superAdminId: string, action: string, details: string): Promise<void> {
    await supabase
      .from('superadmin_logs')
      .insert({
        superadmin_id: superAdminId,
        action,
        details,
        created_at: new Date().toISOString()
      });
  },

  // Obtenir les logs d'un admin
  async getAdminLogs(adminId: string) {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Obtenir les logs d'un super admin
  async getSuperAdminLogs(superAdminId: string) {
    const { data, error } = await supabase
      .from('superadmin_logs')
      .select('*')
      .eq('superadmin_id', superAdminId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }
};

// Service pour les catégories
export const categorieService = {
  // Obtenir toutes les catégories
  async getAll(): Promise<Categorie[]> {
    const { data, error } = await supabase
      .from('categorie')
      .select('*')
      .order('nom', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  // Créer une catégorie
  async create(nom: string): Promise<Categorie> {
    const { data, error } = await supabase
      .from('categorie')
      .insert({ nom })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Mettre à jour une catégorie
  async update(id: string, nom: string): Promise<void> {
    const { error } = await supabase
      .from('categorie')
      .update({ nom })
      .eq('id', id);
    if (error) throw error;
  },
  // Supprimer une catégorie
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categorie')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Service pour la liaison catégorie-organisation
export const categorieOrganizationService = {
  // Obtenir les organisations assignées à une catégorie
  async getOrganizationsByCategorie(categorie_id: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('categorie_organization')
      .select('organization_id')
      .eq('categorie_id', categorie_id);
    if (error) throw error;
    return data ? (data as { organization_id: string }[]).map(row => row.organization_id) : [];
  },
  // Obtenir les catégories assignées à une organisation
  async getCategoriesByOrganization(organization_id: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('categorie_organization')
      .select('categorie_id')
      .eq('organization_id', organization_id);
    if (error) throw error;
    return data ? (data as { categorie_id: string }[]).map(row => row.categorie_id) : [];
  },
  // Assigner une catégorie à une organisation
  async assign(categorie_id: string, organization_id: string): Promise<void> {
    const { error } = await supabase
      .from('categorie_organization')
      .insert({ categorie_id, organization_id });
    if (error) throw error;
  },
  // Désassigner une catégorie d'une organisation
  async unassign(categorie_id: string, organization_id: string): Promise<void> {
    const { error } = await supabase
      .from('categorie_organization')
      .delete()
      .eq('categorie_id', categorie_id)
      .eq('organization_id', organization_id);
    if (error) throw error;
  }
};

// Service pour les logs système unifiés
export const systemLogService = {
  // Créer un log
  async createLog({
    actor_id = null,
    actor_type = 'system',
    level = 'info',
    category = null,
    action,
    details = null
  }: {
    actor_id?: string | null,
    actor_type?: 'admin' | 'superadmin' | 'system',
    level?: 'info' | 'warning' | 'error' | 'success',
    category?: string | null,
    action: string,
    details?: string | null
  }): Promise<void> {
    await supabase
      .from('system_logs')
      .insert({
        actor_id,
        actor_type,
        level,
        category,
        action,
        details,
        created_at: new Date().toISOString()
      });
  },

  // Obtenir tous les logs (optionnel: filtrage)
  async getAll({ limit = 100, level, category }: { limit?: number, level?: string, category?: string } = {}) {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (level) query = query.eq('level', level);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return [];
    return data || [];
  },

  // Obtenir les logs par acteur
  async getByActor(actor_id: string, actor_type: string) {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('actor_id', actor_id)
      .eq('actor_type', actor_type)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  // Obtenir les logs par catégorie
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }
};

// Fonction utilitaire pour générer un code d'authentification
function generateAuthCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 