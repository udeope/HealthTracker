'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Calendar as CalendarIcon,
  AlertTriangle,
  Clock,
  Bell,
  Shield,
  Pill
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MedicationService, NotificationService, type Medication, type Prescription } from '@/lib/medication-system';

interface MedicationFormProps {
  userId: string;
  onMedicationAdded?: () => void;
}

export function MedicationForm({ userId, onMedicationAdded }: MedicationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);

  // Datos del medicamento
  const [medicationData, setMedicationData] = useState({
    name: '',
    generic_name: '',
    active_ingredient: '',
    strength: '',
    form: '',
    manufacturer: '',
    description: '',
    storage_instructions: '',
    is_prescription: true
  });

  // Datos de la prescripción
  const [prescriptionData, setPrescriptionData] = useState({
    prescriber_name: '',
    prescriber_license: '',
    prescriber_contact: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: '',
    quantity_prescribed: '',
    refills_remaining: '0',
    prescribed_date: new Date(),
    start_date: new Date(),
    end_date: undefined as Date | undefined
  });

  // Datos del inventario
  const [inventoryData, setInventoryData] = useState({
    current_quantity: '',
    unit: 'pills',
    expiration_date: undefined as Date | undefined,
    batch_number: '',
    purchase_date: new Date(),
    cost_per_unit: '',
    low_stock_threshold: '7',
    auto_reorder: false
  });

  // Datos de recordatorios
  const [reminderData, setReminderData] = useState({
    reminder_times: ['08:00'],
    days_of_week: [1, 2, 3, 4, 5, 6, 7],
    notification_methods: ['push'],
    advance_notice_minutes: 15,
    sound_enabled: true,
    vibration_enabled: true
  });

  const handleMedicationChange = (field: string, value: any) => {
    setMedicationData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (field: string, value: any) => {
    setPrescriptionData(prev => ({ ...prev, [field]: value }));
  };

  const handleInventoryChange = (field: string, value: any) => {
    setInventoryData(prev => ({ ...prev, [field]: value }));
  };

  const handleReminderChange = (field: string, value: any) => {
    setReminderData(prev => ({ ...prev, [field]: value }));
  };

  const checkInteractions = async (medicationId: string) => {
    try {
      const interactionResults = await MedicationService.checkInteractions(userId, medicationId);
      setInteractions(interactionResults);
      
      if (interactionResults.length > 0) {
        const hasSerious = interactionResults.some(i => i.severity_level >= 4);
        if (hasSerious) {
          toast.error('Se detectaron interacciones serias con otros medicamentos');
        } else {
          toast.warning('Se detectaron posibles interacciones medicamentosas');
        }
      }
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validaciones básicas
      if (!medicationData.name || !medicationData.strength || !prescriptionData.dosage) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }

      // 1. Crear medicamento
      const medication = await MedicationService.createMedication({
        ...medicationData,
        user_id: userId
      });

      // 2. Verificar interacciones
      await checkInteractions(medication.id);

      // 3. Crear prescripción
      const prescription = await MedicationService.createPrescription({
        ...prescriptionData,
        user_id: userId,
        medication_id: medication.id,
        prescribed_date: format(prescriptionData.prescribed_date, 'yyyy-MM-dd'),
        start_date: format(prescriptionData.start_date, 'yyyy-MM-dd'),
        end_date: prescriptionData.end_date ? format(prescriptionData.end_date, 'yyyy-MM-dd') : undefined,
        quantity_prescribed: parseInt(prescriptionData.quantity_prescribed) || undefined,
        refills_remaining: parseInt(prescriptionData.refills_remaining) || 0
      });

      // 4. Crear entrada de inventario
      if (inventoryData.current_quantity) {
        await MedicationService.createInventoryItem({
          ...inventoryData,
          user_id: userId,
          medication_id: medication.id,
          current_quantity: parseInt(inventoryData.current_quantity),
          expiration_date: inventoryData.expiration_date ? format(inventoryData.expiration_date, 'yyyy-MM-dd') : undefined,
          purchase_date: format(inventoryData.purchase_date, 'yyyy-MM-dd'),
          cost_per_unit: parseFloat(inventoryData.cost_per_unit) || undefined,
          low_stock_threshold: parseInt(inventoryData.low_stock_threshold)
        });
      }

      // 5. Crear recordatorios
      const reminder = await MedicationService.createReminder({
        ...reminderData,
        user_id: userId,
        prescription_id: prescription.id,
        is_active: true,
        snooze_duration_minutes: 10,
        max_snooze_count: 3
      });

      // 6. Programar notificaciones
      await NotificationService.scheduleReminder(reminder);

      toast.success('Medicamento agregado exitosamente');
      setIsOpen(false);
      resetForm();
      onMedicationAdded?.();

    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Error al agregar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setMedicationData({
      name: '',
      generic_name: '',
      active_ingredient: '',
      strength: '',
      form: '',
      manufacturer: '',
      description: '',
      storage_instructions: '',
      is_prescription: true
    });
    setPrescriptionData({
      prescriber_name: '',
      prescriber_license: '',
      prescriber_contact: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      instructions: '',
      quantity_prescribed: '',
      refills_remaining: '0',
      prescribed_date: new Date(),
      start_date: new Date(),
      end_date: undefined
    });
    setInventoryData({
      current_quantity: '',
      unit: 'pills',
      expiration_date: undefined,
      batch_number: '',
      purchase_date: new Date(),
      cost_per_unit: '',
      low_stock_threshold: '7',
      auto_reorder: false
    });
    setReminderData({
      reminder_times: ['08:00'],
      days_of_week: [1, 2, 3, 4, 5, 6, 7],
      notification_methods: ['push'],
      advance_notice_minutes: 15,
      sound_enabled: true,
      vibration_enabled: true
    });
    setInteractions([]);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Medicamento *</Label>
          <Input
            id="name"
            value={medicationData.name}
            onChange={(e) => handleMedicationChange('name', e.target.value)}
            placeholder="ej. Lisinopril"
          />
        </div>
        <div>
          <Label htmlFor="generic_name">Nombre Genérico</Label>
          <Input
            id="generic_name"
            value={medicationData.generic_name}
            onChange={(e) => handleMedicationChange('generic_name', e.target.value)}
            placeholder="ej. Enalapril"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="strength">Concentración *</Label>
          <Input
            id="strength"
            value={medicationData.strength}
            onChange={(e) => handleMedicationChange('strength', e.target.value)}
            placeholder="ej. 10mg"
          />
        </div>
        <div>
          <Label htmlFor="form">Forma Farmacéutica</Label>
          <Select value={medicationData.form} onValueChange={(value) => handleMedicationChange('form', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar forma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tablet">Tableta</SelectItem>
              <SelectItem value="capsule">Cápsula</SelectItem>
              <SelectItem value="liquid">Líquido</SelectItem>
              <SelectItem value="injection">Inyección</SelectItem>
              <SelectItem value="cream">Crema</SelectItem>
              <SelectItem value="drops">Gotas</SelectItem>
              <SelectItem value="inhaler">Inhalador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="active_ingredient">Principio Activo</Label>
        <Input
          id="active_ingredient"
          value={medicationData.active_ingredient}
          onChange={(e) => handleMedicationChange('active_ingredient', e.target.value)}
          placeholder="ej. Lisinopril"
        />
      </div>

      <div>
        <Label htmlFor="manufacturer">Laboratorio</Label>
        <Input
          id="manufacturer"
          value={medicationData.manufacturer}
          onChange={(e) => handleMedicationChange('manufacturer', e.target.value)}
          placeholder="ej. Pfizer"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={medicationData.description}
          onChange={(e) => handleMedicationChange('description', e.target.value)}
          placeholder="Descripción del medicamento y su uso"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_prescription"
          checked={medicationData.is_prescription}
          onCheckedChange={(checked) => handleMedicationChange('is_prescription', checked)}
        />
        <Label htmlFor="is_prescription">Medicamento de prescripción</Label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prescriber_name">Médico Prescriptor *</Label>
          <Input
            id="prescriber_name"
            value={prescriptionData.prescriber_name}
            onChange={(e) => handlePrescriptionChange('prescriber_name', e.target.value)}
            placeholder="Dr. Juan Pérez"
          />
        </div>
        <div>
          <Label htmlFor="prescriber_contact">Contacto del Médico</Label>
          <Input
            id="prescriber_contact"
            value={prescriptionData.prescriber_contact}
            onChange={(e) => handlePrescriptionChange('prescriber_contact', e.target.value)}
            placeholder="teléfono o email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dosage">Dosis *</Label>
          <Input
            id="dosage"
            value={prescriptionData.dosage}
            onChange={(e) => handlePrescriptionChange('dosage', e.target.value)}
            placeholder="ej. 1 tableta"
          />
        </div>
        <div>
          <Label htmlFor="frequency">Frecuencia</Label>
          <Select value={prescriptionData.frequency} onValueChange={(value) => handlePrescriptionChange('frequency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once_daily">Una vez al día</SelectItem>
              <SelectItem value="twice_daily">Dos veces al día</SelectItem>
              <SelectItem value="three_times_daily">Tres veces al día</SelectItem>
              <SelectItem value="four_times_daily">Cuatro veces al día</SelectItem>
              <SelectItem value="every_8_hours">Cada 8 horas</SelectItem>
              <SelectItem value="every_12_hours">Cada 12 horas</SelectItem>
              <SelectItem value="as_needed">Según necesidad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="route">Vía de Administración</Label>
        <Select value={prescriptionData.route} onValueChange={(value) => handlePrescriptionChange('route', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oral">Oral</SelectItem>
            <SelectItem value="topical">Tópica</SelectItem>
            <SelectItem value="injection">Inyección</SelectItem>
            <SelectItem value="inhalation">Inhalación</SelectItem>
            <SelectItem value="sublingual">Sublingual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="prescribed_date">Fecha de Prescripción</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !prescriptionData.prescribed_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {prescriptionData.prescribed_date ? format(prescriptionData.prescribed_date, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={prescriptionData.prescribed_date}
                onSelect={(date) => handlePrescriptionChange('prescribed_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="start_date">Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !prescriptionData.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {prescriptionData.start_date ? format(prescriptionData.start_date, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={prescriptionData.start_date}
                onSelect={(date) => handlePrescriptionChange('start_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="end_date">Fecha de Fin (Opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !prescriptionData.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {prescriptionData.end_date ? format(prescriptionData.end_date, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={prescriptionData.end_date}
                onSelect={(date) => handlePrescriptionChange('end_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instrucciones Especiales</Label>
        <Textarea
          id="instructions"
          value={prescriptionData.instructions}
          onChange={(e) => handlePrescriptionChange('instructions', e.target.value)}
          placeholder="ej. Tomar con alimentos, evitar alcohol"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="current_quantity">Cantidad Actual</Label>
          <Input
            id="current_quantity"
            type="number"
            value={inventoryData.current_quantity}
            onChange={(e) => handleInventoryChange('current_quantity', e.target.value)}
            placeholder="30"
          />
        </div>
        <div>
          <Label htmlFor="unit">Unidad</Label>
          <Select value={inventoryData.unit} onValueChange={(value) => handleInventoryChange('unit', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pills">Pastillas</SelectItem>
              <SelectItem value="ml">Mililitros</SelectItem>
              <SelectItem value="mg">Miligramos</SelectItem>
              <SelectItem value="doses">Dosis</SelectItem>
              <SelectItem value="applications">Aplicaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="low_stock_threshold">Alerta de Stock Bajo</Label>
          <Input
            id="low_stock_threshold"
            type="number"
            value={inventoryData.low_stock_threshold}
            onChange={(e) => handleInventoryChange('low_stock_threshold', e.target.value)}
            placeholder="7"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiration_date">Fecha de Vencimiento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !inventoryData.expiration_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {inventoryData.expiration_date ? format(inventoryData.expiration_date, "dd/MM/yyyy") : "Seleccionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={inventoryData.expiration_date}
                onSelect={(date) => handleInventoryChange('expiration_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="batch_number">Número de Lote</Label>
          <Input
            id="batch_number"
            value={inventoryData.batch_number}
            onChange={(e) => handleInventoryChange('batch_number', e.target.value)}
            placeholder="LOT123456"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="auto_reorder"
          checked={inventoryData.auto_reorder}
          onCheckedChange={(checked) => handleInventoryChange('auto_reorder', checked)}
        />
        <Label htmlFor="auto_reorder">Reorden automático cuando esté bajo</Label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label>Horarios de Recordatorio</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {reminderData.reminder_times.map((time, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => {
                  const newTimes = [...reminderData.reminder_times];
                  newTimes[index] = e.target.value;
                  handleReminderChange('reminder_times', newTimes);
                }}
                className="w-32"
              />
              {reminderData.reminder_times.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newTimes = reminderData.reminder_times.filter((_, i) => i !== index);
                    handleReminderChange('reminder_times', newTimes);
                  }}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleReminderChange('reminder_times', [...reminderData.reminder_times, '12:00']);
            }}
          >
            + Agregar Horario
          </Button>
        </div>
      </div>

      <div>
        <Label>Días de la Semana</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
            <Button
              key={index}
              size="sm"
              variant={reminderData.days_of_week.includes(index + 1) ? "default" : "outline"}
              onClick={() => {
                const dayNum = index + 1;
                const newDays = reminderData.days_of_week.includes(dayNum)
                  ? reminderData.days_of_week.filter(d => d !== dayNum)
                  : [...reminderData.days_of_week, dayNum];
                handleReminderChange('days_of_week', newDays);
              }}
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Métodos de Notificación</Label>
        <div className="space-y-2 mt-2">
          {[
            { value: 'push', label: 'Notificaciones Push' },
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' }
          ].map((method) => (
            <div key={method.value} className="flex items-center space-x-2">
              <Checkbox
                id={method.value}
                checked={reminderData.notification_methods.includes(method.value)}
                onCheckedChange={(checked) => {
                  const newMethods = checked
                    ? [...reminderData.notification_methods, method.value]
                    : reminderData.notification_methods.filter(m => m !== method.value);
                  handleReminderChange('notification_methods', newMethods);
                }}
              />
              <Label htmlFor={method.value}>{method.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sound_enabled"
            checked={reminderData.sound_enabled}
            onCheckedChange={(checked) => handleReminderChange('sound_enabled', checked)}
          />
          <Label htmlFor="sound_enabled">Sonido</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vibration_enabled"
            checked={reminderData.vibration_enabled}
            onCheckedChange={(checked) => handleReminderChange('vibration_enabled', checked)}
          />
          <Label htmlFor="vibration_enabled">Vibración</Label>
        </div>
      </div>
    </div>
  );

  const renderInteractionWarnings = () => {
    if (interactions.length === 0) return null;

    return (
      <Card className="border-orange-200 bg-orange-50 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Interacciones Detectadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interactions.map((interaction, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-orange-800">
                    Interacción con {interaction.medication_name}
                  </p>
                  <Badge variant={interaction.severity_level >= 4 ? "destructive" : "outline"}>
                    {interaction.interaction_type}
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mb-2">{interaction.description}</p>
                {interaction.recommendations && (
                  <p className="text-sm text-orange-600">
                    <strong>Recomendación:</strong> {interaction.recommendations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Agregar Medicamento</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            <span>Agregar Nuevo Medicamento</span>
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
            {currentStep === 1 && "Información del Medicamento"}
            {currentStep === 2 && "Datos de Prescripción"}
            {currentStep === 3 && "Inventario"}
            {currentStep === 4 && "Recordatorios"}
          </h3>
        </div>

        {/* Advertencias de interacciones */}
        {renderInteractionWarnings()}

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
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={
                  (currentStep === 1 && (!medicationData.name || !medicationData.strength)) ||
                  (currentStep === 2 && (!prescriptionData.prescriber_name || !prescriptionData.dosage))
                }
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
                  'Guardar Medicamento'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Información Segura</span>
          </div>
          <p className="text-xs text-blue-600">
            Todos los datos están encriptados y cumplen con las normativas HIPAA/GDPR. 
            La información se sincroniza de forma segura entre tus dispositivos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}