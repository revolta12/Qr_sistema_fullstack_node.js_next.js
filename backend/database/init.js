const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Create connection without database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('Connected to MySQL server');

        // Create database
        await connection.execute(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'sistema_absensi'}`
        );
        console.log('Database created/verified');

        // Use the database
        await connection.execute(
            `USE ${process.env.DB_NAME || 'sistema_absensi'}`
        );

        // Read and execute schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'schema.sql');
        
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.execute(statement);
                }
            }
            console.log('Database schema executed successfully');
        } else {
            console.log('Schema file not found');
        }

        await connection.end();
        console.log('database initialization completds')
        
    } catch (error) {
        console.error(' Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run if this script is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;