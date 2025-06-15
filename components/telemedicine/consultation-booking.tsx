'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MessageCircle,
  Phone,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TelemedicineService, type Doctor, type AvailableSlot, type Consultation } from '@/lib/telemedicine-system';

interface ConsultationBookingProps {
  doctor: Doctor;
  onBack: () => void;
  onBookingComplete: (consultation: Consultation) => void;
}

export function ConsultationBooking({ doctor, onBack, onBookingComplete }: ConsultationBookingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'chat' | 'phone'>('video');
  const [loading, setLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const [bookingData, setBookingData] = useState({
    reason_for_visit: '',
    symptoms: '',
    medical_history_summary: '',
    current_medications: '',
    allergies: '',
    preferred_language: 'Español',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_provider: '',
    insurance_policy: ''
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: 'card',
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: '',
    billing_address: ''
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await TelemedicineService.getDoctorAvailability(doctor.id, dateStr);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingDataChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookConsultation = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    try {
      setLoading(true);

      // Crear consulta
      const consultation = await TelemedicineService.createConsultation({
        patient_id: 'current-user-id', // En producción, obtener del contexto
        doctor_id: doctor.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedSlot.start_time,
        duration_minutes: doctor.availability_schedule.consultation_duration_minutes,
        consultation_type: consultationType,
        status: 'scheduled',
        reason_for_visit: bookingData.reason_for_visit,
        symptoms: bookingData.symptoms ? [bookingData.symptoms] : undefined,
        medical_history_summary: bookingData.medical_history_summary || undefined,
        consultation_fee: doctor.consultation_fee,
        payment_status: 'pending',
        follow_up_required: false,
        documents_shared: []
      });

      // Procesar pago
      const payment = await TelemedicineService.createPayment({
        consultation_id: consultation.id,
        patient_id: 'current-user-id',
        doctor_id: doctor.id,
        amount: doctor.consultation_fee,
        currency: doctor.currency,
        payment_method: paymentData.payment_method as any,
        payment_provider: 'stripe',
        status: 'pending'
      });

      const paymentSuccess = await TelemedicineService.processPayment(payment.id);

      if (paymentSuccess) {
        await TelemedicineService.updateConsultationStatus(consultation.id, 'scheduled');
        toast.success('Consulta agendada exitosamente');
        setIsConfirmationOpen(true);
        onBookingComplete(consultation);
      } else {
        toast.error('Error al procesar el pago');
      }

    } catch (error) {
      console.error('Error booking consultation:', error);
      toast.error('Error al agendar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-8 h-0.5 mx-2 ${
              currentStep > step ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Seleccionar Fecha y Hora</h3>
        <p className="text-muted-foreground">Elige cuándo quieres tener tu consulta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Label className="text-base font-medium mb-4 block">Fecha de la consulta</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date > addDays(new Date(), doctor.availability_schedule.advance_booking_days)}
            locale={es}
            className="rounded-md border"
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-4 block">Horarios disponibles</Label>
          {selectedDate ? (
            loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    onClick={() => setSelectedSlot(slot)}
                    className="h-12"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {slot.start_time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay horarios disponibles para esta fecha
              </p>
            )
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Selecciona una fecha para ver horarios disponibles
            </p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-4 block">Tipo de consulta</Label>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant={consultationType === 'video' ? "default" : "outline"}
            onClick={() => setConsultationType('video')}
            className="h-16 flex-col"
          >
            <Video className="w-6 h-6 mb-2" />
            <span>Videollamada</span>
          </Button>
          <Button
            variant={consultationType === 'chat' ? "default" : "outline"}
            onClick={() => setConsultationType('chat')}
            className="h-16 flex-col"
          >
            <MessageCircle className="w-6 h-6 mb-2" />
            <span>Chat</span>
          </Button>
          <Button
            variant={consultationType === 'phone' ? "default" : "outline"}
            onClick={() => setConsultationType('phone')}
            className="h-16 flex-col"
          >
            <Phone className="w-6 h-6 mb-2" />
            <span>Llamada</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Información Médica</h3>
        <p className="text-muted-foreground">Ayúdanos a preparar mejor tu consulta</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reason">Motivo de la consulta *</Label>
          <Textarea
            id="reason"
            value={bookingData.reason_for_visit}
            onChange={(e) => handleBookingDataChange('reason_for_visit', e.target.value)}
            placeholder="Describe brevemente el motivo de tu consulta"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="symptoms">Síntomas actuales</Label>
          <Textarea
            id="symptoms"
            value={bookingData.symptoms}
            onChange={(e) => handleBookingDataChange('symptoms', e.target.value)}
            placeholder="Describe los síntomas que estás experimentando"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="medical_history">Historial médico relevante</Label>
          <Textarea
            id="medical_history"
            value={bookingData.medical_history_summary}
            onChange={(e) => handleBookingDataChange('medical_history_summary', e.target.value)}
            placeholder="Menciona condiciones médicas previas relevantes"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medications">Medicamentos actuales</Label>
            <Textarea
              id="medications"
              value={bookingData.current_medications}
              onChange={(e) => handleBookingDataChange('current_medications', e.target.value)}
              placeholder="Lista los medicamentos que tomas actualmente"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              value={bookingData.allergies}
              onChange={(e) => handleBookingDataChange('allergies', e.target.value)}
              placeholder="Menciona cualquier alergia conocida"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="language">Idioma preferido</Label>
          <Select value={bookingData.preferred_language} onValueChange={(value) => handleBookingDataChange('preferred_language', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {doctor.languages.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Información de Contacto</h3>
        <p className="text-muted-foreground">Para emergencias y seguimiento</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_name">Contacto de emergencia</Label>
            <Input
              id="emergency_name"
              value={bookingData.emergency_contact_name}
              onChange={(e) => handleBookingDataChange('emergency_contact_name', e.target.value)}
              placeholder="Nombre completo"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="emergency_phone">Teléfono de emergencia</Label>
            <Input
              id="emergency_phone"
              value={bookingData.emergency_contact_phone}
              onChange={(e) => handleBookingDataChange('emergency_contact_phone', e.target.value)}
              placeholder="+34 600 123 456"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance_provider">Seguro médico (opcional)</Label>
            <Input
              id="insurance_provider"
              value={bookingData.insurance_provider}
              onChange={(e) => handleBookingDataChange('insurance_provider', e.target.value)}
              placeholder="Nombre del seguro"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="insurance_policy">Número de póliza</Label>
            <Input
              id="insurance_policy"
              value={bookingData.insurance_policy}
              onChange={(e) => handleBookingDataChange('insurance_policy', e.target.value)}
              placeholder="Número de póliza"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Pago y Confirmación</h3>
        <p className="text-muted-foreground">Revisa los detalles y completa el pago</p>
      </div>

      {/* Resumen de la consulta */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Resumen de la Consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={doctor.profile_image} />
              <AvatarFallback>{doctor.first_name[0]}{doctor.last_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{doctor.first_name} {doctor.last_name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fecha:</p>
              <p className="font-medium">
                {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Hora:</p>
              <p className="font-medium">{selectedSlot?.start_time}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo:</p>
              <p className="font-medium capitalize">{consultationType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duración:</p>
              <p className="font-medium">{doctor.availability_schedule.consultation_duration_minutes} min</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">€{doctor.consultation_fee}</span>
          </div>
        </CardContent>
      </Card>

      {/* Información de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Información de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Método de pago</Label>
            <Select value={paymentData.payment_method} onValueChange={(value) => handlePaymentDataChange('payment_method', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Tarjeta de crédito/débito</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentData.payment_method === 'card' && (
            <>
              <div>
                <Label htmlFor="cardholder_name">Nombre del titular</Label>
                <Input
                  id="cardholder_name"
                  value={paymentData.cardholder_name}
                  onChange={(e) => handlePaymentDataChange('cardholder_name', e.target.value)}
                  placeholder="Nombre completo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="card_number">Número de tarjeta</Label>
                <Input
                  id="card_number"
                  value={paymentData.card_number}
                  onChange={(e) => handlePaymentDataChange('card_number', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_date">Fecha de vencimiento</Label>
                  <Input
                    id="expiry_date"
                    value={paymentData.expiry_date}
                    onChange={(e) => handlePaymentDataChange('expiry_date', e.target.value)}
                    placeholder="MM/AA"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => handlePaymentDataChange('cvv', e.target.value)}
                    placeholder="123"
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información de seguridad */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Pago seguro</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Tu información de pago está protegida con encriptación SSL de 256 bits
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Agendar Consulta</h2>
          <p className="text-muted-foreground">
            con {doctor.first_name} {doctor.last_name}
          </p>
        </div>
      </div>

      {/* Indicador de pasos */}
      {renderStepIndicator()}

      {/* Contenido del paso actual */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        
        <div className="flex space-x-4">
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={
                (currentStep === 1 && (!selectedDate || !selectedSlot)) ||
                (currentStep === 2 && !bookingData.reason_for_visit)
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleBookConsultation}
              disabled={loading || !paymentData.cardholder_name}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar y Pagar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <DialogTitle className="text-2xl">¡Consulta Agendada!</DialogTitle>
            </div>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Tu consulta ha sido agendada exitosamente. Recibirás un email de confirmación con todos los detalles.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-medium">
                {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedSlot?.start_time} - {consultationType}
              </p>
            </div>
            <Button onClick={() => setIsConfirmationOpen(false)} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}