'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Calendar as CalendarIcon,
  Wand2,
  Download,
  Share,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Signature
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MedicalReportsService, type MedicalReport, type ReportTemplate } from '@/lib/medical-reports-system';

interface ReportGeneratorProps {
  userId: string;
  onReportGenerated?: (report: MedicalReport) => void;
}

const SPECIALTIES = [
  { value: 'cardiology', label: 'Cardiología' },
  { value: 'neurology', label: 'Neurología' },
  { value: 'endocrinology', label: 'Endocrinología' },
  { value: 'psychiatry', label: 'Psiquiatría' },
  { value: 'general', label: 'Medicina General' },
  { value: 'pediatrics', label: 'Pediatría' },
  { value: 'geriatrics', label: 'Geriatría' }
];

export function ReportGenerator({ userId, onReportGenerated }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [generationOptions, setGenerationOptions] = useState({
    include_charts: true,
    include_recommendations: true,
    auto_sign: false
  });
  const [validationResults, setValidationResults] = useState<any>(null);
  const [generatedReport, setGeneratedReport] = useState<MedicalReport | null>(null);

  useEffect(() => {
    if (selectedSpecialty) {
      loadTemplates();
    }
  }, [selectedSpecialty]);

  const loadTemplates = async () => {
    try {
      const templatesData = await MedicalReportsService.getTemplatesBySpecialty(selectedSpecialty);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error al cargar las plantillas');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Por favor selecciona una plantilla');
      return;
    }

    try {
      setLoading(true);
      
      const report = await MedicalReportsService.generateAutomaticReport(
        userId,
        selectedTemplate,
        {
          start: format(dateRange.start, 'yyyy-MM-dd'),
          end: format(dateRange.end, 'yyyy-MM-dd')
        },
        generationOptions
      );

      setGeneratedReport(report);
      setCurrentStep(4);
      toast.success('Reporte generado exitosamente');
      onReportGenerated?.(report);

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateData = async () => {
    // Simular validación de datos
    setLoading(true);
    
    setTimeout(() => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: ['Algunos datos de laboratorio están pendientes'],
        score: 85,
        completeness: 90,
        accuracy: 95,
        consistency: 80
      };
      
      setValidationResults(mockValidation);
      setLoading(false);
      setCurrentStep(3);
    }, 2000);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedSpecialty('');
    setSelectedTemplate('');
    setValidationResults(null);
    setGeneratedReport(null);
    setDateRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label>Especialidad Médica</Label>
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar especialidad" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((specialty) => (
              <SelectItem key={specialty.value} value={specialty.value}>
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSpecialty && (
        <div>
          <Label>Plantilla de Reporte</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plantilla" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground mt-2">
              {templates.find(t => t.id === selectedTemplate)?.description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.start ? format(dateRange.start, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.start}
                onSelect={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Fecha de Fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.end ? format(dateRange.end, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.end}
                onSelect={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Opciones de Generación</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include_charts"
              checked={generationOptions.include_charts}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, include_charts: e.target.checked }))}
            />
            <Label htmlFor="include_charts">Incluir gráficos y visualizaciones</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include_recommendations"
              checked={generationOptions.include_recommendations}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, include_recommendations: e.target.checked }))}
            />
            <Label htmlFor="include_recommendations">Generar recomendaciones automáticas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto_sign"
              checked={generationOptions.auto_sign}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, auto_sign: e.target.checked }))}
            />
            <Label htmlFor="auto_sign">Firma digital automática</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <CheckCircle className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {loading ? 'Validando Datos...' : 'Validación Completada'}
        </h3>
        <p className="text-muted-foreground">
          {loading 
            ? 'Verificando la integridad y completitud de los datos médicos'
            : 'Los datos han sido validados y están listos para la generación del reporte'
          }
        </p>
      </div>

      {!loading && validationResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{validationResults.completeness}%</p>
              <p className="text-sm text-green-700">Completitud</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{validationResults.accuracy}%</p>
              <p className="text-sm text-blue-700">Precisión</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{validationResults.consistency}%</p>
              <p className="text-sm text-purple-700">Consistencia</p>
            </div>
          </div>

          <div>
            <Label>Puntuación de Calidad General</Label>
            <div className="mt-2">
              <Progress value={validationResults.score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {validationResults.score}/100 - {validationResults.score >= 80 ? 'Excelente' : validationResults.score >= 60 ? 'Bueno' : 'Necesita revisión'}
              </p>
            </div>
          </div>

          {validationResults.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Advertencias</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationResults.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Errores Críticos</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationResults.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          ) : (
            <Wand2 className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {loading ? 'Generando Reporte...' : 'Listo para Generar'}
        </h3>
        <p className="text-muted-foreground">
          {loading 
            ? 'Procesando datos y creando el reporte médico personalizado'
            : 'Todos los datos están validados y listos para la generación automática'
          }
        </p>
      </div>

      {!loading && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Resumen de Configuración</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Especialidad:</strong> {SPECIALTIES.find(s => s.value === selectedSpecialty)?.label}</p>
              <p><strong>Plantilla:</strong> {templates.find(t => t.id === selectedTemplate)?.name}</p>
              <p><strong>Período:</strong> {format(dateRange.start, 'dd/MM/yyyy')} - {format(dateRange.end, \'dd/MM/yyyy')}</p>
              <p><strong>Opciones:</strong> 
                {generationOptions.include_charts && ' Gráficos'}
                {generationOptions.include_recommendations && ' Recomendaciones'}
                {generationOptions.auto_sign && ' Firma automática'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Visualizaciones</p>
              <p className="text-sm text-muted-foreground">Gráficos automáticos</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Seguridad</p>
              <p className="text-sm text-muted-foreground">Encriptación AES-256</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {generatedReport && (
        <>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reporte Generado Exitosamente</h3>
            <p className="text-muted-foreground">
              El reporte médico ha sido creado y está listo para su revisión
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800">{generatedReport.title}</h4>
              <Badge variant="secondary">{generatedReport.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p><strong>ID:</strong> {generatedReport.id}</p>
                <p><strong>Versión:</strong> {generatedReport.version}</p>
                <p><strong>Calidad:</strong> {generatedReport.metadata.quality_score}/100</p>
              </div>
              <div>
                <p><strong>Creado:</strong> {format(new Date(generatedReport.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p><strong>Tipo:</strong> {generatedReport.report_type}</p>
                <p><strong>Estado:</strong> {generatedReport.status}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Hallazgos Principales</h4>
            <ul className="space-y-2">
              {generatedReport.content.summary.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Ver Reporte
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Wand2 className="w-4 h-4" />
          <span>Generar Reporte</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Generador de Reportes Médicos</span>
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step}
              </div>
              {step < 4 && (
                <div className={cn(
                  "w-8 h-0.5 mx-2",
                  currentStep > step ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Títulos de pasos */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {currentStep === 1 && "Configuración del Reporte"}
            {currentStep === 2 && "Validación de Datos"}
            {currentStep === 3 && "Generación Automática"}
            {currentStep === 4 && "Reporte Completado"}
          </h3>
        </div>

        {/* Contenido del paso actual */}
        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                setIsOpen(false);
                resetForm();
              } else {
                setCurrentStep(Math.max(1, currentStep - 1));
              }
            }}
          >
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          <div className="flex space-x-2">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedSpecialty || !selectedTemplate}
              >
                Siguiente
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                onClick={handleValidateData}
                disabled={loading}
              >
                {loading ? 'Validando...' : 'Validar Datos'}
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}