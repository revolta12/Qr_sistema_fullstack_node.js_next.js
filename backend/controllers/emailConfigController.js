const { pool } = require('../config/database');
const nodemailer = require('nodemailer');

class EmailConfigController {
    // Get email configuration
    static async getEmailConfig(req, res) {
        try {
            console.log('Fetching email config from database...');
            
            const [configs] = await pool.execute(
                'SELECT * FROM email_config ORDER BY id_config DESC LIMIT 1'
            );

            console.log('Database result:', configs);

            if (configs.length === 0) {
                return res.json({
                    success: true,
                    data: null
                });
            }

            // Don't return password in response
            const config = { ...configs[0] };
            delete config.email_password;

            res.json({
                success: true,
                data: config
            });

        } catch (error) {
            console.error('Get email config error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update email configuration
    static async updateEmailConfig(req, res) {
        try {
            const { email_host, email_port, email_user, email_password, email_from_name, status_aktif } = req.body;

            console.log(' Updating email config:', { email_host, email_port, email_user, email_from_name, status_aktif });

            if (!email_host || !email_port || !email_user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email host, port no user obrigatoriu'
                });
            }

            // Check if config exists
            const [existingConfigs] = await pool.execute(
                'SELECT id_config FROM email_config ORDER BY id_config DESC LIMIT 1'
            );

            let result;
            if (existingConfigs.length > 0) {
                // Update existing config
                if (email_password) {
                    [result] = await pool.execute(
                        `UPDATE email_config 
                         SET email_host = ?, email_port = ?, email_user = ?, 
                             email_password = ?, email_from_name = ?, status_aktif = ?
                         WHERE id_config = ?`,
                        [email_host, email_port, email_user, email_password, email_from_name, status_aktif, existingConfigs[0].id_config]
                    );
                } else {
                    // Update without changing password
                    [result] = await pool.execute(
                        `UPDATE email_config 
                         SET email_host = ?, email_port = ?, email_user = ?, 
                             email_from_name = ?, status_aktif = ?
                         WHERE id_config = ?`,
                        [email_host, email_port, email_user, email_from_name, status_aktif, existingConfigs[0].id_config]
                    );
                }
            } else {
                // Insert new config
                [result] = await pool.execute(
                    `INSERT INTO email_config 
                     (email_host, email_port, email_user, email_password, email_from_name, status_aktif) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [email_host, email_port, email_user, email_password, email_from_name, status_aktif]
                );
            }

            res.json({
                success: true,
                message: 'Konfigurasaun email atualiza ho susesu'
            });

        } catch (error) {
            console.error('Update email config error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Test email configuration
    static async testEmailConfig(req, res) {
        try {
            // Get current config from database
            const [configs] = await pool.execute(
                'SELECT * FROM email_config ORDER BY id_config DESC LIMIT 1'
            );

            if (configs.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Konfigurasaun email la iha. Favor konfigura dahulu.'
                });
            }

            const config = configs[0];

            // Create transporter
            const transporter = nodemailer.createTransport({
                host: config.email_host,
                port: config.email_port,
                secure: config.email_port == 465,
                auth: {
                    user: config.email_user,
                    pass: config.email_password,
                },
            });

            // Test connection
            await transporter.verify();

            // Send test email
            const testEmail = {
                from: `"${config.email_from_name}" <${config.email_user}>`,
                to: config.email_user,
                subject: 'Test Email - Sistema Absensi QR',
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2 style="color: #2563eb;">Test Email Susesu! 🎉</h2>
                        <p>Konfigurasaun email iha Sistema Absensi QR ona funsiona ho susesu.</p>
                        <p><strong>Detalhus:</strong></p>
                        <ul>
                            <li>Host: ${config.email_host}</li>
                            <li>Port: ${config.email_port}</li>
                            <li>User: ${config.email_user}</li>
                        </ul>
                    </div>
                `
            };

            await transporter.sendMail(testEmail);

            res.json({
                success: true,
                message: 'Test email susesu! Check ita boot nia inbox.'
            });

        } catch (error) {
            console.error('Test email config error:', error);
            res.status(500).json({
                success: false,
                message: `Test email faila: ${error.message}`
            });
        }
    }
}

module.exports = EmailConfigController;