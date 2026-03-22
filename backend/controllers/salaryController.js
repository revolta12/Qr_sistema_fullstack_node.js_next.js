const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const moment = require('moment');
const NotificationController = require('./notificationController');

class SalaryController {
    // Calculate salary for employee
    static async calculateSalary(req, res) {
        try {
            const { id_funsionario, fulan, tinan } = req.body;

            console.log('💰 [SALARY] Calculating salary for:', { id_funsionario, fulan, tinan });

            const currentMonth = fulan || moment().month() + 1;
            const currentYear = tinan || moment().year();

            // Get employee data
            const employee = await Employee.getById(id_funsionario);
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Funsionario la hetan'
                });
            }

            console.log('[SALARY] Getting attendance summary...');
            const attendanceSummary = await Attendance.getMonthlySummary(currentMonth, currentYear);
            console.log('[SALARY] Attendance summary:', attendanceSummary);
            const employeeSummary = attendanceSummary.find(sum => 
                sum.id_funsionario === parseInt(id_funsionario)
            );

            if (!employeeSummary) {
                console.log(' [SALARY] No attendance data found for employee');
                return res.status(400).json({
                    success: false,
                    message: 'La iha dadus absensi ba fulan ida nee'
                });
            }

            console.log(' [SALARY] Employee summary found:', employeeSummary);

            // Calculate salary components
            const baseSalary = parseFloat(employee.salariu_baziku);
            const totalPresent = employeeSummary.total_Presente || 0;
            const totalLate = employeeSummary.total_terlambat || 0;
            const totalMoras = employeeSummary.total_Moras || 0;
            const totalizin = employeeSummary.total_izin || 0;
            const totalAbsent = totalMoras + totalizin;

            console.log('[SALARY] Salary components:', {
                baseSalary,
                totalPresent,
                totalLate,
                totalMoras,
                totalizin,
                totalAbsent
            });

            // Calculate deductions for late (example: $5 per late)
            const lateDeduction = totalLate * 5;
            
            // Calculate deductions for absent (example: $20 per absent day)
            const absentDeduction = totalAbsent * 20;
            
            // Calculate overtime (example: $10 per hour overtime)
            const overtimeHours = 0;
            const overtimeBonus = overtimeHours * 10;

            const totalDeductions = lateDeduction + absentDeduction;
            const finalSalary = baseSalary - totalDeductions + overtimeBonus;

            console.log('[SALARY] Final calculation:', {
                lateDeduction,
                absentDeduction,
                overtimeBonus,
                totalDeductions,
                finalSalary
            });

            // Check if salary already calculated for this month
            const existingSalary = await Salary.getByEmployeeAndMonth(id_funsionario, currentMonth, currentYear);
            
            let salaryData;
            if (existingSalary) {
                console.log(' [SALARY] Updating existing salary record');
                // Update existing salary record
                await Salary.update(existingSalary.id_gaji, {
                    salariu_baziku: baseSalary,
                    total_prezente: totalPresent,
                    total_tatraza: totalLate,
                    potongan: totalDeductions,
                    bonus: overtimeBonus,
                    gaji_final: finalSalary
                });
                salaryData = await Salary.getById(existingSalary.id_gaji);
            } else {
                console.log('[SALARY] Creating new salary record');
                // Create new salary record
                const salaryId = await Salary.create({
                    id_funsionario: id_funsionario,
                    fulan: currentMonth,
                    tinan: currentYear,
                    salariu_baziku: baseSalary,
                    total_prezente: totalPresent,
                    total_tatraza: totalLate,
                    potongan: totalDeductions,
                    bonus: overtimeBonus,
                    gaji_final: finalSalary,
                    status: 'pending'
                });
                salaryData = await Salary.getById(salaryId);
            }

            //  AUTO-SEND EMAIL NOTIFICATION
            try {
                console.log('[SALARY] Attempting to send salary notification...');
                const notificationResult = await NotificationController.sendSalaryNotification(employee, salaryData);
                console.log(' [SALARY] Salary notification result:', notificationResult);
            } catch (notificationError) {
                console.error(' [SALARY] Salary notification failed:', notificationError);
            }

            res.json({
                success: true,
                message: 'Kalkulasaun gaji kompleta',
                data: {
                    ...salaryData,
                    naran_funsionario: employee.naran_funsionario,
                    total_absent: totalAbsent,
                    late_deduction: lateDeduction,
                    absent_deduction: absentDeduction,
                    overtime_bonus: overtimeBonus
                }
            });

        } catch (error) {
            console.error(' [SALARY] Salary calculation error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Calculate all salaries for a month
    static async calculateAllSalaries(req, res) {
        try {
            const { fulan, tinan } = req.body;
            const currentMonth = fulan || moment().month() + 1;
            const currentYear = tinan || moment().year();

            console.log('[SALARY] Calculating all salaries for:', { currentMonth, currentYear });

            // Get all active employees
            const employees = await Employee.getAll();
            const activeEmployees = employees.filter(emp => emp.status_aktif);

            console.log(`[SALARY] Processing ${activeEmployees.length} active employees`);

            //  GET ATTENDANCE SUMMARY SEKALI SAJA
            const attendanceSummary = await Attendance.getMonthlySummary(currentMonth, currentYear);
            console.log('[SALARY] Attendance summary for all:', attendanceSummary);

            const results = [];
            const errors = [];

            for (const employee of activeEmployees) {
                try {
                    console.log(`[SALARY] Processing: ${employee.naran_funsionario}`);
                    
                    //  CARI DATA EMPLOYEE DI SUMMARY
                    const employeeSummary = attendanceSummary.find(sum => 
                        sum.id_funsionario === parseInt(employee.id_funsionario)
                    );

                    if (!employeeSummary) {
                        console.log(` [SALARY] No attendance data for: ${employee.naran_funsionario}`);
                        errors.push({
                            employee: employee.naran_funsionario,
                            error: 'La iha dadus absensi'
                        });
                        continue;
                    }

                    const salaryData = await SalaryController.calculateSalaryForEmployee(
                        employee.id_funsionario,
                        currentMonth,
                        currentYear,
                        employeeSummary //  PASS SUMMARY LANGSUNG
                    );
                    
                    //  AUTO-SEND EMAIL
                    try {
                        console.log(`[SALARY] Sending notification to: ${employee.naran_funsionario}`);
                        const notificationResult = await NotificationController.sendSalaryNotification(employee, salaryData);
                        console.log(` [SALARY] Notification result for ${employee.naran_funsionario}:`, notificationResult.success);
                    } catch (notificationError) {
                        console.error(`[SALARY] Notification failed for ${employee.naran_funsionario}:`, notificationError.message);
                    }
                    
                    results.push({
                        employee: employee.naran_funsionario,
                        salaryData: salaryData,
                        success: true
                    });

                    console.log(` [SALARY] Successfully calculated for: ${employee.naran_funsionario}`);

                } catch (error) {
                    console.error(` [SALARY] Error for ${employee.naran_funsionario}:`, error.message);
                    errors.push({
                        employee: employee.naran_funsionario,
                        error: error.message
                    });
                }
            }

            console.log(`SALARY] Calculation completed: ${results.length} success, ${errors.length} errors`);

            res.json({
                success: true,
                message: `Kalkulasaun gaji kompleta. ${results.length} susesu, ${errors.length} error`,
                data: {
                    calculated: results,
                    errors: errors
                }
            });

        } catch (error) {
            console.error(' [SALARY] Calculate all salaries error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Helper method to calculate salary for single employee
    static async calculateSalaryForEmployee(id_funsionario, fulan, tinan, employeeSummary = null) {
        console.log(`[SALARY-HELPER] Calculating for employee: ${id_funsionario}`);
        
        const employee = await Employee.getById(id_funsionario);
        
        //  JIKA SUMMARY TIDAK DIKASIH, CARI SENDIRI
        if (!employeeSummary) {
            console.log('[SALARY-HELPER] Getting attendance summary...');
            const attendanceSummary = await Attendance.getMonthlySummary(fulan, tinan);
            employeeSummary = attendanceSummary.find(sum => sum.id_funsionario === parseInt(id_funsionario));
        }

        if (!employeeSummary) {
            throw new Error('La iha dadus absensi');
        }

        const baseSalary = parseFloat(employee.salariu_baziku);
        const totalPresent = employeeSummary.total_Presente || 0;
        const totalLate = employeeSummary.total_terlambat || 0;
        const totalMoras = employeeSummary.total_Moras || 0;
        const totalLise = employeeSummary.total_lisensa || 0;
        const totalAbsent = totalMoras + totalizin;

        // Salary calculation logic
        const lateDeduction = totalLate * 5;
        const absentDeduction = totalAbsent * 20;
        const overtimeBonus = 0;

        const totalDeductions = lateDeduction + absentDeduction;
        const finalSalary = baseSalary - totalDeductions + overtimeBonus;

        const existingSalary = await Salary.getByEmployeeAndMonth(id_funsionario, fulan, tinan);
        
        let salaryData;
        if (existingSalary) {
            console.log(' [SALARY-HELPER] Updating existing salary');
            await Salary.update(existingSalary.id_gaji, {
                salariu_baziku: baseSalary,
                total_prezente: totalPresent,
                total_tatraza: totalLate,
                potongan: totalDeductions,
                bonus: overtimeBonus,
                gaji_final: finalSalary
            });
            salaryData = await Salary.getById(existingSalary.id_gaji);
        } else {
            console.log('[SALARY-HELPER] Creating new salary');
            const salaryId = await Salary.create({
                id_funsionario: id_funsionario,
                fulan: fulan,
                tinan: tinan,
                salariu_baziku: baseSalary,
                total_prezente: totalPresent,
                total_tatraza: totalLate,
                potongan: totalDeductions,
                bonus: overtimeBonus,
                gaji_final: finalSalary,
                status: 'pending'
            });
            salaryData = await Salary.getById(salaryId);
        }

        console.log(` [SALARY-HELPER] Calculation completed for: ${employee.naran_funsionario}`);
        return salaryData;
    }

    // GET all salaries for a month
    static async getSalaries(req, res) {
        try {
            const { fulan, tinan } = req.query;
            const currentMonth = fulan || moment().month() + 1;
            const currentYear = tinan || moment().year();

            console.log('[SALARY] Getting salaries for:', { currentMonth, currentYear });

            const salaries = await Salary.getByMonth(currentMonth, currentYear);

            res.json({
                success: true,
                data: salaries
            });

        } catch (error) {
            console.error(' [SALARY] Get salaries error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get salary by ID
    static async getSalaryById(req, res) {
        try {
            const { id } = req.params;
            
            console.log('[SALARY] Getting salary by ID:', id);

            const salary = await Salary.getById(id);

            if (!salary) {
                return res.status(404).json({
                    success: false,
                    message: 'Dadus gaji la hetan'
                });
            }

            res.json({
                success: true,
                data: salary
            });

        } catch (error) {
            console.error(' [SALARY] Get salary error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update salary status
    static async updateSalaryStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            console.log(' [SALARY] Updating salary status:', { id, status });

            if (!['pending', 'dibayar'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status invalidu. Tenki pending ka dibayar'
                });
            }

            const salary = await Salary.getById(id);
            if (!salary) {
                return res.status(404).json({
                    success: false,
                    message: 'Dadus gaji la hetan'
                });
            }

            await Salary.updateStatus(id, status);

            res.json({
                success: true,
                message: `Status gaji altera ba ${status}`
            });

        } catch (error) {
            console.error(' [SALARY] Update salary status error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = SalaryController;