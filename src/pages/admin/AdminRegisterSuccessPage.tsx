import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  Shield, 
  ArrowRight,
  FileText,
  Users,
  Phone
} from 'lucide-react';

const AdminRegisterSuccessPage = () => {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: Mail,
      title: 'Email de confirmation',
      description: 'Vous recevrez un email de confirmation dans les prochaines minutes',
      time: '5-10 minutes'
    },
    {
      icon: FileText,
      title: 'Vérification des documents',
      description: 'Notre équipe vérifiera les informations et documents fournis',
      time: '24-48 heures'
    },
    {
      icon: Shield,
      title: 'Validation finale',
      description: 'Attribution des permissions et activation de votre compte',
      time: '48-72 heures'
    },
    {
      icon: Users,
      title: 'Formation et accompagnement',
      description: 'Session de formation à la plateforme et accompagnement',
      time: '1 semaine'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Titre et message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Demande envoyée avec succès !
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Votre demande d'inscription a été reçue. Notre équipe va l'examiner et vous contacter dans les plus brefs délais.
          </p>

          {/* Numéro de suivi */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Numéro de suivi</p>
            <p className="text-2xl font-bold text-gray-800 font-mono">
              REG-{Date.now().toString().slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Conservez ce numéro pour le suivi de votre demande
            </p>
          </div>

          {/* Prochaines étapes */}
          <div className="text-left mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Prochaines étapes</h2>
            <div className="space-y-4">
              {nextSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <StepIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{step.title}</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informations de contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-4">Besoin d'aide ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">contact@senalert.sn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">+221 33 123 45 67</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/admin/login')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
              Retour à la connexion
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterSuccessPage; 