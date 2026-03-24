import { Workflow } from '../models/Workflow.js';
import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { completeItSetup, syncWorkflowForEmployee } from '../services/workflowService.js';

/**
 * Workflow for the authenticated employee.
 */
export async function getMyWorkflow(req, res) {
  try {
    const p = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!p) return res.status(404).json({ message: 'Profile not found' });
    const workflow = await Workflow.findOne({ employeeId: p._id });
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    return res.json(workflow);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Workflow by employee profile id (HR/Admin).
 */
export async function getWorkflow(req, res) {
  try {
    const { employeeId } = req.params;
    const workflow = await Workflow.findOne({ employeeId });
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    return res.json(workflow);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Admin/HR marks IT setup complete → COMPLETED (legacy POST).
 */
export async function postCompleteIt(req, res) {
  try {
    const { employeeId } = req.params;
    const workflow = await completeItSetup(employeeId);
    return res.json(workflow);
  } catch (err) {
    const code = err.message.includes('not found') ? 404 : 400;
    return res.status(code).json({ message: err.message });
  }
}

/**
 * PATCH /api/workflow/:employeeId/complete-it-setup — HR/Admin; requires currentStep === IT_SETUP.
 */
export async function patchCompleteItSetup(req, res) {
  try {
    const { employeeId } = req.params;
    const workflow = await completeItSetup(employeeId);
    return res.json(workflow);
  } catch (err) {
    const code = err.message.includes('not found') ? 404 : 400;
    return res.status(code).json({ message: err.message });
  }
}

/**
 * Re-evaluate workflow (e.g. after data fix).
 */
export async function postSync(req, res) {
  try {
    const { employeeId } = req.params;
    const w = await syncWorkflowForEmployee(employeeId);
    return res.json(w);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
