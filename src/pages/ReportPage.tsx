import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Mic, MicOff, MapPin, Send, Copy, CheckCircle, Home, Bell, Square, Phone, User, FileText, AlertTriangle, Lightbulb, Trash2, Wrench, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { generateAuthCode, storeAuthCode } from '@/lib/authUtils';
import { populationService, reportService, notificationService } from '@/lib/supabase';
import { Footer } from '@/components/Footer';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';

const ReportPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const incidentTypes = [
    { id: 'voirie', label: 'Problème de voirie' },
    { id: 'eclairage', label: 'Éclairage public' },
    { id: 'proprete', label: 'Propreté urbaine' },
    { id: 'mobilier', label: 'Mobilier urbain' },
    { id: 'autre', label: 'Autre' }
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
            );
            const data = await response.json();
            setAddress(data.localityInfo?.administrative?.[3]?.name + ', ' + data.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'adresse:', error);
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const generateUserId = () => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Obtenir la localisation
      const locationData = localStorage.getItem('user_location');
      let latitude = 0, longitude = 0;
      if (locationData) {
        const location = JSON.parse(locationData);
        latitude = location.latitude;
        longitude = location.longitude;
      }

      // Générer un code unique pour ce signalement
      const anonymousCode = generateAuthCode();

      // Déduire le département depuis l'adresse si possible
      let department = 'Département inconnu';
      if (address) {
        // Exemple simple : extraire le département de l'adresse si possible
        const parts = address.split(',');
        if (parts.length > 1) {
          department = parts[parts.length - 2].trim();
        }
      }

      // Créer le signalement avec upload des fichiers
      const reportData = {
      type: selectedType,
      description,
        latitude,
        longitude,
        department,
      address,
      status: 'en-attente',
        anonymous_code: anonymousCode,
        anonymous_name: fullName,
        anonymous_phone: phoneNumber
      };

      // Convertir le blob audio en fichier si nécessaire
      let audioFile: File | undefined;
      if (audioBlob) {
        audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, {
          type: 'audio/wav'
        });
      }

      const report = await reportService.createWithFiles(
        reportData,
        selectedImage || undefined,
        audioFile
      );

      // Afficher le code unique dans le pop-up
      setAuthCode(anonymousCode);
      setIsSubmitted(true);

    toast({
      title: "Signalement envoyé",
      description: "Votre signalement a été envoyé avec succès.",
    });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du signalement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(authCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useRealtimeTable('reports', loadReport);

  // Page de confirmation après envoi
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Signalement envoyé</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Signalement envoyé avec succès !
              </h2>
              
              <p className="text-gray-600 mb-8">
                Votre signalement a été enregistré. Conservez précieusement votre code d'authentification pour suivre vos signalements et notifications.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Votre code d'authentification unique
                </h3>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
                  <code className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                    {authCode}
                  </code>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Ce code unique de 8 caractères vous permettra d'accéder à vos signalements et notifications.
                  <br />
                  <strong>Conservez-le précieusement !</strong>
                </p>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Code copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copier le code
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/mes-signalements')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Voir mes signalements
                </button>
                
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Voir mes notifications
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Formulaire de signalement
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Signaler un incident</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Conseils */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold mb-2">Conseils pour un bon signalement</h2>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>• Soyez précis dans votre description</li>
                  <li>• Ajoutez une photo si possible</li>
                  <li>• Vérifiez l'adresse de l'incident</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Type d'incident *
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger className="w-full h-14 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500">
                    <SelectValue placeholder="Sélectionnez la catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="text-base py-4">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Informations personnelles
                </Label>
                <div className="space-y-4">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prénom et Nom"
                    className="h-14 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500"
                  />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Numéro de téléphone *"
                    className="h-14 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Localisation
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isLoadingLocation ? "Localisation en cours..." : "Saisissez l'adresse..."}
                    className="h-14 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500 pl-14"
                    required
                    disabled={isLoadingLocation}
                  />
                  <MapPin className="absolute left-4 top-4 w-6 h-6 text-yellow-500" />
                  {isLoadingLocation && (
                    <div className="absolute right-4 top-4">
                      <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Description *
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'incident en détail (minimum 15 caractères)..."
                  className="min-h-[120px] text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500 resize-none"
                  required
                />
            </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Photo (optionnel)
                </Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-6 h-6 mr-2 text-gray-600" />
                      <span className="text-base font-medium">Photo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-6 h-6 mr-2 text-gray-600" />
                      <span className="text-base font-medium">Upload</span>
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                  capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {selectedImage && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Message vocal (optionnel)
                </Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    className="w-full h-16 rounded-xl text-base font-medium"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-6 h-6 mr-3" />
                        Arrêter l'enregistrement
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 mr-3" />
                        Enregistrer un message vocal
                      </>
                    )}
                  </Button>
                  {audioBlob && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center">
                      <audio controls src={URL.createObjectURL(audioBlob)} className="w-full">
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                      <button
                        type="button"
                        onClick={() => setAudioBlob(null)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Supprimer le message vocal"
                        aria-label="Supprimer le message vocal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={!selectedType || !description || !phoneNumber || !address}
              >
                <Send className="w-6 h-6 mr-3" />
                Envoyer le signalement
              </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportPage;
