import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our health data
export interface HealthMetric {
  id: string;
  user_id: string;
  type: 'blood_pressure' | 'weight' | 'temperature' | 'heart_rate' | 'blood_sugar';
  value: number;
  secondary_value?: number; // For blood pressure diastolic
  unit: string;
  recorded_at: string;
  notes?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  taken_time?: string;
  is_taken: boolean;
  notes?: string;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  name: string;
  severity: number; // 1-10 scale
  description?: string;
  recorded_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  height: number;
  emergency_contact: string;
  medical_conditions?: string[];
  allergies?: string[];
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}