'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DoctorList } from '@/components/telemedicine/doctor-list';
import { ConsultationBooking } from '@/components/telemedicine/consultation-booking';
import { VideoConsultation } from '@/components/telemedicine/video-consultation';
import { ChatInterface } from '@/components/telemedicine/chat-interface';
import { MedicalDocuments } from '@/components/telemedicine/medical-documents';
import { PaymentSystem } from '@/components/telemedicine/payment-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  MessageCircle,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  Shield,
  Lock,
  Wifi,
  Headphones,
  Smartphone,
  Laptop,
  Server
} from 'lucide-react';
import { TelemedicineService, type Doctor, type Consultation } from '@/lib/telemedicine-system';

export default function TelemedicinePage() {
  const [currentView, setCurrentView] = useState<'doctors' | 'booking' | 'consultation' | 'chat' | 'documents' | 'payments'>('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'chat'>('video');
  const [activeTab, setActiveTab] = useState('overview');

  // En una aplicación real, esto vendría del contexto de autenticación
  const patientId = 'patient-123';

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('booking');
  };

  const handleBookingComplete = (consultation: Consultation) => {
    setActiveConsultation(consultation);
    setCurrentView('doctors'); // Volver a la lista de doctores después de reservar
  };

  const handleStartConsultation = (type: 'video' | 'chat') => {
    setConsultationType(type);
    setCurrentView(type === 'video' ? 'consultation' : 'chat');
  };

  const handleEndConsultation = () => {
    setCurrentView('doctors');
    setActiveConsultation(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'booking':
        return selectedDoctor ? (
          <ConsultationBooking
            doctor={selectedDoctor}
            onBack={() => setCurrentView('doctors')}
            onBookingComplete={handleBookingComplete}
          />
        ) : (
          <div>Error: No doctor selected</div>
        );
      
      case 'consultation':
        return activeConsultation && selectedDoctor ? (
          <VideoConsultation
            consultation={activeConsultation}
            doctor={selectedDoctor}
            onEndCall={handleEndConsultation}
          />
        ) : (
          <div>Error: No active consultation</div>
        );
      
      case 'chat':
        return activeConsultation && selectedDoctor ? (
          <ChatInterface
            consultation={activeConsultation}
            doctor={selectedDoctor}
          />
        ) : (
          <div>Error: No active consultation</div>
        );
      
      case 'documents':
        return <MedicalDocuments patientId={patientId} />;
      
      case 'payments':
        return <PaymentSystem patientId={patientId} />;
      
      case 'doctors':
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Telemedicina</h1>
              <p className="text-muted-foreground">
                Consulta con especialistas médicos desde la comodidad de tu hogar
              </p>
            </div>

            {/* Consulta activa (si existe) */}
            {activeConsultation && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Consulta Programada</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {selectedDoctor?.first_name[0]}{selectedDoctor?.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{selectedDoctor?.first_name} {selectedDoctor?.last_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedDoctor?.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(new Date(activeConsultation.appointment_date), 'dd/MM/yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{activeConsultation.appointment_time}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleStartConsultation('video')}
                      className="flex-1"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Iniciar Videoconsulta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStartConsultation('chat')}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Iniciar Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visión General</TabsTrigger>
                <TabsTrigger value="doctors">Especialistas</TabsTrigger>
                <TabsTrigger value="features">Características</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        <span>Videoconsultas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Consulta con especialistas médicos a través de videollamadas HD con calidad profesional.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('doctors')}
                      >
                        Agendar Consulta
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span>Chat Médico</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Comunícate con tu médico a través de chat seguro y comparte documentos e imágenes.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCurrentView('documents')}
                      >
                        Gestionar Documentos
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <span>Pagos Seguros</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Realiza pagos de forma segura y recibe facturas electrónicas automáticamente.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCurrentView('payments')}
                      >
                        Ver Pagos
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Cómo Funciona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium mb-1">1. Elige Especialista</h3>
                        <p className="text-sm text-muted-foreground">
                          Selecciona entre nuestros médicos certificados
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-medium mb-1">2. Agenda Cita</h3>
                        <p className="text-sm text-muted-foreground">
                          Selecciona fecha y hora conveniente
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium mb-1">3. Realiza el Pago</h3>
                        <p className="text-sm text-muted-foreground">
                          Paga de forma segura online
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Video className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="font-medium mb-1">4. Inicia Consulta</h3>
                        <p className="text-sm text-muted-foreground">
                          Conéctate por video o chat
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-6">
                <DoctorList onSelectDoctor={handleSelectDoctor} />
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5" />
                        <span>Videoconsultas HD</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Calidad HD con ajuste automático según ancho de banda</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Compartir pantalla para revisar resultados médicos</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Sala de espera virtual con verificación de conexión</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Grabación opcional de consultas (con consentimiento)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Chat Médico Seguro</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Mensajería cifrada de extremo a extremo</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Compartir imágenes y documentos médicos</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Historial completo de conversaciones</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Indicadores de "escribiendo" y "leído"</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Documentación Médica</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Compartir resultados e historias clínicas</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Recetas electrónicas con firma digital</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Almacenamiento seguro de documentos</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Exportación en formatos estándar médicos</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Sistema de Pagos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Facturación automática post-consulta</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Múltiples métodos de pago (tarjeta, PayPal)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Comprobantes digitales descargables</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Integración con seguros médicos</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Seguridad y Privacidad</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Protección de Datos</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <Lock className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Cifrado de Extremo a Extremo</p>
                              <p className="text-sm text-muted-foreground">
                                Todas las comunicaciones están protegidas con cifrado AES-256
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Cumplimiento HIPAA/GDPR</p>
                              <p className="text-sm text-muted-foreground">
                                Plataforma diseñada para cumplir con regulaciones de privacidad médica
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Autenticación de Dos Factores</p>
                              <p className="text-sm text-muted-foreground">
                                Capa adicional de seguridad para proteger tu cuenta
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Infraestructura Segura</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <Server className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Backups Automáticos</p>
                              <p className="text-sm text-muted-foreground">
                                Copias de seguridad cifradas y redundantes
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Wifi className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Conexiones Seguras</p>
                              <p className="text-sm text-muted-foreground">
                                Toda la plataforma utiliza HTTPS con certificados SSL
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <Laptop className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Registro de Accesos</p>
                              <p className="text-sm text-muted-foreground">
                                Monitoreo completo de todas las actividades del sistema
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Compromiso de Privacidad
                      </h3>
                      <p className="text-sm text-blue-700">
                        Nos comprometemos a proteger tu información médica con los más altos estándares de seguridad.
                        Nunca compartimos tus datos con terceros sin tu consentimiento explícito y cumplimos con todas
                        las regulaciones de privacidad médica aplicables.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navegación rápida */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center space-y-2"
                onClick={() => setCurrentView('doctors')}
              >
                <Users className="w-6 h-6 text-blue-600" />
                <span>Buscar Especialistas</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center space-y-2"
                onClick={() => setCurrentView('documents')}
              >
                <FileText className="w-6 h-6 text-green-600" />
                <span>Documentos Médicos</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center space-y-2"
                onClick={() => setCurrentView('payments')}
              >
                <CreditCard className="w-6 h-6 text-purple-600" />
                <span>Pagos y Facturas</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center space-y-2"
                disabled={!activeConsultation}
                onClick={() => activeConsultation && handleStartConsultation('chat')}
              >
                <MessageCircle className="w-6 h-6 text-red-600" />
                <span>Mis Consultas</span>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderCurrentView()}
    </DashboardLayout>
  );
}

// Función auxiliar para formatear fechas
function format(date: Date, format: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}