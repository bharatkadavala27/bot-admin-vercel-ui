const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const Expense = require('../models/Expense');
const Ticket = require('../models/Ticket');

exports.getSummary = async (req, res) => {
    try {
        const adminId = req.adminId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalEmployees,
            activeEmployees,
            presentToday,
            lateToday,
            halfDayToday,
            monthlySalaryRecords,
            totalExpenses,
            recentEmployees,
            pendingTickets
        ] = await Promise.all([
            User.countDocuments({ adminId, role: 'employee' }),
            User.countDocuments({ adminId, role: 'employee', status: 'active' }),
            Attendance.countDocuments({ adminId, date: { $gte: today }, status: 'present' }),
            Attendance.countDocuments({ adminId, date: { $gte: today }, status: 'late' }),
            Attendance.countDocuments({ adminId, date: { $gte: today }, status: 'half-day' }),
            Salary.find({ adminId }), // You might want to filter by current month
            Expense.find({ adminId }),
            User.find({ adminId, role: 'employee' }).sort({ createdAt: -1 }).limit(5).populate('departmentId'),
            Ticket.find({ adminId, status: 'pending' }).sort({ createdAt: -1 }).limit(4).populate('employeeId')
        ]);

        const totalSalary = monthlySalaryRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
        const totalExpenseAmount = totalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        res.json({
            stats: {
                totalEmployees,
                activeEmployees,
                presentToday: presentToday + lateToday,
                absentToday: totalEmployees - (presentToday + lateToday + halfDayToday),
                halfDayToday,
                totalSalary,
                totalExpenses: totalExpenseAmount,
                totalLeads: 0 // Leads not yet implemented in backend
            },
            recentEmployees,
            pendingTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
