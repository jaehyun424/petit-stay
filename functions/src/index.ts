// ============================================
// Petit Stay - Cloud Functions
// ============================================

import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import * as crypto from "crypto";

initializeApp();
const db = getFirestore();

// ----------------------------------------
// Helper: Create notification for a user
// ----------------------------------------
async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await db.collection("notifications").add({
    userId,
    type,
    title,
    body,
    data: data || {},
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

// ----------------------------------------
// Helper: Get hotel staff userIds for a hotel
// ----------------------------------------
async function getHotelStaffIds(hotelId: string): Promise<string[]> {
  const snapshot = await db
    .collection("users")
    .where("role", "==", "hotel_staff")
    .where("hotelId", "==", hotelId)
    .get();
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.id);
}

// ----------------------------------------
// onBookingCreated: Notify hotel staff when a new booking is created
// ----------------------------------------
export const onBookingCreated = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const booking = snapshot.data();
    const hotelId = booking.hotelId;
    if (!hotelId) return;

    const bookingId = event.params.bookingId;
    const code = booking.confirmationCode || "";
    const room = booking.location?.roomNumber || "N/A";

    // Notify all hotel staff for this hotel
    const staffIds = await getHotelStaffIds(hotelId);
    const notifyPromises = staffIds.map((staffId) =>
      createNotification(
        staffId,
        "booking_created",
        "New Booking Received",
        `New booking ${code} for Room ${room}.`,
        { bookingId, hotelId }
      )
    );

    // Also notify the parent that their booking was received
    if (booking.parentId) {
      notifyPromises.push(
        createNotification(
          booking.parentId,
          "booking_created",
          "Booking Submitted",
          `Your booking ${code} has been submitted and is pending confirmation.`,
          { bookingId, hotelId }
        )
      );
    }

    await Promise.all(notifyPromises);
  }
);

// ----------------------------------------
// onSessionCompleted: Notify parent to leave a review
// ----------------------------------------
export const onSessionCompleted = onDocumentUpdated(
  "sessions/{sessionId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    // Only trigger when status changes TO 'completed'
    if (before.status === after.status || after.status !== "completed") return;

    const sessionId = event.params.sessionId;
    const parentId = after.parentId;
    const sitterId = after.sitterId;

    if (parentId) {
      await createNotification(
        parentId,
        "care_completed",
        "Care Session Complete",
        "Your care session has been completed. Please leave a review for your sitter.",
        { sessionId, bookingId: after.bookingId || "" }
      );
    }

    // Notify the sitter that the session is recorded as complete
    if (sitterId) {
      await createNotification(
        sitterId,
        "care_completed",
        "Session Completed",
        "Your care session has been recorded as complete.",
        { sessionId }
      );
    }
  }
);

// ----------------------------------------
// onIncidentCreated: Notify hotel and parent about an incident
// ----------------------------------------
export const onIncidentCreated = onDocumentCreated(
  "incidents/{incidentId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const incident = snapshot.data();
    const incidentId = event.params.incidentId;
    const hotelId = incident.hotelId;
    const parentId = incident.parentId;
    const severity = incident.severity || "low";
    const summary = incident.report?.summary || "An incident has been reported.";

    const severityEmoji =
      severity === "critical" ? "🚨" :
      severity === "high" ? "⚠️" :
      severity === "medium" ? "📋" : "ℹ️";

    // Notify hotel staff
    if (hotelId) {
      const staffIds = await getHotelStaffIds(hotelId);
      await Promise.all(
        staffIds.map((staffId) =>
          createNotification(
            staffId,
            "emergency",
            `${severityEmoji} Incident Report (${severity.toUpperCase()})`,
            summary,
            { incidentId, hotelId, severity }
          )
        )
      );
    }

    // Notify parent
    if (parentId) {
      await createNotification(
        parentId,
        "emergency",
        "Incident Report",
        summary,
        { incidentId, severity }
      );
    }
  }
);

// ----------------------------------------
// onBookingCancelled: Notify relevant parties
// ----------------------------------------
export const onBookingCancelled = onDocumentUpdated(
  "bookings/{bookingId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    // Only trigger when status changes TO 'cancelled'
    if (before.status === after.status || after.status !== "cancelled") return;

    const bookingId = event.params.bookingId;
    const code = after.confirmationCode || bookingId;
    const cancelledBy = after.cancellation?.cancelledBy || "system";

    const promises: Promise<void>[] = [];

    // Notify parent (unless they cancelled)
    if (after.parentId && cancelledBy !== "parent") {
      promises.push(
        createNotification(
          after.parentId,
          "booking_cancelled",
          "Booking Cancelled",
          `Your booking ${code} has been cancelled.`,
          { bookingId, cancelledBy }
        )
      );
    }

    // Notify sitter (if assigned)
    if (after.sitterId) {
      promises.push(
        createNotification(
          after.sitterId,
          "booking_cancelled",
          "Booking Cancelled",
          `Booking ${code} has been cancelled.`,
          { bookingId }
        )
      );
    }

    // Notify hotel staff (unless they cancelled)
    if (after.hotelId && cancelledBy !== "hotel") {
      const staffIds = await getHotelStaffIds(after.hotelId);
      staffIds.forEach((staffId) => {
        promises.push(
          createNotification(
            staffId,
            "booking_cancelled",
            "Booking Cancelled",
            `Booking ${code} has been cancelled by ${cancelledBy}.`,
            { bookingId, cancelledBy }
          )
        );
      });
    }

    await Promise.all(promises);
  }
);

