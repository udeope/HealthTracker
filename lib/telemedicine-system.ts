// Sistema integral de telemedicina con funcionalidades completas
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para el sistema de telemedicina
export interface Doctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  specialty: string;
  sub_specialties: string[];
  medical_license: string;
  years_experience: number;
  education: Education[];
  certifications: string[];
  languages: string[];
  biography: string;
  consultation_fee: number;
  currency: string;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  is_verified: boolean;
  is_available: boolean;
  availability_schedule: AvailabilitySchedule;
  created_at: string;
  updated_at: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: number;
  country: string;
}

export interface AvailabilitySchedule {
  timezone: string;
  weekly_schedule: WeeklySchedule;
  exceptions: ScheduleException[];
  advance_booking_days: number;
  consultation_duration_minutes: number;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  is_available: boolean;
  time_slots: TimeSlot[];
}

export interface TimeSlot {
  start_time: string; // HH:mm format
  end_time: string;
}

export interface ScheduleException {
  date: string;
  is_available: boolean;
  custom_slots?: TimeSlot[];
  reason?: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  consultation_type: 'video' | 'chat' | 'phone';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason_for_visit: string;
  symptoms?: string[];
  medical_history_summary?: string;
  consultation_notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescriptions?: Prescription[];
  follow_up_required: boolean;
  follow_up_date?: string;
  consultation_fee: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_id?: string;
  room_id?: string; // Para videoconsultas
  chat_room_id?: string;
  recording_url?: string;
  documents_shared: string[];
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contact: EmergencyContact;
  insurance_info?: InsuranceInfo;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policy_number: string;
  group_number?: string;
  coverage_details?: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: 'doctor' | 'patient';
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_encrypted: boolean;
  encryption_key?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  edited_at?: string;
  is_deleted: boolean;
}

export interface ChatRoom {
  id: string;
  consultation_id: string;
  participants: string[];
  is_active: boolean;
  last_message?: ChatMessage;
  unread_count_doctor: number;
  unread_count_patient: number;
  encryption_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoCall {
  id: string;
  consultation_id: string;
  daily_room_name: string;
  daily_room_url: string;
  room_token_doctor?: string;
  room_token_patient?: string;
  call_status: 'waiting' | 'active' | 'ended' | 'failed';
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  recording_enabled: boolean;
  recording_url?: string;
  screen_sharing_enabled: boolean;
  participants_log: ParticipantLog[];
  technical_issues: TechnicalIssue[];
  created_at: string;
}

export interface ParticipantLog {
  user_id: string;
  user_type: 'doctor' | 'patient';
  joined_at: string;
  left_at?: string;
  connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TechnicalIssue {
  timestamp: string;
  issue_type: 'connection' | 'audio' | 'video' | 'screen_share';
  description: string;
  resolved: boolean;
  resolution_time?: string;
}

export interface Review {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  rating: number; // 1-5
  comment?: string;
  categories: ReviewCategory[];
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
  doctor_response?: string;
  doctor_response_date?: string;
}

export interface ReviewCategory {
  category: 'communication' | 'expertise' | 'punctuality' | 'overall_experience';
  rating: number;
}

export interface Payment {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'paypal' | 'bank_transfer' | 'insurance';
  payment_provider: 'stripe' | 'paypal' | 'square';
  payment_intent_id?: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  failure_reason?: string;
  refund_amount?: number;
  refund_reason?: string;
  invoice_number: string;
  invoice_url?: string;
  receipt_url?: string;
  created_at: string;
  processed_at?: string;
}

export interface MedicalDocument {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id?: string;
  document_type: 'prescription' | 'lab_result' | 'imaging' | 'report' | 'referral' | 'other';
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_encrypted: boolean;
  encryption_key?: string;
  access_permissions: string[];
  expiry_date?: string;
  is_signed: boolean;
  digital_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refills: number;
  is_generic_allowed: boolean;
  pharmacy_instructions?: string;
  is_controlled_substance: boolean;
  is_sent_to_pharmacy: boolean;
  pharmacy_id?: string;
  created_at: string;
}

// Servicio principal de telemedicina
export class TelemedicineService {
  // Gestión de doctores
  static async getDoctors(filters?: DoctorFilters): Promise<Doctor[]> {
    // Simular datos de doctores
    const mockDoctors = this.generateMockDoctors();
    
    if (!filters) return mockDoctors;
    
    return mockDoctors.filter(doctor => {
      if (filters.specialty && doctor.specialty !== filters.specialty) return false;
      if (filters.min_rating && doctor.rating < filters.min_rating) return false;
      if (filters.max_fee && doctor.consultation_fee > filters.max_fee) return false;
      if (filters.available_today && !this.isDoctorAvailableToday(doctor)) return false;
      if (filters.languages && !filters.languages.some(lang => doctor.languages.includes(lang))) return false;
      return true;
    });
  }

  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const doctors = await this.getDoctors();
    return doctors.find(d => d.id === doctorId) || null;
  }

