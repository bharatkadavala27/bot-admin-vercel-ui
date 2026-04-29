const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.punchIn = async (req, res) => {
    try {
        const { employeeId, location, photo } = req.body;
        const today = new Date().setHours(0,0,0,0);
        
        let attendance = await Attendance.findOne({
            adminId: new mongoose.Types.ObjectId(req.adminId),
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: { $gte: today }
        });

        if (attendance) {
            return res.status(400).json({ message: 'Already punched in today' });
        }

        // Check for Shift and Lateness
        const user = await User.findById(employeeId).populate('shiftId');
        let status = 'present';

        if (user && user.shiftId) {
            const shiftStart = user.shiftId.startTime; // e.g. "09:00"
            const [sHour, sMinute] = shiftStart.split(':').map(Number);
            
            const now = new Date();
            const graceMinutes = 15;
            const threshold = new Date(now);
            threshold.setHours(sHour, sMinute + graceMinutes, 0, 0);

            if (now > threshold) {
                status = 'late';
            }
        }

        attendance = await Attendance.create({
            adminId: new mongoose.Types.ObjectId(req.adminId),
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: new Date(),
            punchIn: new Date(),
            punchInLocation: location,
            punchInPhoto: photo,
            status
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.punchOut = async (req, res) => {
    try {
        const { employeeId, location, photo } = req.body;
        const today = new Date().setHours(0,0,0,0);
        
        const attendance = await Attendance.findOne({
            adminId: new mongoose.Types.ObjectId(req.adminId),
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No punch-in record found for today' });
        }

        attendance.punchOut = new Date();
        attendance.punchOutLocation = location;
        attendance.punchOutPhoto = photo;
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.lunchIn = async (req, res) => {
    try {
        const { employeeId, location } = req.body;
        const today = new Date().setHours(0,0,0,0);
        
        const attendance = await Attendance.findOne({
            adminId: new mongoose.Types.ObjectId(req.adminId),
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No attendance record found for today' });
        }

        attendance.lunchInTime = new Date();
        attendance.lunchInLocation = location;
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.lunchOut = async (req, res) => {
    try {
        const { employeeId, location } = req.body;
        const today = new Date().setHours(0,0,0,0);
        
        const attendance = await Attendance.findOne({
            adminId: new mongoose.Types.ObjectId(req.adminId),
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'No attendance record found for today' });
        }

        attendance.lunchOutTime = new Date();
        attendance.lunchOutLocation = location;
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;
        const query = { adminId: new mongoose.Types.ObjectId(req.adminId) };

        if (employeeId) query.employeeId = new mongoose.Types.ObjectId(employeeId);
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const reports = await Attendance.find(query).populate('employeeId', 'name phone');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { punchIn, punchOut, status, remarks } = req.body;

        const attendance = await Attendance.findOne({
            _id: new mongoose.Types.ObjectId(id),
            adminId: new mongoose.Types.ObjectId(req.adminId)
        });
        if (!attendance) return res.status(404).json({ message: 'Record not found' });

        if (punchIn) attendance.punchIn = punchIn;
        if (punchOut) attendance.punchOut = punchOut;
        if (status) attendance.status = status;
        if (remarks !== undefined) attendance.remarks = remarks;

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
