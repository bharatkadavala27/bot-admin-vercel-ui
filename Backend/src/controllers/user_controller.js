const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            adminId: user.role === 'admin' ? user._id : user.adminId,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// --- AUTH LOGIC ---

exports.loginRequest = async (req, res) => {
    const { phone } = req.body;
    try {
        // Find any user with this phone number
        let user = await User.findOne({ phone });

        const otp = "123456";
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        if (!user) {
            return res.status(404).json({ message: 'Account not found. Please contact support.' });
        }

        // Update existing user with OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        res.status(200).json({ message: 'OTP sent successfully (Mock: 123456)' });
    } catch (error) {
        console.error("Login Request Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            companyName: user.companyName,
            companyLogo: user.companyLogo,
            address: user.address,
            email: user.email,
            token: generateToken(user)
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.companyLogo = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- EMPLOYEE MANAGEMENT LOGIC (Admin Only) ---

exports.getUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = { adminId: new mongoose.Types.ObjectId(req.adminId) };

        if (role) query.role = role;
        if (search) query.name = { $regex: search, $options: 'i' };

        const users = await User.find(query)
            .populate('departmentId branchId shiftId')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);
        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalUsers: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ adminId: new mongoose.Types.ObjectId(req.adminId), role: 'employee' })
            .populate('departmentId branchId shiftId')
            .sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const userData = { ...req.body, adminId: new mongoose.Types.ObjectId(req.adminId) };
        const user = await User.create(userData);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, adminId: new mongoose.Types.ObjectId(req.adminId) },
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, adminId: new mongoose.Types.ObjectId(req.adminId) });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
