const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [admins] = await pool.execute(
            'SELECT id_admin, username, naran FROM admin WHERE id_admin = ?',
            [decoded.id]
        );
        
        if (admins.length === 0) {
            return res.status(403).json({ 
                success: false,
                message: 'Admin not found' 
            });
        }
        
        req.admin = admins[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
};

module.exports = { authenticateToken };