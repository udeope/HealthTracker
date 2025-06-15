'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  Clock,
  Pill,
  CheckCircle,
  AlertTriangle,
  SkipForward,
  Bell
} from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { MedicationService, type MedicationLog, type Prescription } from '@/lib/medication-system';
import { toast } from 'sonner';

interface MedicationCalendarProps {
  userId: string;
}

export function MedicationCalendar({ userId }: MedicationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<MedicationLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadMedicationLogs();
  }, [userId, selectedDate]);

  const loadMedicationLogs = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfDay(selectedDate), 'yyyy-MM-dd HH:mm:ss');
      const endDate = format(endOfDay(selectedDate), 'yyyy-MM-dd HH:mm:ss');
      
      const logs = await MedicationService.getMedicationLogs(userId, startDate, endDate);
      setMedicationLogs(logs);
    } catch (error) {
      console.error('Error loading medication logs:', error);
      toast.error('Error al cargar los medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (log: MedicationLog) => {
    try {
      const now = new Date().toISOString();
      await MedicationService.logMedicationTaken(log.id, now, log.prescription?.dosage, notes);
      toast.success('Medicamento marcado como tomado');
      loadMedicationLogs();
      setIsDialogOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      toast.error('Error al marcar el medicamento');
    }
  };

  const handleMarkAsSkipped = async (log: MedicationLog, reason: string) => {
    try {
      await MedicationService.logMedicationSkipped(log.id, reason);
      toast.success('Medicamento marcado como omitido');
      loadMedicationLogs();
      setIsDialogOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Error marking medication as skipped:', error);
      toast.error('Error al marcar el medicamento');
    }
  };

  const openLogDialog = (log: MedicationLog) => {
    setSelectedLog(log);
    setNotes('');
    setIsDialogOpen(true);
  };

  const getStatusIcon = (log: MedicationLog) => {
    if (log.is_taken) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (log.is_skipped) {
      return <SkipForward className="w-4 h-4 text-red-600" />;
    } else {
      const scheduledTime = new Date(log.scheduled_time);
      const now = new Date();
      if (now > scheduledTime) {
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      }
      return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (log: MedicationLog) => {
    if (log.is_taken) {
      return <Badge variant="secondary">Tomado</Badge>;
    } else if (log.is_skipped) {
      return <Badge variant="destructive">Omitido</Badge>;
    } else {
      const scheduledTime = new Date(log.scheduled_time);
      const now = new Date();
      if (now > scheduledTime) {
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Atrasado</Badge>;
      }
      return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const getTimeColor = (log: MedicationLog) => {
    if (log.is_taken) return 'text-green-600';
    if (log.is_skipped) return 'text-red-600';
    
    const scheduledTime = new Date(log.scheduled_time);
    const now = new Date();
    if (now > scheduledTime) return 'text-orange-600';
    return 'text-blue-600';
  };

  // Agrupar medicamentos por hora
  const groupedLogs = medicationLogs.reduce((groups, log) => {
    const time = format(new Date(log.scheduled_time), 'HH:mm');
    if (!groups[time]) {
      groups[time] = [];
    }
    groups[time].push(log);
    return groups;
  }, {} as Record<string, MedicationLog[]>);

  const sortedTimes = Object.keys(groupedLogs).sort();

  // Calcular estadísticas del día
  const totalMedications = medicationLogs.length;
  const takenMedications = medicationLogs.filter(log => log.is_taken).length;
  const skippedMedications = medicationLogs.filter(log => log.is_skipped).length;
  const pendingMedications = totalMedications - takenMedications - skippedMedications;
  const adherencePercentage = totalMedications > 0 ? (takenMedications / totalMedications) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{totalMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Tomados</p>
                <p className="text-2xl font-bold">{takenMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold">{pendingMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Adherencia</p>
                <p className="text-2xl font-bold">{Math.round(adherencePercentage)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Calendario</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={es}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Horario del día seleccionado */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : sortedTimes.length > 0 ? (
                <div className="space-y-4">
                  {sortedTimes.map((time) => (
                    <div key={time} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${getTimeColor(groupedLogs[time][0])}`}>
                          {time}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {groupedLogs[time].length} medicamento(s)
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {groupedLogs[time].map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(log)}
                              <div>
                                <p className="font-medium">
                                  {log.prescription?.medication?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {log.prescription?.dosage}
                                </p>
                                {log.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {log.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(log)}
                              {!log.is_taken && !log.is_skipped && (
                                <Button
                                  size="sm"
                                  onClick={() => openLogDialog(log)}
                                >
                                  Registrar
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay medicamentos programados para este día
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para registrar medicamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Medicamento</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold">{selectedLog.prescription?.medication?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Dosis: {selectedLog.prescription?.dosage}
                </p>
                <p className="text-sm text-muted-foreground">
                  Hora programada: {format(new Date(selectedLog.scheduled_time), 'HH:mm')}
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar notas sobre la toma del medicamento..."
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleMarkAsTaken(selectedLog)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Tomado
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMarkAsSkipped(selectedLog, notes || 'Sin razón especificada')}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Marcar como Omitido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}