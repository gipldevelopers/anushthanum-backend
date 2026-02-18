const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.SMTP?.host || !config.SMTP?.user) {
    console.warn('⚠️ SMTP not configured. OTP emails will be logged only.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.SMTP.host,
    port: config.SMTP.port,
    secure: config.SMTP.port === 465,
    auth: {
      user: config.SMTP.user,
      pass: config.SMTP.pass,
    },
  });
  transporter.verify((err) => {
    if (err) console.log('❌ SMTP verify failed:', err.message);
    else console.log('✅ SMTP ready');
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  const from = `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`;
  if (!transport) {
    console.log('[Mail] (no SMTP) Would send to', to, ':', subject);
    return { success: true, skipped: true };
  }
  try {
    const result = await transport.sendMail({
      from,
      to,
      subject,
      html: html || text,
      text: text || (html && html.replace(/<[^>]*>/g, ' ').trim()),
    });
    console.log('✅ Email sent to', to, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('❌ Email send failed:', err);
    throw err;
  }
}

function getOtpEmailHtml(otp, userName, expiryMinutes) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #1a1a1a;">Verify your email</h2>
  <p>Hi ${userName || 'there'},</p>
  <p>Your verification code for Anushthanum is:</p>
  <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 20px 0;">${otp}</p>
  <p style="color: #666; font-size: 14px;">This code expires in ${expiryMinutes} minutes. Do not share it with anyone.</p>
  <p style="margin-top: 32px;">If you didn't request this, you can ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Anushthanum. All rights reserved.</p>
</body>
</html>`;
}

async function sendOtpEmail(email, otp, userName = 'User', expiryMinutes = 10) {
  const subject = 'Your verification code – Anushthanum';
  const html = getOtpEmailHtml(otp, userName, expiryMinutes);
  return sendEmail({ to: email, subject, html });
}

module.exports = { sendEmail, sendOtpEmail, getTransporter };
