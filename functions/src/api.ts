// ============================================
// Petit Stay - OTA/PMS REST API
// Express-based API router for external integrations
// ============================================

import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as cors from "cors";
import * as crypto from "crypto";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// ----------------------------------------
// Types
// ----------------------------------------
interface ApiKeyDoc {
  key: string;
  hotelId: string;
  secret: string;
  permissions: string[];
  rateLimit: number;
  active: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface AuthenticatedRequest extends Request {
  apiKey?: ApiKeyDoc;
  requestId?: string;
}

// ----------------------------------------
// In-memory rate limit store
// ----------------------------------------
const rateLimitStore = new Map<string, RateLimitEntry>();

// ----------------------------------------
// Helpers
// ----------------------------------------
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function apiResponse<T>(data: T, requestId: string) {
  return {
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

function apiError(code: string, message: string, requestId: string, details?: Record<string, unknown>) {
  return {
    error: { code, message, details },
    requestId,
    timestamp: new Date().toISOString(),
  };
}

function convertBookingToApi(id: string, booking: FirebaseFirestore.DocumentData) {
  const schedule = booking.schedule || {};
  const scheduleDate = schedule.date?.toDate
    ? schedule.date.toDate().toISOString().split("T")[0]
    : schedule.date || "";

  return {
    id,
    hotelId: booking.hotelId || "",
    confirmationCode: booking.confirmationCode || "",
    status: booking.status || "pending",
    schedule: {
      date: scheduleDate,
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      duration: schedule.duration || 0,
      timezone: schedule.timezone || "Asia/Seoul",
    },
    location: {
      type: booking.location?.type || "room",
      roomNumber: booking.location?.roomNumber,
      kidsRoomName: booking.location?.kidsRoomName,
    },
    children: (booking.children || []).map((c: Record<string, unknown>) => ({
      firstName: c.firstName || "",
      age: c.age || 0,
      allergies: c.allergies || [],
    })),
    requirements: {
      sitterTier: booking.requirements?.sitterTier || "any",
      preferredLanguages: booking.requirements?.preferredLanguages || [],
      specialRequests: booking.requirements?.specialRequests,
    },
    pricing: {
      baseRate: booking.pricing?.baseRate || 0,
      hours: booking.pricing?.hours || 0,
      total: booking.pricing?.total || 0,
      currency: "KRW",
    },
    sitterId: booking.sitterId || undefined,
    createdAt: booking.createdAt?.toDate?.()?.toISOString() || "",
    updatedAt: booking.updatedAt?.toDate?.()?.toISOString() || "",
  };
}

function convertHotelToApi(id: string, hotel: FirebaseFirestore.DocumentData) {
  return {
    id,
    name: hotel.name || "",
    tier: hotel.tier || "standard",
    address: hotel.address || "",
    contactEmail: hotel.contactEmail || "",
    contactPhone: hotel.contactPhone || "",
    timezone: hotel.timezone || "Asia/Seoul",
    currency: hotel.currency || "KRW",
    settings: {
      autoAssign: hotel.settings?.autoAssign || false,
      maxAdvanceBookingDays: hotel.settings?.maxAdvanceBookingDays || 30,
      minBookingHours: hotel.settings?.minBookingHours || 2,
      cancellationPolicy: hotel.settings?.cancellationPolicy || "moderate",
    },
  };
}

// ============================================
// Middleware
// ============================================

// Attach request ID
function attachRequestId(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  req.requestId = generateRequestId();
  next();
}

// Validate API Key
async function validateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKeyValue = req.headers["x-api-key"] as string;
  if (!apiKeyValue) {
    res.status(401).json(apiError("UNAUTHORIZED", "Missing x-api-key header", req.requestId || ""));
    return;
  }

  try {
    const snapshot = await db
      .collection("apiKeys")
      .where("key", "==", apiKeyValue)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(401).json(apiError("UNAUTHORIZED", "Invalid or inactive API key", req.requestId || ""));
      return;
    }

    req.apiKey = snapshot.docs[0].data() as ApiKeyDoc;
    next();
  } catch (err) {
    console.error("API key validation error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to validate API key", req.requestId || ""));
  }
}

