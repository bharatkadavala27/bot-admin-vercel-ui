const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const User = require('../models/User');
const Department = require('../models/Department');
const Branch = require('../models/Branch');
const LeaveType = require('../models/LeaveType');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Department.deleteMany();
        await Branch.deleteMany();
        await LeaveType.deleteMany();

        // Create Dummy Admin
        await User.create({
            role: 'admin',
            name: 'Dummy Admin',
            phone: '8888888888',
            email: 'dummy@test.com',
            companyName: 'Dummy Corp',
            subscriptionPlan: 'pro',
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            otp: '123456',
            otpExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

        // Create Tenant 1 (Admin)
        const admin1 = await User.create({
            role: 'admin',
            name: 'John Doe',
            phone: '9876543210',
            email: 'john@company.com',
            companyName: 'Tech Corp',
            subscriptionPlan: 'pro',
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // Create Dept for Tenant 1
        const dept1 = await Department.create({
            adminId: admin1._id,
            name: 'Engineering',
            colorCode: '#4F46E5'
        });

        // Create Branch for Tenant 1
        const branch1 = await Branch.create({
            adminId: admin1._id,
            branchName: 'Gurugram',
            branchLocation: 'Sector 47, Sector 47, Gurugram, Haryana, 122018',
            latitude: 28.4212598,
            longitude: 77.0405519
        });

        // Create Employee for Tenant 1
        await User.create({
            role: 'employee',
            adminId: admin1._id,
            name: 'Alice Smith',
            phone: '1234567890',
            email: 'alice@techcorp.com',
            departmentId: dept1._id,
            branchId: branch1._id,
            salary: 5000,
            status: 'active'
        });

        // Create Leave Types for Tenant 1
        await LeaveType.create([
            {
                adminId: admin1._id,
                leaveName: 'Annual Leave',
                code: 'AL',
                totalDays: 15,
                iconStyle: 'Calendar',
                description: 'Paid time off for holidays or personal use.'
            },
            {
                adminId: admin1._id,
                leaveName: 'Sick Leave',
                code: 'SL',
                totalDays: 10,
                iconStyle: 'Medical',
                description: 'Time off for medical reasons.'
            }
        ]);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
