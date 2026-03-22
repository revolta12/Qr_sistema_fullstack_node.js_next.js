const EmailService = require('../utils/emailService');
class NotificationController {
    // Auto-send salary notification after calculation
    static async sendSalaryNotification(employee, salaryData) {
        try {
            console.log(' Attempting to send salary notification to:', employee.email);

            let result;

            // Priority: Email first (free), then WhatsApp
            if (EmailService.isConfigured()) {
                result = await EmailService.sendSalarySlip(employee, salaryData);
                console.log(' Email result:', result);
            } 
            else if (WhatsAppService.isConfigured()) {
                result = await WhatsAppService.sendSalarySlip(employee, salaryData);
                console.log(' WhatsApp result:', result);
            }
            else {
                console.log('ℹ No notification service configured');
                return {
                    success: true,
                    message: 'Salary calculated but no notification sent',
                    method: 'none'
                };
            }

            return result;

        } catch (error) {
            console.error('Notification error:', error);
            return {
                success: false,
                message: 'Erro durante haruka notifikasaun: ' + error.message
            };
        }
    }

    // Auto-send attendance notification after scan
    static async sendAttendanceNotification(employee, attendanceData) {
        try {
            console.log(' Attempting to send attendance notification to:', employee.email);

            let result;

            if (EmailService.isConfigured()) {
                result = await EmailService.sendAttendanceNotification(employee, attendanceData);
            }
            else if (WhatsAppService.isConfigured()) {
                result = await WhatsAppService.sendAttendanceNotification(employee, attendanceData);
            }
            else {
                // Don't fail if notification service not configured
                return {
                    success: true,
                    message: 'Attendance recorded but no notification sent',
                    method: 'none'
                };
            }

            return result;

        } catch (error) {
            console.error('Attendance notification error:', error);
            // Don't fail the attendance record if notification fails
            return {
                success: true,
                message: 'Absensi rejistu maibe notifikasaun la bá'
            };
        }
    }

    // Manual test endpoint
    static async testNotification(req, res) {
        try {
            const { type, email } = req.body;

            const testEmployee = {
                naran_funsionario: "João Teste",
                email: email || process.env.EMAIL_USER,
                no_telp: "+6701239"
            };

            const testSalary = {
                fulan: new Date().getMonth() + 1,
                tinan: new Date().getFullYear(),
                salariu_baziku: "1500.00",
                total_prezente: 22,
                total_tatraza: 2,
                potongan: "10.00",
                bonus: "50.00",
                gaji_final: "1540.00",
                status: "dibayar"
            };

            const testAttendance = {
                data: new Date().toISOString().split('T')[0],
                oras_tama: "08:15:00",
                fatin: "Office",
                status: "Presente"
            };

            let result;

            if (type === 'salary') {
                result = await EmailService.sendSalarySlip(testEmployee, testSalary);
            } else {
                result = await EmailService.sendAttendanceNotification(testEmployee, testAttendance);
            }

            if (result.success) {
                res.json({
                    success: true,
                    message: `Test ${type} notification sent successfully`,
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Test notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro durante teste: ' + error.message
            });
        }
    }
}

module.exports = NotificationController;