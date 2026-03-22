const { pool } = require('../config/database');

class SystemLogsController {
    // Get logs dengan filter
    static async getLogs(req, res) {
        try {
            const { nivel, modulo, startDate, endDate, page = 1, limit = 50 } = req.query;
            
            let query = `
                SELECT * FROM system_logs 
                WHERE 1=1
            `;
            let params = [];

            // Apply filters
            if (nivel) {
                query += ' AND nivel = ?';
                params.push(nivel);
            }

            if (modulo) {
                query += ' AND modulo = ?';
                params.push(modulo);
            }

            if (startDate) {
                query += ' AND DATE(created_at) >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND DATE(created_at) <= ?';
                params.push(endDate);
            }

            // Order  pagin
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            const offset = (page - 1) * limit;
            params.push(parseInt(limit), offset);

            const [logs] = await pool.execute(query, params);

            // Get total count peringatan sistama nian
            let countQuery = `SELECT COUNT(*) as total FROM system_logs WHERE 1=1`;
            let countParams = [];

            if (nivel) {
                countQuery += ' AND nivel = ?';
                countParams.push(nivel);
            }

            if (modulo) {
                countQuery += ' AND modulo = ?';
                countParams.push(modulo);
            }
            const [countResult] = await pool.execute(countQuery, countParams);

            res.json({
                success: true,
                data: logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            });

        } catch (error) {
            console.error('Get logs error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Clear all logs
    static async clearLogs(req, res) {
        try {
            await pool.execute('DELETE FROM system_logs');
            
            // Log the clearance action
            await pool.execute(
                'INSERT INTO system_logs (nivel, modulo, mensagem) VALUES (?, ?, ?)',
                ['info', 'SYSTEM', 'All system logs cleared by admin']
            );

            res.json({
                success: true,
                message: 'Log sistema hotu-hotu hamoos ho susesu'
            });

        } catch (error) {
            console.error('Clear logs error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete single log
    static async deleteLog(req, res) {
        try {
            const { id } = req.params;

            const [result] = await pool.execute(
                'DELETE FROM system_logs WHERE id_log = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Log la hetan'
                });
            }

            res.json({
                success: true,
                message: 'Log hamoos ho susesu'
            });

        } catch (error) {
            console.error('Delete log error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = SystemLogsController;