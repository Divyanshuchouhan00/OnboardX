import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { Workflow } from '../models/Workflow.js';

/**
 * Aggregated onboarding metrics for admin dashboard.
 */
export async function getAdminStats(req, res) {
  try {
    const [totalEmployees, pendingHR, inProgress, completed] = await Promise.all([
      EmployeeProfile.countDocuments(),
      Workflow.countDocuments({ currentStep: 'HR_REVIEW' }),
      Workflow.countDocuments({
        currentStep: { $in: ['SUBMITTED', 'MANAGER_ASSIGNED', 'IT_SETUP'] },
      }),
      Workflow.countDocuments({ currentStep: 'COMPLETED' }),
    ]);

    return res.json({
      totalEmployees,
      pendingHR,
      inProgress,
      completed,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
