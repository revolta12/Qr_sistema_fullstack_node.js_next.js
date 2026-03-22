const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    static async login(username, password) {
        try {
            const [admins] = await pool.execute(
                'SELECT * FROM admin WHERE username = ?',
                [username]
            );
            
            if (admins.length === 0) {
                throw new Error('Invalid credentials');
            }
            
            const admin = admins[0];
            const validPassword = await bcrypt.compare(password, admin.password);
            
            if (!validPassword) {
                throw new Error('Invalid credentials');
            }
            
            // Return admin data without password
            const { password: _, ...adminWithoutPassword } = admin;
            return adminWithoutPassword;
        } catch (error) {
            throw error;
        }
    }

    // Get admin by ID
    static async getById(id) {
        try {
            const [admins] = await pool.execute(
                'SELECT id_admin, username, nama, created_at FROM admin WHERE id_admin = ?',
                [id]
            );
            return admins[0] || null;
        } catch (error) {
            throw error;
        }
    }
    // Change password
    static async changePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.execute(
                'UPDATE admin SET password = ? WHERE id_admin = ?',
                [hashedPassword, id]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Admin;