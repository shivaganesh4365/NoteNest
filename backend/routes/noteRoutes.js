import express from 'express';
import {
  uploadNote,
  getNotes,
  getUserNotes,
  deleteNote,
  handleNoteDownload,
  toggleUpvote,
  toggleBookmark,
  getSavedNotes
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { runLifecycleSweep } from '../services/lifecycleService.js';

const router = express.Router();

router.get('/', getNotes);
router.post('/', protect, upload.single('file'), uploadNote);
router.get('/my-notes', protect, getUserNotes);
router.get('/saved', protect, getSavedNotes);

// Protected atomic credit download
router.post('/:id/download', protect, handleNoteDownload);

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