// Validate HMAC Signature
function validateHmacSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const signature = req.headers["x-signature"] as string;
  const timestamp = req.headers["x-timestamp"] as string;

  if (!signature || !timestamp) {
    res.status(401).json(apiError("UNAUTHORIZED", "Missing x-signature or x-timestamp header", req.requestId || ""));
    return;
  }

  // Reject requests older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || Math.abs(now - reqTime) > 300) {
    res.status(401).json(apiError("UNAUTHORIZED", "Request timestamp expired (5 min window)", req.requestId || ""));
    return;
  }

  const secret = req.apiKey?.secret;
  if (!secret) {
    res.status(401).json(apiError("UNAUTHORIZED", "API key missing secret", req.requestId || ""));
    return;
  }

  // For GET requests with no body, use empty string
  const body = req.method === "GET" || !req.body || Object.keys(req.body).length === 0
    ? ""
    : JSON.stringify(req.body);
  const payload = `${timestamp}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    res.status(401).json(apiError("UNAUTHORIZED", "Invalid HMAC signature", req.requestId || ""));
    return;
  }

  next();
}

// Rate Limiter (in-memory, per API key)
function rateLimiter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const key = req.apiKey?.key || "unknown";
  const maxRequests = req.apiKey?.rateLimit || 60;
  const windowMs = 60 * 1000; // 1 minute window

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
    next();
    return;
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", remaining);

  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json(apiError("RATE_LIMITED", "Too many requests. Please retry later.", req.requestId || ""));
    return;
  }

  next();
}

// Error handler
function errorHandler(err: Error, req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  console.error("API Error:", err);
  res.status(500).json(apiError("INTERNAL_ERROR", "An unexpected error occurred", req.requestId || ""));
}

// ============================================
// Express App
// ============================================
export const app = express();

// Restrict CORS to known origins
const ALLOWED_ORIGINS = [
  "https://petit-stay.web.app",
  "https://petit-stay.firebaseapp.com",
  "https://petitstay.com",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173", "http://localhost:3000"] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use(attachRequestId);

// Apply auth + rate limiting to all /api/v1 routes
const apiRouter = express.Router();
apiRouter.use(validateApiKey);
apiRouter.use(validateHmacSignature);
apiRouter.use(rateLimiter);

// ----------------------------------------
// GET /api/v1/hotels — List hotels
// ----------------------------------------
apiRouter.get("/hotels", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hotelId = req.apiKey?.hotelId;

    if (hotelId) {
      // Scoped to single hotel
      const hotelDoc = await db.collection("hotels").doc(hotelId).get();
      if (!hotelDoc.exists) {
        res.status(404).json(apiError("NOT_FOUND", "Hotel not found", req.requestId || ""));
        return;
      }
      res.json({
        data: [convertHotelToApi(hotelDoc.id, hotelDoc.data()!)],
        pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
      });
      return;
    }

    // Admin key — list all hotels
    const snapshot = await db.collection("hotels").orderBy("name").limit(50).get();
    const hotels = snapshot.docs.map((doc) => convertHotelToApi(doc.id, doc.data()));
    res.json({
      data: hotels,
      pagination: { page: 1, pageSize: 50, total: hotels.length, totalPages: 1 },
    });
  } catch (err) {
    console.error("GET /hotels error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to fetch hotels", req.requestId || ""));
  }
});

// ----------------------------------------
// GET /api/v1/hotels/:id — Single hotel
// ----------------------------------------
apiRouter.get("/hotels/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== id) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this hotel", req.requestId || ""));
      return;
    }

    const hotelDoc = await db.collection("hotels").doc(id).get();
    if (!hotelDoc.exists) {
      res.status(404).json(apiError("NOT_FOUND", "Hotel not found", req.requestId || ""));
      return;
    }

    res.json(apiResponse(convertHotelToApi(hotelDoc.id, hotelDoc.data()!), req.requestId || ""));
  } catch (err) {
    console.error("GET /hotels/:id error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to fetch hotel", req.requestId || ""));
  }
});

// ----------------------------------------
// GET /api/v1/availability — Check sitter availability
// ----------------------------------------
apiRouter.get("/availability", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hotelId = (req.query.hotelId as string) || req.apiKey?.hotelId;
    const date = req.query.date as string;

    if (!hotelId || !date) {
      res.status(400).json(apiError("BAD_REQUEST", "hotelId and date are required", req.requestId || ""));
      return;
    }

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== hotelId) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this hotel", req.requestId || ""));
      return;
    }

    const sitterTier = req.query.sitterTier as string;

    // Fetch active sitters for this hotel
    const sittersSnap = await db
      .collection("sitters")
      .where("partnerHotels", "array-contains", hotelId)
      .where("status", "==", "active")
      .get();

    // Map day of week
    const dateObj = new Date(date + "T00:00:00");
    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = dayMap[dateObj.getDay()];

    // Aggregate availability slots
    const slotMap = new Map<string, { gold: number; silver: number }>();

    for (const doc of sittersSnap.docs) {
      const sitter = doc.data();
      if (sitterTier === "gold" && sitter.tier !== "gold") continue;

      const daySlots = sitter.availability?.[dayKey];
      if (!Array.isArray(daySlots)) continue;

      for (const slot of daySlots) {
        const key = `${slot.start}-${slot.end}`;
        const existing = slotMap.get(key) || { gold: 0, silver: 0 };
        if (sitter.tier === "gold") existing.gold++;
        else existing.silver++;
        slotMap.set(key, existing);
      }
    }

    const slots = Array.from(slotMap.entries()).map(([key, tiers]) => {
      const [startTime, endTime] = key.split("-");
      return {
        startTime,
        endTime,
        availableSitters: tiers.gold + tiers.silver,
        tiers,
      };
    });

    res.json(apiResponse({ hotelId, date, slots }, req.requestId || ""));
  } catch (err) {
    console.error("GET /availability error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to check availability", req.requestId || ""));
  }
});

// ----------------------------------------
// GET /api/v1/bookings — List bookings
// ----------------------------------------
apiRouter.get("/bookings", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hotelId = (req.query.hotelId as string) || req.apiKey?.hotelId;
    if (!hotelId) {
      res.status(400).json(apiError("BAD_REQUEST", "hotelId is required", req.requestId || ""));
      return;
    }

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== hotelId) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this hotel", req.requestId || ""));
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string, 10) || 20, 100);
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    let q = db
      .collection("bookings")
      .where("hotelId", "==", hotelId)
      .orderBy("createdAt", "desc");

    if (dateFrom) {
      q = q.where("schedule.date", ">=", new Date(dateFrom));
    }
    if (dateTo) {
      q = q.where("schedule.date", "<=", new Date(dateTo));
    }

    // Get total count (limited to 1000 for performance)
    const countSnap = await q.limit(1000).get();
    const total = countSnap.size;

    // Paginate
    const offset = (page - 1) * pageSize;
    const snapshot = await q.offset(offset).limit(pageSize).get();

    const bookings = snapshot.docs.map((doc) => convertBookingToApi(doc.id, doc.data()));

    res.json({
      data: bookings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("GET /bookings error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to fetch bookings", req.requestId || ""));
  }
});

// ----------------------------------------
// POST /api/v1/bookings — Create booking from PMS
// ----------------------------------------
apiRouter.post("/bookings", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.hotelId || !body.schedule?.date || !body.schedule?.startTime || !body.schedule?.endTime) {
      res.status(400).json(apiError("BAD_REQUEST", "hotelId, schedule.date, schedule.startTime, schedule.endTime are required", req.requestId || ""));
      return;
    }

    if (!body.children || !Array.isArray(body.children) || body.children.length === 0) {
      res.status(400).json(apiError("BAD_REQUEST", "At least one child is required", req.requestId || ""));
      return;
    }

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== body.hotelId) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this hotel", req.requestId || ""));
      return;
    }

    // Generate confirmation code
    const confirmationCode = `KCP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Calculate duration
    const [startH, startM] = (body.schedule.startTime as string).split(":").map(Number);
    const [endH, endM] = (body.schedule.endTime as string).split(":").map(Number);
    const duration = (endH * 60 + endM - startH * 60 - startM) / 60;

    const bookingData = {
      hotelId: body.hotelId,
      parentId: "",
      confirmationCode,
      status: "pending",
      schedule: {
        date: new Date(body.schedule.date),
        startTime: body.schedule.startTime,
        endTime: body.schedule.endTime,
        duration: Math.max(duration, 0),
        timezone: body.schedule.timezone || "Asia/Seoul",
      },
      location: {
        type: body.location?.type || "room",
        roomNumber: body.location?.roomNumber || "",
        kidsRoomName: body.location?.kidsRoomName || "",
      },
      children: body.children.map((c: Record<string, unknown>) => ({
        childId: "",
        firstName: c.firstName || "",
        age: c.age || 0,
        allergies: c.allergies || [],
      })),
      requirements: {
        sitterTier: body.requirements?.sitterTier || "any",
        preferredLanguages: body.requirements?.preferredLanguages || [],
        specialRequests: body.requirements?.specialRequests || "",
      },
      pricing: {
        baseRate: 0,
        hours: Math.max(duration, 0),
        baseTotal: 0,
        nightSurcharge: 0,
        holidaySurcharge: 0,
        goldSurcharge: 0,
        subtotal: 0,
        commission: 0,
        total: 0,
      },
      payment: {
        status: "pending",
        method: "card",
      },
      trustProtocol: {
        safeWord: crypto.randomBytes(3).toString("hex"),
      },
      metadata: {
        source: "website" as const,
        externalReference: body.externalReference || "",
      },
      guestInfo: {
        name: body.parentName || "",
        email: body.parentEmail || "",
        phone: body.parentPhone || "",
        nationality: "",
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const bookingRef = await db.collection("bookings").add(bookingData);

    // Fetch back to get server timestamps
    const created = await bookingRef.get();
    res.status(201).json(apiResponse(convertBookingToApi(bookingRef.id, created.data()!), req.requestId || ""));
  } catch (err) {
    console.error("POST /bookings error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to create booking", req.requestId || ""));
  }
});

