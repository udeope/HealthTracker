import { supabase } from './supabase';

// Tipos para el sistema de medicamentos
export interface Medication {
  id: string;
  user_id: string;
  name: string;
  generic_name?: string;
  active_ingredient?: string;
  strength: string;
  form: string;
  manufacturer?: string;
  ndc_number?: string;
  description?: string;
  storage_instructions?: string;
  is_prescription: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  medication_id: string;
  prescriber_name: string;
  prescriber_license?: string;
  prescriber_contact?: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions?: string;
  quantity_prescribed?: number;
  refills_remaining: number;
  prescribed_date: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  medication?: Medication;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  prescription_id: string;
  scheduled_time: string;
  taken_time?: string;
  dosage_taken?: string;
  is_taken: boolean;
  is_skipped: boolean;
  skip_reason?: string;
  notes?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  prescription?: Prescription;
}

export interface MedicationInteraction {
  id: string;
  medication_a_id: string;
  medication_b_id: string;
  interaction_type: 'major' | 'moderate' | 'minor';
  severity_level: number;
  description: string;
  clinical_effects?: string;
  management_recommendations?: string;
  source?: string;
  created_at: string;
}

export interface MedicationInventory {
  id: string;
  user_id: string;
  medication_id: string;
  current_quantity: number;
  unit: string;
  expiration_date?: string;
  batch_number?: string;
  purchase_date?: string;
  cost_per_unit?: number;
  low_stock_threshold: number;
  auto_reorder: boolean;
  pharmacy_info?: any;
  created_at: string;
  updated_at: string;
  medication?: Medication;
}

export interface MedicationReminder {
  id: string;
  user_id: string;
  prescription_id: string;
  reminder_times: string[];
  days_of_week: number[];
  notification_methods: string[];
  advance_notice_minutes: number;
  is_active: boolean;
  snooze_duration_minutes: number;
  max_snooze_count: number;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  created_at: string;
  updated_at: string;
  prescription?: Prescription;
}

export interface SideEffect {
  id: string;
  user_id: string;
  medication_id: string;
  effect_name: string;
  severity: number;
  start_date: string;
  end_date?: string;
  description?: string;
  action_taken?: string;
  reported_to_doctor: boolean;
  is_serious: boolean;
  created_at: string;
  updated_at: string;
  medication?: Medication;
}

export interface AdherenceReport {
  id: string;
  user_id: string;
  report_period_start: string;
  report_period_end: string;
  overall_adherence_percentage: number;
  total_scheduled_doses: number;
  total_taken_doses: number;
  total_missed_doses: number;
  medications_data: any;
  generated_at: string;
}

