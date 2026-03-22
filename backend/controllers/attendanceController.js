const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');
const NotificationController = require('./notificationController');

class AttendanceController {
    // Record attendance via QR scan
    static async recordAttendance(req, res) {
        try {
            const { qr_code, fatin = 'Office' } = req.body;
            
            if (!qr_code) {
                return res.status(400).json({
                    success: false,
                    message: 'QR Code obrigatoriu'
                });
            }

            // Find employee by QR code
            const employee = await Employee.getByQRCode(qr_code);
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'QR Code invalidu ka funsionario la hetan'
                });
            }

            if (!employee.status_aktif) {
                return res.status(400).json({
                    success: false,
                    message: 'Funsionario la iha status aktif'
                });
            }

            const today = moment().format('YYYY-MM-DD');
            const now = moment().format('HH:mm:ss');

            // Check today's attendance count
            const todayAttendances = await Attendance.getTodayAttendances(employee.id_funsionario);

            let attendanceData;
            let message;
            let attendanceType = '';

            if (todayAttendances.length > 0) {
                const lastAttendance = todayAttendances[todayAttendances.length - 1];
                
                if (todayAttendances.length >= 2) {
                    return res.status(400).json({
                        success: false,
                        message: 'Funsionario ona halo absensi 2x iha loron nee. La bele halo absensi tan!'
                    });
                }
                
                if (lastAttendance.oras_sai) {
                    // Record new entry for second attendance
                    const entryTime = moment(now, 'HH:mm:ss');
                    const lateTime = moment('13:30:00', 'HH:mm:ss');
                    const status = entryTime.isAfter(lateTime) ? 'Atraza' : 'Presente';

                    attendanceData = {
                        id_funsionario: employee.id_funsionario,
                        data: today,
                        oras_tama: now,
                        oras_sai: null,
                        fatin: fatin,
                        status: status
                    };

                    const attendanceId = await Attendance.recordAttendance(attendanceData);
                    attendanceData.id_prezensa = attendanceId;
                    message = 'Absensi kedu (turun serani) rejistu ho susesu';
                    attendanceType = 'kedu_masuk';
                } else {
                    await Attendance.updateExitTime(lastAttendance.id_prezensa, now);
                    attendanceData = { ...lastAttendance, oras_sai: now };
                    message = 'Oras sai primeiru rejistu ho susesu';
                    attendanceType = 'primeiru_pulang';
                }
            } else {

                const entryTime = moment(now, 'HH:mm:ss');
                const lateTime = moment('08:00:00', 'HH:mm:ss');
                const status = entryTime.isAfter(lateTime) ? 'Atraza' : 'Presente';

                attendanceData = {
                    id_funsionario: employee.id_funsionario,
                    data: today,
                    oras_tama: now,
                    oras_sai: null,
                    fatin: fatin,
                    status: status
                };

                const attendanceId = await Attendance.recordAttendance(attendanceData);
                attendanceData.id_prezensa = attendanceId;
                message = 'Absensi primeiru (moris serani) rejistu ho susesu';
                attendanceType = 'primeiru_masuk';
            }

            //  AUTO-SEND EMAIL NOTIFICATION
            try {
                console.log('Attempting to send attendance notification...');
                const notificationResult = await NotificationController.sendAttendanceNotification(
                    employee, 
                    attendanceData,
                    attendanceType 
                );
                console.log('Attendance notification result:', notificationResult);
            } catch (notificationError) {
                console.error('Attendance notification failed (but attendance recorded):', notificationError);

            }

            res.json({
                success: true,
                message: message,
                data: {
                    ...attendanceData,
                    naran_funsionario: employee.naran_funsionario,
                    tipo_absensi: attendanceType
                }
            });

        } catch (error) {
            console.error('Attendance record error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get attendance by date range
    static async getAttendanceByDateRange(req, res) {
        try {
            const { startDate, endDate, employeeId } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date no end date obrigatoriu'
                });
            }

            const attendances = await Attendance.getByDateRange(startDate, endDate, employeeId);

            res.json({
                success: true,
                data: attendances
            });

        } catch (error) {
            console.error('Get attendance error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get monthly summary
    static async getMonthlySummary(req, res) {
        try {
            const { month, year } = req.query;
            const currentMonth = month || moment().month() + 1;
            const currentYear = year || moment().year();

            const summary = await Attendance.getMonthlySummary(currentMonth, currentYear);

            res.json({
                success: true,
                data: summary
            });

        } catch (error) {
            console.error('Monthly summary error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Manual attendance entry (for admin)
    static async manualEntry(req, res) {
        try {
            const { id_funsionario, data, oras_tama, oras_sai, fatin, status } = req.body;

            if (!id_funsionario || !data) {
                return res.status(400).json({
                    success: false,
                    message: 'ID Funsionario no data obrigatoriu'
                });
            }

            // Check if employee exists and is active
            const employee = await Employee.getById(id_funsionario);
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            if (!employee.status_aktif) {
                return res.status(400).json({
                    success: false,
                    message: 'Funsionario la iha status aktif'
                });
            }

            //  BATASAN 2 ABSENSI
            const todayAttendances = await Attendance.getTodayAttendances(id_funsionario);
            if (todayAttendances.length >= 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Funsionario ona halo absensi 2x iha loron nee. La bele halo absensi tan!'
                });
            }

            const attendanceData = {
                id_funsionario,
                data,
                oras_tama: oras_tama || null,
                oras_sai: oras_sai || null,
                fatin: fatin || 'Office',
                status: status || 'Presente'
            };

            const attendanceId = await Attendance.recordAttendance(attendanceData);

            //  AUTO-SEND EMAIL
            try {
                console.log('Sending notification for manual attendance...');
                const notificationResult = await NotificationController.sendAttendanceNotification(employee, attendanceData);
                console.log('Manual attendance notification result:', notificationResult);
            } catch (notificationError) {
                console.error(' Manual attendance notification failed:', notificationError);
            }

            res.json({
                success: true,
                message: 'Absensi manual rejistu ho susesu',
                data: {
                    id_prezensa: attendanceId,
                    ...attendanceData,
                    naran_funsionario: employee.naran_funsionario
                }
            });

        } catch (error) {
            console.error('Manual attendance error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //Manual attendance for sick/leave/permission
    static async createManualAttendance(req, res) {
        try {
            const { id_funsionario, data, status, observasaun } = req.body;

            console.log('[DEBUG] Manual attendance request received:', { 
                id_funsionario, 
                data, 
                status,
                observasaun 
            });

            // Validasi basic
            if (!id_funsionario || !data || !status) {
                console.log('[DEBUG] Validation failed - missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'ID Funsionario, data no status obrigatoriu'
                });
            }

            //  Validasaun status - Cuty, Lisensa, Cuty
            const validStatus = ['Cuty', 'Lisensa', 'Cuty']; 
            if (!validStatus.includes(status)) {
                console.log('[DEBUG] Invalid status:', status);
                return res.status(400).json({
                    success: false,
                    message: `Status invalidu. Tenki: ${validStatus.join(', ')}`
                });
            }

            console.log('[DEBUG] Checking employee exists...');
            // Check if employee exists
            const employee = await Employee.getById(id_funsionario);
            if (!employee) {
                console.log('[DEBUG] Employee not found:', id_funsionario);
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            console.log('[DEBUG] Employee found:', employee.naran_funsionario);

            console.log('[DEBUG] Checking existing attendance...');
            // Check if attendance already exists for this date
            const existingAttendance = await Attendance.checkAttendanceExists(id_funsionario, data);
            if (existingAttendance) {
                console.log('[DEBUG] Attendance already exists for this date');
                return res.status(400).json({
                    success: false,
                    message: 'Funsionario ona iha absensi iha data ida nee'
                });
            }

            console.log(' [DEBUG] No existing attendance, creating new...');
            const attendanceData = {
                id_funsionario,
                data,
                oras_tama: null,
                oras_sai: null,
                fatin: 'Manual Entry',
                status: status,
                observasaun: observasaun || null
            };

            console.log(' [DEBUG] Calling Attendance.recordAttendance with:', attendanceData);
            const attendanceId = await Attendance.recordAttendance(attendanceData);

            console.log(' [DEBUG] Attendance created successfully with ID:', attendanceId);

            res.json({
                success: true,
                message: `Absensi ${status} rejistu ho susesu`,
                data: {
                    id_prezensa: attendanceId,
                    ...attendanceData,
                    naran_funsionario: employee.naran_funsionario
                }
            });

        } catch (error) {
            console.error('[DEBUG] Manual attendance error:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    //  Bulk manual attendance for multiple employees
    static async createBulkManualAttendance(req, res) {
        try {
            const { employees, data, status, observasaun } = req.body;

            console.log(' [DEBUG] Bulk manual attendance request:', { employees, data, status });

            if (!employees || !employees.length || !data || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Lista funsionariu, data no status obrigatoriu'
                });
            }

            //  PERBAIKAN: Validasaun status - HANYA Cuty, Lisensa, Cuty
            const validStatus = ['Cuty', 'Lisensa', 'Cuty'];
            if (!validStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status invalidu. Tenki: ${validStatus.join(', ')}`
                });
            }

            const results = [];
            const errors = [];

            for (const empId of employees) {
                try {
                    const employee = await Employee.getById(empId);
                    if (!employee) {
                        errors.push({
                            id_funsionario: empId,
                            error: 'Funsionario la hetan'
                        });
                        continue;
                    }

                    // Check existing attendance
                    const existingAttendance = await Attendance.checkAttendanceExists(empId, data);
                    if (existingAttendance) {
                        errors.push({
                            id_funsionario: empId,
                            error: 'Funsionario ona iha absensi iha data ida nee'
                        });
                        continue;
                    }

                    const attendanceData = {
                        id_funsionario: empId,
                        data,
                        oras_tama: null,
                        oras_sai: null,
                        fatin: 'Manual Entry',
                        status: status,
                        observasaun: observasaun
                    };

                    const attendanceId = await Attendance.recordAttendance(attendanceData);

                    results.push({
                        id_prezensa: attendanceId,
                        ...attendanceData,
                        naran_funsionario: employee.naran_funsionario
                    });

                } catch (error) {
                    errors.push({
                        id_funsionario: empId,
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                message: `Bulk attendance completed. ${results.length} success, ${errors.length} failed`,
                data: {
                    results,
                    errors
                }
            });

        } catch (error) {
            console.error('Bulk manual attendance error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AttendanceController;