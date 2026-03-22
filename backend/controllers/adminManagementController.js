const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const SystemLogsController = require('./systemLogsController');

class AdminManagement {
    // Get all admins with password hash
    static async getAll() {
        const query = `
            SELECT id_admin, username, password, naran, created_at 
            FROM admin 
            ORDER BY created_at DESC
        `;
        const [admins] = await pool.execute(query);
        return admins;
    }

    // Get admin by ID with password hash
    static async getById(id) {
        const query = `
            SELECT id_admin, username, password, naran, created_at 
            FROM admin 
            WHERE id_admin = ?
        `;
        const [admins] = await pool.execute(query, [id]);
        return admins.length > 0 ? admins[0] : null;
    }

    // Check if username exists
    static async checkUsernameExists(username, excludeId = null) {
        let query = 'SELECT id_admin FROM admin WHERE username = ?';
        const params = [username];

        if (excludeId) {
            query += ' AND id_admin != ?';
            params.push(excludeId);
        }

        const [admins] = await pool.execute(query, params);
        return admins.length > 0;
    }

    // Create new admin
    static async create({ username, password, naran }) {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO admin (username, password, naran) 
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.execute(query, [username, hashedPassword, naran]);
        return result.insertId;
    }

    // Update admin
    static async update(id, { username, password, naran }) {
        let query = 'UPDATE admin SET username = ?, naran = ?';
        const params = [username, naran];

        // Include password if provided
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id_admin = ?';
        params.push(id);

        const [result] = await pool.execute(query, params);
        return result.affectedRows > 0;
    }

    // Delete admin
    static async delete(id) {
        const query = 'DELETE FROM admin WHERE id_admin = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

class AdminManagementController {
    // Get all admins 
    static async getAllAdmins(req, res) {
        try {
            const admins = await AdminManagement.getAll();
            
            // Transform data
            const adminsWithPassword = admins.map(admin => ({
                id_admin: admin.id_admin,
                username: admin.username,
                password: admin.password,
                naran: admin.naran,
                created_at: admin.created_at
            }));

            res.json({
                success: true,
                data: adminsWithPassword
            });
        } catch (error) {
            console.error('Get admins error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create new admin
    static async createAdmin(req, res) {
        try {
            const { username, password, naran } = req.body;

            console.log('Creating new admin:', { username, naran });

            if (!username || !password || !naran) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, password no naran obrigatoriu'
                });
            }

            // Check if username already exists
            const usernameExists = await AdminManagement.checkUsernameExists(username);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username "' + username + '" ona iha, uza username seluk'
                });
            }

            // Create new admin
            const adminId = await AdminManagement.create({
                username,
                password, 
                naran
            });

            // Get created admin data with password hash
            const newAdmin = await AdminManagement.getById(adminId);

            // Log the action
            await SystemLogsController.addSystemLog(
                'info',
                'ADMIN',
                'Admin foun rejistu: ' + username,
                { created_by: req.admin.username, new_admin: username }
            );

            res.json({
                success: true,
                message: 'Admin rejistu ho susesu',
                data: {
                    id_admin: newAdmin.id_admin,
                    username: newAdmin.username,
                    password: newAdmin.password,
                    naran: newAdmin.naran,
                    created_at: newAdmin.created_at
                }
            });

        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update admin
    static async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { username, password, naran } = req.body;

            console.log('📝 Updating admin:', { id, username, naran });

            if (!username || !naran) {
                return res.status(400).json({
                    success: false,
                    message: 'Username no naran obrigatoriu'
                });
            }

            // Check if admin exists
            const existingAdmin = await AdminManagement.getById(id);
            if (!existingAdmin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin la hetan'
                });
            }

            // Check if username already exists (excluding current admin)
            const usernameExists = await AdminManagement.checkUsernameExists(username, id);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username "' + username + '" ona iha, uza username seluk'
                });
            }

            // Prevent updating yourself with empty password
            if (parseInt(id) === req.admin.id_admin && !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Password obrigatoriu atu atualiza ita nia an rasik'
                });
            }

            // Update admin
            const updateData = { username, naran };
            if (password) {
                updateData.password = password;
            }

            const updated = await AdminManagement.update(id, updateData);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'La bele atualiza admin'
                });
            }

            // Get updated admin data with password hash
            const updatedAdmin = await AdminManagement.getById(id);

            // Log the action
            await SystemLogsController.addSystemLog(
                'info',
                'ADMIN', 
                'Admin atualiza: ' + username,
                { updated_by: req.admin.username, admin_id: id }
            );

            res.json({
                success: true,
                message: 'Admin atualiza ho susesu',
                data: {
                    id_admin: updatedAdmin.id_admin,
                    username: updatedAdmin.username,
                    password: updatedAdmin.password,
                    naran: updatedAdmin.naran,
                    created_at: updatedAdmin.created_at
                }
            });

        } catch (error) {
            console.error('Update admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete admin
    static async deleteAdmin(req, res) {
        try {
            const { id } = req.params;

            console.log('Deleting admin:', id);

            // Prevent deleting yourself
            if (parseInt(id) === req.admin.id_admin) {
                return res.status(400).json({
                    success: false,
                    message: 'La bele halakon ita nia an rasik'
                });
            }

            // Check if admin exists and get details for logging
            const adminToDelete = await AdminManagement.getById(id);
            if (!adminToDelete) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin la hetan'
                });
            }

            // Delete admin
            const deleted = await AdminManagement.delete(id);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'La bele halakon admin'
                });
            }
            // log the  action             
            await SystemLogsController.addSystemLog(
                'warnig',
                'ADMIN',
                'Admin halakon' + adminToDelete.username,
                {deleted_by :req.admin.username,admin_id:id}
            );

    
            res.json({
                success: true,
                message: 'Admin halakon ho susesu',
                data: {
                    deleted_admin: adminToDelete.username,
                    password_hash: adminToDelete.password,
                }
            });

        } catch (error) {
            console.error('Delete admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get admin profile (for current user)
    static async getAdminProfile(req, res) {
        try {
            const admin = await AdminManagement.getById(req.admin.id_admin);
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin la hetan'
                });
            }

            res.json({
                success: true,
                data: {
                    id_admin: admin.id_admin,
                    username: admin.username,
                    password: admin.password,
                    naran: admin.naran,
                    created_at: admin.created_at
                }
            });

        } catch (error) {
            console.error('Get admin profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get single admin by ID
    static async getAdminById(req, res) {
        try {
            const { id } = req.params;
            const admin = await AdminManagement.getById(id);
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin la hetan'
                });
            }

            res.json({
                success: true,
                data: {
                    id_admin: admin.id_admin,
                    username: admin.username,
                    password: admin.password,
                    naran: admin.naran,
                    created_at: admin.created_at
                }
            });

        } catch (error) {
            console.error('Get admin by ID error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AdminManagementController;