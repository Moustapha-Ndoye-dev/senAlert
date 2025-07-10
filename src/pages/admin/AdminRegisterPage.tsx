import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  Users, 
  Heart, 
  Zap, 
  Droplets,
  Truck,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  Upload,
  X
} from 'lucide-react';

interface EntityType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  examples: string[];
  requirements: string[];
}

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [formData, setFormData] = useState({
    // Informations de base
    organizationName: '',
    organizationType: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    website: '',
    
    // Contact principal
    contactName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    
    // Informations supplémentaires
    description: '',
    numberOfEmployees: '',
    serviceArea: '',
    operatingHours: '',
    
    // Documents
    registrationDocument: null as File | null,
    authorizationDocument: null as File | null,
    
    // Compte
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const entityTypes: EntityType[] = [
    {
      id: 'mairie',
      name: 'Mairie / Collectivité',
      description: 'Administration locale et services municipaux',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      examples: ['Mairie de Guédiawaye', 'Communauté urbaine', 'Département'],
      requirements: ['Document officiel de la mairie', 'Autorisation du maire', 'Budget alloué']
    },
    {
      id: 'ong',
      name: 'ONG / Association',
      description: 'Organisations non gouvernementales et associations',
      icon: Heart,
      color: 'from-green-500 to-green-600',
      examples: ['ONG environnementale', 'Association de quartier', 'Organisation humanitaire'],
      requirements: ['Récépissé d\'association', 'Statuts de l\'ONG', 'Autorisation préfectorale']
    },
    {
      id: 'prive',
      name: 'Structure Privée',
      description: 'Entreprises et services privés',
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      examples: ['Senelec', 'Sen\'eau', 'UCG', 'Société de transport'],
      requirements: ['Extrait Kbis', 'Autorisation d\'exploitation', 'Certification qualité']
    },
    {
      id: 'benevolat',
      name: 'Bénévolat',
      description: 'Groupes de bénévoles et volontaires',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      examples: ['Groupe de bénévoles', 'Volontaires communautaires', 'Équipe locale'],
      requirements: ['Liste des bénévoles', 'Engagement de participation', 'Supervision locale']
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return selectedEntityType && formData.organizationName && formData.email;
      case 2:
        return formData.contactName && formData.contactEmail && formData.contactPhone;
      case 3:
        return formData.description && formData.serviceArea;
      case 4:
        return formData.password && formData.password === formData.confirmPassword && formData.acceptTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sauvegarder la demande d'inscription
      const registrationData = {
        id: `reg_${Date.now()}`,
        ...formData,
        entityType: selectedEntityType,
        status: 'pending',
        date: new Date().toISOString()
      };
      
      const existingRegistrations = JSON.parse(localStorage.getItem('admin_registrations') || '[]');
      existingRegistrations.push(registrationData);
      localStorage.setItem('admin_registrations', JSON.stringify(existingRegistrations));
      
      // Rediriger vers la page de succès
      navigate('/admin/register/success');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEntity = entityTypes.find(e => e.id === selectedEntityType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/login')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à la connexion
            </button>
            <h1 className="text-xl font-bold text-gray-800">Inscription Organisation</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Étape {step} sur 4 : {
                step === 1 ? 'Type d\'organisation' :
                step === 2 ? 'Contact principal' :
                step === 3 ? 'Informations supplémentaires' :
                'Création du compte'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Type d'organisation</h2>
                    <p className="text-gray-600 mb-6">Sélectionnez le type d'organisation que vous représentez</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entityTypes.map((entity) => {
                      const EntityIcon = entity.icon;
                      return (
                        <button
                          key={entity.id}
                          onClick={() => setSelectedEntityType(entity.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedEntityType === entity.id
                              ? `border-indigo-500 bg-indigo-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${entity.color}`}>
                              <EntityIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`font-semibold ${
                              selectedEntityType === entity.id ? 'text-indigo-600' : 'text-gray-800'
                            }`}>
                              {entity.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{entity.description}</p>
                          <div className="text-xs text-gray-500">
                            Exemples : {entity.examples.join(', ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedEntity && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Documents requis :</h3>
                      <ul className="space-y-1">
                        {selectedEntity.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-blue-700">
                            <CheckCircle className="w-4 h-4" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'organisation *
                      </label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        placeholder="Ex: Mairie de Guédiawaye"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email professionnel *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contact@votre-organisation.sn"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+221 33 123 45 67"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Contact principal</h2>
                    <p className="text-gray-600 mb-6">Informations de la personne responsable</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Nom et prénom"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste / Fonction
                      </label>
                      <input
                        type="text"
                        value={formData.contactPosition}
                        onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                        placeholder="Ex: Directeur, Responsable"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="email@organisation.sn"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Informations supplémentaires</h2>
                    <p className="text-gray-600 mb-6">Détails sur votre organisation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de l'organisation *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez votre organisation, ses missions et ses activités..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone de service
                      </label>
                      <input
                        type="text"
                        value={formData.serviceArea}
                        onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                        placeholder="Ex: Guédiawaye, Dakar"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre d'employés
                      </label>
                      <input
                        type="number"
                        value={formData.numberOfEmployees}
                        onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                        placeholder="Ex: 50"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horaires d'ouverture
                    </label>
                    <input
                      type="text"
                      value={formData.operatingHours}
                      onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                      placeholder="Ex: Lundi-Vendredi 8h-18h"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Création du compte</h2>
                    <p className="text-gray-600 mb-6">Créez vos identifiants de connexion</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Minimum 8 caractères"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Répétez votre mot de passe"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                      J'accepte les <a href="#" className="text-indigo-600 hover:text-indigo-700">conditions d'utilisation</a> et la{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-700">politique de confidentialité</a> *
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={!validateStep(step)}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!validateStep(step) || isSubmitting}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar d'aide */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Aide et informations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Validation rapide</p>
                    <p className="text-xs text-gray-600">Traitement sous 48h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Accès sécurisé</p>
                    <p className="text-xs text-gray-600">Données protégées</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Support dédié</p>
                    <p className="text-xs text-gray-600">Accompagnement personnalisé</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Besoin d'aide ?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Notre équipe est là pour vous accompagner dans votre inscription
              </p>
              <div className="space-y-2 text-sm text-blue-600">
                <p>📧 contact@senalert.sn</p>
                <p>📞 +221 33 123 45 67</p>
                <p>🕒 Lun-Ven 8h-18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage; 