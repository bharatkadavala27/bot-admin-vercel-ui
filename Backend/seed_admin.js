const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const phone = '1234567890';
        const otp = '123456';

        // Check if user already exists
        let user = await User.findOne({ phone });

        if (user) {
            console.log('Admin user already exists. Updating OTP...');
            user.otp = otp;
            user.role = 'admin';
            user.companyName = 'B.O.T Admin';
            await user.save();
        } else {
            console.log('Creating new Admin user...');
            user = await User.create({
                name: 'Admin User',
                phone: phone,
                role: 'admin',
                companyName: 'B.O.T Admin',
                otp: otp,
                status: 'active'
            });
        }

        console.log('-----------------------------------');
        console.log('Admin Seeding Successful!');
        console.log(`Phone: ${phone}`);
        console.log(`OTP: ${otp}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedAdmin();
