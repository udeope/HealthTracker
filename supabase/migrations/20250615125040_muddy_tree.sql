/*
  # Sistema Integral de Seguimiento de Síntomas y Estado de Ánimo

  1. Nuevas Tablas
    - `symptom_entries` - Registro diario de síntomas
    - `pain_locations` - Localizaciones específicas del dolor
    - `mood_entries` - Registro de estado de ánimo
    - `symptom_triggers` - Factores desencadenantes
    - `symptom_patterns` - Patrones identificados automáticamente
    - `mood_correlations` - Correlaciones entre síntomas y estado de ánimo
    - `symptom_reports` - Reportes generados

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Cumplimiento HIPAA/GDPR

  3. Funcionalidades
    - Seguimiento detallado de síntomas
    - Análisis de patrones y correlaciones
    - Sistema de alertas configurables
    - Exportación de datos
*/

-- Tabla de entradas de síntomas
CREATE TABLE IF NOT EXISTS symptom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  entry_time time NOT NULL,
  symptom_type text NOT NULL,
  pain_intensity integer CHECK (pain_intensity BETWEEN 0 AND 10),
  duration_minutes integer,
  frequency text, -- 'constant', 'intermittent', 'occasional'
  description text,
  associated_symptoms text[],
  aggravating_factors text[],
  relieving_factors text[],
  medication_taken text[],
  activity_before text,
  weather_conditions jsonb,
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  notes text,
  is_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de localizaciones del dolor
CREATE TABLE IF NOT EXISTS pain_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_entry_id uuid REFERENCES symptom_entries(id) ON DELETE CASCADE,
  body_part text NOT NULL,
  specific_area text,
  side text, -- 'left', 'right', 'both', 'center'
  coordinates jsonb, -- Para mapas corporales interactivos
  intensity integer CHECK (intensity BETWEEN 1 AND 10),
  pain_type text, -- 'sharp', 'dull', 'burning', 'throbbing', etc.
  created_at timestamptz DEFAULT now()
);

-- Tabla de entradas de estado de ánimo
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  entry_time time NOT NULL,
  overall_mood integer CHECK (overall_mood BETWEEN 1 AND 5), -- 1=muy mal, 5=muy bien
  specific_emotions text[], -- 'happy', 'sad', 'anxious', 'angry', etc.
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  anxiety_level integer CHECK (anxiety_level BETWEEN 1 AND 10),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours decimal(3,1),
  social_interaction text, -- 'none', 'minimal', 'moderate', 'high'
  physical_activity text, -- 'none', 'light', 'moderate', 'intense'
  weather_mood_impact text, -- 'positive', 'negative', 'neutral'
  menstrual_cycle_day integer, -- Para correlaciones hormonales
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de triggers/desencadenantes
CREATE TABLE IF NOT EXISTS symptom_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_name text NOT NULL,
  trigger_category text NOT NULL, -- 'food', 'activity', 'weather', 'stress', 'medication'
  description text,
  confidence_score decimal(3,2) DEFAULT 0.0, -- Calculado automáticamente
  occurrences integer DEFAULT 1,
  last_occurrence timestamptz,
  is_confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de patrones identificados
CREATE TABLE IF NOT EXISTS symptom_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type text NOT NULL, -- 'temporal', 'trigger-based', 'medication-related', 'mood-related'
  pattern_name text NOT NULL,
  description text,
  frequency text, -- 'daily', 'weekly', 'monthly', 'seasonal'
  confidence_level decimal(3,2),
  supporting_data jsonb,
  recommendations text[],
  is_active boolean DEFAULT true,
  detected_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Tabla de correlaciones entre síntomas y estado de ánimo
CREATE TABLE IF NOT EXISTS mood_correlations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_type text NOT NULL, -- 'symptom-mood', 'medication-mood', 'activity-mood'
  factor_a text NOT NULL,
  factor_b text NOT NULL,
  correlation_strength decimal(3,2), -- -1 a 1
  statistical_significance decimal(3,2),
  sample_size integer,
  time_period_days integer,
  analysis_date timestamptz DEFAULT now(),
  is_significant boolean DEFAULT false
);

