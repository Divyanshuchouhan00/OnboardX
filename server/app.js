import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import managerRoutes from './routes/managerRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json());

// Static files for local uploads (when not using Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Central error handler for multer and others
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Server error' });
});

export default app;
