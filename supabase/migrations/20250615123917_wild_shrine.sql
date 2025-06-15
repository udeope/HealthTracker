/*
  # Sistema Integral de Gestión de Medicamentos

  1. Nuevas Tablas
    - `medications` - Catálogo de medicamentos con información completa
    - `prescriptions` - Prescripciones médicas
    - `medication_logs` - Registro de tomas
    - `medication_interactions` - Interacciones conocidas entre medicamentos
    - `medication_inventory` - Inventario actual de medicamentos
    - `medication_reminders` - Configuración de recordatorios
    - `side_effects_log` - Registro de efectos secundarios

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Cumplimiento HIPAA/GDPR

  3. Funcionalidades
    - Gestión completa de medicamentos
    - Seguimiento de adherencia
    - Control de inventario
    - Sistema de notificaciones
    - Registro de efectos secundarios
*/

-- Tabla de medicamentos (catálogo)
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  generic_name text,
  active_ingredient text,
  strength text NOT NULL,
  form text NOT NULL, -- tablet, capsule, liquid, injection, etc.
  manufacturer text,
  ndc_number text, -- National Drug Code
  description text,
  storage_instructions text,
  is_prescription boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de prescripciones
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  prescriber_name text NOT NULL,
  prescriber_license text,
  prescriber_contact text,
  dosage text NOT NULL,
  frequency text NOT NULL, -- "twice daily", "every 8 hours", etc.
  route text DEFAULT 'oral', -- oral, topical, injection, etc.
  instructions text,
  quantity_prescribed integer,
  refills_remaining integer DEFAULT 0,
  prescribed_date date NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de registro de tomas
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  taken_time timestamptz,
  dosage_taken text,
  is_taken boolean DEFAULT false,
  is_skipped boolean DEFAULT false,
  skip_reason text,
  notes text,
  location text, -- where the medication was taken
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de interacciones entre medicamentos
CREATE TABLE IF NOT EXISTS medication_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_a_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  medication_b_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'major', 'moderate', 'minor'
  severity_level integer CHECK (severity_level BETWEEN 1 AND 5),
  description text NOT NULL,
  clinical_effects text,
  management_recommendations text,
  source text, -- FDA, drug database, etc.
  created_at timestamptz DEFAULT now(),
  UNIQUE(medication_a_id, medication_b_id)
);

-- Tabla de inventario de medicamentos
CREATE TABLE IF NOT EXISTS medication_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  current_quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pills', -- pills, ml, mg, etc.
  expiration_date date,
  batch_number text,
  purchase_date date,
  cost_per_unit decimal(10,2),
  low_stock_threshold integer DEFAULT 7,
  auto_reorder boolean DEFAULT false,
  pharmacy_info jsonb, -- store pharmacy details
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS medication_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE CASCADE,
  reminder_times time[] NOT NULL, -- array of times for daily reminders
  days_of_week integer[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  notification_methods text[] DEFAULT '{"push"}', -- push, email, sms
  advance_notice_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  snooze_duration_minutes integer DEFAULT 10,
  max_snooze_count integer DEFAULT 3,
  sound_enabled boolean DEFAULT true,
  vibration_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de efectos secundarios
CREATE TABLE IF NOT EXISTS side_effects_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  effect_name text NOT NULL,
  severity integer CHECK (severity BETWEEN 1 AND 10),
  start_date date NOT NULL,
  end_date date,
  description text,
  action_taken text, -- "continued medication", "reduced dose", "stopped medication"
  reported_to_doctor boolean DEFAULT false,
  is_serious boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de reportes de adherencia
CREATE TABLE IF NOT EXISTS adherence_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  overall_adherence_percentage decimal(5,2),
  total_scheduled_doses integer,
  total_taken_doses integer,
  total_missed_doses integer,
  medications_data jsonb, -- detailed per-medication adherence data
  generated_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para medications
CREATE POLICY "Users can manage their own medications"
  ON medications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para prescriptions
CREATE POLICY "Users can manage their own prescriptions"
  ON prescriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para medication_logs
CREATE POLICY "Users can manage their own medication logs"
  ON medication_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para medication_interactions (lectura pública para seguridad)
CREATE POLICY "Anyone can read medication interactions"
  ON medication_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify interactions"
  ON medication_interactions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Políticas de seguridad para medication_inventory
CREATE POLICY "Users can manage their own inventory"
  ON medication_inventory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para medication_reminders
CREATE POLICY "Users can manage their own reminders"
  ON medication_reminders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para side_effects_log
CREATE POLICY "Users can manage their own side effects"
  ON side_effects_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para adherence_reports
CREATE POLICY "Users can view their own adherence reports"
  ON adherence_reports
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_id ON prescriptions(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_prescription_id ON medication_logs(prescription_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled_time ON medication_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_medication_inventory_user_id ON medication_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user_id ON medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_user_id ON side_effects_log(user_id);

-- Función para calcular adherencia
CREATE OR REPLACE FUNCTION calculate_adherence_percentage(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS decimal AS $$
DECLARE
  total_scheduled integer;
  total_taken integer;
  adherence_pct decimal;
BEGIN
  SELECT 
    COUNT(*) as scheduled,
    COUNT(*) FILTER (WHERE is_taken = true) as taken
  INTO total_scheduled, total_taken
  FROM medication_logs
  WHERE user_id = p_user_id
    AND scheduled_time::date BETWEEN p_start_date AND p_end_date;
  
  IF total_scheduled = 0 THEN
    RETURN 0;
  END IF;
  
  adherence_pct := (total_taken::decimal / total_scheduled::decimal) * 100;
  RETURN ROUND(adherence_pct, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar interacciones
CREATE OR REPLACE FUNCTION check_medication_interactions(
  p_user_id uuid,
  p_new_medication_id uuid
) RETURNS TABLE(
  interaction_id uuid,
  medication_name text,
  interaction_type text,
  severity_level integer,
  description text,
  recommendations text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    m.name,
    mi.interaction_type,
    mi.severity_level,
    mi.description,
    mi.management_recommendations
  FROM medication_interactions mi
  JOIN medications m ON (
    (mi.medication_a_id = p_new_medication_id AND mi.medication_b_id = m.id) OR
    (mi.medication_b_id = p_new_medication_id AND mi.medication_a_id = m.id)
  )
  WHERE m.id IN (
    SELECT DISTINCT p.medication_id
    FROM prescriptions p
    WHERE p.user_id = p_user_id AND p.is_active = true
  )
  AND m.id != p_new_medication_id;
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

-- Aplicar trigger a las tablas relevantes
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_inventory_updated_at
  BEFORE UPDATE ON medication_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_reminders_updated_at
  BEFORE UPDATE ON medication_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_side_effects_log_updated_at
  BEFORE UPDATE ON side_effects_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();