import Note from '../models/Note.js';
import fs from 'fs';
import path from 'path';

export const uploadNote = async (req, res) => {
  try {
    const { title, subject, semester, department } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    const note = await Note.create({
      title,
      subject,
      semester: Number(semester),
      department: department || 'General',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { search, semester, subject, department } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (department && department !== 'All') filter.department = department;

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name college')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const incrementDownload = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ downloadCount: note.downloadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    if (note.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: can only delete your own notes.' });
    }

    const filePath = path.join(process.cwd(), note.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};