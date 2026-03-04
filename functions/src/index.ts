// ============================================
// Petit Stay - Cloud Functions
// ============================================

import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import * as crypto from "crypto";
import Stripe from "stripe";
import {
  sendgridApiKey,
  twilioAccountSid,
  twilioAuthToken,
  twilioPhoneNumber,
  notifyUser,
  getUserLocale,
  sendPaymentLinkSMS as sendPaymentLinkSMSService,
} from "./notifications";

// Stripe secret key (stored in Firebase secrets)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

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
// Matching Engine: Score calculation (server-side mirror)
// ----------------------------------------
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

interface SitterDoc {
  id: string;
  tier: string;
  status: string;
  profile: {
    languages: string[];
    experience: number;
  };
  certifications: { type: string }[];
  availability: Record<string, { start: string; end: string }[]> & {
    nightShift?: boolean;
  };
  stats: {
    averageRating: number;
    ratingCount: number;
    totalSessions: number;
    noShowCount: number;
    safetyRecord: number;
  };
  partnerHotels: string[];
}

function scoreSitter(
  sitter: SitterDoc,
  booking: Record<string, unknown>,
  hotelId: string
): number {
  const requirements = booking.requirements as {
    preferredLanguages?: string[];
    sitterTier?: string;
  } | undefined;
  const schedule = booking.schedule as {
    date?: { toDate?: () => Date } | string;
    startTime?: string;
    endTime?: string;
  } | undefined;

  // Language (30%)
  const sitterLangs = (sitter.profile?.languages || []).map((l: string) => l.toLowerCase());
  const prefLangs = (requirements?.preferredLanguages || []).map((l: string) => l.toLowerCase());
  let langScore = 100;
  if (prefLangs.length > 0 && sitterLangs.length > 0) {
    const matchCount = prefLangs.filter((l: string) => sitterLangs.includes(l)).length;
    langScore = Math.round((matchCount / prefLangs.length) * 100);
  } else if (prefLangs.length > 0) {
    langScore = 0;
  }

  // Availability (25%)
  let availScore = 0;
  if (schedule?.date && schedule.startTime && schedule.endTime) {
    const dateVal = typeof schedule.date === "object" && schedule.date.toDate
      ? schedule.date.toDate()
      : new Date(schedule.date as string);
    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = dayMap[dateVal.getDay()];
    const daySlots = sitter.availability?.[dayKey];
    if (Array.isArray(daySlots) && daySlots.length > 0) {
      const bStart = timeToMinutes(schedule.startTime);
      const bEnd = timeToMinutes(schedule.endTime);
      for (const slot of daySlots) {
        const sStart = timeToMinutes(slot.start);
        const sEnd = timeToMinutes(slot.end);
        if (sStart <= bStart && sEnd >= bEnd) {
          availScore = 100;
          break;
        }
      }
    }
  }

  // Experience (20%)
  const years = sitter.profile?.experience || 0;
  const certCount = sitter.certifications?.length || 0;
  let expScore = Math.min(years / 10, 1) * 50 + Math.min(certCount / 4, 1) * 30;
  if (requirements?.sitterTier === "gold" && sitter.tier === "gold") expScore += 20;
  else if (requirements?.sitterTier === "any") expScore += sitter.tier === "gold" ? 20 : 10;
  expScore = Math.min(expScore, 100);

  // Rating (15%)
  const avg = sitter.stats?.averageRating || 0;
  const count = sitter.stats?.ratingCount || 0;
  const sessions = sitter.stats?.totalSessions || 0;
  const ratingBase = (avg / 5) * 80;
  const volumeBonus = Math.min(sessions / 50, 1) * 15;
  const confidence = count < 3 ? 0.7 : 1;
  const noShowPen = sitter.stats?.noShowCount ? Math.max(0, 1 - sitter.stats.noShowCount * 0.1) : 1;
  const ratingScore = Math.min((ratingBase + volumeBonus) * confidence * noShowPen, 100);

  // Distance (10%)
  const distScore = sitter.partnerHotels?.includes(hotelId) ? 100 : 30;

  return Math.round(
    langScore * 0.30 +
    availScore * 0.25 +
    expScore * 0.20 +
    ratingScore * 0.15 +
    distScore * 0.10
  );
}

