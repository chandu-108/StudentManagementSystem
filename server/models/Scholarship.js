import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  scholarshipName: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Selected', 'Not Selected'],
    default: 'Not Selected',
  },
  sanctionStatus: {
    type: String,
    enum: ['Pending Approval', 'Sanctioned', 'Rejected'],
    default: 'Pending Approval',
  },
  reimbursementPaid: {
    type: Boolean,
    default: false,
  },
  reimbursementDate: {
    type: Date,
  },
  sanctionedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sanctionedAt: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
export default Scholarship;
