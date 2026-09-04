export type Language = "en" | "hi" | "bn";

export interface VitalReading {
  id: string;
  type: "bp" | "hr" | "spo2" | "sugar" | "weight";
  value: string;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "alert";
  note?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: "Morning" | "Afternoon" | "Evening" | "Night" | "Before Food" | "After Food";
  takenToday: boolean;
  instructions: string;
  scheduledTime?: string; // e.g. "08:00 AM", "01:30 PM", "08:00 PM"
  remainingPills?: number;
  totalPills?: number;
  critical?: boolean; // Critical medicine that alerts caregiver if missed (e.g. BP, Insulin)
  snoozedUntil?: number; // timestamp in ms
}

export interface SmartHealthAlert {
  id: string;
  type: "BP_HIGH" | "BP_LOW" | "SUGAR_HIGH" | "SUGAR_LOW" | "SPO2_LOW" | "HR_HIGH" | "HR_LOW" | "MISSED_CHECKUP";
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  vitalType: "bp" | "sugar" | "spo2" | "hr" | "general";
  currentValue: string;
  safeThreshold: string;
  timestamp: string;
  message: string;
  immediateAction: string[];
  suggestedDoctorSpeciality: string;
  caregiverNotified: boolean;
  isDismissed: boolean;
}

export interface SmartMedicationAlert {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  timingCategory: "Morning" | "Afternoon" | "Evening" | "Night";
  status: "DUE_NOW" | "MISSED" | "TAKEN" | "SNOOZED" | "UPCOMING";
  instructions: string;
  critical: boolean;
  remainingPills?: number;
  caregiverEscalated: boolean;
  minutesOverdue?: number;
}

export interface DailyCheckin {
  id: string;
  date: string;
  mood: "great" | "good" | "okay" | "low" | "sad";
  symptoms: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "mitra";
  text: string;
  timestamp: string;
  emergencyFlag?: boolean;
  doctorQuestions?: string[];
}

export interface ReportParameter {
  name: string;
  value: string;
  standardRange: string;
  status: "Normal" | "Borderline" | "Elevated" | "Low" | "Requires Attention";
  explanation: string;
}

export interface ReportAnalysisResult {
  title: string;
  overview: string;
  parameters: ReportParameter[];
  doctorQuestions: string[];
  lifestyleAdvice: string[];
}

export interface SymptomAssessmentResult {
  triage_level: "Mild / Routine" | "Moderate / Schedule Doctor" | "Emergency / Urgent";
  summary: string;
  care_recommendations: string[];
  doctor_questions: string[];
  red_flags: string[];
}

export interface DoctorVisitPrepData {
  summaryTitle: string;
  keyVitalsSnapshot: string;
  chiefComplaints: string[];
  medicationsList: string[];
  topQuestionsForDoctor: string[];
  checklist: string[];
}

export interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar: string;
  isEmergencyContact: boolean;
  email?: string;
  liveLocationAccess?: boolean;
  geofenceAlerts?: boolean;
  priorityOrder?: number;
}

export interface GuardianEmergencyAlert {
  id: string;
  timestamp: string;
  severity: "CRITICAL_SOS" | "FALL_DETECTED" | "VITALS_ALERT" | "ASSISTANCE_NEEDED";
  status: "DISPATCHED" | "ACKNOWLEDGED_BY_GUARDIAN" | "RESPONDER_EN_ROUTE" | "RESOLVED";
  patientName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracyMeters: number;
    mapUrl: string;
    batteryLevel: number;
    timestamp: string;
  };
  vitalsSnapshot?: {
    bp: string;
    hr: string;
    spo2: string;
    sugar: string;
  };
  message: string;
  dispatchedTo: string[];
  acknowledgedBy?: string;
  etaMinutes?: number;
  timeline: {
    step: string;
    time: string;
    detail: string;
    icon?: string;
  }[];
}

export interface PatientLocationState {
  lat: number;
  lng: number;
  address: string;
  lastUpdated: string;
  isTracking: boolean;
  accuracyMeters: number;
  geofenceStatus: "INSIDE_HOME_ZONE" | "OUTSIDE_SAFE_ZONE" | "NEAR_HOSPITAL" | "IN_COMMUNITY_PARK";
  batteryLevel: number;
  movementState: "STATIONARY" | "WALKING" | "IN_VEHICLE";
  speedKmh?: number;
  nearbyHospitals: {
    name: string;
    distanceKm: number;
    phone: string;
    timeMin: number;
    type: string;
  }[];
}

export interface CaretakerDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  relation: string;
  isPrimary: boolean;
}

export interface ElderlyProfile {
  id?: string;
  role?: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  basicHealthInfo: string;
  allergies?: string;
  passionsLifestyle: string;
  caretakers: CaretakerDetail[];
  isRegistered: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  date: string;
  time: string;
  reason: string;
  patientName: string;
  patientEmail: string;
  status: "Requested" | "Upcoming" | "Completed" | "Cancelled";
  ownerId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface NearbyDoctor {
  id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: string;
  phone: string;
  hospital: string;
  distance: string;
  availableTime: string;
  rating: number;
  consultationFee: string;
}

export interface NearbyHospital {
  id: string;
  name: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  distance: string;
  icuAvailable: boolean;
  ambulanceAvailable: boolean;
  type: string;
}

export interface NearbyMedicineShop {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  distance: string;
  isOpen24x7: boolean;
  homeDelivery: boolean;
  discount: string;
}

export interface SchemeInfo {
  id: string;
  name: string;
  category: string;
  coverage: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
  contact: string;
  officialUrl: string;
}

export interface HealthCheck {
  id: string;
  symptoms: string;
  age?: number;
  gender?: string;
  duration?: string;
  severity?: string;
  summary?: string;
  urgency?: string;
  urgencyColor?: string;
  possibleCauses?: string[];
  careTips?: string[];
  recommendedSpecialties?: string[];
  redFlagWarnings?: string[];
  createdAt?: any;
  ownerId?: string;
}
