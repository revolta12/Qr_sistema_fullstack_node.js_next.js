const { body, validationResult } = require('express-validator');

// Validation rules for employee
const validateEmployee = [
    body('naran_funsionario').notEmpty().withMessage('Naran funsionario obrigatoriu'),
    body('email').isEmail().withMessage('Email invalidu'),
    body('no_telp').notEmpty().withMessage('Numeru telefone obrigatoriu'),
    body('posisaun').notEmpty().withMessage('Posisaun obrigatoriu'),
    body('departamentu').notEmpty().withMessage('Departamentu obrigatoriu'),
    body('salariu_baziku').isNumeric().withMessage('Salariu baziku tenki numeriku')
];

// Validation rules for attendance
const validateAttendance = [
    body('id_funsionario').isInt().withMessage('ID Funsionario tenki numeru'),
    body('qr_code').notEmpty().withMessage('QR Code obrigatoriu')
];

// Middleware to check validation results 
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateEmployee,
    validateAttendance,
    handleValidationErrors
};