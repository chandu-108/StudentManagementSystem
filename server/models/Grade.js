import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Mid-term', 'Final', 'Assignment'],
    required: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin or teacher
    required: true
  }
}, {
  timestamps: true
});

gradeSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