// ----------------------------------------
// GET /api/v1/bookings/:id — Single booking
// ----------------------------------------
apiRouter.get("/bookings/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bookingDoc = await db.collection("bookings").doc(id).get();

    if (!bookingDoc.exists) {
      res.status(404).json(apiError("NOT_FOUND", "Booking not found", req.requestId || ""));
      return;
    }

    const booking = bookingDoc.data()!;

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== booking.hotelId) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this booking", req.requestId || ""));
      return;
    }

    res.json(apiResponse(convertBookingToApi(bookingDoc.id, booking), req.requestId || ""));
  } catch (err) {
    console.error("GET /bookings/:id error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to fetch booking", req.requestId || ""));
  }
});

// ----------------------------------------
// PATCH /api/v1/bookings/:id — Update booking
// ----------------------------------------
apiRouter.patch("/bookings/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bookingDoc = await db.collection("bookings").doc(id).get();

    if (!bookingDoc.exists) {
      res.status(404).json(apiError("NOT_FOUND", "Booking not found", req.requestId || ""));
      return;
    }

    const booking = bookingDoc.data()!;

    // Scope check
    if (req.apiKey?.hotelId && req.apiKey.hotelId !== booking.hotelId) {
      res.status(403).json(apiError("FORBIDDEN", "Access denied to this booking", req.requestId || ""));
      return;
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    const body = req.body;

    if (body.status) {
      const allowedTransitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["cancelled", "in_progress"],
        sitter_assigned: ["sitter_confirmed", "cancelled"],
        sitter_confirmed: ["in_progress", "cancelled"],
        in_progress: ["completed"],
      };

      const currentStatus = booking.status as string;
      if (!allowedTransitions[currentStatus]?.includes(body.status)) {
        res.status(400).json(apiError(
          "BAD_REQUEST",
          `Cannot transition from '${currentStatus}' to '${body.status}'`,
          req.requestId || ""
        ));
        return;
      }
      updateData.status = body.status;
    }

    if (body.schedule) {
      if (body.schedule.date) updateData["schedule.date"] = new Date(body.schedule.date);
      if (body.schedule.startTime) updateData["schedule.startTime"] = body.schedule.startTime;
      if (body.schedule.endTime) updateData["schedule.endTime"] = body.schedule.endTime;
    }

    if (body.location?.roomNumber) {
      updateData["location.roomNumber"] = body.location.roomNumber;
    }

    if (body.cancellation && body.status === "cancelled") {
      updateData.cancellation = {
        ...body.cancellation,
        timestamp: FieldValue.serverTimestamp(),
        refundStatus: "none",
        refundAmount: 0,
        penaltyApplied: false,
      };
    }

    await bookingDoc.ref.update(updateData);

    const updated = await bookingDoc.ref.get();
    res.json(apiResponse(convertBookingToApi(id, updated.data()!), req.requestId || ""));
  } catch (err) {
    console.error("PATCH /bookings/:id error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to update booking", req.requestId || ""));
  }
});

