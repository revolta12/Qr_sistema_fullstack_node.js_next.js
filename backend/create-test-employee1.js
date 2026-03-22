const { pool } = require('./config/database');

async function createTestEmployee() {
    try {
        console.log('Creating test employee...');
        
        const testQR = 'DEMO-ATTENDANCE';
        
        const [result] = await pool.execute(`
            INSERT INTO tb_funsionario 
            (naran_funsionario, data_moris, jeneru, email, no_telp, posisaun, departamentu, salariu_baziku, data_rejistu, alamat, qr_code, status_aktif) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, 1)
        `, [
            'Test Employee - Maria de Jesus',
            '1990-05-15',
            'F',
            'materkorer@company.com',
            '+67073841',
            'Staff Administrativu',
            'Administrasaun',
            850.00,
            'Dili, Timor-Leste',
            testQR
        ]);
        
        console.log(' TEST EMPLOYEE CREATED SUCCESSFULLY!');
        console.log('========================================');
        console.log('Name: Test Employee - Maria de Jesus');
        console.log(' Email: materkorer@company.com');
        console.log(' QR Code: ' + testQR);
        console.log(' Salary: $850.00');
        console.log(' Department: Administrasaun');
        console.log('\n Use this QR code for testing: ' + testQR);
        
    } catch (error) {
        console.error(' Error creating test employee:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(' Employee with this email or QR code already exists.');
            // Fetch and display existing employee info
            try {
                const [existing] = await pool.execute(
                    `SELECT naran_funsionario, email, qr_code FROM tb_funsionario WHERE qr_code = ?`,
                    [testQR]
                );
                if (existing.length > 0) {
                    const emp = existing[0]; 
                    console.log('Name: ' + emp.naran_funsionario);
                    console.log(' Email: ' + emp.email);
                    console.log(' QR Code: ' + emp.qr_code);
                }
            } catch (queryError) {
                console.error(' Error fetching existing employee:', queryError.message);
            }
        }
    }
}


createTestEmployee();