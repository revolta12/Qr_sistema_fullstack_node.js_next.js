const { pool } = require('../config/database');

class Employee {
    // Get all employees
    static async getAll() {
        try {
            const [employees] = await pool.execute(
                `SELECT id_funsionario, naran_funsionario, data_moris, jeneru, email, 
                 no_telp, posisaun, departamentu, salariu_baziku, data_rejistu, 
                 status_aktif, alamat, qr_code 
                 FROM tb_funsionario 
                 ORDER BY naran_funsionario`
            );
            return employees;
        } catch (error) {
            throw error;
        }
    }

    // Get employee by ID
    static async getById(id) {
        try {
            const [employees] = await pool.execute(
                `SELECT id_funsionario, naran_funsionario, data_moris, jeneru, email, 
                 no_telp, posisaun, departamentu, salariu_baziku, data_rejistu, 
                 status_aktif, alamat, qr_code 
                 FROM tb_funsionario 
                 WHERE id_funsionario = ?`,
                [id]
            );
            return employees[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Create new employee
    static async create(employeeData) {
        try {
            const {
                naran_funsionario, data_moris, jeneru, email, no_telp,
                posisaun, departamentu, salariu_baziku, data_rejistu, alamat, qr_code
            } = employeeData;

            const [result] = await pool.execute(
                `INSERT INTO tb_funsionario 
                 (naran_funsionario, data_moris, jeneru, email, no_telp, 
                  posisaun, departamentu, salariu_baziku, data_rejistu, alamat, qr_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [naran_funsionario, data_moris, jeneru, email, no_telp,
                 posisaun, departamentu, salariu_baziku, data_rejistu, alamat, qr_code]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // UPDATE EMPLOYEE
    static async update(id, employeeData) {
        try {
            console.log('[UPDATE] Updating employee:', id, 'with data:', employeeData);
            
            const fields = [];
            const values = [];
            
            // BUILD DYNAMIC QUERY 
            for (const [key, value] of Object.entries(employeeData)) {
                if (value !== undefined && value !== null) {
                    fields.push(`${key} = ?`);
                    
                    // FIX: MySQL expects 1/0 for BOOLEAN, not true/false
                    if (key === 'status_aktif') {
                        values.push(value ? 1 : 0);
                        console.log('🔧 [UPDATE] Converting boolean:', value, '->', value ? 1 : 0);
                    } else {
                        values.push(value);
                    }
                }
            }
            
            if (fields.length === 0) {
                throw new Error('La iha data atu atualiza');
            }
            
            values.push(id);
            
            const query = `UPDATE tb_funsionario 
                          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                          WHERE id_funsionario = ?`;
            
            console.log('[UPDATE] Final Query:', query);
            console.log('[UPDATE] Final Values:', values);
            
            const [result] = await pool.execute(query, values);
            console.log('[UPDATE] Update successful, affected rows:', result.affectedRows);
            
            return true;
        } catch (error) {
            console.error('[UPDATE] Error updating employee:', error);
            throw error;
        }
    }

    // Delete employee
    static async delete(id) {
        try {
            // Delete related records first to avoid foreign key constraint errors
            await pool.execute('DELETE FROM gaji WHERE id_funsionario = ?', [id]);
            await pool.execute('DELETE FROM absensi WHERE id_funsionario = ?', [id]);

            // Now delete the employee
            await pool.execute(
                'DELETE FROM tb_funsionario WHERE id_funsionario = ?',
                [id]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get employee by QR code
    static async getByQRCode(qrCode) {
        try {
            const [employees] = await pool.execute(
                `SELECT id_funsionario, naran_funsionario, email, no_telp, 
                 posisaun, departamentu, status_aktif 
                 FROM tb_funsionario 
                 WHERE qr_code = ? AND status_aktif = TRUE`,
                [qrCode]
            );
            return employees[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Employee;