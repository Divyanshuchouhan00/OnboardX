import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { Workflow, WORKFLOW_STEPS } from '../models/Workflow.js';
import { Document } from '../models/Document.js';

function calculateProfileCompletion(personalDetails = {}) {
  const fields = ['phone', 'address', 'department', 'jobTitle', 'startDate'];
  const completed = fields.filter((field) => {
    const value = personalDetails[field];
    return value !== null && value !== undefined && String(value).trim() !== '';
  }).length;

  return Math.round((completed / fields.length) * 100);
}

function calculateProgressPercent(currentStep) {
  const stepIndex = WORKFLOW_STEPS.indexOf(currentStep);
  if (stepIndex < 0) {
    return 0;
  }
  return Math.round(((stepIndex + 1) / WORKFLOW_STEPS.length) * 100);
}

function summarizeDocuments(documents) {
  const summary = {
    total: documents.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    status: 'pending',
  };

  for (const doc of documents) {
    summary[doc.verificationStatus] += 1;
  }

  if (summary.total === 0) {
    summary.status = 'pending';
  } else if (summary.pending > 0 || summary.rejected > 0) {
    summary.status = 'in_progress';
  } else {
    summary.status = 'completed';
  }

  return summary;
}

function deriveOverallStatus(currentStep, profileCompletion, documentSummary) {
  if (currentStep === 'COMPLETED') {
    return 'completed';
  }
  if (currentStep === 'SUBMITTED' && profileCompletion < 100 && documentSummary.total === 0) {
    return 'pending';
  }
  return 'in_progress';
}

export async function listAssignedEmployees(req, res) {
  try {
    const profiles = await EmployeeProfile.find({ assignedManager: req.user._id })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    const profileIds = profiles.map((profile) => profile._id);

    const [workflows, documents] = await Promise.all([
      Workflow.find({ employeeId: { $in: profileIds } }),
      Document.find({ employeeId: { $in: profileIds } }).sort({ createdAt: -1 }),
    ]);

    const workflowByEmployeeId = new Map(
      workflows.map((workflow) => [String(workflow.employeeId), workflow])
    );
    const documentsByEmployeeId = new Map();

    for (const doc of documents) {
      const key = String(doc.employeeId);
      if (!documentsByEmployeeId.has(key)) {
        documentsByEmployeeId.set(key, []);
      }
      documentsByEmployeeId.get(key).push(doc);
    }

    const employees = profiles.map((profile) => {
      const employeeId = String(profile._id);
      const workflow = workflowByEmployeeId.get(employeeId);
      const employeeDocuments = documentsByEmployeeId.get(employeeId) || [];
      const profileCompletion = calculateProfileCompletion(profile.personalDetails || {});
      const currentStep = workflow?.currentStep || 'SUBMITTED';
      const progressPercent = calculateProgressPercent(currentStep);
      const documentsSummary = summarizeDocuments(employeeDocuments);

      return {
        id: profile._id,
        name: profile.userId?.name || 'Unknown employee',
        email: profile.userId?.email || '',
        currentStep,
        progressPercent,
        profileCompletion,
        status: deriveOverallStatus(currentStep, profileCompletion, documentsSummary),
        onboardingStatus: profile.status,
        documents: {
          ...documentsSummary,
          items: employeeDocuments.map((doc) => ({
            id: doc._id,
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            verificationStatus: doc.verificationStatus,
            reviewNote: doc.reviewNote || '',
            updatedAt: doc.updatedAt,
          })),
        },
        personalDetails: {
          phone: profile.personalDetails?.phone || '',
          address: profile.personalDetails?.address || '',
          department: profile.personalDetails?.department || '',
          jobTitle: profile.personalDetails?.jobTitle || '',
          startDate: profile.personalDetails?.startDate || null,
        },
        updatedAt: profile.updatedAt,
      };
    });

    return res.json(employees);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Could not load assigned employees' });
  }
}
