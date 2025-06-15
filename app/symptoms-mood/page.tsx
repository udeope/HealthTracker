'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SymptomForm } from '@/components/symptom-mood/symptom-form';
import { MoodForm } from '@/components/symptom-mood/mood-form';
import { SymptomMoodDashboard } from '@/components/symptom-mood/symptom-mood-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Brain,
  BarChart3,
  Calendar,
  Download,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export default function SymptomsMoodPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // En una aplicación real, esto vendría del contexto de autenticación
  const userId = 'user-123';

  const handleDataAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sistema de Seguimiento de Síntomas y Estado de Ánimo</h1>
            <p className="text-muted-foreground">
              Monitoreo integral de tu bienestar físico y emocional con análisis predictivo
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <SymptomForm userId={userId} onSymptomAdded={handleDataAdded} />
            <MoodForm userId={userId} onMoodAdded={handleDataAdded} />
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar Datos</span>
            </Button>
          </div>
        </div>

        {/* Características del sistema */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Heart className="w-5 h-5" />
              <span>Sistema Integral de Seguimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Seguimiento de Síntomas</p>
                <p className="text-sm text-blue-600">Registro detallado con localización y intensidad</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Estado de Ánimo</p>
                <p className="text-sm text-blue-600">Monitoreo emocional y factores influyentes</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Análisis Predictivo</p>
                <p className="text-sm text-blue-600">Detección de patrones y correlaciones</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Alertas Inteligentes</p>
                <p className="text-sm text-blue-600">Notificaciones configurables y automáticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs principales */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SymptomMoodDashboard userId={userId} key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Análisis Avanzado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Análisis Predictivo Avanzado</h3>
                  <p className="text-muted-foreground mb-4">
                    Identificación automática de patrones, triggers y correlaciones entre síntomas y estado de ánimo
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Detección de Triggers</p>
                      <p className="text-sm text-muted-foreground">Factores desencadenantes automáticos</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Patrones Temporales</p>
                      <p className="text-sm text-muted-foreground">Tendencias y ciclos identificados</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <p className="font-medium">Correlaciones</p>
                      <p className="text-sm text-muted-foreground">Relaciones entre síntomas y emociones</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Reportes Personalizados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Generación de Reportes</h3>
                  <p className="text-muted-foreground mb-4">
                    Reportes detallados en PDF/CSV con análisis de tendencias y recomendaciones médicas
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">Reportes Semanales</p>
                      <p className="text-sm text-muted-foreground">Resúmenes automáticos</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Download className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Exportación Médica</p>
                      <p className="text-sm text-muted-foreground">Formato para profesionales</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configuración del Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configuración Personalizada</h3>
                  <p className="text-muted-foreground mb-4">
                    Personaliza alertas, recordatorios y preferencias de análisis
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium">Alertas Configurables</p>
                      <p className="text-sm text-muted-foreground">Umbrales personalizados</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Recordatorios</p>
                      <p className="text-sm text-muted-foreground">Horarios de registro</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Funcionalidades destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Registro Intuitivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Formularios paso a paso</li>
                <li>• Escalas visuales de dolor</li>
                <li>• Localización corporal interactiva</li>
                <li>• Registro rápido de emociones</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Brain className="w-5 h-5" />
                <span>Análisis Inteligente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Detección automática de patrones</li>
                <li>• Correlaciones estadísticas</li>
                <li>• Predicción de riesgos</li>
                <li>• Recomendaciones personalizadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Sistema de Alertas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Umbrales de dolor configurables</li>
                <li>• Alertas de frecuencia de síntomas</li>
                <li>• Detección de declive emocional</li>
                <li>• Notificaciones preventivas</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Información técnica y de seguridad */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Shield className="w-5 h-5" />
              <span>Características Técnicas y Seguridad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Funcionalidades Técnicas</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ Interfaz responsive y accesible</li>
                  <li>✓ Sincronización entre dispositivos</li>
                  <li>✓ Análisis predictivo con IA</li>
                  <li>✓ Exportación PDF/CSV</li>
                  <li>✓ Visualizaciones interactivas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Seguridad y Privacidad</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ Encriptación end-to-end</li>
                  <li>✓ Cumplimiento HIPAA/GDPR</li>
                  <li>✓ Almacenamiento seguro</li>
                  <li>✓ Control de acceso granular</li>
                  <li>✓ Auditoría de datos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}