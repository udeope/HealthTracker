'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Thermometer,
  Activity,
  Brain,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SymptomMoodService, type SymptomEntry, type PainLocation } from '@/lib/local-storage-system';

interface SymptomFormProps {
  userId: string;
  onSymptomAdded?: () => void;
}

const COMMON_SYMPTOMS = [
  'Dolor de cabeza', 'Dolor de espalda', 'Dolor articular', 'Fatiga',
  'Náuseas', 'Mareos', 'Dolor abdominal', 'Dolor muscular',
  'Insomnio', 'Ansiedad', 'Depresión', 'Irritabilidad'
];

const BODY_PARTS = [
  'Cabeza', 'Cuello', 'Hombros', 'Brazos', 'Manos', 'Pecho',
  'Espalda alta', 'Espalda baja', 'Abdomen', 'Caderas',
  'Piernas', 'Rodillas', 'Pies', 'Todo el cuerpo'
];

const PAIN_TYPES = [
  'Punzante', 'Sordo', 'Ardiente', 'Pulsátil', 'Eléctrico',
  'Presión', 'Calambres', 'Rigidez', 'Hormigueo'
];

const AGGRAVATING_FACTORS = [
  'Movimiento', 'Reposo', 'Estrés', 'Clima', 'Comida',
  'Falta de sueño', 'Ejercicio', 'Trabajo', 'Ruido', 'Luz'
];

const RELIEVING_FACTORS = [
  'Descanso', 'Medicamento', 'Calor', 'Frío', 'Masaje',
  'Ejercicio suave', 'Meditación', 'Sueño', 'Hidratación'
];

