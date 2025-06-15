'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ReportGenerator } from '@/components/medical-reports/report-generator';
import { TemplateEditor } from '@/components/medical-reports/template-editor';
import { ReportsDashboard } from '@/components/medical-reports/reports-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Wand2,
  Edit,
  BarChart3,
  Shield,
  Download,
  Share,
  Signature,
  Lock,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Settings
} from 'lucide-react';

export default function MedicalReportsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // En una aplicación real, esto vendría del contexto de autenticación
  const userId = 'user-123';

  const handleReportGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sistema Integral de Reportes Médicos</h1>
            <p className="text-muted-foreground">
              Generación automática, plantillas personalizables y cumplimiento normativo
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <ReportGenerator userId={userId} onReportGenerated={handleReportGenerated} />
            <TemplateEditor />
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
              <FileText className="w-5 h-5" />
              <span>Sistema Integral de Reportes Médicos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Wand2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Generación Automática</p>
                <p className="text-sm text-blue-600">IA avanzada con autocompletado inteligente</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Edit className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Templates Personalizables</p>
                <p className="text-sm text-blue-600">Editor visual por especialidad médica</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Visualizaciones Avanzadas</p>
                <p className="text-sm text-blue-600">Gráficos interactivos y dashboards</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Seguridad Total</p>
                <p className="text-sm text-blue-600">HIPAA/GDPR con firma digital</p>
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
            <TabsTrigger value="generation" className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>Generación</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Seguridad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ReportsDashboard userId={userId} key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Generación Automática de Reportes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Wand2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Generación Inteligente</h3>
                  <p className="text-muted-foreground mb-4">
                    Sistema de IA que genera reportes médicos automáticamente con validación de datos críticos
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Autocompletado</p>
                      <p className="text-sm text-muted-foreground">Campos inteligentes automáticos</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium">Validación</p>
                      <p className="text-sm text-muted-foreground">Verificación de datos críticos</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Visualizaciones</p>
                      <p className="text-sm text-muted-foreground">Gráficos automáticos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Sistema de Plantillas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Edit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Editor Visual de Plantillas</h3>
                  <p className="text-muted-foreground mb-4">
                    Biblioteca de plantillas por especialidad médica con editor visual personalizable
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Database className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">Biblioteca Completa</p>
                      <p className="text-sm text-muted-foreground">Templates por especialidad</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Settings className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Campos Dinámicos</p>
                      <p className="text-sm text-muted-foreground">Adaptables a cada caso</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Seguridad y Cumplimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Seguridad Integral</h3>
                  <p className="text-muted-foreground mb-4">
                    Cumplimiento HIPAA/GDPR con encriptación, firma digital y compartición segura
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Lock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <p className="font-medium">Encriptación</p>
                      <p className="text-sm text-muted-foreground">AES-256 end-to-end</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Signature className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Firma Digital</p>
                      <p className="text-sm text-muted-foreground">Certificada y verificable</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Share className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Compartición</p>
                      <p className="text-sm text-muted-foreground">Enlaces seguros temporales</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">Auditoría</p>
                      <p className="text-sm text-muted-foreground">Registro completo de accesos</p>
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
                <span>Generación Automática</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Autocompletado inteligente de campos</li>
                <li>• Validación automática de datos críticos</li>
                <li>• Generación instantánea basada en IA</li>
                <li>• Resúmenes ejecutivos automáticos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Edit className="w-5 h-5" />
                <span>Sistema de Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Biblioteca por especialidad médica</li>
                <li>• Editor visual personalizable</li>
                <li>• Campos dinámicos adaptables</li>
                <li>• Validación de reglas personalizadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <BarChart3 className="w-5 h-5" />
                <span>Visualizaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Gráficos interactivos automáticos</li>
                <li>• Dashboard personalizable</li>
                <li>• Indicadores clave de salud</li>
                <li>• Análisis de tendencias</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Información de cumplimiento y exportación */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Globe className="w-5 h-5" />
              <span>Exportación y Cumplimiento Normativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Formatos de Exportación</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ HL7 FHIR para interoperabilidad</li>
                  <li>✓ DICOM para imágenes médicas</li>
                  <li>✓ PDF con firma digital certificada</li>
                  <li>✓ CSV para análisis de datos</li>
                  <li>✓ Watermarks y metadatos seguros</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Cumplimiento Normativo</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ HIPAA - Protección de datos médicos</li>
                  <li>✓ GDPR - Privacidad y consentimiento</li>
                  <li>✓ FDA 21 CFR Part 11 - Registros electrónicos</li>
                  <li>✓ ISO 27001 - Gestión de seguridad</li>
                  <li>✓ Auditoría completa de accesos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan de implementación */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Clock className="w-5 h-5" />
              <span>Plan de Implementación por Fases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="font-medium text-gray-800">Fase 1: Core</p>
                <p className="text-sm text-gray-600">Generación básica y templates</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="font-medium text-gray-800">Fase 2: IA</p>
                <p className="text-sm text-gray-600">Autocompletado y validación</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="font-medium text-gray-800">Fase 3: Seguridad</p>
                <p className="text-sm text-gray-600">Firma digital y compartición</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <p className="font-medium text-gray-800">Fase 4: Integración</p>
                <p className="text-sm text-gray-600">HL7/DICOM y APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}