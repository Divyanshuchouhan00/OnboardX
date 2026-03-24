/**
 * Reusable HTML + plain-text bodies for onboarding emails.
 * Used with Nodemailer; HTML is optional fallback to text in emailService.
 */

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLayout({ title, bodyLines }) {
  const safeTitle = escapeHtml(title);
  const paragraphs = bodyLines.map((line) => `<p style="margin:0 0 12px;line-height:1.55;color:#334155;">${escapeHtml(line)}</p>`).join('');
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 4px 24px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8b5cf6;">OnboardX</p>
    <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f172a;">${safeTitle}</h1>
    ${paragraphs}
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>`;
  return html;
}

export function documentsApprovedTemplate({ employeeName }) {
  const name = employeeName || 'there';
  const text = `Hi ${name},\n\nYour documents have been approved.\n\nYou can continue your onboarding in the OnboardX portal.\n\n— OnboardX`;
  const html = wrapLayout({
    title: 'Documents approved',
    bodyLines: [
      `Hi ${name},`,
      'Your documents have been approved.',
      'You can continue your onboarding in the OnboardX portal.',
    ],
  });
  return { subject: 'Your documents have been approved', text, html };
}

export function managerAssignedTemplate({ employeeName }) {
  const name = employeeName || 'there';
  const text = `Hi ${name},\n\nA manager has been assigned to you.\n\nIT will finalize your access next. Check OnboardX for updates.\n\n— OnboardX`;
  const html = wrapLayout({
    title: 'Manager assigned',
    bodyLines: [
      `Hi ${name},`,
      'A manager has been assigned to you.',
      'IT will finalize your access next. Check OnboardX for updates.',
    ],
  });
  return { subject: 'A manager has been assigned to you', text, html };
}

export function onboardingCompleteTemplate({ employeeName }) {
  const name = employeeName || 'there';
  const text = `Hi ${name},\n\nYour onboarding is complete. Welcome aboard!\n\nWe're glad you're here.\n\n— OnboardX`;
  const html = wrapLayout({
    title: 'Welcome aboard',
    bodyLines: [`Hi ${name},`, 'Your onboarding is complete. Welcome aboard!', "We're glad you're here."],
  });
  return { subject: 'Your onboarding is complete — welcome aboard!', text, html };
}

export function documentRejectedTemplate({ employeeName, note }) {
  const name = employeeName || 'there';
  const lines = [
    `Hi ${name},`,
    'A document in your onboarding was not approved.',
    note ? `Note from HR: ${note}` : 'Please review the feedback in OnboardX and upload a replacement if needed.',
  ];
  const text = lines.join('\n\n') + '\n\n— OnboardX';
  const html = wrapLayout({
    title: 'Document needs attention',
    bodyLines: lines,
  });
  return { subject: 'Onboarding: document needs attention', text, html };
}
