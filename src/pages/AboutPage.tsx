import React from 'react';
import { ArrowLeft, MapPin, Users, Shield, Phone, Mail, Globe, Award, Target, Heart, Star, CheckCircle, Clock, TrendingUp, Eye, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">À propos</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-12 text-white text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">SenAlert</h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-6">Plateforme citoyenne pour le Sénégal</p>
              <div className="flex items-center justify-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Citoyenneté active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Sécurité garantie</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Impact réel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission et Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Notre Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              SenAlert est conçu pour permettre à toute la population du Sénégal de signaler facilement les incidents et problèmes rencontrés dans leur environnement quotidien.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Notre objectif est de renforcer la participation citoyenne et d'améliorer la qualité de vie de tous, partout au Sénégal, en créant un pont direct entre les citoyens et les services publics.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Notre Vision</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous aspirons à créer un Sénégal où chaque citoyen peut contribuer activement à l'amélioration de son cadre de vie.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Une société où la technologie facilite la communication entre les habitants et les autorités, pour un développement durable et inclusif.
            </p>
          </div>
        </div>

        {/* Valeurs */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nos Valeurs</h3>
          <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-800 mb-2">Communauté</h4>
              <p className="text-gray-600 text-sm">Une plateforme participative pour tous les citoyens sénégalais, favorisant l'engagement collectif</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-800 mb-2">Transparence</h4>
              <p className="text-gray-600 text-sm">Signalement sécurisé et traitement transparent pour une confiance mutuelle</p>
                </div>
                
                <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <TrendingUp className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-800 mb-2">Innovation</h4>
              <p className="text-gray-600 text-sm">Utilisation des technologies modernes pour un service public plus efficace</p>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fonctionnalités Principales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Signalement en temps réel</h4>
                  <p className="text-gray-600 text-sm">Signalez les incidents instantanément avec géolocalisation précise</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Médias intégrés</h4>
                  <p className="text-gray-600 text-sm">Photos et messages vocaux pour une description complète</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                  <h4 className="font-semibold text-gray-800">Suivi des signalements</h4>
                  <p className="text-gray-600 text-sm">Consultez l'état de vos signalements et recevez des notifications</p>
                </div>
                    </div>
                  </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                  <h4 className="font-semibold text-gray-800">Authentification sécurisée</h4>
                  <p className="text-gray-600 text-sm">Code unique pour accéder à vos signalements en toute sécurité</p>
                    </div>
                  </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                  <h4 className="font-semibold text-gray-800">Interface intuitive</h4>
                  <p className="text-gray-600 text-sm">Design moderne et accessible pour tous les utilisateurs</p>
                    </div>
                  </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Support multilingue</h4>
                  <p className="text-gray-600 text-sm">Interface en français pour tous les Sénégalais</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Types d'incidents */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Types d'incidents pris en charge</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Problèmes de voirie</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Éclairage public défaillant</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Problèmes d'assainissement</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Dégradations urbaines</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Problèmes environnementaux</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Autres incidents publics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Impact de SenAlert</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Couverture nationale</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Disponibilité</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Rapide</div>
              <div className="text-blue-100">Traitement</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Sécurisé</div>
              <div className="text-blue-100">Données protégées</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Contact et Support</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-blue-50 rounded-xl">
              <Phone className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <p className="text-gray-600 text-sm">+221 33 XXX XX XX</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-xl">
              <Mail className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <p className="text-gray-600 text-sm">contact@senalert.sn</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
              <Globe className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-800">Site web</p>
                <p className="text-gray-600 text-sm">www.senalert.sn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center text-white">
          <MessageSquare className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Prêt à contribuer ?</h3>
          <p className="text-lg mb-6 opacity-90">
            Rejoignez la communauté SenAlert et participez à l'amélioration de votre environnement
          </p>
          <button
            onClick={() => navigate('/signaler')}
            className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Faire un signalement
          </button>
        </div>

        {/* Informations techniques */}
        <div className="bg-gray-50 rounded-xl p-6 text-center mt-8">
          <p className="text-gray-600 mb-2">
            Cette plateforme est développée pour la population du Sénégal.
          </p>
          <p className="text-sm text-gray-500">
            Version 1.0 - © 2024 SenAlert - Tous droits réservés
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
