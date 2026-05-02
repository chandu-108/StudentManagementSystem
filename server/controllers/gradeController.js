import Grade from '../models/Grade.js';

export const addGrade = async (req, res, next) => {
  try {
    const { studentId, subject, examType, marksObtained, totalMarks } = req.body;

    const grade = new Grade({
      student: studentId,
      subject,
      examType,
      marksObtained,
      totalMarks,
      recordedBy: req.user._id
    });

    const createdGrade = await grade.save();
    res.status(201).json(createdGrade);
  } catch (error) {
    next(error);
  }
};

export const getStudentGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId });
    res.json(grades);
  } catch (error) {
    next(error);
  }
};

export const getClassGrades = async (req, res, next) => {
  try {
    const { subject, examType } = req.query;
    
    if (!subject || !examType) {
      res.status(400);
      throw new Error('Subject and examType are required');
    }

    const grades = await Grade.find({ subject, examType });
    res.json(grades);
  } catch (error) {
    next(error);
  }
};

export const bulkSaveGrades = async (req, res, next) => {
  try {
    const { subject, examType, totalMarks, gradesData } = req.body;
    
    if (!subject || !examType || !totalMarks || !Array.isArray(gradesData)) {
      res.status(400);
      throw new Error('Subject, examType, totalMarks, and gradesData are required');
    }

    const bulkOps = gradesData.map(record => ({
      updateOne: {
        filter: { 
          student: record.studentId, 
          subject,
          examType
        },
        update: {
          $set: {
            student: record.studentId,
            subject,
            examType,
            marksObtained: record.marksObtained,
            totalMarks,
            recordedBy: req.user._id
          }
        },
        upsert: true
      }
    }));

    await Grade.bulkWrite(bulkOps);
    
    res.json({ message: 'Grades saved successfully' });
  } catch (error) {
    next(error);
  }
};
