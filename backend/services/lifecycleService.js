import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Note from '../models/Note.js';

const archiveDir = 'archived_uploads/';
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

/**
 * Lifecycle Policies:
 * 1. Archive: Notes older than 90 days with fewer than 3 downloads.
 * 2. Purge: Notes that have been archived for over 180 days.
 */
export const runLifecycleSweep = async () => {
  console.log('[Lifecycle Service] Starting automated storage sweep...');

  try {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const purgeCutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Rule 1: Find candidates to move to cold archive
    const archiveCandidates = await Note.find({
      isArchived: false,
      reviewStatus: { $in: ['approved', null] },
      createdAt: { $lte: ninetyDaysAgo },
      downloadCount: { $lt: 3 }
    });

    for (const note of archiveCandidates) {
      const currentPath = path.join(process.cwd(), note.fileUrl);
      const fileName = path.basename(note.fileUrl);
      const targetPath = path.join(archiveDir, fileName);

      if (fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, targetPath);
      }

      note.isArchived = true;
      note.archivedAt = new Date();
      note.fileUrl = `/archived_uploads/${fileName}`;
      await note.save();

      console.log(`[Lifecycle] Archived inactive note: "${note.title}" (${note._id})`);
    }

    // Rule 2: Purge long-dead archived records
    const purgeCandidates = await Note.find({
      isArchived: true,
      archivedAt: { $lte: purgeCutoff }
    });

    for (const deadNote of purgeCandidates) {
      const deadPath = path.join(process.cwd(), deadNote.fileUrl);
      if (fs.existsSync(deadPath)) {
        fs.unlinkSync(deadPath);
      }
      await deadNote.deleteOne();
      console.log(`[Lifecycle] Permanently purged expired note: "${deadNote.title}"`);
    }

    console.log(
      `[Lifecycle Service] Sweep complete. Archived: ${archiveCandidates.length}, Purged: ${purgeCandidates.length}`
    );
  } catch (error) {
    console.error(`[Lifecycle Service Error]: ${error.message}`);
  }
};

// Scheduled job: Runs every night at midnight (00:00)
export const initLifecycleScheduler = () => {
  cron.schedule('0 0 * * *', () => {
    runLifecycleSweep();
  });
  console.log('[Lifecycle Scheduler] Initialized to run nightly at 00:00');
};