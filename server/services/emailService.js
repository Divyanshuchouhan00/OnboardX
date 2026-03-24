import { createMailTransporter } from '../config/email.js';

const transporter = createMailTransporter();

/**
 * Sends a plain-text email. In dev without SMTP, JSON transport logs the message.
 */
export async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'onboarding@company.local';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text,
  });

  if (transporter.transporter?.options?.jsonTransport) {
    console.log('[Email dev]', JSON.parse(info.message));
  }

  return info;
}
