const { pool } = require('../config/database');
const moment = require('moment');

class Attendance {
    // Check kona ba atendense
    static async checkAttendanceExists(id_funsionario, date = null) {
        try {
            const targetDate = date || moment().format('YYYY-MM-DD');
            const [attendances] = await pool.execute(
                `SELECT id_prezensa FROM absensi 
                 WHERE id_funsionario = ? AND data = ? 
                 LIMIT 1`,
                [id_funsionario, targetDate]
            );
            return attendances.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get all today's attendances for a employee
    static async getTodayAttendances(id_funsionario) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const [attendances] = await pool.execute(
                `SELECT * FROM absensi 
                 WHERE id_funsionario = ? AND data = ? 
                 ORDER BY oras_tama ASC`,
                [id_funsionario, today]
            );
            return attendances;
        } catch (error) {
            throw error;
        }
    }

    // Record attendanc
    static async recordAttendance(attendanceData) {
        try {
            const { 
                id_funsionario, 
                data, 
                oras_tama, 
                oras_sai, 
                fatin, 
                status, 
                observasaun 
            } = attendanceData;

            console.log('[DEBUG] Recording attendance with data:', {
                id_funsionario,
                data,
                oras_tama,
                oras_sai,
                fatin,
                status,
                observasaun
            });

            const [result] = await pool.execute(
                `INSERT INTO absensi 
                 (id_funsionario, data, oras_tama, oras_sai, fatin, status, observasaun) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_funsionario, 
                    data, 
                    oras_tama, 
                    oras_sai, 
                    fatin, 
                    status, 
                    observasaun || null
                ]
            );

            console.log('[DEBUG] Attendance recorded successfully, ID:', result.insertId);
            return result.insertId;

        } catch (error) {
            console.error(' [DEBUG] Error recording attendance:', error);
            throw error;
        }
    }

    // Check if already attended today
    static async checkTodayAttendance(id_funsionario) {
        try {
            const today = moment().format('YYYY-MM-DD');
            const [attendances] = await pool.execute(
                `SELECT * FROM absensi 
                 WHERE id_funsionario = ? AND data = ?`,
                [id_funsionario, today]
            );
            return attendances[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Update exit time
    static async updateExitTime(id_prezensa, oras_sai) {
        try {
            await pool.execute(
                'UPDATE absensi SET oras_sai = ? WHERE id_prezensa = ?',
                [oras_sai, id_prezensa]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance by date range
    static async getByDateRange(startDate, endDate, id_funsionario = null) {
        try {
            let query = `
                SELECT a.*, f.naran_funsionario, f.posisaun, f.departamentu 
                FROM absensi a 
                JOIN tb_funsionario f ON a.id_funsionario = f.id_funsionario 
                WHERE a.data BETWEEN ? AND ?
            `;
            let params = [startDate, endDate];

            if (id_funsionario) {
                query += ' AND a.id_funsionario = ?';
                params.push(id_funsionario);
            }

            query += ' ORDER BY a.data DESC, a.oras_tama DESC';

            const [attendances] = await pool.execute(query, params);
            return attendances;
        } catch (error) {
            throw error;
        }
    }

    // Get monthly attendance summary
    static async getMonthlySummary(month, year) {
        try {
            const [summary] = await pool.execute(
                `SELECT 
                    f.id_funsionario,
                    f.naran_funsionario,
                    f.posisaun,
                    f.departamentu,
                    COUNT(a.id_prezensa) as total_Presente,
                    SUM(CASE WHEN a.status = 'Atraza' THEN 1 ELSE 0 END) as total_Atraza,
                    SUM(CASE WHEN a.status = 'Lisensa' THEN 1 ELSE 0 END) as total_Lisensa,
                    SUM(CASE WHEN a.status = 'Moras' THEN 1 ELSE 0 END) as total_Moras
                 FROM tb_funsionario f
                 LEFT JOIN absensi a ON f.id_funsionario = a.id_funsionario 
                    AND MONTH(a.data) = ? AND YEAR(a.data) = ?
                 WHERE f.status_aktif = TRUE
                 GROUP BY f.id_funsionario, f.naran_funsionario, f.posisaun, f.departamentu`,
                [month, year]
            );
            return summary;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance by ID
    static async getById(id_prezensa) {
        try {
            const [attendances] = await pool.execute(
                `SELECT a.*, f.naran_funsionario, f.posisaun, f.departamentu 
                 FROM absensi a 
                 JOIN tb_funsionario f ON a.id_funsionario = f.id_funsionario 
                 WHERE a.id_prezensa = ?`,
                [id_prezensa]
            );
            return attendances[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Delete attendance
    static async deleteAttendance(id_prezensa) {
        try {
            await pool.execute(
                'DELETE FROM absensi WHERE id_prezensa = ?',
                [id_prezensa]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Update attendance - PERBAIKAN: TAMBAH OBSERVASAUN
    static async updateAttendance(id_prezensa, attendanceData) {
        try {
            const { data, oras_tama, oras_sai, fatin, status, observasaun } = attendanceData;
            
            await pool.execute(
                `UPDATE absensi 
                 SET data = ?, oras_tama = ?, oras_sai = ?, fatin = ?, status = ?, observasaun = ? 
                 WHERE id_prezensa = ?`,
                [data, oras_tama, oras_sai, fatin, status, observasaun || null, id_prezensa]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance statistics for dashboard
    static async getDashboardStats(startDate, endDate) {
        try {
            const [stats] = await pool.execute(
                `SELECT 
                    COUNT(*) as total_absensi,
                    COUNT(DISTINCT id_funsionario) as total_funsionario,
                    SUM(CASE WHEN status = 'Presente' THEN 1 ELSE 0 END) as total_Presente,
                    SUM(CASE WHEN status = 'Atraza' THEN 1 ELSE 0 END) as total_Atraza,
                    SUM(CASE WHEN status = 'Lisensa' THEN 1 ELSE 0 END) as total_Lisensa,
                    SUM(CASE WHEN status = 'Moras' THEN 1 ELSE 0 END) as total_Moras,
                    SUM(CASE WHEN status = 'Cuty' THEN 1 ELSE 0 END) as total_Cuty,
                    SUM(CASE WHEN status = 'alpha' THEN 1 ELSE 0 END) as total_alpha
                 FROM absensi 
                 WHERE data BETWEEN ? AND ?`,
                [startDate, endDate]
            );
            return stats[0] || {};
        } catch (error) {
            throw error;
        }
    }

    // Get recent attendances
    static async getRecentAttendances(limit = 10) {
        try {
            const [attendances] = await pool.execute(
                `SELECT a.*, f.naran_funsionario, f.posisaun, f.departamentu 
                 FROM absensi a 
                 JOIN tb_funsionario f ON a.id_funsionario = f.id_funsionario 
                 ORDER BY a.created_at DESC 
                 LIMIT ?`,
                [limit]
            );
            return attendances;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance by employee and date range
    static async getByEmployeeAndDateRange(id_funsionario, startDate, endDate) {
        try {
            const [attendances] = await pool.execute(
                `SELECT a.*, f.naran_funsionario, f.posisaun, f.departamentu 
                 FROM absensi a 
                 JOIN tb_funsionario f ON a.id_funsionario = f.id_funsionario 
                 WHERE a.id_funsionario = ? AND a.data BETWEEN ? AND ?
                 ORDER BY a.data DESC, a.oras_tama DESC`,
                [id_funsionario, startDate, endDate]
            );
            return attendances;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Attendance;