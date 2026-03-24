import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
    type: {
      type: String,
      required: true,
      enum: ['id_proof', 'contract', 'tax_form', 'other'],
    },
    fileName: String,
    fileUrl: { type: String, required: true },
    publicId: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: String,
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
