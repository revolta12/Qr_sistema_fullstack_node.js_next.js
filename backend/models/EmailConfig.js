const { pool } = require('../config/database');

class EmailConfig {
    // Get active email configuration
    static async getActiveConfig() {
        try {
            const [configs] = await pool.execute(
                'SELECT * FROM email_config WHERE status_aktif = TRUE ORDER BY created_at DESC LIMIT 1'
            );
            return configs[0] || null;
        } catch (error) {
            console.error(' Error getting email config:', error);
            throw error;
        }
    }

    // Get all email configurations
    static async getAll() {
        try {
            const [configs] = await pool.execute(
                'SELECT id_config, email_host, email_port, email_user, email_from_name, status_aktif, created_at FROM email_config ORDER BY created_at DESC'
            );
            return configs;
        } catch (error) {
            console.error(' Error getting all email configs:', error);
            throw error;
        }
    }

    // Create new email configuration
    static async create(configData) {
        try {
            const { email_host, email_port, email_user, email_password, email_from_name } = configData;

            console.log('Creating new email config:', { email_host, email_port, email_user });

            // Deactivate all other configs
            await pool.execute(
                'UPDATE email_config SET status_aktif = FALSE'
            );

            const [result] = await pool.execute(
                `INSERT INTO email_config (email_host, email_port, email_user, email_password, email_from_name, status_aktif) 
                 VALUES (?, ?, ?, ?, ?, TRUE)`,
                [email_host, email_port, email_user, email_password, email_from_name]
            );

            console.log('✅ Email config created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error(' Error creating email config:', error);
            throw error;
        }
    }

    // Update email configuration
    static async update(id, configData) {
        try {
            const { email_host, email_port, email_user, email_password, email_from_name, status_aktif } = configData;

            console.log('Updating email config:', { id, email_host, email_user });

            // If activating this config, deactivate others
            if (status_aktif) {
                await pool.execute(
                    'UPDATE email_config SET status_aktif = FALSE WHERE id_config != ?',
                    [id]
                );
            }

            let query = '';
            let params = [];

            if (email_password) {
                query = `UPDATE email_config 
                         SET email_host = ?, email_port = ?, email_user = ?, email_password = ?, email_from_name = ?, status_aktif = ?
                         WHERE id_config = ?`;
                params = [email_host, email_port, email_user, email_password, email_from_name, status_aktif, id];
            } else {
                query = `UPDATE email_config 
                         SET email_host = ?, email_port = ?, email_user = ?, email_from_name = ?, status_aktif = ?
                         WHERE id_config = ?`;
                params = [email_host, email_port, email_user, email_from_name, status_aktif, id];
            }

            await pool.execute(query, params);
            console.log('✅ Email config updated successfully');
            return true;
        } catch (error) {
            console.error(' Error updating email config:', error);
            throw error;
        }
    }

    // Delete email configuration
    static async delete(id) {
        try {
            await pool.execute(
                'DELETE FROM email_config WHERE id_config = ?',
                [id]
            );
            console.log('✅ Email config deleted:', id);
            return true;
        } catch (error) {
            console.error(' Error deleting email config:', error);
            throw error;
        }
    }

    // Test email configuration
    static async testConfig(configData) {
        try {
            const { email_host, email_port, email_user, email_password } = configData;
            
            console.log('🧪 Testing email config:', { email_host, email_port, email_user });

            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host: email_host,
                port: email_port,
                secure: email_port === 465,
                auth: {
                    user: email_user,
                    pass: email_password,
                },
            });

            await transporter.verify();
            console.log('✅ Email config test successful');
            return { success: true, message: 'Koneksaun ho servisu email susesu' };
        } catch (error) {
            console.error(' Email config test failed:', error.message);
            return { success: false, message: `Erro: ${error.message}` };
        }
    }

    // Get email config by ID
    static async getById(id) {
        try {
            const [configs] = await pool.execute(
                'SELECT * FROM email_config WHERE id_config = ?',
                [id]
            );
            return configs[0] || null;
        } catch (error) {
            console.error(' Error getting email config by ID:', error);
            throw error;
        }
    }
}

module.exports = EmailConfig;