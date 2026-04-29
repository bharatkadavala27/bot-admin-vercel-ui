const Salary = require('../models/Salary');
const User = require('../models/User');

exports.generateSalaries = async (req, res) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) return res.status(400).json({ message: 'Month and Year are required' });

        // 1. Fetch all active employees
        const employees = await User.find({
            adminId: req.adminId,
            role: 'employee',
            status: 'active'
        });

        const results = [];
        for (const emp of employees) {
            // Check if already generated
            const existing = await Salary.findOne({
                adminId: req.adminId,
                employeeId: emp._id,
                month,
                year
            });
            if (existing) continue;

            // 2. Calculate Components
            const earnings = [];
            const deductions = [];
            let totalEarnings = 0;
            let totalDeductions = 0;

            const c = emp.salaryComponents || {};
            const base = emp.salary || 0; // CTC

            // Helper to add component
            const addComp = (key, label, type) => {
                if (c[key] && c[key].enabled) {
                    const amt = Math.round((base * (c[key].percentage || 0)) / 100);
                    if (type === 'earning') {
                        earnings.push({ name: label, amount: amt });
                        totalEarnings += amt;
                    } else {
                        deductions.push({ name: label, amount: amt });
                        totalDeductions += amt;
                    }
                }
            };

            // Earnings
            addComp('basic', 'Basic Salary', 'earning');
            addComp('da', 'DA', 'earning');
            addComp('hra', 'HRA', 'earning');
            addComp('ca', 'Conveyance Allowance', 'earning');
            addComp('bonus', 'Bonus', 'earning');

            // Deductions
            addComp('tds', 'TDS', 'deduction');
            addComp('pf', 'PF', 'deduction');
            addComp('esic', 'ESIC', 'deduction');
            addComp('epf', 'EPF', 'deduction');
            addComp('pt', 'Professional Tax', 'deduction');
            addComp('retention', 'Retention', 'deduction');
            addComp('adminCharge', 'Admin Charges', 'deduction');

            const totalSalary = totalEarnings - totalDeductions;

            // 3. Create Record
            const salaryRecord = await Salary.create({
                adminId: req.adminId,
                employeeId: emp._id,
                baseSalary: base,
                bonus: earnings.find(e => e.name === 'Bonus')?.amount || 0,
                deductions: totalDeductions,
                month,
                year,
                totalSalary,
                status: 'pending',
                breakdown: { earnings, deductions }
            });
            results.push(salaryRecord);
        }

        res.status(201).json({ 
            message: `Generated ${results.length} salary records`,
            count: results.length 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addSalary = async (req, res) => {

    try {
        const { employeeId, baseSalary, bonus, deductions, month, year } = req.body;
        const totalSalary = baseSalary + (bonus || 0) - (deductions || 0);

        const salary = await Salary.create({
            adminId: req.adminId,
            employeeId,
            baseSalary,
            bonus,
            deductions,
            month,
            year,
            totalSalary
        });

        res.status(201).json(salary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSalaryByEmployee = async (req, res) => {
    try {
        const salaries = await Salary.find({
            adminId: req.adminId,
            employeeId: req.params.employeeId
        }).sort({ year: -1, month: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const salaries = await Salary.find({
            adminId: req.adminId,
            month,
            year
        }).populate('employeeId', 'name phone');
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSalary = async (req, res) => {
    try {
        const salary = await Salary.findOneAndUpdate(
            { _id: req.params.id, adminId: req.adminId },
            req.body,
            { new: true }
        );
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.json(salary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