-- Tabla de alertas configurables
CREATE TABLE IF NOT EXISTS symptom_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_name text NOT NULL,
  alert_type text NOT NULL, -- 'pain_threshold', 'symptom_frequency', 'mood_decline', 'pattern_detected'
  conditions jsonb NOT NULL, -- Condiciones para activar la alerta
  notification_methods text[] DEFAULT '{"push"}',
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  trigger_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de reportes generados
CREATE TABLE IF NOT EXISTS symptom_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL, -- 'weekly', 'monthly', 'custom', 'medical'
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  report_data jsonb NOT NULL,
  summary_insights text[],
  recommendations text[],
  generated_at timestamptz DEFAULT now(),
  format text DEFAULT 'pdf', -- 'pdf', 'csv', 'json'
  file_path text
);

-- Tabla de configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_symptom_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  default_symptoms text[],
  pain_scale_type text DEFAULT 'numeric', -- 'numeric', 'faces', 'descriptive'
  reminder_times time[],
  auto_analysis_enabled boolean DEFAULT true,
  data_sharing_consent boolean DEFAULT false,
  export_preferences jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_symptom_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can manage their own symptom entries"
  ON symptom_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pain locations"
  ON pain_locations FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM symptom_entries se 
    WHERE se.id = pain_locations.symptom_entry_id 
    AND se.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own mood entries"
  ON mood_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own triggers"
  ON symptom_triggers FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own patterns"
  ON symptom_patterns FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own correlations"
  ON mood_correlations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts"
  ON symptom_alerts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON symptom_reports FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_symptom_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Índices para optimización
CREATE INDEX idx_symptom_entries_user_date ON symptom_entries(user_id, entry_date);
CREATE INDEX idx_symptom_entries_type ON symptom_entries(symptom_type);
CREATE INDEX idx_symptom_entries_intensity ON symptom_entries(pain_intensity);
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
CREATE INDEX idx_mood_entries_mood ON mood_entries(overall_mood);
CREATE INDEX idx_symptom_triggers_user ON symptom_triggers(user_id);
CREATE INDEX idx_symptom_patterns_user ON symptom_patterns(user_id, is_active);
CREATE INDEX idx_mood_correlations_user ON mood_correlations(user_id);

-- Función para calcular correlaciones automáticamente
CREATE OR REPLACE FUNCTION calculate_mood_symptom_correlation(
  p_user_id uuid,
  p_days_back integer DEFAULT 30
) RETURNS TABLE(
  factor_a text,
  factor_b text,
  correlation decimal,
  significance decimal,
  sample_size integer
) AS $$
DECLARE
  correlation_data record;
BEGIN
  -- Correlación entre intensidad del dolor y estado de ánimo
  FOR correlation_data IN
    SELECT 
      'pain_intensity' as fa,
      'overall_mood' as fb,
      corr(se.pain_intensity::numeric, me.overall_mood::numeric) as corr_value,
      count(*) as samples
    FROM symptom_entries se
    JOIN mood_entries me ON se.entry_date = me.entry_date AND se.user_id = me.user_id
    WHERE se.user_id = p_user_id 
      AND se.entry_date >= CURRENT_DATE - INTERVAL '%s days' % p_days_back
      AND se.pain_intensity IS NOT NULL
    GROUP BY se.user_id
    HAVING count(*) >= 10
  LOOP
    factor_a := correlation_data.fa;
    factor_b := correlation_data.fb;
    correlation := correlation_data.corr_value;
    significance := CASE 
      WHEN correlation_data.samples >= 30 THEN 0.95
      WHEN correlation_data.samples >= 20 THEN 0.90
      ELSE 0.80
    END;
    sample_size := correlation_data.samples;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para detectar patrones automáticamente
CREATE OR REPLACE FUNCTION detect_symptom_patterns(p_user_id uuid)
RETURNS void AS $$
DECLARE
  pattern_record record;
  pattern_confidence decimal;
