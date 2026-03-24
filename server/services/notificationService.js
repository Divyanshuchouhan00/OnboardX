import { sendMail } from './emailService.js';
import {
  documentsApprovedTemplate,
  managerAssignedTemplate,
  onboardingCompleteTemplate,
  documentRejectedTemplate,
} from './emailTemplates.js';

/**
 * Notifies stakeholders when workflow status changes (generic).
 */
export async function notifyWorkflowChange({ toEmail, employeeName, step, extra }) {
  if (!toEmail) return;
  const subject = `Onboarding update: ${step}`;
  const text = `Hello,\n\nThe onboarding workflow for ${employeeName} has moved to: ${step}.\n${extra || ''}\n\n— OnboardX`;
  await sendMail({ to: toEmail, subject, text });
}

/** When all documents are approved (workflow → manager assignment). */
export async function notifyDocumentsFullyApproved({ toEmail, employeeName }) {
  if (!toEmail) return;
  const { subject, text, html } = documentsApprovedTemplate({ employeeName });
  await sendMail({ to: toEmail, subject, text, html });
}

/** When a manager is assigned (employee enters IT setup). */
export async function notifyManagerAssignedToEmployee({ toEmail, employeeName }) {
  if (!toEmail) return;
  const { subject, text, html } = managerAssignedTemplate({ employeeName });
  await sendMail({ to: toEmail, subject, text, html });
}

/** Final welcome when onboarding is marked complete. */
export async function notifyOnboardingWelcome({ toEmail, employeeName }) {
  if (!toEmail) return;
  const { subject, text, html } = onboardingCompleteTemplate({ employeeName });
  await sendMail({ to: toEmail, subject, text, html });
}

/** Single document rejected by HR. */
export async function notifyDocumentRejected({ toEmail, employeeName, note }) {
  if (!toEmail) return;
  const { subject, text, html } = documentRejectedTemplate({ employeeName, note });
  await sendMail({ to: toEmail, subject, text, html });
}

export async function notifyItSetup({ toEmail, employeeName, details }) {
  if (!toEmail) return;
  const subject = `IT setup required: ${employeeName}`;
  const text = `IT team,\n\nPlease provision accounts for: ${employeeName}.\n${details || ''}`;
  await sendMail({ to: toEmail, subject, text });
}
