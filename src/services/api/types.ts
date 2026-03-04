// ============================================
// Petit Stay - OTA/PMS API Types
// ============================================

// ----------------------------------------
// API Authentication
// ----------------------------------------
export interface ApiKeyHeader {
  'x-api-key': string;
  'x-signature': string;
  'x-timestamp': string;
}

// ----------------------------------------
// Pagination
// ----------------------------------------
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ----------------------------------------
// Booking API Types
// ----------------------------------------
export interface ApiBooking {
  id: string;
  hotelId: string;
  confirmationCode: string;
  status: string;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    timezone: string;
  };
  location: {
    type: 'room' | 'kids_room';
    roomNumber?: string;
    kidsRoomName?: string;
  };
  children: Array<{
    firstName: string;
    age: number;
    allergies?: string[];
  }>;
  requirements: {
    sitterTier: 'any' | 'gold';
    preferredLanguages: string[];
    specialRequests?: string;
  };
  pricing: {
    baseRate: number;
    hours: number;
    total: number;
    currency: string;
  };
  sitterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  hotelId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    timezone?: string;
  };
  location: {
    type: 'room' | 'kids_room';
    roomNumber?: string;
    kidsRoomName?: string;
  };
  children: Array<{
    firstName: string;
    age: number;
    allergies?: string[];
  }>;
  requirements?: {
    sitterTier?: 'any' | 'gold';
    preferredLanguages?: string[];
    specialRequests?: string;
  };
  externalReference?: string;
}

export interface UpdateBookingRequest {
  status?: 'confirmed' | 'cancelled';
  schedule?: {
    date?: string;
    startTime?: string;
    endTime?: string;
  };
  location?: {
    roomNumber?: string;
  };
  cancellation?: {
    reason: string;
    cancelledBy: 'hotel' | 'parent' | 'system';
  };
}

// ----------------------------------------
// Availability API Types
// ----------------------------------------
export interface AvailabilityQuery {
  hotelId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  sitterTier?: 'any' | 'gold';
}

export interface AvailabilityResponse {
  hotelId: string;
  date: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  availableSitters: number;
  tiers: {
    gold: number;
    silver: number;
  };
}

// ----------------------------------------
// Hotel API Types
// ----------------------------------------
export interface ApiHotel {
  id: string;
  name: string;
  tier: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: string;
  settings: {
    autoAssign: boolean;
    maxAdvanceBookingDays: number;
    minBookingHours: number;
    cancellationPolicy: string;
  };
}

// ----------------------------------------
// Webhook Types
// ----------------------------------------
export type WebhookEventType =
  | 'check_in'
  | 'check_out'
  | 'booking_created'
  | 'booking_cancelled'
  | 'room_change'
  | 'guest_update';

export interface WebhookEvent {
  event: WebhookEventType;
  timestamp: string;
  data: WebhookCheckIn | WebhookCheckOut | WebhookBookingCreated | WebhookBookingCancelled | WebhookRoomChange | WebhookGuestUpdate;
  externalReference?: string;
}

export interface WebhookCheckIn {
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfChildren?: number;
}

export interface WebhookCheckOut {
  guestName: string;
  roomNumber: string;
  checkOutDate: string;
}

export interface WebhookBookingCreated {
  bookingId: string;
  guestName: string;
  roomNumber: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  children: Array<{
    firstName: string;
    age: number;
  }>;
}

export interface WebhookBookingCancelled {
  bookingId: string;
  reason: string;
}

export interface WebhookRoomChange {
  guestName: string;
  oldRoom: string;
  newRoom: string;
}

export interface WebhookGuestUpdate {
  guestName: string;
  roomNumber: string;
  updatedFields: Record<string, unknown>;
}

// ----------------------------------------
// API Error Response
// ----------------------------------------
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
  timestamp: string;
}

// ----------------------------------------
// API Success Response (single item)
// ----------------------------------------
export interface ApiResponse<T> {
  data: T;
  requestId: string;
  timestamp: string;
}
