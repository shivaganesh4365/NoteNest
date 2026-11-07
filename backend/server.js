import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { initLifecycleScheduler } from './services/lifecycleService.js';

dotenv.config();

const app = express();

// Absolute paths matching uploadMiddleware
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const archivedDir = path.resolve(process.cwd(), 'archived_uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(archivedDir)) fs.mkdirSync(archivedDir, { recursive: true });

app.use(cors());
app.use(express.json());

// Serve static directories with CORS headers enabled
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsDir)
);

app.use(
  '/archived_uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(archivedDir)
);

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/', (req, res) => {
  res.send({ status: 'API is working' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] NoteNest backend running on port ${PORT}`);
    console.log(`[Server] Serving uploads from: ${uploadsDir}`);
    initLifecycleScheduler();
  });
});