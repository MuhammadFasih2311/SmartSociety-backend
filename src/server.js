import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import adminResidentRoutes from './routes/admin/adminResidentRoutes.js';
import adminGuardRoutes from './routes/admin/adminGuardRoutes.js';
import guardVisitorRoutes from './routes/guard/guardVisitorRoutes.js';
import guardDashboardRoutes from './routes/guard/guardDashboardRoutes.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import billingRoutes from './routes/admin/adminBillingRoutes.js';
import adminComplaintRoutes from './routes/admin/adminComplaintRoutes.js';
import securityRoutes from './routes/admin/adminSecurityRoutes.js';
import adminNoticeRoutes from './routes/admin/adminNoticeRoutes.js';
import settingsRoutes from './routes/admin/adminSettingsRoutes.js';
import dashboardRoutes from './routes/admin/adminDashboardRoutes.js';
import adminAmenityRoutes from './routes/admin/adminAmenityRoutes.js';
import adminAmenityBookingRoutes from './routes/admin/adminAmenityBookingRoutes.js';
import gateRoutes from './routes/guard/guardGateRoutes.js';
import guardRoutes from './routes/guard/guardRoutes.js';
import reportRoutes from './routes/guard/guardReportRoutes.js';

import residentRoutes from './routes/resident/residentRoutes.js';
import visitorPassRoutes from './routes/resident/residentVisitorPassRoutes.js';
import residentPassRoutes from './routes/resident/residentPassRoutes.js';
import residentBillRoutes from './routes/resident/residentBillRoutes.js';
import maintenanceBillRoutes from './routes/resident/residentMaintenanceBillRoutes.js';
import residentComplaintRoutes from './routes/resident/residentComplaintRoutes.js';
import residentAmenityBookingRoutes from './routes/resident/residentAmenityBookingRoutes.js';
import residentAmenityRoutes from './routes/resident/residentAmenityRoutes.js';
import residentNoticeRoutes from './routes/resident/residentNoticeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - FINAL FIX
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.options('*', cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB();

console.log('Server initializing...');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/guard/dashboard', guardDashboardRoutes);
app.use('/api/guard', guardVisitorRoutes);
app.use('/api/guard', gateRoutes);
app.use('/api/guard/reports', reportRoutes);
app.use('/api/guard', guardRoutes);

app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/residents', adminResidentRoutes);
app.use('/api/admin/guards', adminGuardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/billing', billingRoutes);
app.use('/api/admin/complaints', adminComplaintRoutes);
app.use('/api/admin/security', securityRoutes);
app.use('/api/admin/notices', adminNoticeRoutes);
app.use('/api/admin/amenities/bookings', adminAmenityBookingRoutes);
app.use('/api/admin/amenities', adminAmenityRoutes);
app.use('/api/admin/settings', settingsRoutes);

app.use('/api/resident', residentRoutes);
app.use('/api/resident', visitorPassRoutes);
app.use('/api/resident', maintenanceBillRoutes);
app.use('/api/resident', residentComplaintRoutes);
app.use('/api/resident', residentAmenityBookingRoutes);
app.use('/api/resident', residentAmenityRoutes);
app.use('/api/resident', residentNoticeRoutes);
app.use('/api', residentPassRoutes);
app.use('/api', residentBillRoutes);
app.use('/api', residentAmenityRoutes);
app.use('/api', residentAmenityBookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SmartSociety API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});