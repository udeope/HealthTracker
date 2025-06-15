'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Calendar,
  DollarSign,
  Receipt,
  Shield,
  ArrowRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TelemedicineService, type Payment, type Consultation } from '@/lib/telemedicine-system';

interface PaymentSystemProps {
  patientId: string;
  consultationId?: string;
  isDoctor?: boolean;
}

export function PaymentSystem({ patientId, consultationId, isDoctor = false }: PaymentSystemProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const [paymentData, setPaymentData] = useState({
    payment_method: 'card',
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: '',
    billing_address: ''
  });

  useEffect(() => {
    // En una aplicación real, esto cargaría datos de la API
    loadMockData();
  }, [patientId, consultationId]);

  const loadMockData = async () => {
    try {
      setLoading(true);
      
      // Generar datos de ejemplo
      const mockConsultations = generateMockConsultations();
      const mockPayments = generateMockPayments(mockConsultations);
      
      setConsultations(mockConsultations);
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Error al cargar datos de pagos');
    } finally {
      setLoading(false);
    }
  };

  const generateMockConsultations = (): Consultation[] => {
    // Generar consultas de ejemplo
    return [
      {
        id: 'cons-1',
        patient_id: patientId,
        doctor_id: 'doc-1',
        appointment_date: '2024-06-15',
        appointment_time: '10:00',
        duration_minutes: 30,
        consultation_type: 'video',
        status: 'completed',
        reason_for_visit: 'Consulta de seguimiento',
        consultation_fee: 80,
        payment_status: 'paid',
        follow_up_required: false,
        documents_shared: [],
        created_at: '2024-06-10T12:00:00Z',
        updated_at: '2024-06-15T10:30:00Z',
        doctor: {
          id: 'doc-1',
          user_id: 'user-doc-1',
          first_name: 'Dr. María',
          last_name: 'González',
          email: 'maria.gonzalez@hospital.com',
          phone: '+34 600 123 456',
          specialty: 'Cardiología',
          sub_specialties: ['Cardiología Intervencionista'],
          medical_license: 'MD-12345',
          years_experience: 15,
          education: [],
          certifications: [],
          languages: ['Español', 'Inglés'],
          biography: 'Especialista en cardiología',
          consultation_fee: 80,
          currency: 'EUR',
          rating: 4.8,
          total_reviews: 156,
          total_consultations: 1240,
          is_verified: true,
          is_available: true,
          availability_schedule: {
            timezone: 'Europe/Madrid',
            weekly_schedule: {
              monday: { is_available: true, time_slots: [{ start_time: '09:00', end_time: '17:00' }] },
              tuesday: { is_available: true, time_slots: [{ start_time: '09:00', end_time: '17:00' }] },
              wednesday: { is_available: true, time_slots: [{ start_time: '09:00', end_time: '17:00' }] },
              thursday: { is_available: true, time_slots: [{ start_time: '09:00', end_time: '17:00' }] },
              friday: { is_available: true, time_slots: [{ start_time: '09:00', end_time: '15:00' }] },
              saturday: { is_available: false, time_slots: [] },
              sunday: { is_available: false, time_slots: [] }
            },
            exceptions: [],
            advance_booking_days: 30,
            consultation_duration_minutes: 30
          },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      },
      {
        id: 'cons-2',
        patient_id: patientId,
        doctor_id: 'doc-2',
        appointment_date: '2024-06-20',
        appointment_time: '15:30',
        duration_minutes: 45,
        consultation_type: 'video',
        status: 'scheduled',
        reason_for_visit: 'Dolor de cabeza recurrente',
        consultation_fee: 95,
        payment_status: 'pending',
        follow_up_required: false,
        documents_shared: [],
        created_at: '2024-06-12T09:00:00Z',
        updated_at: '2024-06-12T09:00:00Z'
      }
    ];
  };

  const generateMockPayments = (consultations: Consultation[]): Payment[] => {
    // Generar pagos basados en las consultas
    return consultations.map((consultation, index) => ({
      id: `pay-${index + 1}`,
      consultation_id: consultation.id,
      patient_id: consultation.patient_id,
      doctor_id: consultation.doctor_id,
      amount: consultation.consultation_fee,
      currency: 'EUR',
      payment_method: 'card',
      payment_provider: 'stripe',
      payment_intent_id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      transaction_id: index === 0 ? `txn_${Math.random().toString(36).substring(2, 15)}` : undefined,
      status: index === 0 ? 'completed' : 'pending',
      invoice_number: `INV-${new Date().getFullYear()}-${String(1000 + index).slice(1)}`,
      invoice_url: `https://example.com/invoice-${index + 1}`,
      receipt_url: index === 0 ? `https://example.com/receipt-${index + 1}` : undefined,
      created_at: consultation.created_at,
      processed_at: index === 0 ? consultation.updated_at : undefined
    }));
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      
      // En producción, esto procesaría el pago a través de Stripe u otro proveedor
      const success = await TelemedicineService.processPayment(paymentId);
      
      if (success) {
        toast.success('Pago procesado exitosamente');
        loadMockData(); // Recargar datos
      } else {
        toast.error('Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const viewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Completado</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Fallido</span>
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="outline" className="flex items-center space-x-1 border-blue-500 text-blue-600">
            <RefreshCw className="w-3 h-3" />
            <span>Reembolsado</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Pagos</h2>
          <p className="text-muted-foreground">
            Gestiona tus pagos y facturas de consultas médicas
          </p>
        </div>
        {!isDoctor && (
          <Button
            onClick={() => setIsPaymentFormOpen(true)}
            className="flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Añadir Método de Pago</span>
          </Button>
        )}
      </div>

      {/* Resumen de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Pagos Completados</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {payments.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-xs text-muted-foreground">
              Total: €{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Pagos Pendientes</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {payments.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">
              Total: €{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Próxima Consulta</span>
            </div>
          </CardHeader>
          <CardContent>
            {consultations.find(c => c.status === 'scheduled') ? (
              <>
                <p className="text-lg font-bold">
                  {format(parseISO(consultations.find(c => c.status === 'scheduled')!.appointment_date), 'dd/MM/yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {consultations.find(c => c.status === 'scheduled')!.appointment_time}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No hay consultas programadas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Consulta</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const consultation = consultations.find(c => c.id === payment.consultation_id);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(parseISO(payment.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {consultation?.doctor?.first_name} {consultation?.doctor?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {consultation?.doctor?.specialty}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      €{payment.amount}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{payment.payment_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {payment.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewReceipt(payment)}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === 'pending' && !isDoctor && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => processPayment(payment.id)}
                          >
                            Pagar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Información de seguridad */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Pagos Seguros</span>
          </div>
          <p className="text-sm text-green-700">
            Todos los pagos son procesados de forma segura a través de proveedores certificados PCI DSS.
            Tus datos de pago nunca se almacenan en nuestros servidores.
          </p>
        </CardContent>
      </Card>

      {/* Modal de recibo */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Recibo de Pago</span>
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
                <h3 className="text-xl font-bold">Pago Completado</h3>
                <p className="text-muted-foreground">
                  Gracias por tu pago
                </p>
              </div>

              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número de factura:</span>
                  <span className="font-medium">{selectedPayment.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span>
                    {selectedPayment.processed_at 
                      ? format(parseISO(selectedPayment.processed_at), 'dd/MM/yyyy HH:mm')
                      : 'Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de pago:</span>
                  <span className="capitalize">{selectedPayment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de transacción:</span>
                  <span className="font-mono text-sm">
                    {selectedPayment.transaction_id || 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-medium">
                  <span>Consulta médica</span>
                  <span>€{selectedPayment.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>€0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>€{selectedPayment.amount}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(selectedPayment.invoice_url, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Factura
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedPayment.receipt_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de método de pago */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Añadir Método de Pago</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                <div>
                  <Label htmlFor="billing_address">Dirección de facturación</Label>
                  <Input
                    id="billing_address"
                    value={paymentData.billing_address}
                    onChange={(e) => handlePaymentDataChange('billing_address', e.target.value)}
                    placeholder="Dirección completa"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-800">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Pago seguro</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Tu información de pago está protegida con encriptación SSL de 256 bits
              </p>
            </div>

            <Button
              onClick={() => {
                toast.success('Método de pago añadido correctamente');
                setIsPaymentFormOpen(false);
              }}
              disabled={paymentData.payment_method === 'card' && (!paymentData.card_number || !paymentData.cardholder_name)}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Guardar Método de Pago
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}