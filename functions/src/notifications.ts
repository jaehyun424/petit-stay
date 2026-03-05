// ============================================
// Petit Stay - Notification Services (Email + SMS)
// SendGrid for email, Twilio for SMS
// ============================================

import { defineSecret } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";

// Secrets (stored in Firebase Functions secrets)
export const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
export const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
export const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
export const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");

const db = getFirestore();

// ----------------------------------------
// Email Template interface
// ----------------------------------------
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ----------------------------------------
// Send Email via SendGrid
// ----------------------------------------
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  from: string = "noreply@petitstay.com"
): Promise<boolean> {
  try {
    // Dynamic import to avoid issues when SendGrid is not configured
    const sgMail = await import("@sendgrid/mail");
    sgMail.setApiKey(sendgridApiKey.value());

    await sgMail.send({
      to,
      from: { email: from, name: "Petit Stay" },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Email sent to ${to}: ${template.subject}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

// ----------------------------------------
// Send SMS via Twilio
// ----------------------------------------
export async function sendSMS(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const twilio = await import("twilio");
    const client = twilio.default(
      twilioAccountSid.value(),
      twilioAuthToken.value()
    );

    await client.messages.create({
      to,
      from: twilioPhoneNumber.value(),
      body: message,
    });

    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    return false;
  }
}

// ----------------------------------------
// Send Payment Link SMS
// ----------------------------------------
type SupportedLocale = "en" | "ko" | "ja" | "zh";

const paymentSmsTemplates: Record<SupportedLocale, (url: string) => string> = {
  en: (url) => `[Petit Stay] Please complete your payment to confirm your booking: ${url}`,
  ko: (url) => `[Petit Stay] 예약 확인을 위해 결제를 완료해 주세요: ${url}`,
  ja: (url) => `[Petit Stay] ご予約の確認のため、お支払いを完了してください: ${url}`,
  zh: (url) => `[Petit Stay] 请完成支付以确认您的预约: ${url}`,
};

export async function sendPaymentLinkSMS(
  phone: string,
  paymentUrl: string,
  locale: string = "en"
): Promise<boolean> {
  const lang = (["en", "ko", "ja", "zh"].includes(locale) ? locale : "en") as SupportedLocale;
  const message = paymentSmsTemplates[lang](paymentUrl);
  return sendSMS(phone, message);
}

// ----------------------------------------
// Helper: Get user notification preferences + contact info
// ----------------------------------------
interface NotificationChannel {
  email: string | null;
  phone: string | null;
  preferences: { push: boolean; email: boolean; sms: boolean };
}

export async function getUserNotificationChannel(userId: string): Promise<NotificationChannel> {
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData) {
    return { email: null, phone: null, preferences: { push: true, email: true, sms: false } };
  }

  return {
    email: userData.email || null,
    phone: userData.profile?.phone || null,
    preferences: {
      push: userData.notifications?.push ?? true,
      email: userData.notifications?.email ?? true,
      sms: userData.notifications?.sms ?? false,
    },
  };
}

// ----------------------------------------
// Helper: Get user preferred language
// ----------------------------------------
export async function getUserLocale(userId: string): Promise<SupportedLocale> {
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  const lang = userData?.profile?.preferredLanguage || "en";
  return (["en", "ko", "ja", "zh"].includes(lang) ? lang : "en") as SupportedLocale;
}

// ----------------------------------------
// High-level: Send notification to user via preferred channels
// ----------------------------------------
export async function notifyUser(
  userId: string,
  emailTemplate: EmailTemplate | null,
  smsMessage: string | null
): Promise<void> {
  const channel = await getUserNotificationChannel(userId);
  const promises: Promise<boolean>[] = [];

  if (channel.preferences.email && channel.email && emailTemplate) {
    promises.push(sendEmail(channel.email, emailTemplate));
  }

  if (channel.preferences.sms && channel.phone && smsMessage) {
    promises.push(sendSMS(channel.phone, smsMessage));
  }

  await Promise.all(promises);
}
