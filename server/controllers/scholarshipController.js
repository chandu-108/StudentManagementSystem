import Scholarship from '../models/Scholarship.js';
import Student from '../models/Student.js';

// ── GET all scholarships (admin: all, student: own) ─────────────────────────
export const getScholarships = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'Admin') {
      // Find the student record linked to this user
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.json([]);
      query = { studentId: student._id };
    }

    const scholarships = await Scholarship.find(query)
      .populate({ path: 'studentId', populate: { path: 'user', select: 'name email' } })
      .populate('sanctionedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST assign scholarship (admin only) ─────────────────────────────────────
export const assignScholarship = async (req, res) => {
  try {
    const { studentId, scholarshipName, amount, status, remarks } = req.body;

    const scholarship = await Scholarship.create({
      studentId,
      scholarshipName,
      amount,
      status: status || 'Not Selected',
      sanctionStatus: status === 'Selected' ? 'Pending Approval' : 'Pending Approval',
      remarks: remarks || '',
    });

    const populated = await scholarship.populate([
      { path: 'studentId', populate: { path: 'user', select: 'name email' } },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH change Selected / Not Selected (admin only) ────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status, scholarshipName, amount, remarks } = req.body;
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Not found' });

    scholarship.status = status;
    if (scholarshipName) scholarship.scholarshipName = scholarshipName;
    if (amount !== undefined) scholarship.amount = amount;
    if (remarks !== undefined) scholarship.remarks = remarks;
    // Reset sanction when moving to selected
    if (status === 'Selected') scholarship.sanctionStatus = 'Pending Approval';

    await scholarship.save();
    const populated = await scholarship.populate([
      { path: 'studentId', populate: { path: 'user', select: 'name email' } },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH sanction / reject money (admin only) ───────────────────────────────
export const sanctionScholarship = async (req, res) => {
  try {
    const { sanctionStatus, remarks } = req.body;
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Not found' });

    scholarship.sanctionStatus = sanctionStatus;
    scholarship.sanctionedBy = req.user._id;
    scholarship.sanctionedAt = new Date();
    if (remarks !== undefined) scholarship.remarks = remarks;
    // If rejected, reset reimbursement
    if (sanctionStatus === 'Rejected') {
      scholarship.reimbursementPaid = false;
      scholarship.reimbursementDate = undefined;
    }

    await scholarship.save();
    const populated = await scholarship.populate([
      { path: 'studentId', populate: { path: 'user', select: 'name email' } },
      { path: 'sanctionedBy', select: 'name' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PATCH mark reimbursement as paid (admin only) ────────────────────────────
export const markReimbursed = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ message: 'Not found' });
    if (scholarship.sanctionStatus !== 'Sanctioned')
      return res.status(400).json({ message: 'Scholarship must be sanctioned first' });

    scholarship.reimbursementPaid = true;
    scholarship.reimbursementDate = new Date();
    await scholarship.save();

    const populated = await scholarship.populate([
      { path: 'studentId', populate: { path: 'user', select: 'name email' } },
      { path: 'sanctionedBy', select: 'name' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── GET dashboard stats (admin only) ─────────────────────────────────────────
export const getScholarshipStats = async (req, res) => {
  try {
    const all = await Scholarship.find();
    const total        = all.length;
    const selected     = all.filter(s => s.status === 'Selected').length;
    const notSelected  = all.filter(s => s.status === 'Not Selected').length;
    const sanctioned   = all.filter(s => s.sanctionStatus === 'Sanctioned').length;
    const reimbPending = all.filter(s => s.sanctionStatus === 'Sanctioned' && !s.reimbursementPaid).length;

    const totalAmount     = all.filter(s => s.status === 'Selected').reduce((a, s) => a + s.amount, 0);
    const sanctionedAmount = all.filter(s => s.sanctionStatus === 'Sanctioned').reduce((a, s) => a + s.amount, 0);

    res.json({ total, selected, notSelected, sanctioned, reimbPending, totalAmount, sanctionedAmount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
