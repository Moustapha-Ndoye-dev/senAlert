import React, { useState } from 'react';
import { Play, Pause, Volume2, X, Download, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface MediaViewerProps {
  photoUrl?: string;
  audioUrl?: string;
  className?: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ 
  photoUrl, 
  audioUrl, 
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!photoUrl && !audioUrl) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Photo */}
      {photoUrl && (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl border border-gray-200">
            <img
              src={photoUrl}
              alt="Photo du signalement"
              className="w-full h-48 object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => setShowPhotoModal(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-800"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-gray-800"
                  onClick={() => downloadFile(photoUrl, `photo_signalement_${Date.now()}.jpg`)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio */}
      {audioUrl && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Button
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full bg-white hover:bg-blue-50 border-2 border-blue-300"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-blue-600" />
                ) : (
                  <Play className="w-5 h-5 text-blue-600 ml-0.5" />
                )}
              </Button>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Message vocal
                </span>
              </div>
              
              <audio
                ref={setAudioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="w-full"
                controls
                preload="metadata"
              />
            </div>

            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={() => downloadFile(audioUrl, `audio_signalement_${Date.now()}.wav`)}
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour la photo */}
      {showPhotoModal && photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-800"
              onClick={() => setShowPhotoModal(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <img
              src={photoUrl}
              alt="Photo du signalement"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-800"
                onClick={() => downloadFile(photoUrl, `photo_signalement_${Date.now()}.jpg`)}
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 