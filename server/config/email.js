import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter from SMTP_* env vars.
 * Falls back to JSON transport in development when SMTP is not set (logs only).
 */
export function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Dev fallback: emails are logged, not sent
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}
