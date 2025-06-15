'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageCircle,
  FileText,
  Settings,
  Users,
  Clock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  CameraOff
} from 'lucide-react';
import { TelemedicineService, type Consultation, type Doctor, type VideoCall } from '@/lib/telemedicine-system';

interface VideoConsultationProps {
  consultation: Consultation;
  doctor: Doctor;
  isDoctor?: boolean;
  onEndCall: () => void;
}

export function VideoConsultation({ consultation, doctor, isDoctor = false, onEndCall }: VideoConsultationProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [callDuration, setCallDuration] = useState(0);
  const [isWaitingRoom, setIsWaitingRoom] = useState(!isDoctor);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [videoCall, setVideoCall] = useState<VideoCall | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<Date>(new Date());

  useEffect(() => {
    initializeCall();
    startCallTimer();
    
    return () => {
      cleanupCall();
    };
  }, []);

  useEffect(() => {
    // Simular cambios en la calidad de conexión
    const interval = setInterval(() => {
      const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const initializeCall = async () => {
    try {
      // En producción, esto inicializaría Daily.co
      console.log('Initializing video call for consultation:', consultation.id);
      
      // Simular creación de sala de video
      if (consultation.room_id) {
        const mockVideoCall: VideoCall = {
          id: 'video-call-1',
          consultation_id: consultation.id,
          daily_room_name: consultation.room_id,
          daily_room_url: `https://healthtracker.daily.co/${consultation.room_id}`,
          call_status: 'waiting',
          recording_enabled: false,
          screen_sharing_enabled: true,
          participants_log: [],
          technical_issues: [],
          created_at: new Date().toISOString()
        };
        setVideoCall(mockVideoCall);
      }

      // Obtener acceso a cámara y micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Si es doctor, unirse inmediatamente
      if (isDoctor) {
        await joinCall();
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Error al inicializar la videollamada');
    }
  };

  const joinCall = async () => {
    try {
      if (videoCall) {
        const userId = isDoctor ? consultation.doctor_id : consultation.patient_id;
        const userType = isDoctor ? 'doctor' : 'patient';
        
        await TelemedicineService.joinVideoCall(videoCall.id, userId, userType);
        setIsWaitingRoom(false);
        setParticipants([userId]);
        
        toast.success('Te has unido a la videollamada');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Error al unirse a la llamada');
    }
  };

  const startCallTimer = () => {
    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - callStartTime.current.getTime()) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        toast.success('Compartiendo pantalla');
      } else {
        // Volver a la cámara
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        
        setIsScreenSharing(false);
        toast.success('Dejaste de compartir pantalla');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Error al compartir pantalla');
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const endCall = async () => {
    try {
      if (videoCall) {
        await TelemedicineService.endVideoCall(videoCall.id);
      }
      
      // Limpiar streams
      cleanupCall();
      
      toast.success('Llamada finalizada');
      onEndCall();
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Error al finalizar la llamada');
    }
  };

  const cleanupCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-blue-600" />;
      case 'fair':
        return <Wifi className="w-4 h-4 text-yellow-600" />;
      case 'poor':
        return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };

  if (isWaitingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Sala de Espera</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor.profile_image} />
                <AvatarFallback>{doctor.first_name[0]}{doctor.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium">{doctor.first_name} {doctor.last_name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">
                Esperando a que el doctor se una a la consulta...
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Mientras esperas, asegúrate de que tu cámara y micrófono estén funcionando correctamente.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={isAudioEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
            </div>

            <Button variant="outline" onClick={onEndCall} className="w-full">
              Salir de la Sala
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Video principal (remoto) */}
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Overlay cuando no hay video remoto */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={doctor.profile_image} />
              <AvatarFallback className="text-2xl">{doctor.first_name[0]}{doctor.last_name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-xl font-medium">{doctor.first_name} {doctor.last_name}</p>
            <p className="text-gray-300">{doctor.specialty}</p>
          </div>
        </div>
      </div>

      {/* Video local (picture-in-picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <CameraOff className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Header con información de la llamada */}
      <div className="absolute top-4 left-4 right-64 flex items-center justify-between">
        <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatDuration(callDuration)}</span>
          </div>
          <div className="flex items-center space-x-2 text-white">
            {getConnectionIcon()}
            <span className="text-sm capitalize">{connectionQuality}</span>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participants.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Controles de la llamada */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 bg-black/70 backdrop-blur-sm rounded-full px-6 py-4">
          <Button
            variant={isAudioEnabled ? "ghost" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 text-white hover:bg-white/20"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "ghost" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 text-white hover:bg-white/20"
          >
            {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "ghost"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12 text-white hover:bg-white/20"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full w-12 h-12 text-white hover:bg-white/20"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full w-12 h-12 text-white hover:bg-white/20"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Indicadores de estado */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {!isAudioEnabled && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <MicOff className="w-3 h-3" />
            <span>Micrófono desactivado</span>
          </Badge>
        )}
        {!isVideoEnabled && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <VideoOff className="w-3 h-3" />
            <span>Cámara desactivada</span>
          </Badge>
        )}
        {isScreenSharing && (
          <Badge variant="default" className="flex items-center space-x-1">
            <Monitor className="w-3 h-3" />
            <span>Compartiendo pantalla</span>
          </Badge>
        )}
      </div>

      {/* Modal de chat */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-96">
          <DialogHeader>
            <DialogTitle>Chat de la Consulta</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4">
              <p className="text-center text-muted-foreground">
                El chat estará disponible próximamente
              </p>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 border rounded-lg"
                disabled
              />
              <Button disabled>Enviar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuración */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de la Llamada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Calidad de video</span>
              <select className="px-3 py-1 border rounded">
                <option>Alta (720p)</option>
                <option>Media (480p)</option>
                <option>Baja (360p)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Reducción de ruido</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Eco cancelación</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Grabación de la consulta</span>
              <input type="checkbox" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}