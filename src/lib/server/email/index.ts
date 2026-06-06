import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";

const EMAIL_PORT_NUM = Number(EMAIL_PORT) || 587;

function createTransporter() {
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT_NUM,
    secure: EMAIL_PORT_NUM === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

function emailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
  .logo { font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
  .logo span { color: #3b82f6; }
  h1 { color: #f1f5f9; font-size: 20px; margin: 0 0 16px; }
  p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
  .btn { display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 16px 0; }
  .btn:hover { background: #2563eb; }
  .footer { color: #64748b; font-size: 13px; margin-top: 24px; text-align: center; }
  .footer a { color: #3b82f6; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="logo">Hermes<span>Blog</span></div>
    ${bodyHtml}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Hermes Blog. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${PUBLIC_APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const html = emailTemplate(
    "Verify Your Email",
    `
    <h1>Verify Your Email Address</h1>
    <p>Thank you for registering on Hermes Blog. Please verify your email address to activate your account.</p>
    <a href="${verificationUrl}" class="btn">Verify Email</a>
    <p>Or copy this link to your browser:</p>
    <p style="word-break: break-all; color: #60a5fa;">${verificationUrl}</p>
    <p>If you did not create an account, you can safely ignore this email.</p>
    `,
  );

  await sendEmail(email, "Hermes Blog — Verify Your Email", html);
}

export async function sendResetPasswordEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${PUBLIC_APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const html = emailTemplate(
    "Reset Your Password",
    `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for your Hermes Blog account.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>Or copy this link to your browser:</p>
    <p style="word-break: break-all; color: #60a5fa;">${resetUrl}</p>
    <p>This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    `,
  );

  await sendEmail(email, "Hermes Blog — Reset Your Password", html);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Hermes Blog" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