// ----------------------------------------
// POST /api/v1/webhooks/pms — Receive PMS events
// ----------------------------------------
apiRouter.post("/webhooks/pms", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { event, timestamp, data, externalReference } = req.body;

    if (!event || !data) {
      res.status(400).json(apiError("BAD_REQUEST", "event and data are required", req.requestId || ""));
      return;
    }

    const hotelId = req.apiKey?.hotelId;
    if (!hotelId) {
      res.status(400).json(apiError("BAD_REQUEST", "API key must be scoped to a hotel for webhook events", req.requestId || ""));
      return;
    }

    // Log the webhook event
    await db.collection("webhookEvents").add({
      hotelId,
      event,
      data,
      externalReference: externalReference || "",
      receivedAt: FieldValue.serverTimestamp(),
      processed: false,
    });

    // Process based on event type
    switch (event) {
      case "check_in": {
        // Update any bookings for this room
        if (data.roomNumber) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const bookingsSnap = await db
            .collection("bookings")
            .where("hotelId", "==", hotelId)
            .where("location.roomNumber", "==", data.roomNumber)
            .where("schedule.date", ">=", today)
            .where("schedule.date", "<", tomorrow)
            .get();

          for (const doc of bookingsSnap.docs) {
            if (doc.data().status === "pending") {
              await doc.ref.update({
                status: "confirmed",
                "guestInfo.name": data.guestName || "",
                "guestInfo.email": data.guestEmail || "",
                "guestInfo.phone": data.guestPhone || "",
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }
        break;
      }

      case "check_out": {
        // Auto-complete any active bookings for this room
        if (data.roomNumber) {
          const bookingsSnap = await db
            .collection("bookings")
            .where("hotelId", "==", hotelId)
            .where("location.roomNumber", "==", data.roomNumber)
            .where("status", "in", ["confirmed", "sitter_confirmed", "in_progress"])
            .get();

          for (const doc of bookingsSnap.docs) {
            await doc.ref.update({
              status: "completed",
              completedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      case "booking_cancelled": {
        if (data.bookingId) {
          const bookingDoc = await db.collection("bookings").doc(data.bookingId).get();
          if (bookingDoc.exists && bookingDoc.data()?.hotelId === hotelId) {
            await bookingDoc.ref.update({
              status: "cancelled",
              cancellation: {
                cancelledBy: "hotel",
                reason: data.reason || "Cancelled via PMS",
                timestamp: FieldValue.serverTimestamp(),
                refundStatus: "none",
                refundAmount: 0,
                penaltyApplied: false,
              },
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      case "room_change": {
        if (data.oldRoom && data.newRoom) {
          const bookingsSnap = await db
            .collection("bookings")
            .where("hotelId", "==", hotelId)
            .where("location.roomNumber", "==", data.oldRoom)
            .where("status", "in", ["pending", "confirmed", "sitter_assigned", "sitter_confirmed"])
            .get();

          for (const doc of bookingsSnap.docs) {
            await doc.ref.update({
              "location.roomNumber": data.newRoom,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      default:
        // Log unknown events but don't fail
        console.log(`Unknown PMS webhook event: ${event}`, { timestamp, hotelId });
    }

    // Mark as processed
    res.json(apiResponse({ received: true, event, processed: true }, req.requestId || ""));
  } catch (err) {
    console.error("POST /webhooks/pms error:", err);
    res.status(500).json(apiError("INTERNAL_ERROR", "Failed to process webhook", req.requestId || ""));
  }
});

// Mount router
app.use("/api/v1", apiRouter);

// Error handler
app.use(errorHandler);
