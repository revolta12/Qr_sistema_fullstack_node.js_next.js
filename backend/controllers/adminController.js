const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AdminController {
    
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username no password obrigatoriu'
                });
            }

            const admin = await Admin.login(username, password);
            
         
            const token = jwt.sign(
                { id: admin.id_admin, username: admin.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                message: 'Login susesu',
                data: {
                    token,
                    admin: {
                        id: admin.id_admin,
                        username: admin.username,
                        nama: admin.nama
                    }
                }
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get admin profile
    static async getProfile(req, res) {
        try {
            const admin = await Admin.getById(req.admin.id_admin);
            
            res.json({
                success: true,
                data: admin
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const adminId = req.admin.id_admin;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Password atual no foun obrigatoriu'
                });
            }

            // Verify current password
            const [admins] = await pool.execute(
                'SELECT password FROM admin WHERE id_admin = ?',
                [adminId]
            );

            if (admins.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin la hetan'
                });
            }

            const validPassword = await bcrypt.compare(currentPassword, admins[0].password);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Password atual la loos'
                });
            }

            await Admin.changePassword(adminId, newPassword);

            res.json({
                success: true,
                message: 'Password altera susesu'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            // Total employees
            const [totalEmployees] = await pool.execute(
                'SELECT COUNT(*) as total FROM tb_funsionario WHERE status_aktif = TRUE'
            );

            // Today's attendance
            const [todayAttendance] = await pool.execute(
                'SELECT COUNT(*) as total FROM absensi WHERE data = ?',
                [today]
            );

            // Pending salaries
            const [pendingSalaries] = await pool.execute(
                'SELECT COUNT(*) as total FROM gaji WHERE status = "pending" AND fulan = ? AND tinan = ?',
                [currentMonth, currentYear]
            );

            // Recent activities
            const [recentActivities] = await pool.execute(
                `SELECT a.data, a.oras_tama, f.naran_funsionario 
                 FROM absensi a 
                 JOIN tb_funsionario f ON a.id_funsionario = f.id_funsionario 
                 ORDER BY a.created_at DESC 
                 LIMIT 10`
            );

            res.json({
                success: true,
                data: {
                    totalEmployees: totalEmployees[0].total,
                    todayAttendance: todayAttendance[0].total,
                    pendingSalaries: pendingSalaries[0].total,
                    recentActivities
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
}

module.exports = AdminController;