const moment = require('moment');

class SalaryCalculator {
    // Calculate base salary components
    static calculateBaseSalary(employee, attendanceSummary) {
        const baseSalary = parseFloat(employee.salariu_baziku);
        const totalPresent = attendanceSummary.total_Presente || 0;
        const totalLate = attendanceSummary.total_Atraza || 0;
        const totalAbsent = (attendanceSummary.total_izin || 0) + (attendanceSummary.total_Moras || 0);

        return {
            baseSalary,
            totalPresent,
            totalLate,
            totalAbsent
        };
    }

    // Calculate deductions
    static calculateDeductions(totalLate, totalAbsent, config = {}) {
        const latePenalty = config.latePenalty || 5; // $5 per late
        const absentPenalty = config.absentPenalty || 20; // $20 per absent day

        const lateDeduction = totalLate * latePenalty;
        const absentDeduction = totalAbsent * absentPenalty;
        const totalDeductions = lateDeduction + absentDeduction;

        return {
            lateDeduction,
            absentDeduction,
            totalDeductions
        };
    }

    // Calculate overtime
    static calculateOvertime(overtimeHours, config = {}) {
        const overtimeRate = config.overtimeRate || 10; // $10 per hour
        return overtimeHours * overtimeRate;
    }

    // Calculate final salary
    static calculateFinalSalary(baseSalary, deductions, overtime, bonuses = 0) {
        return baseSalary - deductions + overtime + bonuses;
    }

    // Calculate salary for period
    static calculateSalaryForPeriod(employee, attendanceSummary, overtimeHours = 0, config = {}) {
        const { baseSalary, totalPresent, totalLate, totalAbsent } = 
            this.calculateBaseSalary(employee, attendanceSummary);

        const deductions = this.calculateDeductions(totalLate, totalAbsent, config);
        const overtimeBonus = this.calculateOvertime(overtimeHours, config);
        
        const finalSalary = this.calculateFinalSalary(
            baseSalary, 
            deductions.totalDeductions, 
            overtimeBonus
        );

        return {
            baseSalary,
            totalPresent,
            totalLate,
            totalAbsent,
            ...deductions,
            overtimeHours,
            overtimeBonus,
            finalSalary,
            workingDays: config.workingDays || 22 // Default working days per month
        };
    }

    // Generate salary breakdown
    static generateSalaryBreakdown(calculation) {
        return {
            earnings: {
                baseSalary: calculation.baseSalary,
                overtime: calculation.overtimeBonus,
                totalEarnings: calculation.baseSalary + calculation.overtimeBonus
            },
            deductions: {
                late: calculation.lateDeduction,
                absent: calculation.absentDeduction,
                totalDeductions: calculation.totalDeductions
            },
            summary: {
                finalSalary: calculation.finalSalary,
                presentDays: calculation.totalPresent,
                lateDays: calculation.totalLate,
                absentDays: calculation.totalAbsent
            }
        };
    }
}

module.exports = SalaryCalculator;