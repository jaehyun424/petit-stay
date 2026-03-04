// ============================================
// Petit Stay - TypeScript Type Definitions
// ============================================

// ----------------------------------------
// User & Authentication Types
// ----------------------------------------
export type UserRole = 'parent' | 'sitter' | 'hotel_staff' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  hotelId?: string;
  profile: UserProfile;
  parentInfo?: ParentInfo;
  sitterInfo?: SitterInfo;
  notifications: NotificationSettings;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  phoneVerified: boolean;
  avatar?: string;
  preferredLanguage: Language;
  nationality?: string;
}

export interface ParentInfo {
  emergencyContact: string;
  emergencyPhone: string;
}

export interface SitterInfo {
  sitterId: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
}

// ----------------------------------------
// Hotel Types
// ----------------------------------------
export type HotelTier = 'luxury' | 'premium' | 'standard';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';
export type Currency = 'KRW' | 'USD' | 'JPY';

export interface Hotel {
  id: string;
  name: string;
  nameI18n: I18nText;
  tier: HotelTier;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  logo: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: Currency;
  commission: number;
  settings: HotelSettings;
  stats: HotelStats;
  slaMetrics: SLAMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelSettings {
  autoAssign: boolean;
  requireGoldForInfant: boolean;
  maxAdvanceBookingDays: number;
  minBookingHours: number;
  cancellationPolicy: CancellationPolicy;
}

export interface HotelStats {
  totalBookings: number;
  safetyDays: number;
  averageRating: number;
  thisMonthBookings: number;
  thisMonthRevenue: number;
}

export interface SLAMetrics {
  responseRate: number;
  replacementRate: number;
  satisfactionRate: number;
}

// ----------------------------------------
// Sitter Types
// ----------------------------------------
export type SitterTier = 'gold' | 'silver';
export type SitterStatus = 'active' | 'inactive' | 'suspended';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type TrainingStatus = 'pending' | 'completed';
export type CertificationType = 'childcare' | 'first_aid' | 'cpr' | 'hotel_manner';
export type OnboardingStatus = 'applied' | 'documents_submitted' | 'training' | 'quiz_passed' | 'approved' | 'rejected';
export type OnboardingStep = 'basicInfo' | 'documentUpload' | 'trainingVideo' | 'quiz' | 'pendingApproval';

export interface Sitter {
  id: string;
  userId: string;
  tier: SitterTier;
  status: SitterStatus;
  profile: SitterProfile;
  certifications: Certification[];
  verification: SitterVerification;
  availability: WeeklyAvailability;
  pricing: SitterPricing;
  stats: SitterStats;
  bankInfo: BankInfo;
  partnerHotels: string[];
  onboarding?: SitterOnboarding;
  createdAt: Date;
  updatedAt: Date;
}

export interface SitterOnboarding {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  documents: OnboardingDocument[];
  trainingCompleted: boolean;
  quizScore?: number;
  quizPassedAt?: Date;
  appliedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface OnboardingDocument {
  type: 'id_card' | 'certificate' | 'background_check' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface SitterProfile {
  displayName: string;
  bio: string;
  bioI18n?: Partial<I18nText>;
  avatar: string;
  languages: string[];
  experience: number;
  specialties: string[];
}

export interface Certification {
  type: CertificationType;
  name: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  documentUrl?: string;
}

export interface SitterVerification {
  identity: VerificationStatus;
  background: VerificationStatus;
  training: TrainingStatus;
  verifiedAt?: Date;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
  nightShift: boolean;
  holidayAvailable: boolean;
}

export interface SitterPricing {
  hourlyRate: number;
  nightMultiplier: number;
  holidayMultiplier: number;
}

export interface SitterStats {
  totalSessions: number;
  totalHours: number;
  averageRating: number;
  ratingCount: number;
  safetyRecord: number;
  noShowCount: number;
  repeatClientRate: number;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// ----------------------------------------
// Child Types
// ----------------------------------------
export type Gender = 'male' | 'female' | 'other';

export interface Child {
  id: string;
  parentId: string;
  firstName: string;
  age: number;
  gender: Gender;
  allergies: string[];
  medicalNotes?: string;
  specialNeeds?: string;
  favoriteActivities?: string[];
  sleepSchedule?: string;
  dietaryRestrictions?: string[];
  emergencyMedication?: EmergencyMedication;
  consentGiven: boolean;
  consentTimestamp: Date;
  autoDeleteAt: Date;
  createdAt: Date;
}

export interface EmergencyMedication {
  name: string;
  dosage: string;
  instructions: string;
}

// ----------------------------------------
// Booking Types
// ----------------------------------------
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending_guest_consent' | 'pending_assignment' | 'sitter_assigned' | 'sitter_confirmed' | 'issue_reported';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
export type PaymentMethodType = 'card' | 'hotel_billing';

export interface PaymentMethodCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}
export type RefundStatus = 'full' | 'partial' | 'none';
export type BookingSource = 'concierge' | 'parent_app' | 'website';
export type LocationType = 'room' | 'kids_room';
export type RequiredSitterTier = 'any' | 'gold';

export interface Booking {
  id: string;
  hotelId: string;
  parentId: string;
  sitterId?: string;
  confirmationCode: string;
  status: BookingStatus;
  schedule: BookingSchedule;
  location: BookingLocation;
  children: BookingChild[];
  requirements: BookingRequirements;
  pricing: BookingPricing;
  payment: PaymentInfo;
  trustProtocol: TrustProtocolData;
  cancellation?: CancellationInfo;
  review?: ReviewData;
  guestTokenId?: string;
  guestConsent?: GuestConsent;
  guestInfo?: { name: string; email: string; phone: string; nationality: string };
  statusHistory?: { status: BookingStatus; timestamp: Date; changedBy: string }[];
  metadata: BookingMetadata;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface BookingSchedule {
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
}

export interface BookingLocation {
  type: LocationType;
  roomNumber?: string;
  kidsRoomName?: string;
  floorNumber?: number;
}

export interface BookingChild {
  childId: string;
  firstName: string;
  age: number;
  allergies?: string[];
}

export interface BookingRequirements {
  sitterTier: RequiredSitterTier;
  preferredLanguages: string[];
  specialRequests?: string;
}

export interface BookingPricing {
  baseRate: number;
  hours: number;
  baseTotal: number;
  nightSurcharge: number;
  holidaySurcharge: number;
  goldSurcharge: number;
  subtotal: number;
  commission: number;
  total: number;
}

export interface PaymentInfo {
  status: PaymentStatus;
  method: PaymentMethodType;
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface TrustProtocolData {
  safeWord: string;
  checkIn?: CheckInData;
  checkOut?: CheckOutData;
}

export interface CheckInData {
  timestamp: Date;
  sitterVerified: boolean;
  parentVerified: boolean;
  roomSafetyChecked: boolean;
  childConditionNoted: boolean;
  emergencyConsentSigned: boolean;
  signatures: SignatureData;
}

export interface CheckOutData {
  timestamp: Date;
  childConditionNoted: boolean;
  itemsReturned: boolean;
  parentSatisfied: boolean;
  signatures: SignatureData;
}

export interface SignatureData {
  parent: string;
  sitter: string;
}

export interface CancellationInfo {
  cancelledBy: 'parent' | 'sitter' | 'hotel' | 'system';
  reason: string;
  timestamp: Date;
  refundStatus: RefundStatus;
  refundAmount: number;
  penaltyApplied: boolean;
}

export interface ReviewData {
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: Date;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  message: string;
  createdAt: Date;
}

export interface BookingMetadata {
  source: BookingSource;
  deviceType?: string;
  ipAddress?: string;
}

// ----------------------------------------
// Care Session Types
// ----------------------------------------
export type SessionStatus = 'preparing' | 'checked_in' | 'active' | 'paused' | 'completed' | 'emergency';
export type TimelineEventType = 'check_in' | 'activity' | 'meal' | 'nap' | 'diaper' | 'note' | 'photo' | 'emergency' | 'check_out';

export interface CareSession {
  id: string;
  bookingId: string;
  hotelId: string;
  sitterId: string;
  parentId: string;
  status: SessionStatus;
  timeline: TimelineEvent[];
  checklist: SessionChecklist;
  emergencyLog: EmergencyLogEntry[];
  actualTimes: ActualTimes;
  extension?: ExtensionRequest;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  description: string;
  descriptionI18n?: Partial<I18nText>;
  mediaUrl?: string;
  isPrivate: boolean;
}

export interface SessionChecklist {
  roomSafety: RoomSafetyChecklist;
  childInfo: ChildInfoChecklist;
  supplies: SuppliesChecklist;
}

export interface RoomSafetyChecklist {
  windowsSecured: boolean;
  balconyLocked: boolean;
  hazardsRemoved: boolean;
  emergencyExitKnown: boolean;
}

export interface ChildInfoChecklist {
  allergiesConfirmed: boolean;
  medicationNoted: boolean;
  sleepScheduleNoted: boolean;
}

export interface SuppliesChecklist {
  diapersProvided: boolean;
  snacksProvided: boolean;
  toysAvailable: boolean;
  emergencyKitReady: boolean;
}

export interface EmergencyLogEntry {
  id: string;
  severity: IncidentSeverity;
  type: IncidentType;
  description: string;
  actionsTaken: string[];
  notifiedParent: boolean;
  notifiedHotel: boolean;
  notified119: boolean;
  timestamp: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface ActualTimes {
  checkInAt?: Date;
  startedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  completedAt?: Date;
}

export interface ExtensionRequest {
  requestedAt: Date;
  additionalMinutes: number;
  approvedByParent: boolean;
  additionalCharge: number;
}

// ----------------------------------------
// Incident Types
// ----------------------------------------
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 'injury' | 'illness' | 'property_damage' | 'complaint' | 'safety_concern' | 'other';
export type IncidentResolutionStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type SitterAction = 'none' | 'warning' | 'retraining' | 'suspension' | 'termination';

export interface Incident {
  id: string;
  bookingId: string;
  sessionId: string;
  hotelId: string;
  sitterId: string;
  parentId: string;
  severity: IncidentSeverity;
  category: IncidentType;
  report: IncidentReport;
  response: IncidentResponse;
  resolution: IncidentResolution;
  documentation: IncidentDocumentation;
  followUp: IncidentFollowUp;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentReport {
  summary: string;
  details: string;
  reportedBy: 'sitter' | 'parent' | 'hotel' | 'system';
  reportedAt: Date;
}

export interface IncidentResponse {
  firstResponseAt?: Date;
  respondedBy?: string;
  actions: IncidentAction[];
}

export interface IncidentAction {
  action: string;
  takenBy: string;
  timestamp: Date;
}

export interface IncidentResolution {
  status: IncidentResolutionStatus;
  outcome?: string;
  compensationProvided?: boolean;
  compensationAmount?: number;
  insuranceClaimed?: boolean;
  insuranceClaimId?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface IncidentDocumentation {
  photos: string[];
  medicalReports: string[];
  witnessStatements: string[];
  internalNotes: string[];
}

export interface IncidentFollowUp {
  parentContacted: boolean;
  parentSatisfied?: boolean;
  preventiveMeasures?: string[];
  sitterAction?: SitterAction;
}

// ----------------------------------------
// Notification Types
// ----------------------------------------
export type NotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'sitter_assigned'
  | 'care_started'
  | 'care_completed'
  | 'emergency'
  | 'review_received'
  | 'payment_received'
  | 'general';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// ----------------------------------------
// Guest Token Types
// ----------------------------------------
export interface GuestToken {
  id: string;
  bookingId: string;
  hotelId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface GuestConsent {
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToLiability: boolean;
  signatureDataUrl?: string;
  consentedAt: Date;
  ipAddress?: string;
}

// ----------------------------------------
// Settlement Types
// ----------------------------------------
export type SettlementStatus = 'draft' | 'pending_approval' | 'approved' | 'paid';

export interface Settlement {
  id: string;
  hotelId: string;
  hotelName: string;
  period: { start: Date; end: Date };
  totalBookings: number;
  totalRevenue: number;
  commission: number;
  commissionRate: number;
  netPayout: number;
  status: SettlementStatus;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface SitterPayout {
  id: string;
  sitterId: string;
  sitterName: string;
  period: { start: Date; end: Date };
  totalSessions: number;
  totalHours: number;
  grossAmount: number;
  deductions: number;
  netPayout: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  createdAt: Date;
}

// ----------------------------------------
// Utility Types
// ----------------------------------------
export type Language = 'en' | 'ko' | 'ja' | 'zh';

export interface I18nText {
  en: string;
  ko: string;
  ja: string;
  zh: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ----------------------------------------
// Form & UI Types
// ----------------------------------------
export interface SelectOption {
  value: string;
  label: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// ----------------------------------------
// Dashboard Stats Types
// ----------------------------------------
export interface DashboardStats {
  todayBookings: number;
  activeNow: number;
  completedToday: number;
  todayRevenue: number;
  safetyDays: number;
  pendingBookings: number;
}

export interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}