// ----------------------------------------
// autoMatchSitter: Auto-assign best sitter on booking creation
// Triggered by Firestore onCreate on bookings collection
// ----------------------------------------
export const autoMatchSitter = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const booking = snapshot.data();
    const hotelId = booking.hotelId;
    if (!hotelId) return;

    // Check if hotel has autoAssign enabled
    const hotelDoc = await db.collection("hotels").doc(hotelId).get();
    if (!hotelDoc.exists) return;
    const hotel = hotelDoc.data();
    if (!hotel?.settings?.autoAssign) return;

    // Only auto-match for bookings in pending/pending_assignment status
    if (booking.status !== "pending" && booking.status !== "pending_assignment") return;

    // Fetch active sitters for this hotel
    const sittersSnap = await db
      .collection("sitters")
      .where("partnerHotels", "array-contains", hotelId)
      .where("status", "==", "active")
      .get();

    if (sittersSnap.empty) {
      console.log(`autoMatchSitter: No active sitters for hotel ${hotelId}`);
      return;
    }

    // Filter by tier if required
    const requiredTier = booking.requirements?.sitterTier;
    let sitters = sittersSnap.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as SitterDoc[];

    if (requiredTier === "gold") {
      sitters = sitters.filter((s) => s.tier === "gold");
    }

    if (sitters.length === 0) {
      console.log(`autoMatchSitter: No eligible sitters for booking ${event.params.bookingId}`);
      return;
    }

    // Score and sort
    const scored = sitters
      .map((s) => ({ sitter: s, score: scoreSitter(s, booking, hotelId) }))
      .sort((a, b) => b.score - a.score);

    const bestMatch = scored[0];

    // Assign the top sitter
    const bookingRef = db.collection("bookings").doc(event.params.bookingId);
    await bookingRef.update({
      sitterId: bestMatch.sitter.id,
      status: "sitter_assigned",
      "matchResult": {
        sitterId: bestMatch.sitter.id,
        score: bestMatch.score,
        matchedAt: FieldValue.serverTimestamp(),
        topCandidates: scored.slice(0, 3).map((s) => ({
          sitterId: s.sitter.id,
          score: s.score,
        })),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Notify the assigned sitter
    await createNotification(
      bestMatch.sitter.id,
      "sitter_assigned",
      "New Assignment",
      `You've been assigned to a new booking. Match score: ${bestMatch.score}/100.`,
      { bookingId: event.params.bookingId, hotelId, matchScore: bestMatch.score }
    );

    console.log(
      `autoMatchSitter: Assigned sitter ${bestMatch.sitter.id} (score: ${bestMatch.score}) to booking ${event.params.bookingId}`
    );
  }
);

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

      // Send email + SMS booking confirmation to parent
      try {
        const locale = await getUserLocale(booking.parentId);
        const hotelDoc = await db.collection("hotels").doc(hotelId).get();
        const hotelName = hotelDoc.data()?.name || "";
        const scheduleDate = booking.schedule?.date?.toDate?.()
          ? booking.schedule.date.toDate().toISOString().split("T")[0]
          : "";

        const bookingData = {
          confirmationCode: code,
          hotelName,
          date: scheduleDate,
          startTime: booking.schedule?.startTime || "",
          endTime: booking.schedule?.endTime || "",
          childrenNames: (booking.children || []).map((c: { firstName: string }) => c.firstName),
          total: booking.pricing?.total || 0,
          currency: "KRW",
        };

        // Build email template inline (mirrors src/services/emailTemplates.ts logic)
        const subjectMap: Record<string, string> = {
          en: `Booking Confirmed — Petit Stay`,
          ko: `예약 확인 — Petit Stay`,
          ja: `予約確認 — Petit Stay`,
          zh: `预约确认 — Petit Stay`,
        };
        const smsMap: Record<string, string> = {
          en: `[Petit Stay] Your booking ${code} is confirmed! Hotel: ${hotelName}, Date: ${scheduleDate}`,
          ko: `[Petit Stay] 예약 ${code}이(가) 확인되었습니다! 호텔: ${hotelName}, 날짜: ${scheduleDate}`,
          ja: `[Petit Stay] ご予約 ${code} が確認されました！ホテル: ${hotelName}, 日付: ${scheduleDate}`,
          zh: `[Petit Stay] 您的预约 ${code} 已确认！酒店: ${hotelName}, 日期: ${scheduleDate}`,
        };

        const emailTemplate = {
          subject: subjectMap[locale] || subjectMap.en,
          html: `<h2>${subjectMap[locale] || subjectMap.en}</h2><p>Code: ${bookingData.confirmationCode}</p><p>Hotel: ${bookingData.hotelName}</p><p>Date: ${bookingData.date} ${bookingData.startTime} — ${bookingData.endTime}</p>`,
          text: `${subjectMap[locale] || subjectMap.en}\nCode: ${bookingData.confirmationCode}\nHotel: ${bookingData.hotelName}\nDate: ${bookingData.date} ${bookingData.startTime} — ${bookingData.endTime}`,
        };

        await notifyUser(booking.parentId, emailTemplate, smsMap[locale] || smsMap.en);
      } catch (err) {
        console.error("Failed to send booking confirmation email/SMS:", err);
      }
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

      // Send care completed email + SMS + review request
      try {
        const locale = await getUserLocale(parentId);
        const completedSmsMap: Record<string, string> = {
          en: `[Petit Stay] Your care session is complete! Please leave a review in the app.`,
          ko: `[Petit Stay] 돌봄 세션이 완료되었습니다! 앱에서 리뷰를 남겨주세요.`,
          ja: `[Petit Stay] ケアセッションが完了しました！アプリでレビューをお願いします。`,
          zh: `[Petit Stay] 看护服务已完成！请在应用中留下评价。`,
        };
        const completedSubjectMap: Record<string, string> = {
          en: `Care Session Completed — Petit Stay`,
          ko: `돌봄 세션 완료 — Petit Stay`,
          ja: `ケアセッション完了 — Petit Stay`,
          zh: `看护服务已完成 — Petit Stay`,
        };
        const reviewSubjectMap: Record<string, string> = {
          en: `How was your experience? — Petit Stay`,
          ko: `경험은 어떠셨나요? — Petit Stay`,
          ja: `ご利用はいかがでしたか？ — Petit Stay`,
          zh: `您的体验如何？ — Petit Stay`,
        };

        const bookingId = after.bookingId || "";
        const reviewUrl = `https://petit-stay.web.app/parent/bookings/${bookingId}#review`;

        // Care completed notification
        await notifyUser(
          parentId,
          {
            subject: completedSubjectMap[locale] || completedSubjectMap.en,
            html: `<h2>${completedSubjectMap[locale] || completedSubjectMap.en}</h2><p>Session ID: ${sessionId}</p>`,
            text: `${completedSubjectMap[locale] || completedSubjectMap.en}\nSession: ${sessionId}`,
          },
          completedSmsMap[locale] || completedSmsMap.en
        );

        // Review request (sent as a separate email after a short delay concept — sent immediately for simplicity)
        const reviewCtaMap: Record<string, string> = {
          en: "Leave a Review",
          ko: "리뷰 작성하기",
          ja: "レビューを書く",
          zh: "撰写评价",
        };
        await notifyUser(
          parentId,
          {
            subject: reviewSubjectMap[locale] || reviewSubjectMap.en,
            html: `<h2>${reviewSubjectMap[locale] || reviewSubjectMap.en}</h2><p><a href="${reviewUrl}">${reviewCtaMap[locale] || reviewCtaMap.en}</a></p>`,
            text: `${reviewSubjectMap[locale] || reviewSubjectMap.en}\n${reviewCtaMap[locale] || reviewCtaMap.en}: ${reviewUrl}`,
          },
          null
        );
      } catch (err) {
        console.error("Failed to send care completed email/SMS:", err);
      }
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

// ----------------------------------------
// createStripeCheckoutSession: Generate a Stripe Checkout Session for a booking
// Called from the frontend payment service
// ----------------------------------------
export const createStripeCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const { bookingId, hotelId, amount, currency, guestEmail, description, locale } = request.data;
    if (!bookingId || !amount) {
      throw new HttpsError("invalid-argument", "bookingId and amount are required");
    }

    const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2026-02-25.clover" });

    // Determine base URL for success/cancel redirects
    const baseUrl = "https://petit-stay.web.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: guestEmail || undefined,
      locale: (locale as Stripe.Checkout.SessionCreateParams.Locale) || "auto",
      line_items: [
        {
          price_data: {
            currency: currency || "krw",
            unit_amount: amount,
            product_data: {
              name: description || "Petit Stay Childcare Service",
              description: `Booking: ${bookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        hotelId: hotelId || "",
      },
      success_url: `${baseUrl}/guest/${bookingId}?payment=success`,
      cancel_url: `${baseUrl}/guest/${bookingId}?payment=cancelled`,
    });

    // Store the Stripe session ID on the booking
    await db.collection("bookings").doc(bookingId).update({
      "payment.stripeSessionId": session.id,
      "payment.status": "pending",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  }
);

// ----------------------------------------
// getPaymentStatus: Query payment status for a booking
// ----------------------------------------
export const getPaymentStatus = onCall(async (request) => {
  const { bookingId } = request.data;
  if (!bookingId) {
    throw new HttpsError("invalid-argument", "bookingId is required");
  }

  const bookingSnap = await db.collection("bookings").doc(bookingId).get();
  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found");
  }

  const booking = bookingSnap.data()!;
  const payment = booking.payment || {};

  return {
    status: payment.status || "pending",
    transactionId: payment.transactionId || undefined,
    paidAt: payment.paidAt ? payment.paidAt.toDate().toISOString() : undefined,
  };
});

// ----------------------------------------
// onStripeWebhook: Handle Stripe webhook events
// Updates booking.payment.status on successful payment
// ----------------------------------------
export const onStripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2026-02-25.clover" });
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await db.collection("bookings").doc(bookingId).update({
            "payment.status": "captured",
            "payment.transactionId": session.payment_intent as string || session.id,
            "payment.paidAt": FieldValue.serverTimestamp(),
            "payment.method": "card",
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Notify hotel staff about successful payment
          const bookingSnap = await db.collection("bookings").doc(bookingId).get();
          if (bookingSnap.exists) {
            const booking = bookingSnap.data()!;
            const code = booking.confirmationCode || bookingId;

            if (booking.hotelId) {
              const staffIds = await getHotelStaffIds(booking.hotelId);
              await Promise.all(
                staffIds.map((staffId) =>
                  createNotification(
                    staffId,
                    "payment_received",
                    "Payment Received",
                    `Payment for booking ${code} has been completed.`,
                    { bookingId, hotelId: booking.hotelId }
                  )
                )
              );
            }
          }

          console.log(`Payment captured for booking ${bookingId}`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await db.collection("bookings").doc(bookingId).update({
            "payment.status": "failed",
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Payment session expired for booking ${bookingId}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;

        if (paymentIntent) {
          // Find booking by transaction ID
          const bookingsSnap = await db
            .collection("bookings")
            .where("payment.transactionId", "==", paymentIntent)
            .limit(1)
            .get();

          if (!bookingsSnap.empty) {
            const bookingDoc = bookingsSnap.docs[0];
            await bookingDoc.ref.update({
              "payment.status": "refunded",
              "payment.refundedAt": FieldValue.serverTimestamp(),
              "payment.refundAmount": charge.amount_refunded,
              updatedAt: FieldValue.serverTimestamp(),
            });
            console.log(`Refund processed for booking ${bookingDoc.id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);

// ----------------------------------------
// sendPaymentLinkSMS: Callable function to send payment link via SMS
// ----------------------------------------
export const sendPaymentLinkSMS = onCall(
  { secrets: [twilioAccountSid, twilioAuthToken, twilioPhoneNumber] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const { phone, paymentUrl, locale } = request.data;
    if (!phone || !paymentUrl) {
      throw new HttpsError("invalid-argument", "phone and paymentUrl are required");
    }

    const success = await sendPaymentLinkSMSService(phone, paymentUrl, locale || "en");

    if (!success) {
      throw new HttpsError("internal", "Failed to send SMS");
    }

    return { success: true };
  }
);
