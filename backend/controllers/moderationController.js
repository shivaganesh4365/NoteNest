import Note from '../models/Note.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

export const createReport = async (req, res) => {
  try {
    const { reason, details = '' } = req.body;
    const allowedReasons = ['copyright', 'inappropriate', 'misleading', 'personal_information', 'other'];
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ message: 'Choose a valid report reason.' });
    }

    const note = await Note.findById(req.params.id).select('uploadedBy reviewStatus isArchived');
    if (!note) return res.status(404).json({ message: 'Resource not found.' });
    if (note.isArchived || !['approved', undefined].includes(note.reviewStatus)) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    if (note.uploadedBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot report your own resource.' });
    }

    const report = await Report.create({
      note: note._id,
      reporter: req.user.id,
      reason,
      details: typeof details === 'string' ? details.trim().slice(0, 1000) : ''
    });

    return res.status(201).json({ message: 'Your report has been sent to the moderation team.', reportId: report._id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reported this resource.' });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getModerationQueue = async (req, res) => {
  try {
    const [pendingNotes, openReports] = await Promise.all([
      Note.find({ reviewStatus: 'pending' })
        .populate('uploadedBy', 'name email college')
        .sort({ createdAt: 1 }),
      Report.find({ status: 'open' })
        .populate('reporter', 'name email')
        .populate({
          path: 'note',
          populate: { path: 'uploadedBy', select: 'name email college' }
        })
        .sort({ createdAt: 1 })
    ]);

    return res.json({ pendingNotes, openReports });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reviewNote = async (req, res) => {
  try {
    const { decision, note: moderationNote = '' } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be approved or rejected.' });
    }

    const existingNote = await Note.findById(req.params.id);
    if (!existingNote) return res.status(404).json({ message: 'Resource not found.' });
    if (existingNote.reviewStatus !== 'pending') {
      return res.status(409).json({ message: 'This resource has already been reviewed.' });
    }

    if (decision === 'approved' && !(await User.exists({ _id: existingNote.uploadedBy }))) {
      return res.status(404).json({ message: 'Contributor account not found; resource cannot be approved.' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, reviewStatus: 'pending' },
      {
        $set: {
          reviewStatus: decision,
          moderationNote: typeof moderationNote === 'string' ? moderationNote.trim().slice(0, 1000) : '',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          creditAwarded: decision === 'approved'
        }
      },
      { new: true }
    );
    if (!note) return res.status(409).json({ message: 'This resource has already been reviewed.' });

    if (decision === 'approved') {
      await User.findByIdAndUpdate(
        note.uploadedBy,
        { $inc: { credits: 10 } },
        { new: true }
      ).select('credits');
    }

    return res.json({
      message: decision === 'approved' ? 'Resource approved and contributor rewarded.' : 'Resource rejected.',
      note
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { decision } = req.body;
    if (!['resolved', 'dismissed'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be resolved or dismissed.' });
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, status: 'open' },
      { $set: { status: decision, reviewedBy: req.user.id, reviewedAt: new Date() } },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Open report not found.' });

    if (decision === 'resolved') {
      await Note.findByIdAndUpdate(report.note, {
        $set: {
          reviewStatus: 'rejected',
          moderationNote: 'Removed after a community report was reviewed.',
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      });
    }

    return res.json({ message: `Report ${decision}.` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
