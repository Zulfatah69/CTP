import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { initMinio } from './utils/minio';

const app = express();

// Init async services
initMinio();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Basic health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

import masterRoutes from './routes/master.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import documentRoutes from './routes/document.routes';
import auditRoutes from './routes/audit.routes';
import skmRoutes from './routes/skm.routes';
import reportRoutes from './routes/report.routes';
import announcementRoutes from './routes/announcement.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/skm', skmRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
