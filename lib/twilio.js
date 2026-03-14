// lib/twilio.js
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationOtp(phone) {
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phone,
      channel: "sms",
    });
}

export async function checkVerificationOtp(phone, code) {
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phone,
      code,
    });
}

export async function sendAlertSms(phone, body) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
