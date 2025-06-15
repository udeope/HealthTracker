// Sistema de almacenamiento local para reemplazar Supabase temporalmente
// En producción, esto se conectaría a una base de datos real

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

// Utilidad para generar IDs únicos
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Clase para manejar el almacenamiento local
class LocalStorageManager {
  private static getKey(table: string, userId: string): string {
    return `health_tracker_${table}_${userId}`;
  }

  static get<T>(table: string, userId: string): T[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const key = this.getKey(table, userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  static set<T>(table: string, userId: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = this.getKey(table, userId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static add<T extends { id: string }>(table: string, userId: string, item: Omit<T, 'id' | 'created_at' | 'updated_at'>): T {
    const items = this.get<T>(table, userId);
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: generateId(),
      created_at: now,
      updated_at: now
    } as T;
    
    items.push(newItem);
    this.set(table, userId, items);
    return newItem;
  }

  static update<T extends { id: string; updated_at: string }>(table: string, userId: string, id: string, updates: Partial<T>): T | null {
    const items = this.get<T>(table, userId);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    items[index] = updatedItem;
    this.set(table, userId, items);
    return updatedItem;
  }

  static delete(table: string, userId: string, id: string): boolean {
    const items = this.get(table, userId);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.set(table, userId, filteredItems);
    return true;
  }
}

// Servicio principal para gestión de síntomas y estado de ánimo
export class SymptomMoodService {
  // Gestión de entradas de síntomas
  static async getSymptomEntries(userId: string, startDate?: string, endDate?: string): Promise<SymptomEntry[]> {
    let entries = LocalStorageManager.get<SymptomEntry>('symptom_entries', userId);
    
    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const entryDate = entry.entry_date;
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    
    // Cargar localizaciones del dolor para cada entrada
    for (const entry of entries) {
      entry.pain_locations = LocalStorageManager.get<PainLocation>('pain_locations', userId)
        .filter(location => location.symptom_entry_id === entry.id);
    }
    
    return entries.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }

  static async createSymptomEntry(entry: Omit<SymptomEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomEntry> {
    return LocalStorageManager.add<SymptomEntry>('symptom_entries', entry.user_id, entry);
  }

  static async updateSymptomEntry(id: string, updates: Partial<SymptomEntry>): Promise<SymptomEntry> {
    const userId = updates.user_id || '';
    const updated = LocalStorageManager.update<SymptomEntry>('symptom_entries', userId, id, updates);
    if (!updated) throw new Error('Symptom entry not found');
    return updated;
  }

  static async deleteSymptomEntry(id: string, userId: string): Promise<void> {
    const deleted = LocalStorageManager.delete('symptom_entries', userId, id);
    if (!deleted) throw new Error('Symptom entry not found');
  }

  // Gestión de localizaciones del dolor
  static async addPainLocation(location: Omit<PainLocation, 'id' | 'created_at'>): Promise<PainLocation> {
    // Obtener el user_id de la entrada de síntoma
    const symptomEntries = LocalStorageManager.get<SymptomEntry>('symptom_entries', 'user-123'); // Temporal
    const symptomEntry = symptomEntries.find(e => e.id === location.symptom_entry_id);
    const userId = symptomEntry?.user_id || 'user-123';
    
    return LocalStorageManager.add<PainLocation>('pain_locations', userId, location);
  }

  static async getPainLocations(symptomEntryId: string): Promise<PainLocation[]> {
    return LocalStorageManager.get<PainLocation>('pain_locations', 'user-123')
      .filter(location => location.symptom_entry_id === symptomEntryId);
  }

  // Gestión de entradas de estado de ánimo
  static async getMoodEntries(userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    let entries = LocalStorageManager.get<MoodEntry>('mood_entries', userId);
    
    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const entryDate = entry.entry_date;
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    
    return entries.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }

  static async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'created_at' | 'updated_at'>): Promise<MoodEntry> {
    return LocalStorageManager.add<MoodEntry>('mood_entries', entry.user_id, entry);
  }

  static async updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry> {
    const userId = updates.user_id || '';
    const updated = LocalStorageManager.update<MoodEntry>('mood_entries', userId, id, updates);
    if (!updated) throw new Error('Mood entry not found');
    return updated;
  }

  // Gestión de triggers/desencadenantes
  static async getSymptomTriggers(userId: string): Promise<SymptomTrigger[]> {
    return LocalStorageManager.get<SymptomTrigger>('symptom_triggers', userId)
      .sort((a, b) => b.confidence_score - a.confidence_score);
  }

  static async createSymptomTrigger(trigger: Omit<SymptomTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomTrigger> {
    return LocalStorageManager.add<SymptomTrigger>('symptom_triggers', trigger.user_id, trigger);
  }

  static async updateTriggerConfidence(triggerId: string, confidence: number, userId: string): Promise<void> {
    LocalStorageManager.update<SymptomTrigger>('symptom_triggers', userId, triggerId, { confidence_score: confidence });
  }

  // Gestión de patrones
  static async getSymptomPatterns(userId: string): Promise<SymptomPattern[]> {
    return LocalStorageManager.get<SymptomPattern>('symptom_patterns', userId)
      .filter(pattern => pattern.is_active)
      .sort((a, b) => b.confidence_level - a.confidence_level);
  }

  static async detectPatterns(userId: string): Promise<void> {
    const symptoms = await this.getSymptomEntries(userId);
    const patterns: SymptomPattern[] = [];

    // Detectar patrones temporales simples
    const symptomsByDay = symptoms.reduce((acc, symptom) => {
      const dayOfWeek = new Date(symptom.entry_date).getDay();
      if (!acc[symptom.symptom_type]) acc[symptom.symptom_type] = {};
      if (!acc[symptom.symptom_type][dayOfWeek]) acc[symptom.symptom_type][dayOfWeek] = 0;
      acc[symptom.symptom_type][dayOfWeek]++;
      return acc;
    }, {} as any);

    Object.entries(symptomsByDay).forEach(([symptomType, days]: [string, any]) => {
      Object.entries(days).forEach(([dayOfWeek, count]: [string, any]) => {
        if (count >= 3) { // Patrón si ocurre 3+ veces en el mismo día
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          patterns.push({
            id: generateId(),
            user_id: userId,
            pattern_type: 'temporal',
            pattern_name: `${symptomType} los ${dayNames[parseInt(dayOfWeek)]}`,
            description: `Se detectó que ${symptomType} tiende a ocurrir los ${dayNames[parseInt(dayOfWeek)]} (${count} veces)`,
            confidence_level: Math.min(count / 10, 1),
            supporting_data: { symptomType, dayOfWeek, count },
            recommendations: [`Considera factores específicos de los ${dayNames[parseInt(dayOfWeek)]} que puedan estar causando ${symptomType}`],
            is_active: true,
            detected_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
        }
      });
    });

    // Guardar patrones detectados
    const existingPatterns = LocalStorageManager.get<SymptomPattern>('symptom_patterns', userId);
    LocalStorageManager.set('symptom_patterns', userId, [...existingPatterns, ...patterns]);
  }

  // Análisis de correlaciones
  static async getMoodCorrelations(userId: string): Promise<MoodCorrelation[]> {
    return LocalStorageManager.get<MoodCorrelation>('mood_correlations', userId)
      .filter(corr => corr.is_significant)
      .sort((a, b) => Math.abs(b.correlation_strength) - Math.abs(a.correlation_strength));
  }

  static async calculateCorrelations(userId: string, daysBack: number = 30): Promise<any[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [symptoms, moods] = await Promise.all([
      this.getSymptomEntries(userId, startDate, endDate),
      this.getMoodEntries(userId, startDate, endDate)
    ]);

    const correlations: any[] = [];

    // Correlación simple entre intensidad del dolor y estado de ánimo
    const pairedData = symptoms.map(symptom => {
      const mood = moods.find(m => m.entry_date === symptom.entry_date);
      return mood ? {
        painIntensity: symptom.pain_intensity || 0,
        mood: mood.overall_mood
      } : null;
    }).filter(Boolean);

    if (pairedData.length >= 10) {
      // Cálculo simple de correlación de Pearson
      const n = pairedData.length;
      const sumX = pairedData.reduce((sum, d) => sum + d!.painIntensity, 0);
      const sumY = pairedData.reduce((sum, d) => sum + d!.mood, 0);
      const sumXY = pairedData.reduce((sum, d) => sum + d!.painIntensity * d!.mood, 0);
      const sumX2 = pairedData.reduce((sum, d) => sum + d!.painIntensity * d!.painIntensity, 0);
      const sumY2 = pairedData.reduce((sum, d) => sum + d!.mood * d!.mood, 0);

      const correlation = (n * sumXY - sumX * sumY) / 
        Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

      if (!isNaN(correlation)) {
        correlations.push({
          factor_a: 'pain_intensity',
          factor_b: 'overall_mood',
          correlation: correlation,
          significance: n >= 30 ? 0.95 : 0.80,
          sample_size: n
        });
      }
    }

    return correlations;
  }

  // Gestión de alertas
  static async getSymptomAlerts(userId: string): Promise<SymptomAlert[]> {
    return LocalStorageManager.get<SymptomAlert>('symptom_alerts', userId)
      .filter(alert => alert.is_active);
  }

  static async createSymptomAlert(alert: Omit<SymptomAlert, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomAlert> {
    return LocalStorageManager.add<SymptomAlert>('symptom_alerts', alert.user_id, alert);
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
        LocalStorageManager.update<SymptomAlert>('symptom_alerts', userId, alert.id, {
          last_triggered: new Date().toISOString(),
          trigger_count: alert.trigger_count + 1
        });
      }
    }

    return triggeredAlerts;
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
            id: generateId(),
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
            id: generateId(),
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

  static async generatePDFReport(userId: string): Promise<Blob> {
    const stats = await SymptomMoodService.getSymptomStatistics(userId, 30);
    const patterns = await SymptomMoodService.getSymptomPatterns(userId);
    
    // Simulación de generación de PDF
    const reportData = {
      user_id: userId,
      generated_at: new Date().toISOString(),
      statistics: stats,
      patterns: patterns,
      summary: 'Reporte generado con datos de los últimos 30 días'
    };
    
    const pdfContent = JSON.stringify(reportData, null, 2);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
}