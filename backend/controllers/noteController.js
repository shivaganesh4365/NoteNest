import Note from '../models/Note.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

export const uploadNote = async (req, res) => {
  try {
    const { title, subject, semester, department, tags } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    // Parse comma-separated or JSON tags
    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    }

    const note = await Note.create({
      title,
      subject,
      semester: Number(semester),
      department: department || 'General',
      tags: parsedTags,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    // Reward uploader with +10 Credits
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { credits: 10 } },
      { new: true }
    );

    res.status(201).json({
      note,
      remainingCredits: user.credits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { search, semester, subject, department, tag, sort } = req.query;
    const filter = { isArchived: false };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (department && department !== 'All') filter.department = department;
    if (tag) filter.tags = { $in: [tag] };

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { downloadCount: -1 };
    if (sort === 'upvotes') sortOption = { upvotes: -1 };

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name college')
      .sort(sortOption);

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleNoteDownload = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const downloader = await User.findById(req.user.id);
    if (!downloader) return res.status(404).json({ message: 'User not found.' });

    const isOwner = note.uploadedBy.toString() === req.user.id;
    const alreadyDownloaded = downloader.downloadedNotes?.some(
      (id) => id.toString() === note._id.toString()
    );

    // Free access: Author or re-downloading previously unlocked note
    if (isOwner || alreadyDownloaded) {
      return res.json({
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        credits: downloader.credits
      });
    }

    // Check balance
    const DOWNLOAD_COST = 2;
    if ((downloader.credits || 0) < DOWNLOAD_COST) {
      return res.status(403).json({
        message: 'Insufficient credits. Upload notes to earn more credits!'
      });
    }

    // 1. Deduct 2 credits and add note to downloader's history
    downloader.credits -= DOWNLOAD_COST;
    downloader.downloadedNotes = downloader.downloadedNotes || [];
    downloader.downloadedNotes.push(note._id);
    await downloader.save();

    // 2. Pay +1 credit royalty to the uploader
    await User.findByIdAndUpdate(note.uploadedBy, { $inc: { credits: 1 } });

    // 3. Increment note download count and access time
    note.downloadCount = (note.downloadCount || 0) + 1;
    note.lastAccessedAt = new Date();
    await note.save();

    res.json({
      fileUrl: note.fileUrl,
      fileName: note.fileName,
      credits: downloader.credits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const userId = req.user.id;
    const index = note.upvotes.indexOf(userId);

    if (index === -1) {
      note.upvotes.push(userId);
    } else {
      note.upvotes.splice(index, 1);
    }

    await note.save();
    res.json({ upvotesCount: note.upvotes.length, hasUpvoted: index === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const noteId = req.params.id;

    const exists = user.savedNotes?.some((id) => id.toString() === noteId);

    if (exists) {
      user.savedNotes = user.savedNotes.filter((id) => id.toString() !== noteId);
    } else {
      user.savedNotes = user.savedNotes || [];
      user.savedNotes.push(noteId);
    }

    await user.save();
    res.json({ isBookmarked: !exists, savedNotes: user.savedNotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedNotes',
      populate: { path: 'uploadedBy', select: 'name college' }
    });
    res.json(user.savedNotes || []);
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