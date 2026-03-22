const { pool } = require('./config/database');

async function checkEmployees() {
    try {
        console.log('🔍 Checking employees in database...');
        
        const [employees] = await pool.execute(`
            SELECT id_funsionario, naran_funsionario, qr_code, status_aktif, email
            FROM tb_funsionario 
            ORDER BY status_aktif DESC, naran_funsionario
        `);
        
        console.log('\n👥 EMPLOYEES IN DATABASE:');
        console.log('========================================');
        
        if (employees.length === 0) {
            console.log(' No employees found in database.');
        } else {
            employees.forEach((emp, index) => {
                console.log(`${index + 1}. ${emp.naran_funsionario}`);
                console.log(`   📧 Email: ${emp.email}`);
                console.log(`   📱 QR Code: ${emp.qr_code || 'NULL'}`);
                console.log(`   🟢 Status: ${emp.status_aktif ? 'AKTIF' : 'INAKTIF'}`);
                console.log('   ---');
            });
        }
        
        // Check active employees with QR codes
        const activeWithQR = employees.filter(emp => emp.status_aktif && emp.qr_code);
        console.log(`\n Active employees with QR codes: ${activeWithQR.length}`);
        
        if (activeWithQR.length === 0) {
            console.log('\n No active employees with QR codes found.');
            console.log('   Please add employees or generate QR codes first.');
        }
        
    } catch (error) {
        console.error(' Database error:', error.message);
        console.log(' Make sure:');
        console.log('   1. Database is running');
        console.log('   2. Tables are created');
        console.log('   3. Connection settings are correct');
    } finally {
        // Close connection
        pool.end();
    }
}

checkEmployees();