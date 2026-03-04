// ============================================
// Petit Stay - OTA/PMS API Client
// Frontend client for testing and admin use
// ============================================

import type {
  ApiBooking,
  ApiHotel,
  ApiResponse,
  AvailabilityQuery,
  AvailabilityResponse,
  CreateBookingRequest,
  PaginatedApiResponse,
  PaginationParams,
  UpdateBookingRequest,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ----------------------------------------
// HMAC Signature Generation
// ----------------------------------------
async function generateHmacSignature(
  secret: string,
  timestamp: string,
  body: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(`${timestamp}.${body}`);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ----------------------------------------
// API Client Class
// ----------------------------------------
export class PetitStayApiClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(apiKey: string, apiSecret: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = await generateHmacSignature(
      this.apiSecret,
      timestamp,
      bodyStr
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-signature': signature,
      'x-timestamp': timestamp,
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: bodyStr || undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { code: 'UNKNOWN', message: response.statusText },
      }));
      throw new ApiClientError(
        error.error?.message || response.statusText,
        error.error?.code || 'UNKNOWN',
        response.status
      );
    }

    return response.json();
  }

  // ----------------------------------------
  // Hotels
  // ----------------------------------------
  async getHotels(): Promise<PaginatedApiResponse<ApiHotel>> {
    return this.request('GET', '/hotels');
  }

  async getHotel(hotelId: string): Promise<ApiResponse<ApiHotel>> {
    return this.request('GET', `/hotels/${hotelId}`);
  }

  // ----------------------------------------
  // Availability
  // ----------------------------------------
  async getAvailability(
    params: AvailabilityQuery
  ): Promise<ApiResponse<AvailabilityResponse>> {
    const qs = new URLSearchParams();
    qs.set('hotelId', params.hotelId);
    qs.set('date', params.date);
    if (params.startTime) qs.set('startTime', params.startTime);
    if (params.endTime) qs.set('endTime', params.endTime);
    if (params.sitterTier) qs.set('sitterTier', params.sitterTier);
    return this.request('GET', `/availability?${qs.toString()}`);
  }

  // ----------------------------------------
  // Bookings
  // ----------------------------------------
  async getBookings(
    params?: PaginationParams & { hotelId?: string; dateFrom?: string; dateTo?: string }
  ): Promise<PaginatedApiResponse<ApiBooking>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.pageSize) qs.set('pageSize', params.pageSize.toString());
    if (params?.hotelId) qs.set('hotelId', params.hotelId);
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params?.dateTo) qs.set('dateTo', params.dateTo);
    const query = qs.toString();
    return this.request('GET', `/bookings${query ? `?${query}` : ''}`);
  }

  async getBooking(bookingId: string): Promise<ApiResponse<ApiBooking>> {
    return this.request('GET', `/bookings/${bookingId}`);
  }

  async createBooking(
    booking: CreateBookingRequest
  ): Promise<ApiResponse<ApiBooking>> {
    return this.request('POST', '/bookings', booking);
  }

  async updateBooking(
    bookingId: string,
    update: UpdateBookingRequest
  ): Promise<ApiResponse<ApiBooking>> {
    return this.request('PATCH', `/bookings/${bookingId}`, update);
  }
}

// ----------------------------------------
// Error Class
// ----------------------------------------
export class ApiClientError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
