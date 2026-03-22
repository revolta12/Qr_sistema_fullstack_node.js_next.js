const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminManagement {
    // Get all admins (without passwords)
    static async getAll() {
        try {
            const [admins] = await pool.execute(
                'SELECT id_admin, username, naran, created_at FROM admin ORDER BY created_at DESC'
            );
            return admins;
        } catch (error) {
            throw error;
        }
    }

    // Get admin by ID
    static async getById(id) {
        try {
            const [admins] = await pool.execute(
                'SELECT id_admin, username, naran, created_at FROM admin WHERE id_admin = ?',
                [id]
            );
            return admins[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Check if username exists
    static async checkUsernameExists(username, excludeId = null) {
        try {
            let query = 'SELECT id_admin FROM admin WHERE username = ?';
            const params = [username];

            if (excludeId) {
                query += ' AND id_admin != ?';
                params.push(excludeId);
            }

            const [admins] = await pool.execute(query, params);
            return admins.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Create new admin
    static async create(adminData) {
        try {
            const { username, password, naran } = adminData;
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await pool.execute(
                'INSERT INTO admin (username, password, naran) VALUES (?, ?, ?)',
                [username, hashedPassword, naran]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update admin
    static async update(id, adminData) {
        try {
            const { username, password, naran } = adminData;

            let query = 'UPDATE admin SET username = ?, naran = ?';
            let params = [username, naran];

            // Update password if provided
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                query += ', password = ?';
                params.push(hashedPassword);
            }

            query += ' WHERE id_admin = ?';
            params.push(id);

            const [result] = await pool.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete admin
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM admin WHERE id_admin = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminManagement;