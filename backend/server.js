import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { initLifecycleScheduler } from './services/lifecycleService.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Serve both live uploads and cold archives
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/archived_uploads', express.static(path.join(__dirname, 'archived_uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/', (req, res) => {
  res.send({ status: 'API is working' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] NoteNest backend running on port ${PORT}`);
    // Start automated background scheduler
    initLifecycleScheduler();
  });
});