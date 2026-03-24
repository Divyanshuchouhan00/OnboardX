import { Document } from '../models/Document.js';
import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { User } from '../models/User.js';
import { Workflow } from '../models/Workflow.js';

/** Users allowed to be assigned as people managers in onboarding */
const ELIGIBLE_MANAGER_ROLES = ['admin', 'hr', 'manager'];

async function assertEligibleManager(managerId) {
  const manager = await User.findById(managerId);
  if (!manager) {
    return { error: { status: 404, message: 'Manager user not found' } };
  }
  if (!ELIGIBLE_MANAGER_ROLES.includes(manager.role)) {
    return {
      error: {
        status: 400,
        message: 'managerId must reference a user with role admin, hr, or manager',
      },
    };
  }
  return { manager };
}

/**
 * Users who can be selected as an employee's manager (HR/Admin UI).
 */
export async function listEligibleManagers(req, res) {
  try {
    const users = await User.find({ role: { $in: ELIGIBLE_MANAGER_ROLES } })
      .select('name email role')
      .sort({ name: 1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * List employees (HR/Admin).
 */
export async function listEmployees(req, res) {
  try {
    const profiles = await EmployeeProfile.find()
      .populate('userId', 'name email role')
      .populate('manager', 'name email role')
      .populate('assignedManager', 'name email role')
      .sort({ createdAt: -1 });
    return res.json(profiles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Current employee's profile (convenience route).
 */
export async function getMyProfile(req, res) {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email role')
      .populate('manager', 'name email role')
      .populate('assignedManager', 'name email role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Get profile by id (HR/Admin only).
 */
export async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    let profile;

    profile = await EmployeeProfile.findById(id)
      .populate('userId', 'name email role')
      .populate('manager', 'name email role')
      .populate('assignedManager', 'name email role');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Create employee profile for existing user (Admin) — optional onboarding path.
 */
export async function createEmployeeProfile(req, res) {
  try {
    const { userId, personalDetails } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'employee') {
      return res.status(400).json({ message: 'User must be an employee' });
    }

    const existing = await EmployeeProfile.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    const profile = await EmployeeProfile.create({
      userId,
      personalDetails: personalDetails || {},
      status: 'onboarding',
    });

    await Workflow.create({
      employeeId: profile._id,
      currentStep: 'SUBMITTED',
      history: [{ step: 'SUBMITTED', action: 'profile_created', at: new Date() }],
    });

    return res.status(201).json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Update employee profile (employee updates self, HR/Admin can update any).
 */
export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { personalDetails, status } = req.body;

    let profile;
    if (req.user.role === 'employee') {
      profile = await EmployeeProfile.findOne({ userId: req.user._id });
    } else {
      profile = await EmployeeProfile.findById(id);
    }

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (req.user.role === 'employee' && String(profile.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (personalDetails) {
      profile.personalDetails = { ...profile.personalDetails?.toObject?.() || profile.personalDetails, ...personalDetails };
    }
    if (status && ['hr', 'admin'].includes(req.user.role)) {
      profile.status = status;
    }

    await profile.save();
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function applyManagerAssignment(employeeProfileId, managerId) {
  if (!managerId) {
    return { error: { status: 400, message: 'managerId is required' } };
  }
  const { error, manager } = await assertEligibleManager(managerId);
  if (error) return { error };

  const profile = await EmployeeProfile.findById(employeeProfileId);
  if (!profile) {
    return { error: { status: 404, message: 'Employee profile not found' } };
  }

  profile.assignedManager = manager._id;
  profile.manager = manager._id;
  await profile.save();

  const { syncWorkflowForEmployee } = await import('../services/workflowService.js');
  await syncWorkflowForEmployee(profile._id);

  const updated = await EmployeeProfile.findById(employeeProfileId)
    .populate('userId', 'name email role')
    .populate('assignedManager', 'name email role')
    .populate('manager', 'name email role');
  return { updated };
}

/**
 * PATCH /api/employees/:id/assign-manager — HR/Admin; validates manager role; advances workflow when at MANAGER_ASSIGNED.
 */
export async function assignManagerViaHR(req, res) {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const { error, updated } = await applyManagerAssignment(id, managerId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/employees/:id/manager — Admin only; same behavior as assign-manager (legacy route).
 */
export async function assignManager(req, res) {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const { error, updated } = await applyManagerAssignment(id, managerId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Delete employee profile (Admin) — cascades handled in app or manual.
 */
export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    await Document.deleteMany({ employeeId: id });
    await EmployeeProfile.findByIdAndDelete(id);
    await Workflow.deleteOne({ employeeId: id });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
