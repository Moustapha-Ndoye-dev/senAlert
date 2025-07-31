import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const OrganizationLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('========================================');
    console.log('🔍 DÉBUT DE LA CONNEXION');
    console.log('========================================');
    console.log('📅 Date/Heure:', new Date().toLocaleString());
    console.log('👤 Username saisi:', username);
    console.log('🔒 Mot de passe saisi:', password ? '***' + password.length + ' caractères' : 'vide');
    console.log('========================================');
    
    if (!username || !password) {
      console.log('❌ ERREUR: Champs manquants');
      console.log('  - Username:', username ? 'OK' : 'MANQUANT');
      console.log('  - Password:', password ? 'OK' : 'MANQUANT');
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('⏳ Loading activé');

    try {
      // Vérifier dans la table organizations
      console.log('\n🔐 ÉTAPE 1: Recherche dans la table organizations...');
      console.log('  - Table: organizations');
      console.log('  - Condition: username =', username);
      console.log('  - Condition: is_active = true');
      
      const { data: organization, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      console.log('\n📊 RÉSULTAT DE LA REQUÊTE:');
      if (error) {
        console.log('❌ ERREUR SQL:', error);
        console.log('  - Code:', error.code);
        console.log('  - Message:', error.message);
        console.log('  - Details:', error.details);
        console.log('  - Hint:', error.hint);
      }
      
      if (!organization) {
        console.log('❌ Aucune organisation trouvée');
      } else {
        console.log('✅ Organisation trouvée:');
        console.log('  - ID:', organization.id);
        console.log('  - Nom:', organization.name);
        console.log('  - Email:', organization.email);
        console.log('  - Type:', organization.type);
        console.log('  - Status:', organization.status);
        console.log('  - Active:', organization.is_active);
        console.log('  - Password hash présent:', !!organization.password_hash);
      }

      if (error || !organization) {
        console.log('\n❌ ÉCHEC: Organisation non trouvée ou inactive');
        toast({
          title: "Erreur",
          description: "Nom d'utilisateur incorrect ou compte inactif",
          variant: "destructive"
        });
        return;
      }

      // Vérifier le mot de passe
      console.log('\n🔍 ÉTAPE 2: Vérification du mot de passe...');
      console.log('  - Mot de passe hash présent:', !!organization.password_hash);
      console.log('  - Longueur du hash:', organization.password_hash ? organization.password_hash.length : 0);
      
      let isValidPassword = false;

      if (organization.password_hash) {
        console.log('  - Type de hash détecté:', organization.password_hash.substring(0, 7));
        
        try {
          console.log('  - Comparaison avec bcrypt...');
          isValidPassword = await bcrypt.compare(password, organization.password_hash);
          console.log('  - Résultat bcrypt:', isValidPassword ? '✅ VALIDE' : '❌ INVALIDE');
        } catch (bcryptError) {
          console.log('❌ ERREUR bcrypt:', bcryptError);
          console.log('  - Tentative de comparaison directe...');
          isValidPassword = organization.password_hash === password;
          console.log('  - Résultat direct:', isValidPassword ? '✅ VALIDE' : '❌ INVALIDE');
        }
      } else {
        console.log('❌ Aucun mot de passe hash trouvé pour cette organisation');
      }

      if (!isValidPassword) {
        console.log('\n❌ ÉCHEC: Mot de passe incorrect');
        toast({
          title: "Erreur",
          description: "Mot de passe incorrect",
          variant: "destructive"
        });
        return;
      }

      console.log('\n✅ AUTHENTIFICATION RÉUSSIE');
      
      // Mettre à jour la dernière connexion
      console.log('\n📝 ÉTAPE 3: Mise à jour last_login...');
      const updateResult = await supabase
        .from('organizations')
        .update({ last_login: new Date().toISOString() })
        .eq('id', organization.id);
      
      if (updateResult.error) {
        console.log('⚠️ Erreur lors de la mise à jour last_login:', updateResult.error);
      } else {
        console.log('✅ last_login mis à jour');
      }

      // Sauvegarder les données de l'organisation dans localStorage
      console.log('\n💾 ÉTAPE 4: Sauvegarde dans localStorage...');
      const authData = {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        type: organization.type,
        status: organization.status,
        is_active: organization.is_active,
        permissions: organization.permissions || [],
        username: organization.username
      };
      
      console.log('  - Données à sauvegarder:', JSON.stringify(authData, null, 2));
      localStorage.setItem('organization_auth', JSON.stringify(authData));
      console.log('✅ Données sauvegardées dans localStorage');
      
      // Vérification
      const savedData = localStorage.getItem('organization_auth');
      console.log('  - Vérification localStorage:', savedData ? 'OK' : 'ERREUR');

      console.log('\n🎉 CONNEXION RÉUSSIE');
      console.log('  - Organisation:', organization.name);
      console.log('  - Username:', organization.username);
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${organization.name}`,
      });
      
      // Redirection immédiate vers le dashboard
      console.log('\n🔄 REDIRECTION...');
      console.log('  - Destination: /organization/dashboard');
      console.log('  - Replace: true');
      
      navigate('/organization/dashboard', { replace: true });
      
      console.log('✅ Navigation déclenchée');
      console.log('========================================');
      console.log('FIN DU PROCESSUS DE CONNEXION');
      console.log('========================================');

    } catch (error: any) {
      console.log('\n💥 ERREUR INATTENDUE:', error);
      console.log('  - Type:', error.constructor.name);
      console.log('  - Message:', error.message);
      console.log('  - Stack:', error.stack);
      
      toast({
        title: "Erreur de connexion",
        description: error.message || "Identifiant ou mot de passe incorrect",
        variant: "destructive"
      });
    } finally {
      console.log('\n🏁 Finally block');
      console.log('  - Loading désactivé');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Espace Organisation
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connectez-vous à votre compte organisation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                className="h-12"
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="h-12 pr-12"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-semibold">
              NOUVEAUX COMPTES CRÉÉS :
            </p>
            <div className="mt-2 text-sm text-gray-700 space-y-2 bg-gray-100 p-3 rounded">
              <p className="font-bold">🏛️ Mairie de Dakar Centre</p>
              <p>Username: <span className="font-mono bg-white px-1">mairie_dakar</span></p>
              <p>Password: <span className="font-mono bg-white px-1">dakar2024</span></p>
              
              <hr className="my-2" />
              
              <p className="font-bold">🌱 ONG Sauver Senegal</p>
              <p>Username: <span className="font-mono bg-white px-1">ong_sauver</span></p>
              <p>Password: <span className="font-mono bg-white px-1">sauver2024</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationLoginPage;
