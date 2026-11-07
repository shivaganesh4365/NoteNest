import express from 'express';
import {
  uploadNote,
  getNotes,
  getUserNotes,
  deleteNote,
  handleNoteDownload,
  toggleUpvote,
  toggleBookmark,
  getSavedNotes,
  getNoteFile
} from '../controllers/noteController.js';
import { createReport, getModerationQueue, reviewNote, reviewReport } from '../controllers/moderationController.js';
import { protect, requireModerator } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { runLifecycleSweep } from '../services/lifecycleService.js';

const router = express.Router();

const receivePdf = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: error.message });
    }
    return next();
  });
};

router.get('/', getNotes);
router.post('/', protect, receivePdf, uploadNote);
router.get('/my-notes', protect, getUserNotes);
router.get('/saved', protect, getSavedNotes);
router.get('/moderation/queue', protect, requireModerator, getModerationQueue);
router.patch('/moderation/notes/:id', protect, requireModerator, reviewNote);
router.patch('/moderation/reports/:id', protect, requireModerator, reviewReport);

// Protected atomic credit download
router.post('/:id/download', protect, handleNoteDownload);
router.get('/:id/file', protect, getNoteFile);
router.post('/:id/report', protect, createReport);

router.patch('/:id/upvote', protect, toggleUpvote);
router.patch('/:id/bookmark', protect, toggleBookmark);
router.delete('/:id', protect, deleteNote);

router.post('/trigger-lifecycle', protect, async (req, res) => {
  try {
    await runLifecycleSweep();
    res.json({ message: 'Lifecycle sweep executed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;