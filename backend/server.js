import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import searchRoutes from './routes/search.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB (respect case-sensitive DB names)
const DB_NAME = process.env.MONGODB_DBNAME || 'Lumina';
const MONGODB_URI =
  process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log(' Connected to MongoDB');
})
.catch((error) => {
  console.error(' MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lumina API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Health: http://localhost:${PORT}/api/health`);
});

// Handle port conflicts gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, you can:`);
    console.error(`1. Stop the existing server (Ctrl+C in the terminal where it's running)`);
    console.error(`2. Or kill the process using: netstat -ano | findstr :${PORT}`);
    console.error(`   Then: taskkill /F /PID <process_id>`);
    console.error(`3. Or use a different port by setting PORT environment variable\n`);
    process.exit(1);
  } else {
    console.error(' Server error:', error);
    process.exit(1);
  }
});

