import { Document } from '../models/Document.js';
import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { Workflow } from '../models/Workflow.js';
import {
  notifyItSetup,
  notifyWorkflowChange,
  notifyDocumentsFullyApproved,
  notifyManagerAssignedToEmployee,
  notifyOnboardingWelcome,
} from './notificationService.js';
import { User } from '../models/User.js';

function pushHistory(workflow, step, action, meta = {}) {
  workflow.history.push({ step, action, meta, at: new Date() });
}

/**
 * Advances workflow when business rules are satisfied.
 */
export async function syncWorkflowForEmployee(employeeId) {
  const workflow = await Workflow.findOne({ employeeId });
  if (!workflow || workflow.currentStep === 'COMPLETED') {
    return workflow;
  }

  const profile = await EmployeeProfile.findById(employeeId).populate('userId');
  if (!profile) return workflow;

  const employeeUser = profile.userId;
  const docs = await Document.find({ employeeId });

  let changed = false;

  // SUBMITTED → HR_REVIEW when at least one document exists
  if (workflow.currentStep === 'SUBMITTED' && docs.length > 0) {
    workflow.currentStep = 'HR_REVIEW';
    pushHistory(workflow, 'HR_REVIEW', 'documents_uploaded', { count: docs.length });
    changed = true;
    await notifyWorkflowChange({
      toEmail: employeeUser?.email,
      employeeName: employeeUser?.name || 'Employee',
      step: 'HR Review',
      extra: 'Documents have been submitted for review.',
    });
  }

  // HR_REVIEW → MANAGER_ASSIGNED when all documents approved (if any docs exist)
  if (workflow.currentStep === 'HR_REVIEW' && docs.length > 0) {
    const allApproved = docs.every((d) => d.verificationStatus === 'approved');
    if (allApproved) {
      workflow.currentStep = 'MANAGER_ASSIGNED';
      pushHistory(workflow, 'MANAGER_ASSIGNED', 'all_documents_approved');
      changed = true;
      await notifyDocumentsFullyApproved({
        toEmail: employeeUser?.email,
        employeeName: employeeUser?.name || 'Employee',
      });
    }
  }

  // MANAGER_ASSIGNED → IT_SETUP when assignedManager (or legacy manager) is set
  const managerUserId = profile.assignedManager || profile.manager;
  if (workflow.currentStep === 'MANAGER_ASSIGNED' && managerUserId) {
    workflow.currentStep = 'IT_SETUP';
    pushHistory(workflow, 'IT_SETUP', 'manager_assigned', { managerId: String(managerUserId) });
    changed = true;

    const itEmail = process.env.IT_TEAM_EMAIL || process.env.ADMIN_NOTIFY_EMAIL;
    const mgr = await User.findById(managerUserId);
    await notifyManagerAssignedToEmployee({
      toEmail: employeeUser?.email,
      employeeName: employeeUser?.name || 'Employee',
    });
    if (itEmail) {
      await notifyItSetup({
        toEmail: itEmail,
        employeeName: employeeUser?.name || 'Employee',
        details: `Manager: ${mgr?.name || 'N/A'} (${mgr?.email || ''})`,
      });
    }
  }

  if (changed) await workflow.save();
  return workflow;
}

/**
 * Marks IT setup complete and finishes onboarding (admin/HR).
 */
export async function completeItSetup(employeeId) {
  const workflow = await Workflow.findOne({ employeeId });
  if (!workflow) throw new Error('Workflow not found');
  if (workflow.currentStep !== 'IT_SETUP') {
    throw new Error('Workflow must be in IT_SETUP to complete');
  }

  workflow.currentStep = 'COMPLETED';
  pushHistory(workflow, 'COMPLETED', 'it_setup_done');
  await workflow.save();

  await EmployeeProfile.findByIdAndUpdate(employeeId, { status: 'completed' });

  const profile = await EmployeeProfile.findById(employeeId).populate('userId');
  const employeeUser = profile?.userId;
  await notifyOnboardingWelcome({
    toEmail: employeeUser?.email,
    employeeName: employeeUser?.name || 'Employee',
  });

  return workflow;
}