export function SymptomForm({ userId, onSymptomAdded }: SymptomFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Datos básicos del síntoma
  const [symptomData, setSymptomData] = useState({
    entry_date: new Date(),
    entry_time: format(new Date(), 'HH:mm'),
    symptom_type: '',
    pain_intensity: 5,
    duration_minutes: 0,
    frequency: '',
    description: '',
    associated_symptoms: [] as string[],
    aggravating_factors: [] as string[],
    relieving_factors: [] as string[],
    medication_taken: [] as string[],
    activity_before: '',
    stress_level: 5,
    sleep_quality: 5,
    notes: '',
    is_critical: false
  });

  // Datos de localización del dolor
  const [painLocations, setPainLocations] = useState<Omit<PainLocation, 'id' | 'symptom_entry_id' | 'created_at'>[]>([]);
  const [currentLocation, setCurrentLocation] = useState({
    body_part: '',
    specific_area: '',
    side: '',
    intensity: 5,
    pain_type: ''
  });

  const handleSymptomChange = (field: string, value: any) => {
    setSymptomData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setSymptomData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const addPainLocation = () => {
    if (currentLocation.body_part) {
      setPainLocations(prev => [...prev, { ...currentLocation }]);
      setCurrentLocation({
        body_part: '',
        specific_area: '',
        side: '',
        intensity: 5,
        pain_type: ''
      });
    }
  };

  const removePainLocation = (index: number) => {
    setPainLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!symptomData.symptom_type) {
        toast.error('Por favor selecciona un tipo de síntoma');
        return;
      }

      // Crear entrada de síntoma
      const symptomEntry = await SymptomMoodService.createSymptomEntry({
        user_id: userId,
        entry_date: format(symptomData.entry_date, 'yyyy-MM-dd'),
        entry_time: symptomData.entry_time,
        symptom_type: symptomData.symptom_type,
        pain_intensity: symptomData.pain_intensity > 0 ? symptomData.pain_intensity : undefined,
        duration_minutes: symptomData.duration_minutes > 0 ? symptomData.duration_minutes : undefined,
        frequency: symptomData.frequency || undefined,
        description: symptomData.description || undefined,
        associated_symptoms: symptomData.associated_symptoms.length > 0 ? symptomData.associated_symptoms : undefined,
        aggravating_factors: symptomData.aggravating_factors.length > 0 ? symptomData.aggravating_factors : undefined,
        relieving_factors: symptomData.relieving_factors.length > 0 ? symptomData.relieving_factors : undefined,
        medication_taken: symptomData.medication_taken.length > 0 ? symptomData.medication_taken : undefined,
        activity_before: symptomData.activity_before || undefined,
        stress_level: symptomData.stress_level,
        sleep_quality: symptomData.sleep_quality,
        notes: symptomData.notes || undefined,
        is_critical: symptomData.is_critical
      });

      // Agregar localizaciones del dolor
      for (const location of painLocations) {
        await SymptomMoodService.addPainLocation({
          symptom_entry_id: symptomEntry.id,
          body_part: location.body_part,
          specific_area: location.specific_area || undefined,
          side: location.side || undefined,
          intensity: location.intensity,
          pain_type: location.pain_type || undefined
        });
      }

      // Verificar alertas
      const triggeredAlerts = await SymptomMoodService.checkAlerts(userId, symptomEntry);
      if (triggeredAlerts.length > 0) {
        toast.warning(`Se activaron ${triggeredAlerts.length} alerta(s) basadas en este síntoma`);
      }

      toast.success('Síntoma registrado exitosamente');
      resetForm();
      setIsOpen(false);
      onSymptomAdded?.();

    } catch (error) {
      console.error('Error adding symptom:', error);
      toast.error('Error al registrar el síntoma');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSymptomData({
      entry_date: new Date(),
      entry_time: format(new Date(), 'HH:mm'),
      symptom_type: '',
      pain_intensity: 5,
      duration_minutes: 0,
      frequency: '',
      description: '',
      associated_symptoms: [],
      aggravating_factors: [],
      relieving_factors: [],
      medication_taken: [],
      activity_before: '',
      stress_level: 5,
      sleep_quality: 5,
      notes: '',
      is_critical: false
    });
    setPainLocations([]);
    setCurrentLocation({
      body_part: '',
      specific_area: '',
      side: '',
      intensity: 5,
      pain_type: ''
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !symptomData.entry_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {symptomData.entry_date ? format(symptomData.entry_date, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={symptomData.entry_date}
                onSelect={(date) => handleSymptomChange('entry_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            type="time"
            value={symptomData.entry_time}
            onChange={(e) => handleSymptomChange('entry_time', e.target.value)}
          />
        </div>
      </div>

      {/* Tipo de síntoma */}
      <div>
        <Label>Tipo de Síntoma *</Label>
        <Select value={symptomData.symptom_type} onValueChange={(value) => handleSymptomChange('symptom_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar síntoma" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_SYMPTOMS.map((symptom) => (
              <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>
            ))}
            <SelectItem value="otro">Otro (especificar en descripción)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Intensidad del dolor */}
      <div>
        <Label>Intensidad del Dolor/Molestia (0-10)</Label>
        <div className="px-3 py-2">
          <Slider
            value={[symptomData.pain_intensity]}
            onValueChange={(value) => handleSymptomChange('pain_intensity', value[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Sin dolor</span>
            <span className="font-medium">{symptomData.pain_intensity}</span>
            <span>Dolor severo</span>
          </div>
        </div>
      </div>

      {/* Duración y frecuencia */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Input
            id="duration"
            type="number"
            value={symptomData.duration_minutes}
            onChange={(e) => handleSymptomChange('duration_minutes', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Frecuencia</Label>
          <Select value={symptomData.frequency} onValueChange={(value) => handleSymptomChange('frequency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="constant">Constante</SelectItem>
              <SelectItem value="intermittent">Intermitente</SelectItem>
              <SelectItem value="occasional">Ocasional</SelectItem>
              <SelectItem value="first_time">Primera vez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor="description">Descripción del Síntoma</Label>
        <Textarea
          id="description"
          value={symptomData.description}
          onChange={(e) => handleSymptomChange('description', e.target.value)}
          placeholder="Describe cómo se siente el síntoma..."
        />
      </div>

      {/* Síntoma crítico */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="critical"
          checked={symptomData.is_critical}
          onCheckedChange={(checked) => handleSymptomChange('is_critical', checked)}
        />
        <Label htmlFor="critical" className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Marcar como síntoma crítico</span>
        </Label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Localización del dolor */}
      <div>
        <Label className="text-base font-semibold">Localización del Dolor</Label>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Parte del Cuerpo</Label>
              <Select value={currentLocation.body_part} onValueChange={(value) => setCurrentLocation(prev => ({ ...prev, body_part: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map((part) => (
                    <SelectItem key={part} value={part}>{part}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lado</Label>
              <Select value={currentLocation.side} onValueChange={(value) => setCurrentLocation(prev => ({ ...prev, side: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierdo</SelectItem>
                  <SelectItem value="right">Derecho</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="specific_area">Área Específica</Label>
            <Input
              id="specific_area"
              value={currentLocation.specific_area}
              onChange={(e) => setCurrentLocation(prev => ({ ...prev, specific_area: e.target.value }))}
              placeholder="ej. parte superior, lateral..."
            />
          </div>

          <div>
            <Label>Tipo de Dolor</Label>
            <Select value={currentLocation.pain_type} onValueChange={(value) => setCurrentLocation(prev => ({ ...prev, pain_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {PAIN_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Intensidad en esta Zona (1-10)</Label>
            <div className="px-3 py-2">
              <Slider
                value={[currentLocation.intensity]}
                onValueChange={(value) => setCurrentLocation(prev => ({ ...prev, intensity: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Leve</span>
                <span className="font-medium">{currentLocation.intensity}</span>
                <span>Severo</span>
              </div>
            </div>
          </div>

          <Button onClick={addPainLocation} disabled={!currentLocation.body_part} className="w-full">
            <MapPin className="w-4 h-4 mr-2" />
            Agregar Localización
          </Button>
        </div>

        {/* Localizaciones agregadas */}
        {painLocations.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Localizaciones Agregadas:</Label>
            <div className="mt-2 space-y-2">
              {painLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {location.body_part} {location.side && `(${location.side})`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {location.pain_type} - Intensidad: {location.intensity}/10
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removePainLocation(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Síntomas asociados */}
      <div>
        <Label>Síntomas Asociados</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.filter(s => s !== symptomData.symptom_type).map((symptom) => (
            <Button
              key={symptom}
              size="sm"
              variant={symptomData.associated_symptoms.includes(symptom) ? "default" : "outline"}
              onClick={() => handleArrayToggle('associated_symptoms', symptom)}
            >
              {symptom}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Factores agravantes */}
      <div>
        <Label>Factores que Empeoran el Síntoma</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AGGRAVATING_FACTORS.map((factor) => (
            <Button
              key={factor}
              size="sm"
              variant={symptomData.aggravating_factors.includes(factor) ? "default" : "outline"}
              onClick={() => handleArrayToggle('aggravating_factors', factor)}
            >
              {factor}
            </Button>
          ))}
        </div>
      </div>

      {/* Factores aliviantes */}
      <div>
        <Label>Factores que Alivian el Síntoma</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {RELIEVING_FACTORS.map((factor) => (
            <Button
              key={factor}
              size="sm"
              variant={symptomData.relieving_factors.includes(factor) ? "default" : "outline"}
              onClick={() => handleArrayToggle('relieving_factors', factor)}
            >
              {factor}
            </Button>
          ))}
        </div>
      </div>

      {/* Medicamentos tomados */}
      <div>
        <Label htmlFor="medications">Medicamentos Tomados</Label>
        <Input
          id="medications"
          value={symptomData.medication_taken.join(', ')}
          onChange={(e) => handleSymptomChange('medication_taken', e.target.value.split(', ').filter(m => m.trim()))}
          placeholder="Separar con comas"
        />
      </div>

      {/* Actividad previa */}
      <div>
        <Label htmlFor="activity">Actividad Antes del Síntoma</Label>
        <Input
          id="activity"
          value={symptomData.activity_before}
          onChange={(e) => handleSymptomChange('activity_before', e.target.value)}
          placeholder="¿Qué estabas haciendo antes?"
        />
      </div>

      {/* Nivel de estrés */}
      <div>
        <Label>Nivel de Estrés (1-10)</Label>
        <div className="px-3 py-2">
          <Slider
            value={[symptomData.stress_level]}
            onValueChange={(value) => handleSymptomChange('stress_level', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Relajado</span>
            <span className="font-medium">{symptomData.stress_level}</span>
            <span>Muy estresado</span>
          </div>
        </div>
      </div>

      {/* Calidad del sueño */}
      <div>
        <Label>Calidad del Sueño Anoche (1-10)</Label>
        <div className="px-3 py-2">
          <Slider
            value={[symptomData.sleep_quality]}
            onValueChange={(value) => handleSymptomChange('sleep_quality', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Muy mal</span>
            <span className="font-medium">{symptomData.sleep_quality}</span>
            <span>Excelente</span>
          </div>
        </div>
      </div>

      {/* Notas adicionales */}
      <div>
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          value={symptomData.notes}
          onChange={(e) => handleSymptomChange('notes', e.target.value)}
          placeholder="Cualquier información adicional relevante..."
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Registrar Síntoma</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Registro de Síntomas</span>
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step}
              </div>
              {step < 3 && (
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
            {currentStep === 1 && "Información Básica"}
            {currentStep === 2 && "Localización y Síntomas"}
            {currentStep === 3 && "Factores y Contexto"}
          </h3>
        </div>

        {/* Contenido del paso actual */}
        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                disabled={currentStep === 1 && !symptomData.symptom_type}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Síntoma'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}