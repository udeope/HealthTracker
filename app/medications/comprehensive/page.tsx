'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MedicationDashboard } from '@/components/medication/medication-dashboard';
import { MedicationForm } from '@/components/medication/medication-form';
import { MedicationCalendar } from '@/components/medication/medication-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Calendar,
  BarChart3,
  Package,
  Bell,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

export default function ComprehensiveMedicationPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // En una aplicación real, esto vendría del contexto de autenticación
  const userId = 'user-123';

  const handleMedicationAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sistema de Gestión de Medicamentos</h1>
            <p className="text-muted-foreground">
              Gestión integral, segura y conforme con HIPAA/GDPR
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <MedicationForm userId={userId} onMedicationAdded={handleMedicationAdded} />
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
              <Shield className="w-5 h-5" />
              <span>Sistema Integral de Medicamentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Pill className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Base de Datos Completa</p>
                <p className="text-sm text-blue-600">Medicamentos, prescripciones, interacciones</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Bell className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Notificaciones Inteligentes</p>
                <p className="text-sm text-blue-600">Push, email, SMS personalizables</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Seguimiento Avanzado</p>
                <p className="text-sm text-blue-600">Adherencia, efectos secundarios</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Seguridad Total</p>
                <p className="text-sm text-blue-600">HIPAA/GDPR, sincronización segura</p>
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
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <MedicationDashboard userId={userId} key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <MedicationCalendar userId={userId} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Gestión de Inventario</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Inventario Inteligente</h3>
                  <p className="text-muted-foreground mb-4">
                    Control automático de stock, alertas de vencimiento y reorden automático
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium">Alertas de Stock</p>
                      <p className="text-sm text-muted-foreground">Notificaciones automáticas</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Control de Vencimiento</p>
                      <p className="text-sm text-muted-foreground">Fechas de caducidad</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Reorden Automático</p>
                      <p className="text-sm text-muted-foreground">Configuración inteligente</p>
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
                  <TrendingUp className="w-5 h-5" />
                  <span>Reportes y Análisis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Análisis Avanzado</h3>
                  <p className="text-muted-foreground mb-4">
                    Reportes detallados de adherencia, efectos secundarios y tendencias
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Adherencia Semanal</p>
                      <p className="text-sm text-muted-foreground">Reportes automáticos</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Exportación PDF/CSV</p>
                      <p className="text-sm text-muted-foreground">Datos portables</p>
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
                <span>Seguimiento de Adherencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Registro automático de tomas</li>
                <li>• Métricas de cumplimiento</li>
                <li>• Identificación de patrones</li>
                <li>• Reportes para médicos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Detección de Interacciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Base de datos actualizada</li>
                <li>• Alertas en tiempo real</li>
                <li>• Niveles de severidad</li>
                <li>• Recomendaciones clínicas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Bell className="w-5 h-5" />
                <span>Sistema de Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Recordatorios personalizables</li>
                <li>• Múltiples canales (push/email/SMS)</li>
                <li>• Alertas de stock bajo</li>
                <li>• Reportes semanales</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Información de cumplimiento */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Shield className="w-5 h-5" />
              <span>Seguridad y Cumplimiento Normativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Cumplimiento HIPAA</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ Encriptación end-to-end</li>
                  <li>✓ Auditoría de accesos</li>
                  <li>✓ Controles de privacidad</li>
                  <li>✓ Backup seguro</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Cumplimiento GDPR</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ Consentimiento explícito</li>
                  <li>✓ Derecho al olvido</li>
                  <li>✓ Portabilidad de datos</li>
                  <li>✓ Notificación de brechas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}