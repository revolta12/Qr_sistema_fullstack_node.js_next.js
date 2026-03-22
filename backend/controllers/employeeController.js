const Employee = require('../models/Employee');
const QRGenerator = require('../utils/qrGenerator');

class EmployeeController {
    // Get all employees
    static async getAllEmployees(req, res) {
        try {
            const employees = await Employee.getAll();
            
            res.json({
                success: true,
                data: employees
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get employee by ID
    static async getEmployeeById(req, res) {
        try {
            const { id } = req.params;
            const employee = await Employee.getById(id);
            
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            res.json({
                success: true,
                data: employee
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create new employee
    static async createEmployee(req, res) {
        try {
            const employeeData = req.body;
            
            // Generate unique QR code
            const qrData = QRGenerator.generateUniqueData();
            employeeData.qr_code = qrData;

            const employeeId = await Employee.create(employeeData);

            res.status(201).json({
                success: true,
                message: 'Funsionario rejistu susesu',
                data: {
                    id: employeeId,
                    qr_code: qrData
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update employee
    static async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const employeeData = req.body;

            // Check if employee exists
            const existingEmployee = await Employee.getById(id);
            if (!existingEmployee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            await Employee.update(id, employeeData);

            res.json({
                success: true,
                message: 'Funsionario atualiza susesu'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete employee
    static async deleteEmployee(req, res) {
        try {
            const { id } = req.params;

            // Check if employee exists
            const existingEmployee = await Employee.getById(id);
            if (!existingEmployee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            await Employee.delete(id);

            res.json({
                success: true,
                message: 'Funsionario delete susesu'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Generate QR code for employee
    static async generateQRCode(req, res) {
        try {
            const { id } = req.params;
            
            const employee = await Employee.getById(id);
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            if (!employee.qr_code) {
                return res.status(400).json({
                    success: false,
                    message: 'QR Code la iha ba funsionario ida nee'
                });
            }

            const qrImage = QRGenerator.generateQRImage(employee.qr_code);
            
            res.setHeader('Content-Type', 'image/png');
            qrImage.pipe(res);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // TOGGLE EMPLOYEE STATUS - IMPROVED VERSION
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;

            console.log(' [TOGGLE] Request to toggle employee ID:', id);

            // Check if employee exists
            const employee = await Employee.getById(id);
            if (!employee) {
                console.log(' [TOGGLE] Employee not found:', id);
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            console.log(' [TOGGLE] Current status:', employee.status_aktif);
            const newStatus = !employee.status_aktif;
            console.log(' [TOGGLE] New status:', newStatus);

            // Update status dengan data yang benar
            await Employee.update(id, { status_aktif: newStatus });

            console.log('[TOGGLE] Status updated successfully');

            res.json({
                success: true,
                message: `Status funsionario altera ba ${newStatus ? 'aktif' : 'inaktif'}`,
                data: { 
                    id_funsionario: parseInt(id),
                    status_aktif: newStatus 
                }
            });

        } catch (error) {
            console.error(' [TOGGLE] Error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = EmployeeController;