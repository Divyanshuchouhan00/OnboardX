import mongoose from 'mongoose';

const personalDetailsSchema = new mongoose.Schema(
  {
    phone: String,
    address: String,
    department: String,
    jobTitle: String,
    startDate: Date,
  },
  { _id: false }
);

const employeeProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personalDetails: { type: personalDetailsSchema, default: {} },
    status: {
      type: String,
      enum: ['active', 'inactive', 'onboarding', 'completed'],
      default: 'onboarding',
    },
    /** @deprecated legacy alias — kept in sync with assignedManager for older data */
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);
