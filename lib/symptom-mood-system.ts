import { supabase } from './supabase';

// Tipos para el sistema de síntomas y estado de ánimo
export interface SymptomEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_time: string;
  symptom_type: string;
  pain_intensity?: number;
  duration_minutes?: number;
  frequency?: string;
  description?: string;
  associated_symptoms?: string[];
  aggravating_factors?: string[];
  relieving_factors?: string[];
  medication_taken?: string[];
  activity_before?: string;
  weather_conditions?: any;
  stress_level?: number;
  sleep_quality?: number;
  notes?: string;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
  pain_locations?: PainLocation[];
}

export interface PainLocation {
  id: string;
  symptom_entry_id: string;
  body_part: string;
  specific_area?: string;
  side?: string;
  coordinates?: any;
  intensity: number;
  pain_type?: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_time: string;
  overall_mood: number;
  specific_emotions?: string[];
  energy_level?: number;
  stress_level?: number;
  anxiety_level?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  social_interaction?: string;
  physical_activity?: string;
  weather_mood_impact?: string;
  menstrual_cycle_day?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SymptomTrigger {
  id: string;
  user_id: string;
  trigger_name: string;
  trigger_category: string;
  description?: string;
  confidence_score: number;
  occurrences: number;
  last_occurrence?: string;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SymptomPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_name: string;
  description?: string;
  frequency?: string;
  confidence_level: number;
  supporting_data?: any;
  recommendations?: string[];
  is_active: boolean;
  detected_at: string;
  last_updated: string;
}

export interface MoodCorrelation {
  id: string;
  user_id: string;
  correlation_type: string;
  factor_a: string;
  factor_b: string;
  correlation_strength: number;
  statistical_significance: number;
  sample_size: number;
  time_period_days: number;
  analysis_date: string;
  is_significant: boolean;
}

export interface SymptomAlert {
  id: string;
  user_id: string;
  alert_name: string;
  alert_type: string;
  conditions: any;
  notification_methods: string[];
  is_active: boolean;
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface SymptomReport {
  id: string;
  user_id: string;
  report_type: string;
  report_period_start: string;
  report_period_end: string;
  report_data: any;
  summary_insights: string[];
  recommendations: string[];
  generated_at: string;
  format: string;
  file_path?: string;
}

export interface UserSymptomPreferences {
  id: string;
  user_id: string;
  default_symptoms: string[];
  pain_scale_type: string;
  reminder_times: string[];
  auto_analysis_enabled: boolean;
  data_sharing_consent: boolean;
  export_preferences?: any;
  created_at: string;
  updated_at: string;
}

// Servicio principal para gestión de síntomas y estado de ánimo
export class SymptomMoodService {
  // Gestión de entradas de síntomas
  static async getSymptomEntries(userId: string, startDate?: string, endDate?: string): Promise<SymptomEntry[]> {
    let query = supabase
      .from('symptom_entries')
      .select(`
        *,
        pain_locations(*)
      `)
      .eq('user_id', userId);

    if (startDate) query = query.gte('entry_date', startDate);
    if (endDate) query = query.lte('entry_date', endDate);

    const { data, error } = await query.order('entry_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createSymptomEntry(entry: Omit<SymptomEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomEntry> {
    const { data, error } = await supabase
      .from('symptom_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSymptomEntry(id: string, updates: Partial<SymptomEntry>): Promise<SymptomEntry> {
    const { data, error } = await supabase
      .from('symptom_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSymptomEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('symptom_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Gestión de localizaciones del dolor
  static async addPainLocation(location: Omit<PainLocation, 'id' | 'created_at'>): Promise<PainLocation> {
    const { data, error } = await supabase
      .from('pain_locations')
      .insert(location)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getPainLocations(symptomEntryId: string): Promise<PainLocation[]> {
    const { data, error } = await supabase
      .from('pain_locations')
      .select('*')
      .eq('symptom_entry_id', symptomEntryId);

    if (error) throw error;
    return data || [];
  }

  // Gestión de entradas de estado de ánimo
  static async getMoodEntries(userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    let query = supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId);

    if (startDate) query = query.gte('entry_date', startDate);
    if (endDate) query = query.lte('entry_date', endDate);

    const { data, error } = await query.order('entry_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'created_at' | 'updated_at'>): Promise<MoodEntry> {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry> {
    const { data, error } = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Gestión de triggers/desencadenantes
  static async getSymptomTriggers(userId: string): Promise<SymptomTrigger[]> {
    const { data, error } = await supabase
      .from('symptom_triggers')
      .select('*')
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createSymptomTrigger(trigger: Omit<SymptomTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomTrigger> {
    const { data, error } = await supabase
      .from('symptom_triggers')
      .insert(trigger)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTriggerConfidence(triggerId: string, confidence: number): Promise<void> {
    const { error } = await supabase
      .from('symptom_triggers')
      .update({ confidence_score: confidence })
      .eq('id', triggerId);

    if (error) throw error;
  }

  // Gestión de patrones
  static async getSymptomPatterns(userId: string): Promise<SymptomPattern[]> {
    const { data, error } = await supabase
      .from('symptom_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('confidence_level', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async detectPatterns(userId: string): Promise<void> {
    const { error } = await supabase.rpc('detect_symptom_patterns', {
      p_user_id: userId
    });

    if (error) throw error;
  }

  // Análisis de correlaciones
  static async getMoodCorrelations(userId: string): Promise<MoodCorrelation[]> {
    const { data, error } = await supabase
      .from('mood_correlations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_significant', true)
      .order('correlation_strength', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async calculateCorrelations(userId: string, daysBack: number = 30): Promise<any[]> {
    const { data, error } = await supabase.rpc('calculate_mood_symptom_correlation', {
      p_user_id: userId,
      p_days_back: daysBack
    });

    if (error) throw error;
    return data || [];
  }

  // Gestión de alertas
  static async getSymptomAlerts(userId: string): Promise<SymptomAlert[]> {
    const { data, error } = await supabase
      .from('symptom_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  static async createSymptomAlert(alert: Omit<SymptomAlert, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomAlert> {
    const { data, error } = await supabase
      .from('symptom_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async checkAlerts(userId: string, symptomEntry: SymptomEntry): Promise<SymptomAlert[]> {
    const alerts = await this.getSymptomAlerts(userId);
    const triggeredAlerts: SymptomAlert[] = [];

    for (const alert of alerts) {
      let shouldTrigger = false;

      switch (alert.alert_type) {
        case 'pain_threshold':
          if (symptomEntry.pain_intensity && symptomEntry.pain_intensity >= alert.conditions.threshold) {
            shouldTrigger = true;
          }
          break;
        case 'symptom_frequency':
          // Lógica para verificar frecuencia de síntomas
          const recentEntries = await this.getSymptomEntries(
            userId,
            new Date(Date.now() - alert.conditions.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          );
          const symptomCount = recentEntries.filter(e => e.symptom_type === symptomEntry.symptom_type).length;
          if (symptomCount >= alert.conditions.frequency) {
            shouldTrigger = true;
          }
          break;
      }

      if (shouldTrigger) {
        triggeredAlerts.push(alert);
        await this.updateAlertTrigger(alert.id);
      }
    }

    return triggeredAlerts;
  }

  private static async updateAlertTrigger(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('symptom_alerts')
      .update({
        last_triggered: new Date().toISOString(),
        trigger_count: supabase.sql`trigger_count + 1`
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  // Generación de reportes
  static async getSymptomReports(userId: string): Promise<SymptomReport[]> {
    const { data, error } = await supabase
      .from('symptom_reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async generateReport(
    userId: string,
    startDate: string,
    endDate: string,
    reportType: string = 'custom'
  ): Promise<SymptomReport> {
    const { data, error } = await supabase.rpc('generate_symptom_report', {
      p_user_id: userId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_report_type: reportType
    });

    if (error) throw error;

    // Obtener el reporte generado
    const { data: report, error: reportError } = await supabase
      .from('symptom_reports')
      .select('*')
      .eq('id', data)
      .single();

    if (reportError) throw reportError;
    return report;
  }

  // Preferencias de usuario
  static async getUserPreferences(userId: string): Promise<UserSymptomPreferences | null> {
    const { data, error } = await supabase
      .from('user_symptom_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserSymptomPreferences>
  ): Promise<UserSymptomPreferences> {
    const { data, error } = await supabase
      .from('user_symptom_preferences')
      .upsert({ user_id: userId, ...preferences })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Análisis estadístico
  static async getSymptomStatistics(userId: string, days: number = 30): Promise<any> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [symptoms, moods] = await Promise.all([
      this.getSymptomEntries(userId, startDate, endDate),
      this.getMoodEntries(userId, startDate, endDate)
    ]);

    // Calcular estadísticas de síntomas
    const symptomStats = symptoms.reduce((acc, entry) => {
      if (!acc[entry.symptom_type]) {
        acc[entry.symptom_type] = {
          count: 0,
          totalIntensity: 0,
          maxIntensity: 0,
          avgIntensity: 0
        };
      }
      
      acc[entry.symptom_type].count++;
      if (entry.pain_intensity) {
        acc[entry.symptom_type].totalIntensity += entry.pain_intensity;
        acc[entry.symptom_type].maxIntensity = Math.max(
          acc[entry.symptom_type].maxIntensity,
          entry.pain_intensity
        );
      }
      
      return acc;
    }, {} as any);

    // Calcular promedios
    Object.keys(symptomStats).forEach(symptom => {
      if (symptomStats[symptom].count > 0) {
        symptomStats[symptom].avgIntensity = 
          symptomStats[symptom].totalIntensity / symptomStats[symptom].count;
      }
    });

    // Calcular estadísticas de estado de ánimo
    const moodStats = moods.length > 0 ? {
      avgMood: moods.reduce((sum, m) => sum + m.overall_mood, 0) / moods.length,
      avgEnergy: moods.reduce((sum, m) => sum + (m.energy_level || 0), 0) / moods.length,
      avgStress: moods.reduce((sum, m) => sum + (m.stress_level || 0), 0) / moods.length,
      avgSleep: moods.reduce((sum, m) => sum + (m.sleep_quality || 0), 0) / moods.length,
      totalEntries: moods.length
    } : null;

    return {
      period: { startDate, endDate, days },
      symptoms: symptomStats,
      mood: moodStats,
      totalSymptomEntries: symptoms.length,
      totalMoodEntries: moods.length
    };
  }
}

// Utilidades para análisis predictivo
export class SymptomAnalysisService {
  static async identifyTriggers(userId: string): Promise<SymptomTrigger[]> {
    const symptoms = await SymptomMoodService.getSymptomEntries(userId);
    const triggers: { [key: string]: SymptomTrigger } = {};

    symptoms.forEach(symptom => {
      // Analizar factores agravantes
      symptom.aggravating_factors?.forEach(factor => {
        if (!triggers[factor]) {
          triggers[factor] = {
            id: '',
            user_id: userId,
            trigger_name: factor,
            trigger_category: 'aggravating',
            confidence_score: 0,
            occurrences: 0,
            is_confirmed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        triggers[factor].occurrences++;
      });

      // Analizar actividades previas
      if (symptom.activity_before) {
        const factor = symptom.activity_before;
        if (!triggers[factor]) {
          triggers[factor] = {
            id: '',
            user_id: userId,
            trigger_name: factor,
            trigger_category: 'activity',
            confidence_score: 0,
            occurrences: 0,
            is_confirmed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        triggers[factor].occurrences++;
      }
    });

    // Calcular confianza basada en frecuencia
    Object.values(triggers).forEach(trigger => {
      trigger.confidence_score = Math.min(trigger.occurrences / 10, 1.0);
    });

    return Object.values(triggers).filter(t => t.occurrences >= 2);
  }

  static async predictSymptomRisk(userId: string): Promise<any> {
    const stats = await SymptomMoodService.getSymptomStatistics(userId, 30);
    const patterns = await SymptomMoodService.getSymptomPatterns(userId);
    
    const riskFactors = {
      high_frequency: Object.entries(stats.symptoms)
        .filter(([_, data]: [string, any]) => data.count > 10)
        .map(([symptom, _]) => symptom),
      high_intensity: Object.entries(stats.symptoms)
        .filter(([_, data]: [string, any]) => data.avgIntensity > 7)
        .map(([symptom, _]) => symptom),
      declining_mood: stats.mood && stats.mood.avgMood < 3,
      active_patterns: patterns.filter(p => p.confidence_level > 0.7).length
    };

    const overallRisk = (
      riskFactors.high_frequency.length * 0.3 +
      riskFactors.high_intensity.length * 0.4 +
      (riskFactors.declining_mood ? 1 : 0) * 0.2 +
      riskFactors.active_patterns * 0.1
    );

    return {
      risk_level: overallRisk > 2 ? 'high' : overallRisk > 1 ? 'medium' : 'low',
      risk_score: overallRisk,
      risk_factors: riskFactors,
      recommendations: this.generateRecommendations(riskFactors)
    };
  }

  private static generateRecommendations(riskFactors: any): string[] {
    const recommendations: string[] = [];

    if (riskFactors.high_frequency.length > 0) {
      recommendations.push('Considera consultar con tu médico sobre la frecuencia de síntomas');
    }

    if (riskFactors.high_intensity.length > 0) {
      recommendations.push('Los niveles altos de dolor requieren atención médica');
    }

    if (riskFactors.declining_mood) {
      recommendations.push('Tu estado de ánimo ha disminuido, considera hablar con un profesional');
    }

    if (riskFactors.active_patterns > 2) {
      recommendations.push('Se han detectado múltiples patrones, revisa los triggers identificados');
    }

    return recommendations;
  }
}

// Utilidades para exportación
export class SymptomExportService {
  static async exportToCSV(userId: string, startDate: string, endDate: string): Promise<string> {
    const [symptoms, moods] = await Promise.all([
      SymptomMoodService.getSymptomEntries(userId, startDate, endDate),
      SymptomMoodService.getMoodEntries(userId, startDate, endDate)
    ]);

    // Generar CSV de síntomas
    const symptomHeaders = [
      'Fecha', 'Hora', 'Tipo de Síntoma', 'Intensidad', 'Duración (min)',
      'Frecuencia', 'Descripción', 'Factores Agravantes', 'Factores Aliviantes',
      'Medicamentos', 'Actividad Previa', 'Nivel de Estrés', 'Calidad del Sueño', 'Notas'
    ];

    const symptomRows = symptoms.map(s => [
      s.entry_date,
      s.entry_time,
      s.symptom_type,
      s.pain_intensity || '',
      s.duration_minutes || '',
      s.frequency || '',
      s.description || '',
      s.aggravating_factors?.join('; ') || '',
      s.relieving_factors?.join('; ') || '',
      s.medication_taken?.join('; ') || '',
      s.activity_before || '',
      s.stress_level || '',
      s.sleep_quality || '',
      s.notes || ''
    ]);

    // Generar CSV de estado de ánimo
    const moodHeaders = [
      'Fecha', 'Hora', 'Estado de Ánimo General', 'Emociones Específicas',
      'Nivel de Energía', 'Nivel de Estrés', 'Nivel de Ansiedad',
      'Calidad del Sueño', 'Horas de Sueño', 'Interacción Social',
      'Actividad Física', 'Impacto del Clima', 'Notas'
    ];

    const moodRows = moods.map(m => [
      m.entry_date,
      m.entry_time,
      m.overall_mood,
      m.specific_emotions?.join('; ') || '',
      m.energy_level || '',
      m.stress_level || '',
      m.anxiety_level || '',
      m.sleep_quality || '',
      m.sleep_hours || '',
      m.social_interaction || '',
      m.physical_activity || '',
      m.weather_mood_impact || '',
      m.notes || ''
    ]);

    // Combinar en un CSV
    const csvContent = [
      '# DATOS DE SÍNTOMAS',
      symptomHeaders.join(','),
      ...symptomRows.map(row => row.join(',')),
      '',
      '# DATOS DE ESTADO DE ÁNIMO',
      moodHeaders.join(','),
      ...moodRows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  static async generatePDFReport(userId: string, reportId: string): Promise<Blob> {
    // En una implementación real, esto generaría un PDF usando una librería como jsPDF
    const report = await SymptomMoodService.getSymptomReports(userId);
    const targetReport = report.find(r => r.id === reportId);
    
    if (!targetReport) {
      throw new Error('Report not found');
    }

    // Simulación de generación de PDF
    const pdfContent = JSON.stringify(targetReport, null, 2);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
}