// ----------------------------------------
// scheduledNoShowDetection: Detect no-show bookings every 15 minutes
// If a booking's scheduled start is 30+ minutes ago and no session started, mark as no_show
// ----------------------------------------
export const scheduledNoShowDetection = onSchedule(
  { schedule: "every 15 minutes", timeZone: "Asia/Seoul" },
  async () => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    // Find sitter_confirmed bookings with scheduled start before cutoff
    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "in", ["confirmed", "sitter_confirmed"])
      .where("scheduledStart", "<=", cutoff)
      .get();

    if (bookingsSnap.empty) return;

    const batch = db.batch();
    const notifyPromises: Promise<void>[] = [];

    for (const bookingDoc of bookingsSnap.docs) {
      const booking = bookingDoc.data();

      // Check if a session exists for this booking
      const sessionSnap = await db
        .collection("sessions")
        .where("bookingId", "==", bookingDoc.id)
        .limit(1)
        .get();

      if (sessionSnap.empty) {
        // No session started — mark as no_show
        batch.update(bookingDoc.ref, {
          status: "no_show",
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Notify hotel staff
        if (booking.hotelId) {
          const staffIds = await getHotelStaffIds(booking.hotelId);
          staffIds.forEach((staffId) => {
            notifyPromises.push(
              createNotification(
                staffId,
                "booking_cancelled",
                "No-Show Detected",
                `Booking ${booking.confirmationCode || bookingDoc.id} marked as no-show.`,
                { bookingId: bookingDoc.id, hotelId: booking.hotelId }
              )
            );
          });
        }
      }
    }

    await batch.commit();
    await Promise.all(notifyPromises);
  }
);

// ----------------------------------------
// onReviewCreated: Recalculate sitter average rating + notify sitter
// ----------------------------------------
export const onReviewCreated = onDocumentCreated(
  "reviews/{reviewId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const review = snapshot.data();
    const sitterId = review.sitterId;
    if (!sitterId) return;

    // Recalculate average rating
    const reviewsSnap = await db
      .collection("reviews")
      .where("sitterId", "==", sitterId)
      .get();

    let totalRating = 0;
    let count = 0;
    reviewsSnap.docs.forEach((doc: QueryDocumentSnapshot) => {
      const r = doc.data();
      if (typeof r.rating === "number") {
        totalRating += r.rating;
        count++;
      }
    });

    const averageRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;

    // Update sitter document with new rating
    const sitterRef = db.collection("sitters").doc(sitterId);
    const sitterDoc = await sitterRef.get();

    if (sitterDoc.exists) {
      await sitterRef.update({
        rating: averageRating,
        reviewCount: count,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Notify the sitter about the new review
    const rating = review.rating || 0;
    const stars = "⭐".repeat(Math.min(rating, 5));
    await createNotification(
      sitterId,
      "review_received",
      "New Review Received",
      `You received a ${stars} (${rating}/5) review.`,
      { reviewId: event.params.reviewId, rating }
    );
  }
);

// ----------------------------------------
// scheduledCleanup: Daily cleanup of old read notifications (03:00 KST)
// Deletes read notifications older than 30 days, in batches of 500
// ----------------------------------------
export const scheduledCleanup = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Asia/Seoul" },
  async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const query = db
      .collection("notifications")
      .where("read", "==", true)
      .where("createdAt", "<=", cutoff)
      .limit(500);

    let deleted = 0;
    let snapshot = await query.get();

    while (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deleted += snapshot.docs.length;

      // Get next batch
      if (snapshot.docs.length < 500) break;
      snapshot = await query.get();
    }

    if (deleted > 0) {
      console.log(`scheduledCleanup: Deleted ${deleted} old read notifications.`);
    }
  }
);

