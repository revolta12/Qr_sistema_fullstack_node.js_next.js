const { pool } = require('../config/database');

class Salary {
    // Create salary record -  PERBAIKI INI
    static async create(salaryData) {
        try {
            const {
                id_funsionario, fulan, tinan, salariu_baziku,
                total_prezente, total_tatraza, potongan, bonus, gaji_final, status
            } = salaryData;

            console.log('[SALARY] Inserting salary data:', {
                id_funsionario, fulan, tinan, salariu_baziku,
                total_prezente, total_tatraza, potongan, bonus, gaji_final, status
            });

            const [result] = await pool.execute(
                `INSERT INTO gaji 
                 (id_funsionario, fulan, tinan, salariu_baziku, total_prezente, 
                  total_tatraza, potongan, bonus, gaji_final, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_funsionario, fulan, tinan, salariu_baziku, total_prezente,
                 total_tatraza, potongan, bonus, gaji_final, status]
            );

            console.log(' [SALARY] Salary inserted with ID:', result.insertId);

            // result.insertId ada sebelum panggil getById
            if (result.insertId) {
                return await Salary.getById(result.insertId);
            } else {
                // Jika insertId tidak ada, return data yang diinput
                return {
                    id_gaji: null,
                    ...salaryData,
                    naran_funsionario: 'Unknown'
                };
            }
        } catch (error) {
            console.error('[SALARY] Error creating salary:', error);
            throw error;
        }
    }

    // Get salary by ID 
    static async getById(id) {
        try {
            if (!id) {
                console.error('[SALARY] getById called with invalid ID:', id);
                return null;
            }

            console.log('🔍 [SALARY] Getting salary by ID:', id);

            const [salaries] = await pool.execute(
                `SELECT g.*, f.naran_funsionario, f.email, f.no_telp 
                 FROM gaji g 
                 JOIN tb_funsionario f ON g.id_funsionario = f.id_funsionario 
                 WHERE g.id_gaji = ?`,
                [id]
            );

            console.log(' [SALARY] Salary found:', salaries[0] ? 'Yes' : 'No');
            return salaries[0] || null;
        } catch (error) {
            console.error('[SALARY] Error getting salary by ID:', error);
            throw error;
        }
    }

    // Get salary by employee and month
    static async getByEmployeeAndMonth(id_funsionario, fulan, tinan) {
        try {
            const [salaries] = await pool.execute(
                `SELECT * FROM gaji 
                 WHERE id_funsionario = ? AND fulan = ? AND tinan = ?`,
                [id_funsionario, fulan, tinan]
            );
            return salaries[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get all salaries for a month
    static async getByMonth(fulan, tinan) {
        try {
            const [salaries] = await pool.execute(
                `SELECT g.*, f.naran_funsionario, f.posisaun, f.departamentu 
                 FROM gaji g 
                 JOIN tb_funsionario f ON g.id_funsionario = f.id_funsionario 
                 WHERE g.fulan = ? AND g.tinan = ? 
                 ORDER BY f.naran_funsionario`,
                [fulan, tinan]
            );
            return salaries;
        } catch (error) {
            throw error;
        }
    }

    // Update salary -  PERBAIKI INI JUGA
    static async update(id, salaryData) {
        try {
            const {
                salariu_baziku, total_prezente, total_tatraza,
                potongan, bonus, gaji_final
            } = salaryData;

            console.log('[SALARY] Updating salary ID:', id);

            await pool.execute(
                `UPDATE gaji 
                 SET salariu_baziku = ?, total_prezente = ?, total_tatraza = ?, 
                     potongan = ?, bonus = ?, gaji_final = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id_gaji = ?`,
                [salariu_baziku, total_prezente, total_tatraza,
                 potongan, bonus, gaji_final, id]
            );

            console.log('[SALARY] Salary updated successfully');

            return await Salary.getById(id);
        } catch (error) {
            console.error('[SALARY] Error updating salary:', error);
            throw error;
        }
    }

    // Update salary status
    static async updateStatus(id, status) {
        try {
            await pool.execute(
                'UPDATE gaji SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id_gaji = ?',
                [status, id]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get salary statistics
    static async getStatistics(fulan, tinan) {
        try {
            const [stats] = await pool.execute(
                `SELECT 
                    COUNT(*) as total_salaries,
                    SUM(gaji_final) as total_payout,
                    AVG(gaji_final) as average_salary,
                    SUM(potongan) as total_deductions,
                    SUM(bonus) as total_bonus,
                    COUNT(CASE WHEN status = 'dibayar' THEN 1 END) as paid_count,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
                 FROM gaji 
                 WHERE fulan = ? AND tinan = ?`,
                [fulan, tinan]
            );
            return stats[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Salary;