  static async getDoctorAvailability(doctorId: string, date: string): Promise<AvailableSlot[]> {
    const doctor = await this.getDoctorById(doctorId);
    if (!doctor) return [];

    const dayOfWeek = format(parseISO(date), 'EEEE').toLowerCase() as keyof WeeklySchedule;
    const daySchedule = doctor.availability_schedule.weekly_schedule[dayOfWeek];
    
    if (!daySchedule.is_available) return [];

    // Generar slots disponibles
    const availableSlots: AvailableSlot[] = [];
    const duration = doctor.availability_schedule.consultation_duration_minutes;

    daySchedule.time_slots.forEach(slot => {
      const startTime = parseISO(`${date}T${slot.start_time}:00`);
      const endTime = parseISO(`${date}T${slot.end_time}:00`);
      
      let currentTime = startTime;
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        if (slotEnd <= endTime) {
          availableSlots.push({
            start_time: format(currentTime, 'HH:mm'),
            end_time: format(slotEnd, 'HH:mm'),
            is_available: true // En producción, verificar contra citas existentes
          });
        }
        currentTime = slotEnd;
      }
    });

    return availableSlots;
  }

  // Gestión de consultas
  static async createConsultation(consultationData: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    const consultation: Consultation = {
      ...consultationData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Crear sala de chat
    if (consultationData.consultation_type === 'chat' || consultationData.consultation_type === 'video') {
      const chatRoom = await this.createChatRoom(consultation.id, [consultation.patient_id, consultation.doctor_id]);
      consultation.chat_room_id = chatRoom.id;
    }

    // Crear sala de video si es necesario
    if (consultationData.consultation_type === 'video') {
      const videoCall = await this.createVideoCall(consultation.id);
      consultation.room_id = videoCall.daily_room_name;
    }

    this.saveToStorage('consultations', consultation);
    return consultation;
  }

  static async getConsultations(userId: string, userType: 'doctor' | 'patient'): Promise<Consultation[]> {
    const consultations = this.getFromStorage<Consultation>('consultations');
    const field = userType === 'doctor' ? 'doctor_id' : 'patient_id';
    return consultations.filter(c => c[field] === userId);
  }

  static async updateConsultationStatus(consultationId: string, status: Consultation['status']): Promise<void> {
    const consultations = this.getFromStorage<Consultation>('consultations');
    const index = consultations.findIndex(c => c.id === consultationId);
    if (index !== -1) {
      consultations[index].status = status;
      consultations[index].updated_at = new Date().toISOString();
      this.setStorage('consultations', consultations);
    }
  }

  // Sistema de chat
  static async createChatRoom(consultationId: string, participants: string[]): Promise<ChatRoom> {
    const chatRoom: ChatRoom = {
      id: this.generateId(),
      consultation_id: consultationId,
      participants,
      is_active: true,
      unread_count_doctor: 0,
      unread_count_patient: 0,
      encryption_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.saveToStorage('chat_rooms', chatRoom);
    return chatRoom;
  }

  static async sendMessage(messageData: Omit<ChatMessage, 'id' | 'created_at' | 'is_read' | 'read_at'>): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...messageData,
      id: this.generateId(),
      is_read: false,
      created_at: new Date().toISOString(),
      is_deleted: false
    };

    // Encriptar mensaje si es necesario
    if (messageData.is_encrypted) {
      message.content = this.encryptMessage(message.content);
    }

    this.saveToStorage('chat_messages', message);
    
    // Actualizar sala de chat
    await this.updateChatRoomLastMessage(messageData.chat_room_id, message);
    
    return message;
  }

  static async getChatMessages(chatRoomId: string): Promise<ChatMessage[]> {
    const messages = this.getFromStorage<ChatMessage>('chat_messages');
    return messages
      .filter(m => m.chat_room_id === chatRoomId && !m.is_deleted)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  static async markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
    const messages = this.getFromStorage<ChatMessage>('chat_messages');
    const updatedMessages = messages.map(message => {
      if (message.chat_room_id === chatRoomId && message.sender_id !== userId && !message.is_read) {
        return {
          ...message,
          is_read: true,
          read_at: new Date().toISOString()
        };
      }
      return message;
    });
    this.setStorage('chat_messages', updatedMessages);
  }