// ----------------------------------------
// generateGuestToken: Create a secure token for guest page access
// ----------------------------------------
export const generateGuestToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  const { bookingId, hotelId } = request.data;
  if (!bookingId || !hotelId) {
    throw new HttpsError("invalid-argument", "bookingId and hotelId are required");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

  const tokenRef = await db.collection("guestTokens").add({
    bookingId,
    hotelId,
    token,
    expiresAt,
    used: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update booking status to pending_guest_consent
  await db.collection("bookings").doc(bookingId).update({
    status: "pending_guest_consent",
    guestTokenId: tokenRef.id,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const guestPageUrl = `https://petitstay.com/guest/${bookingId}?token=${token}`;

  return { tokenId: tokenRef.id, token, guestPageUrl, expiresAt: expiresAt.toISOString() };
});

// ----------------------------------------
// validateGuestToken: Validate token and return sanitized reservation data
// ----------------------------------------
export const validateGuestToken = onCall(async (request) => {
  const { token } = request.data;
  if (!token) {
    throw new HttpsError("invalid-argument", "token is required");
  }

  const tokensSnap = await db
    .collection("guestTokens")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (tokensSnap.empty) {
    throw new HttpsError("not-found", "Invalid token");
  }

  const tokenDoc = tokensSnap.docs[0];
  const tokenData = tokenDoc.data();

  const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(tokenData.expiresAt);
  if (expiresAt < new Date()) {
    throw new HttpsError("deadline-exceeded", "Token has expired");
  }

  // Fetch booking data
  const bookingSnap = await db.collection("bookings").doc(tokenData.bookingId).get();
  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found");
  }

  const booking = bookingSnap.data()!;

  // Return sanitized data (no sensitive info)
  return {
    bookingId: tokenData.bookingId,
    hotelId: tokenData.hotelId,
    confirmationCode: booking.confirmationCode || "",
    schedule: booking.schedule || {},
    children: (booking.children || []).map((c: { firstName: string; age: number }) => ({
      name: c.firstName,
      age: c.age,
    })),
    location: { roomNumber: booking.location?.roomNumber || "" },
    pricing: { total: booking.pricing?.total || 0 },
    status: booking.status,
  };
});

// ----------------------------------------
// onReservationStatusChange: Handle full status flow notifications
// ----------------------------------------
export const onReservationStatusChange = onDocumentUpdated(
  "bookings/{bookingId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;
    if (before.status === after.status) return;

    const bookingId = event.params.bookingId;
    const code = after.confirmationCode || bookingId;
    const newStatus = after.status;

    const promises: Promise<void>[] = [];

    switch (newStatus) {
      case "pending_assignment":
        // Notify hotel staff that guest consent is complete
        if (after.hotelId) {
          const staffIds = await getHotelStaffIds(after.hotelId);
          staffIds.forEach((staffId) => {
            promises.push(
              createNotification(staffId, "booking_confirmed", "Guest Consent Complete",
                `Booking ${code}: Guest consent and payment received. Ready for sitter assignment.`,
                { bookingId, hotelId: after.hotelId })
            );
          });
        }
        break;

      case "sitter_assigned":
        // Notify sitter they've been assigned
        if (after.sitterId) {
          promises.push(
            createNotification(after.sitterId, "sitter_assigned", "New Assignment",
              `You've been assigned to booking ${code}.`,
              { bookingId })
          );
        }
        break;

      case "sitter_confirmed":
        // Notify parent that sitter confirmed
        if (after.parentId) {
          promises.push(
            createNotification(after.parentId, "booking_confirmed", "Sitter Confirmed",
              `Your specialist has confirmed booking ${code}.`,
              { bookingId })
          );
        }
        break;

      case "in_progress":
        // Notify parent that care has started
        if (after.parentId) {
          promises.push(
            createNotification(after.parentId, "care_started", "Care Session Started",
              `Care session for booking ${code} has started.`,
              { bookingId })
          );
        }
        break;

      case "completed":
        // Handled by onSessionCompleted
        break;
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }
);

// ----------------------------------------
// calculateSettlement: Monthly settlement aggregation (1st of each month at 02:00 KST)
// ----------------------------------------
export const calculateSettlement = onSchedule(
  { schedule: "0 2 1 * *", timeZone: "Asia/Seoul" },
  async () => {
    // Get previous month's date range
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get all hotels
    const hotelsSnap = await db.collection("hotels").get();

    for (const hotelDoc of hotelsSnap.docs) {
      const hotel = hotelDoc.data();
      const hotelId = hotelDoc.id;

      // Get completed bookings for this hotel in the period
      const bookingsSnap = await db
        .collection("bookings")
        .where("hotelId", "==", hotelId)
        .where("status", "==", "completed")
        .where("completedAt", ">=", startOfLastMonth)
        .where("completedAt", "<=", endOfLastMonth)
        .get();

      if (bookingsSnap.empty) continue;

      let totalRevenue = 0;
      bookingsSnap.docs.forEach((doc: QueryDocumentSnapshot) => {
        const booking = doc.data();
        totalRevenue += booking.pricing?.total || 0;
      });

      const commissionRate = hotel.commission || 15;
      const commission = Math.round(totalRevenue * (commissionRate / 100));

      await db.collection("settlements").add({
        hotelId,
        hotelName: hotel.name || hotelId,
        period: {
          start: startOfLastMonth,
          end: endOfLastMonth,
        },
        totalBookings: bookingsSnap.size,
        totalRevenue,
        commission,
        commissionRate,
        netPayout: totalRevenue - commission,
        status: "pending_approval",
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log(`Settlement created for ${hotel.name}: ${bookingsSnap.size} bookings, ${totalRevenue} revenue`);
    }
  }
);