// Funciones para gestión de medicamentos
export class MedicationService {
  // Medicamentos
  static async getMedications(userId: string): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMedication(id: string): Promise<void> {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Prescripciones
  static async getPrescriptions(userId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getActivePrescriptions(userId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createPrescription(prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(prescription)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePrescription(id: string, updates: Partial<Prescription>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Registro de tomas
  static async getMedicationLogs(userId: string, startDate?: string, endDate?: string): Promise<MedicationLog[]> {
    let query = supabase
      .from('medication_logs')
      .select(`
        *,
        prescription:prescriptions(
          *,
          medication:medications(*)
        )
      `)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('scheduled_time', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_time', endDate);
    }

    const { data, error } = await query.order('scheduled_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async logMedicationTaken(logId: string, takenTime: string, dosageTaken?: string, notes?: string): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .update({
        is_taken: true,
        taken_time: takenTime,
        dosage_taken: dosageTaken,
        notes: notes
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async logMedicationSkipped(logId: string, skipReason?: string): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .update({
        is_skipped: true,
        skip_reason: skipReason
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createMedicationLog(log: Omit<MedicationLog, 'id' | 'created_at' | 'updated_at'>): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Inventario
  static async getInventory(userId: string): Promise<MedicationInventory[]> {
    const { data, error } = await supabase
      .from('medication_inventory')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', userId)
      .order('current_quantity');

    if (error) throw error;
    return data || [];
  }

  static async getLowStockItems(userId: string): Promise<MedicationInventory[]> {
    const { data, error } = await supabase
      .from('medication_inventory')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', userId)
      .filter('current_quantity', 'lte', 'low_stock_threshold')
      .order('current_quantity');

    if (error) throw error;
    return data || [];
  }

  static async updateInventory(id: string, updates: Partial<MedicationInventory>): Promise<MedicationInventory> {
    const { data, error } = await supabase
      .from('medication_inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createInventoryItem(item: Omit<MedicationInventory, 'id' | 'created_at' | 'updated_at'>): Promise<MedicationInventory> {
    const { data, error } = await supabase
      .from('medication_inventory')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Recordatorios
  static async getReminders(userId: string): Promise<MedicationReminder[]> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .select(`
        *,
        prescription:prescriptions(
          *,
          medication:medications(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  static async createReminder(reminder: Omit<MedicationReminder, 'id' | 'created_at' | 'updated_at'>): Promise<MedicationReminder> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateReminder(id: string, updates: Partial<MedicationReminder>): Promise<MedicationReminder> {
    const { data, error } = await supabase
      .from('medication_reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Efectos secundarios
  static async getSideEffects(userId: string): Promise<SideEffect[]> {
    const { data, error } = await supabase
      .from('side_effects_log')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createSideEffect(sideEffect: Omit<SideEffect, 'id' | 'created_at' | 'updated_at'>): Promise<SideEffect> {
    const { data, error } = await supabase
      .from('side_effects_log')
      .insert(sideEffect)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Interacciones
  static async checkInteractions(userId: string, medicationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('check_medication_interactions', {
        p_user_id: userId,
        p_new_medication_id: medicationId
      });

    if (error) throw error;
    return data || [];
  }

  // Adherencia
  static async calculateAdherence(userId: string, startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_adherence_percentage', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;
    return data || 0;
  }

  static async getAdherenceReports(userId: string): Promise<AdherenceReport[]> {
    const { data, error } = await supabase
      .from('adherence_reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async generateAdherenceReport(userId: string, startDate: string, endDate: string): Promise<AdherenceReport> {
    // Calcular estadísticas de adherencia
    const adherencePercentage = await this.calculateAdherence(userId, startDate, endDate);
    
    const logs = await this.getMedicationLogs(userId, startDate, endDate);
    const totalScheduled = logs.length;
    const totalTaken = logs.filter(log => log.is_taken).length;
    const totalMissed = logs.filter(log => !log.is_taken && !log.is_skipped).length;

    // Agrupar por medicamento
    const medicationsData = logs.reduce((acc, log) => {
      const medId = log.prescription?.medication_id;
      if (!medId) return acc;

      if (!acc[medId]) {
        acc[medId] = {
          medication_name: log.prescription?.medication?.name,
          scheduled: 0,
          taken: 0,
          missed: 0,
          adherence_percentage: 0
        };
      }

      acc[medId].scheduled++;
      if (log.is_taken) acc[medId].taken++;
      if (!log.is_taken && !log.is_skipped) acc[medId].missed++;
      
      acc[medId].adherence_percentage = (acc[medId].taken / acc[medId].scheduled) * 100;

      return acc;
    }, {} as any);

    const reportData = {
      user_id: userId,
      report_period_start: startDate,
      report_period_end: endDate,
      overall_adherence_percentage: adherencePercentage,
      total_scheduled_doses: totalScheduled,
      total_taken_doses: totalTaken,
      total_missed_doses: totalMissed,
      medications_data: medicationsData
    };

    const { data, error } = await supabase
      .from('adherence_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Utilidades para notificaciones
export class NotificationService {
  static async scheduleReminder(reminder: MedicationReminder): Promise<void> {
    // En una implementación real, esto se integraría con un servicio de notificaciones
    // como Firebase Cloud Messaging, OneSignal, o un servicio de email/SMS
    console.log('Scheduling reminder:', reminder);
  }

  static async sendLowStockAlert(inventory: MedicationInventory): Promise<void> {
    console.log('Sending low stock alert:', inventory);
  }

  static async sendInteractionAlert(interactions: any[]): Promise<void> {
    console.log('Sending interaction alert:', interactions);
  }

  static async sendAdherenceReport(report: AdherenceReport): Promise<void> {
    console.log('Sending adherence report:', report);
  }
}

// Utilidades para exportación de datos
export class ExportService {
  static async exportMedicationData(userId: string, format: 'pdf' | 'csv'): Promise<Blob> {
    const medications = await MedicationService.getMedications(userId);
    const prescriptions = await MedicationService.getPrescriptions(userId);
    const logs = await MedicationService.getMedicationLogs(userId);
    const sideEffects = await MedicationService.getSideEffects(userId);

    if (format === 'csv') {
      return this.generateCSV({
        medications,
        prescriptions,
        logs,
        sideEffects
      });
    } else {
      return this.generatePDF({
        medications,
        prescriptions,
        logs,
        sideEffects
      });
    }
  }

  private static generateCSV(data: any): Blob {
    // Implementación simplificada de generación CSV
    const csvContent = JSON.stringify(data);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static generatePDF(data: any): Blob {
    // Implementación simplificada de generación PDF
    const pdfContent = JSON.stringify(data);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
}