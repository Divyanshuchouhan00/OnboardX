import { Document } from '../models/Document.js';
import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { resolveFileUrl } from '../services/uploadService.js';
import { syncWorkflowForEmployee } from '../services/workflowService.js';
import { notifyDocumentRejected } from '../services/notificationService.js';

/**
 * Upload a document for the authenticated employee.
 */
export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { type = 'other' } = req.body;
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const localPath = req.file.path;
    const { fileUrl, publicId } = await resolveFileUrl(localPath);

    const doc = await Document.create({
      employeeId: profile._id,
      type,
      fileName: req.file.originalname,
      fileUrl,
      publicId,
      verificationStatus: 'pending',
    });

    await syncWorkflowForEmployee(profile._id);

    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
}

/**
 * List documents for the authenticated employee.
 */
export async function listMyDocuments(req, res) {
  try {
    const p = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!p) return res.status(404).json({ message: 'Profile not found' });
    const docs = await Document.find({ employeeId: p._id }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * List documents by employee profile id (HR/Admin).
 */
export async function listDocuments(req, res) {
  try {
    const { employeeId } = req.params;
    const docs = await Document.find({ employeeId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * HR/Admin approve or reject a document.
 */
export async function reviewDocument(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }

    const doc = await Document.findById(id).populate({
      path: 'employeeId',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.verificationStatus = status;
    doc.reviewedBy = req.user._id;
    doc.reviewNote = note;
    await doc.save();

    const empUser = doc.employeeId?.userId;
    if (empUser?.email && status === 'rejected') {
      await notifyDocumentRejected({
        toEmail: empUser.email,
        employeeName: empUser.name,
        note,
      });
    }

    await syncWorkflowForEmployee(doc.employeeId._id);

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