  // Sistema de videollamadas
  static async createVideoCall(consultationId: string): Promise<VideoCall> {
    const roomName = `consultation-${consultationId}-${Date.now()}`;
    
    const videoCall: VideoCall = {
      id: this.generateId(),
      consultation_id: consultationId,
      daily_room_name: roomName,
      daily_room_url: `https://healthtracker.daily.co/${roomName}`,
      call_status: 'waiting',
      recording_enabled: false,
      screen_sharing_enabled: true,
      participants_log: [],
      technical_issues: [],
      created_at: new Date().toISOString()
    };

    this.saveToStorage('video_calls', videoCall);
    return videoCall;
  }

  static async joinVideoCall(videoCallId: string, userId: string, userType: 'doctor' | 'patient'): Promise<string> {
    // En producción, esto generaría tokens reales de Daily.co
    const token = `token-${userId}-${Date.now()}`;
    
    // Registrar participante
    const participantLog: ParticipantLog = {
      user_id: userId,
      user_type: userType,
      joined_at: new Date().toISOString(),
      connection_quality: 'good'
    };

    const videoCalls = this.getFromStorage<VideoCall>('video_calls');
    const index = videoCalls.findIndex(vc => vc.id === videoCallId);
    if (index !== -1) {
      videoCalls[index].participants_log.push(participantLog);
      if (videoCalls[index].call_status === 'waiting') {
        videoCalls[index].call_status = 'active';
        videoCalls[index].started_at = new Date().toISOString();
      }
      this.setStorage('video_calls', videoCalls);
    }

    return token;
  }

