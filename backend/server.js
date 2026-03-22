const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');

// IMPORT ROUTES
const adminManagementRoutes = require('./routes/adminManagementRoutes');
const emailConfigRoutes = require('./routes/emailConfigRoutes');
const systemLogsRoutes = require('./routes/systemLogsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// PERBAIKI CORS DI SINI:
app.use(cors({
  origin: 'http://localhost:3000', // URL frontend Next.js
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);

//  ROUTES CRUD
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/system-logs', systemLogsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'QR Attendance System API',
        version: '1.0.0',
        endpoints: {
            admin: '/api/admin',
            employees: '/api/employees', 
            attendance: '/api/attendance',
            salary: '/api/salary',
            admin_management: '/api/admin-management',
            email_config: '/api/email-config',
            system_logs: '/api/system-logs',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint la hetan: ' + req.method + ' ' + req.url
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno server',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Frontend: http://localhost:3000`);
    console.log('');
    console.log('ROUTES  TERDAFTAR:');
    console.log('   /api/admin-management - CRUD Admin');
    console.log('   /api/email-config - Konfigurasi Email');
    console.log('   /api/system-logs - Log Sistem');
    console.log('   /api/system-settings - Pengaturan Sistem');
    console.log('   /api/admin - Login Admin');
    console.log('   /api/employees - Data Karyawan');
    console.log('   /api/attendance - Absensi');
    console.log('   /api/salary - Gaji');
});

module.exports = app;