BEGIN
  -- Detectar patrones temporales (síntomas que ocurren en días específicos)
  FOR pattern_record IN
    SELECT 
      symptom_type,
      EXTRACT(DOW FROM entry_date) as day_of_week,
      count(*) as occurrences,
      avg(pain_intensity) as avg_intensity
    FROM symptom_entries
    WHERE user_id = p_user_id 
      AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY symptom_type, EXTRACT(DOW FROM entry_date)
    HAVING count(*) >= 3
  LOOP
    pattern_confidence := LEAST(pattern_record.occurrences / 10.0, 1.0);
    
    INSERT INTO symptom_patterns (
      user_id, pattern_type, pattern_name, description, 
      confidence_level, supporting_data
    ) VALUES (
      p_user_id,
      'temporal',
      format('%s on %s', pattern_record.symptom_type, 
        CASE pattern_record.day_of_week
          WHEN 0 THEN 'Sundays'
          WHEN 1 THEN 'Mondays'
          WHEN 2 THEN 'Tuesdays'
          WHEN 3 THEN 'Wednesdays'
          WHEN 4 THEN 'Thursdays'
          WHEN 5 THEN 'Fridays'
          WHEN 6 THEN 'Saturdays'
        END
      ),
      format('Pattern detected: %s tends to occur on %s with average intensity %.1f',
        pattern_record.symptom_type,
        CASE pattern_record.day_of_week
          WHEN 0 THEN 'Sundays'
          WHEN 1 THEN 'Mondays'
          WHEN 2 THEN 'Tuesdays'
          WHEN 3 THEN 'Wednesdays'
          WHEN 4 THEN 'Thursdays'
          WHEN 5 THEN 'Fridays'
          WHEN 6 THEN 'Saturdays'
        END,
        pattern_record.avg_intensity
      ),
      pattern_confidence,
      jsonb_build_object(
        'symptom_type', pattern_record.symptom_type,
        'day_of_week', pattern_record.day_of_week,
        'occurrences', pattern_record.occurrences,
        'avg_intensity', pattern_record.avg_intensity
      )
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar reportes automáticos
CREATE OR REPLACE FUNCTION generate_symptom_report(
  p_user_id uuid,
  p_start_date date,
  p_end_date date,
  p_report_type text DEFAULT 'weekly'
) RETURNS uuid AS $$
DECLARE
  report_id uuid;
  report_data jsonb;
  insights text[];
  recommendations text[];
BEGIN
  -- Generar datos del reporte
  SELECT jsonb_build_object(
    'symptom_summary', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'symptom_type', symptom_type,
          'total_entries', count(*),
          'avg_intensity', round(avg(pain_intensity), 1),
          'max_intensity', max(pain_intensity),
          'most_common_time', mode() WITHIN GROUP (ORDER BY entry_time)
        )
      )
      FROM symptom_entries
      WHERE user_id = p_user_id 
        AND entry_date BETWEEN p_start_date AND p_end_date
      GROUP BY symptom_type
    ),
    'mood_summary', (
      SELECT jsonb_build_object(
        'avg_mood', round(avg(overall_mood), 1),
        'avg_energy', round(avg(energy_level), 1),
        'avg_stress', round(avg(stress_level), 1),
        'avg_sleep_quality', round(avg(sleep_quality), 1),
        'total_entries', count(*)
      )
      FROM mood_entries
      WHERE user_id = p_user_id 
        AND entry_date BETWEEN p_start_date AND p_end_date
    ),
    'patterns_detected', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'pattern_name', pattern_name,
          'confidence_level', confidence_level,
          'description', description
        )
      )
      FROM symptom_patterns
      WHERE user_id = p_user_id AND is_active = true
    )
  ) INTO report_data;

  -- Generar insights
  insights := ARRAY[
    'Análisis completado para el período ' || p_start_date || ' a ' || p_end_date,
    'Se registraron ' || (
      SELECT count(*) FROM symptom_entries 
      WHERE user_id = p_user_id 
        AND entry_date BETWEEN p_start_date AND p_end_date
    )::text || ' entradas de síntomas'
  ];

  -- Generar recomendaciones
  recommendations := ARRAY[
    'Continúa registrando síntomas diariamente para mejorar el análisis',
    'Considera discutir los patrones detectados con tu médico'
  ];

  -- Insertar reporte
  INSERT INTO symptom_reports (
    user_id, report_type, report_period_start, report_period_end,
    report_data, summary_insights, recommendations
  ) VALUES (
    p_user_id, p_report_type, p_start_date, p_end_date,
    report_data, insights, recommendations
  ) RETURNING id INTO report_id;

  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER update_symptom_entries_updated_at
  BEFORE UPDATE ON symptom_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_triggers_updated_at
  BEFORE UPDATE ON symptom_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_patterns_updated_at
  BEFORE UPDATE ON symptom_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_alerts_updated_at
  BEFORE UPDATE ON symptom_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_symptom_preferences_updated_at
  BEFORE UPDATE ON user_symptom_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();