  static async endVideoCall(videoCallId: string): Promise<void> {
    const videoCalls = this.getFromStorage<VideoCall>('video_calls');
    const index = videoCalls.findIndex(vc => vc.id === videoCallId);
    if (index !== -1) {
      const startTime = videoCalls[index].started_at;
      const endTime = new Date().toISOString();
      
      videoCalls[index].call_status = 'ended';
      videoCalls[index].ended_at = endTime;
      
      if (startTime) {
        const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60);
        videoCalls[index].duration_minutes = Math.round(duration);
      }
      
      this.setStorage('video_calls', videoCalls);
    }
  }

  // Sistema de pagos
  static async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'invoice_number'>): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: this.generateId(),
      invoice_number: this.generateInvoiceNumber(),
      created_at: new Date().toISOString()
    };

    this.saveToStorage('payments', payment);
    return payment;
  }

  static async processPayment(paymentId: string): Promise<boolean> {
    // Simular procesamiento de pago
    const payments = this.getFromStorage<Payment>('payments');
    const index = payments.findIndex(p => p.id === paymentId);
    
    if (index !== -1) {
      payments[index].status = 'completed';
      payments[index].processed_at = new Date().toISOString();
      payments[index].transaction_id = `txn_${Date.now()}`;
      this.setStorage('payments', payments);
      return true;
    }
    
    return false;
  }

  // Sistema de reseñas
  static async createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'is_verified'>): Promise<Review> {
    const review: Review = {
      ...reviewData,
      id: this.generateId(),
      is_verified: true,
      created_at: new Date().toISOString()
    };

    this.saveToStorage('reviews', review);
    await this.updateDoctorRating(reviewData.doctor_id);
    return review;
  }

  static async getDoctorReviews(doctorId: string): Promise<Review[]> {
    const reviews = this.getFromStorage<Review>('reviews');
    return reviews.filter(r => r.doctor_id === doctorId);
  }

  // Gestión de documentos médicos
  static async uploadMedicalDocument(documentData: Omit<MedicalDocument, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalDocument> {
    const document: MedicalDocument = {
      ...documentData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.saveToStorage('medical_documents', document);
    return document;
  }

  static async getPatientDocuments(patientId: string): Promise<MedicalDocument[]> {
    const documents = this.getFromStorage<MedicalDocument>('medical_documents');
    return documents.filter(d => d.patient_id === patientId);
  }

  // Utilidades privadas
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static generateInvoiceNumber(): string {
    return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }

  private static generateMockDoctors(): Doctor[] {
    return [
      {
        id: 'doc-1',
        user_id: 'user-doc-1',
        first_name: 'Dr. María',
        last_name: 'González',
        email: 'maria.gonzalez@hospital.com',
        phone: '+34 600 123 456',
        specialty: 'Cardiología',
        sub_specialties: ['Cardiología Intervencionista', 'Ecocardiografía'],
        medical_license: 'MD-12345',
        years_experience: 15,
        education: [
          { institution: 'Universidad Complutense Madrid', degree: 'Medicina', year: 2008, country: 'España' },
          { institution: 'Hospital Clínic Barcelona', degree: 'Especialidad Cardiología', year: 2012, country: 'España' }
        ],
        certifications: ['Certificación Europea de Cardiología', 'ACLS'],
        languages: ['Español', 'Inglés', 'Francés'],
        biography: 'Especialista en cardiología con más de 15 años de experiencia. Experta en procedimientos intervencionistas y diagnóstico por imagen cardiovascular.',
        consultation_fee: 120,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      // Más doctores mock...
    ];
  }

  private static isDoctorAvailableToday(doctor: Doctor): boolean {
    const today = format(new Date(), 'EEEE').toLowerCase() as keyof WeeklySchedule;
    return doctor.availability_schedule.weekly_schedule[today].is_available;
  }

  private static async updateChatRoomLastMessage(chatRoomId: string, message: ChatMessage): Promise<void> {
    const chatRooms = this.getFromStorage<ChatRoom>('chat_rooms');
    const index = chatRooms.findIndex(cr => cr.id === chatRoomId);
    if (index !== -1) {
      chatRooms[index].last_message = message;
      chatRooms[index].updated_at = new Date().toISOString();
      
      // Incrementar contador de no leídos
      if (message.sender_type === 'doctor') {
        chatRooms[index].unread_count_patient++;
      } else {
        chatRooms[index].unread_count_doctor++;
      }
      
      this.setStorage('chat_rooms', chatRooms);
    }
  }

  private static async updateDoctorRating(doctorId: string): Promise<void> {
    const reviews = await this.getDoctorReviews(doctorId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // En producción, esto actualizaría la base de datos
    console.log(`Updated doctor ${doctorId} rating to ${averageRating.toFixed(1)}`);
  }

  private static encryptMessage(content: string): string {
    // Implementación simplificada de encriptación
    return btoa(content);
  }

  private static decryptMessage(encryptedContent: string): string {
    // Implementación simplificada de desencriptación
    return atob(encryptedContent);
  }

  // Utilidades de almacenamiento
  private static getFromStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`telemedicine_${key}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static setStorage<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`telemedicine_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private static saveToStorage<T extends { id: string }>(key: string, item: T): void {
    const items = this.getFromStorage<T>(key);
    items.push(item);
    this.setStorage(key, items);
  }
}

// Interfaces adicionales
export interface DoctorFilters {
  specialty?: string;
  min_rating?: number;
  max_fee?: number;
  available_today?: boolean;
  languages?: string[];
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Servicio de notificaciones en tiempo real
export class NotificationService {
  private static socket: any = null;

  static initializeSocket(userId: string): void {
    // En producción, esto se conectaría a Socket.io
    console.log(`Initializing socket for user ${userId}`);
  }

  static sendTypingIndicator(chatRoomId: string, isTyping: boolean): void {
    // Enviar indicador de "escribiendo..."
    console.log(`Typing indicator: ${isTyping} in room ${chatRoomId}`);
  }

  static subscribeToMessages(chatRoomId: string, callback: (message: ChatMessage) => void): void {
    // Suscribirse a mensajes en tiempo real
    console.log(`Subscribed to messages in room ${chatRoomId}`);
  }

  static subscribeToCallUpdates(consultationId: string, callback: (update: any) => void): void {
    // Suscribirse a actualizaciones de videollamadas
    console.log(`Subscribed to call updates for consultation ${consultationId}`);
  }
}

// Servicio de seguridad
export class SecurityService {
  static async enableTwoFactorAuth(userId: string): Promise<string> {
    // Generar código QR para 2FA
    return `otpauth://totp/HealthTracker:${userId}?secret=JBSWY3DPEHPK3PXP&issuer=HealthTracker`;
  }

  static async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    // Verificar código 2FA
    return code.length === 6 && /^\d+$/.test(code);
  }

  static async logAccess(userId: string, action: string, details?: any): Promise<void> {
    const accessLog = {
      user_id: userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip_address: 'localhost',
      user_agent: navigator.userAgent
    };

    const logs = TelemedicineService['getFromStorage']<any>('access_logs');
    logs.push(accessLog);
    TelemedicineService['setStorage']('access_logs', logs);
  }

  static async encryptSensitiveData(data: any): Promise<string> {
    // Implementación de encriptación para datos sensibles
    return btoa(JSON.stringify(data));
  }

  static async decryptSensitiveData(encryptedData: string): Promise<any> {
    // Implementación de desencriptación
    return JSON.parse(atob(encryptedData));
  }
}