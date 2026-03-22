const nodemailer = require('nodemailer');

// Try to import EmailConfig, but don't fail if not exists
let EmailConfig;
try {
    EmailConfig = require('../models/EmailConfig');
    console.log(' EmailConfig model loaded successfully');
} catch (error) {
    console.log('EmailConfig model not found, using .env fallback');
    EmailConfig = null;
}

class EmailService {
    constructor() {
        console.log('Initializing Email Service...');
        this.transporter = null;
        this.usingDatabase = false;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            // Try to use database config first
            if (EmailConfig) {
                const config = await EmailConfig.getActiveConfig();
                
                if (config) {
                    console.log(' Using email config from database:', {
                        host: config.email_host,
                        user: config.email_user
                    });

                    this.transporter = nodemailer.createTransport({
                        host: config.email_host,
                        port: config.email_port,
                        secure: config.email_port === 465,
                        auth: {
                            user: config.email_user,
                            pass: config.email_password,
                        },
                    });

                    await this.transporter.verify();
                    this.usingDatabase = true;
                    console.log(' Email service initialized from database');
                    return;
                }
            }

            // Fallback to .env if database config not available
            if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                console.log('Using email config from .env (fallback)');
                
                this.transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                    port: process.env.EMAIL_PORT || 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                await this.transporter.verify();
                console.log(' Email service initialized from .env');
            } else {
                console.log('No email configuration found');
                this.transporter = null;
            }

        } catch (error) {
            console.error('Email service initialization failed:', error.message);
            this.transporter = null;
        }
    }

    // Check if email service is configured
    isConfigured() {
        return this.transporter !== null;
    }

    // Check if using database config
    isUsingDatabase() {
        return this.usingDatabase;
    }

    // Send salary slip via Email
    async sendSalarySlip(employee, salaryData) {
        try {
            if (!this.isConfigured()) {
                return { 
                    success: false, 
                    message: 'Email service la konfigura. Favor halo konfigurasaun email dahulu.' 
                };
            }

            console.log('Attempting to send email to:', employee.email);
            
            let from;
            if (this.usingDatabase && EmailConfig) {
                const config = await EmailConfig.getActiveConfig();
                from = `"${config.email_from_name}" <${config.email_user}>`;
            } else {
                from = `"Sistema Absensi QR" <${process.env.EMAIL_USER}>`;
            }

            const htmlContent = this.generateSalarySlipHTML(employee, salaryData);

            const mailOptions = {
                from: from,
                to: employee.email,
                subject: `Slip Gaji - ${employee.naran_funsionario} - ${salaryData.fulan}/${salaryData.tinan}`,
                html: htmlContent,
                text: this.generateSalarySlipText(employee, salaryData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(' Email sent successfully! Message ID:', result.messageId);
            
            return { 
                success: true, 
                message: 'Slip gaji haruka via email ho susesu',
                messageId: result.messageId 
            };
        } catch (error) {
            console.error('Email send error:', error);
            return { 
                success: false, 
                message: 'Erro durante haruka email: ' + error.message 
            };
        }
    }

    // Send attendance notification
    async sendAttendanceNotification(employee, attendanceData) {
        try {
            if (!this.isConfigured()) {
                return { 
                    success: false, 
                    message: 'Email service la konfigura' 
                };
            }

            let from;
            if (this.usingDatabase && EmailConfig) {
                const config = await EmailConfig.getActiveConfig();
                from = `"${config.email_from_name}" <${config.email_user}>`;
            } else {
                from = `"Sistema Absensi QR" <${process.env.EMAIL_USER}>`;
            }

            const htmlContent = this.generateAttendanceHTML(employee, attendanceData);

            const mailOptions = {
                from: from,
                to: employee.email,
                subject: `Absensi - ${employee.naran_funsionario} - ${attendanceData.data}`,
                html: htmlContent,
                text: this.generateAttendanceText(employee, attendanceData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            return { 
                success: true, 
                message: 'Notifikasaun absensi haruka via email'
            };
        } catch (error) {
            console.error('Email send error:', error);
            return { 
                success: false, 
                message: 'Erro durante haruka email' 
            };
        }
    }

    // HTML Template for Salary Slip
    generateSalarySlipHTML(employee, salaryData) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 4px 6px (0,0,0,0,0.1);

        }
        .header { 
            background: linear-gradient(135deg, #4F46E5, #7E22CE); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .footer { 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            padding: 20px;
            background: #f8fafc;
        }
        .amount { 
            font-size: 28px; 
            font-weight: bold; 
            color: #059669; 
        }
        .deduction { color: #DC2626; }
        .bonus { color: #059669; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th, td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
            text-align: left; 
        }
        th { 
            background: #f8fafc; 
            font-weight: 600; 
        }
        .total-row { 
            background: #f0fdf4; 
            font-weight: bold; 
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💼 SLIP GAJI</h1>
            <h2>${employee.naran_funsionario}</h2>
            <p>Sistema Absensi QR</p>
        </div>
        
        <div class="content">
            <h3>📅 Periodu: ${this.getMonthName(salaryData.fulan)} ${salaryData.tinan}</h3>
            
            <table>
                <tr>
                    <th>Deskrisaun</th>
                    <th>Detallu</th>
                    <th style="text-align: right;">Valor</th>
                </tr>
                <tr>
                    <td>💰 Salariu Baziku</td>
                    <td>Gaji pokok</td>
                    <td style="text-align: right;">$${parseFloat(salaryData.salariu_baziku).toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td>📊 Total Presente</td>
                    <td>Dias trabalhados</td>
                    <td style="text-align: right;">${salaryData.total_prezente} dia</td>
                </tr>
                <tr>
                    <td>⏰ Total Atraza</td>
                    <td>Atrasos</td>
                    <td style="text-align: right;">${salaryData.total_tatraza} dia</td>
                </tr>
                <tr class="deduction">
                    <td>💸 Potongan</td>
                    <td>Descontos</td>
                    <td style="text-align: right;">-$${parseFloat(salaryData.potongan).toLocaleString('id-ID')}</td>
                </tr>
                <tr class="bonus">
                    <td>🎁 Bonus</td>
                    <td>Horas extras</td>
                    <td style="text-align: right;">+$${parseFloat(salaryData.bonus).toLocaleString('id-ID')}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2"><strong>💵 GAJI FINAL</strong></td>
                    <td style="text-align: right;" class="amount">$${parseFloat(salaryData.gaji_final).toLocaleString('id-ID')}</td>
                </tr>
            </table>
            
            <div class="status-badge ${salaryData.status === 'dibayar' ? 'status-paid' : 'status-pending'}">
                ${salaryData.status === 'dibayar' ? ' ONA SELU' : '⏰ PROSESU'}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Sistema Absensi QR</strong></p>
            <>Obrigadu ba servisu diak! 🚀<>
            <p>Email automátiku - La presiza responde</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    // Text version for email clients that don't support HTML
    generateSalarySlipText(employee, salaryData) {
        return `
SLIP GAJI - ${employee.naran_funsionario}

Periodu: ${this.getMonthName(salaryData.fulan)} ${salaryData.tinan}

💰 Salariu Baziku: $${salaryData.salariu_baziku}
📊 Total Presente: ${salaryData.total_prezente} dia
⏰ Total Atraza: ${salaryData.total_tatraza} dia
💸 Potongan: -$${salaryData.potongan}
🎁 Bonus: +$${salaryData.bonus}
💵 GAJI FINAL: $${salaryData.gaji_final}

Status: ${salaryData.status === 'dibayar' ? 'ONA SELU' : 'PROSESU'}

Obrigadu ba servisu diak!
Sistema Absensi QR
        `.trim();
    }

    // HTML Template for Attendance
    generateAttendanceHTML(employee, attendanceData) {
        const isLate = attendanceData.status === 'Atraza';
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: ${isLate ? '#F59E0B' : '#10B981'}; color: white; padding: 25px; text-align: center; }
        .content { padding: 25px; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 15px; background: #f8fafc; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        li:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isLate ? '⚠️' : ''} NOTIFIKASAUN ABSENSI</h1>
        </div>
        
        <div class="content">
            <p><strong>Olá ${employee.naran_funsionario}!</strong></p>
            
            <p>Absensi rejistu ho susesu:</p>
            <ul>
                <li>📅 <strong>Data:</strong> ${attendanceData.data}</li>
                <li>🕐 <strong>Oras:</strong> ${attendanceData.oras_tama}</li>
                <li>📍 <strong>Fatin:</strong> ${attendanceData.fatin}</li>
                <li>📝 <strong>Status:</strong> ${attendanceData.status}</li>
            </ul>
            
            ${isLate ? 
                '<p style="color: #B45309; background: #FEF3C7; padding: 10px; border-radius: 5px;"><strong>⚠️ Favor atensaun ba oras servisu!</strong></p>' : 
                '<p style="color: #065F46; background: #D1FAE5; padding: 10px; border-radius: 5px;"><strong> Obrigadu ba pontualidade!</strong></p>'
            }
        </div>
        
        <div class="footer">
            <p><strong>Sistema Absensi QR</strong></p>
            <p>Email automátiku</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    // Text version for attendance
    generateAttendanceText(employee, attendanceData) {
        const isLate = attendanceData.status === 'Atraza';
        
        return `
NOTIFIKASAUN ABSENSI

Olá ${employee.naran_funsionario}!

${isLate ? '⚠️' : ''} Absensi rejistu ho susesu:

📅 Data: ${attendanceData.data}
🕐 Oras: ${attendanceData.oras_tama}
📍 Fatin: ${attendanceData.fatin}
📝 Status: ${attendanceData.status}

${isLate ? '⚠️ Favor atensaun ba oras servisu!' : ' Obrigadu ba pontualidade!'}

Sistema Absensi QR
        `.trim();
    }

    // Helper function to get month name
    getMonthName(monthNumber) {
        const months = [
            'Janeiru', 'Fevereiru', 'Marsu', 'Abril', 'Maiu', 'Junhu',
            'Julhu', 'Agustu', 'Setembru', 'Outubru', 'Novembru', 'Dezembru'
        ];
        return months[monthNumber - 1] || 'Unknown';
    }

    // Test email configuration
    async testConfiguration() {
        try {
            if (!this.isConfigured()) {
                return { success: false, message: 'Email service la konfigura' };
            }

            // Test by sending to ourselves
            const testEmail = this.usingDatabase && EmailConfig 
                ? (await EmailConfig.getActiveConfig()).email_user 
                : process.env.EMAIL_USER;

            const testMailOptions = {
                from: `"Sistema Absensi QR" <${testEmail}>`,
                to: testEmail,
                subject: '🧪 Teste Konfigurasaun Email',
                text: 'Teste konfigurasaun email ho susesu! Sistema Absensi QR.',
                html: '<h2> Teste Konfigurasaun Email</h2><p>Teste konfigurasaun email ho susesu!</p>'
            };

            const result = await this.transporter.sendMail(testMailOptions);
            return { 
                success: true, 
                message: 'Teste email ho susesu! Email haruka ba ' + testEmail,
                messageId: result.messageId 
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'Erro durante teste email: ' + error.message 
            };
        }
    }
}

module.exports = new EmailService();