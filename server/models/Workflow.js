import mongoose from 'mongoose';

/**
 * Workflow steps align with onboarding: Submitted → HR Review → Manager Assigned → IT Setup → Completed
 */
export const WORKFLOW_STEPS = [
  'SUBMITTED',
  'HR_REVIEW',
  'MANAGER_ASSIGNED',
  'IT_SETUP',
  'COMPLETED',
];

const historyEntrySchema = new mongoose.Schema(
  {
    step: { type: String, required: true },
    action: String,
    meta: mongoose.Schema.Types.Mixed,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, unique: true },
    currentStep: {
      type: String,
      enum: WORKFLOW_STEPS,
      default: 'SUBMITTED',
    },
    history: [historyEntrySchema],
  },
  { timestamps: true }
);

export const Workflow = mongoose.model('Workflow', workflowSchema);
