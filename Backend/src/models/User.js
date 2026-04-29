const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ['admin', 'employee'], 
        required: true 
    },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        index: true,
        required: function() { return this.role === 'employee'; }
    },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, sparse: true },
    
    // Admin specific fields
    companyName: { 
        type: String, 
        required: function() { return this.role === 'admin'; } 
    },
    companyLogo: { type: String },
    subscriptionPlan: { 
        type: String, 
        enum: ['free', 'basic', 'pro'], 
        default: 'free' 
    },
    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date },
    
    // Employee specific fields
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    salary: { type: Number, default: 0 },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    profileImage: { type: String },

    // Additional Personal Details
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    joiningDate: { type: Date },
    employmentType: { type: String, enum: ['monthly', 'daily', 'hourly'], default: 'monthly' },
    leadDeletionPermission: { type: Boolean, default: false },
    
    address: { type: String },
    bloodGroup: { type: String },
    contactPersonName: { type: String },
    contactPersonMobile: { type: String },
    aadhaarNo: { type: String },
    panNo: { type: String },
    experience: { type: String },
    residentialAddress: { type: String },
    residentialPhone: { type: String },
    education: { type: String },

    bankDetails: {
        accountNumber: { type: String },
        bankName: { type: String },
        ifsc: { type: String },
        branchName: { type: String },
        nameAsPerBank: { type: String }
    },

    // Customized Holiday Fields
    weeklyHolidays: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        weeks: { type: [Number], default: [] } // Empty means all weeks, [1, 3] means 1st and 3rd week
    }],

    // Salary Configuration
    salaryComponents: {
        tds: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        tdsCategory: { type: String }, // e.g., 92B, 92J
        basic: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        da: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        hra: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        ca: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        pf: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        esic: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        epf: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        tdsOnProfession: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        retention: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        pt: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        adminCharge: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
        bonus: { enabled: { type: Boolean, default: false }, percentage: { type: Number, default: 0 } },
    },
    
    // Common fields
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    isActive: { type: Boolean, default: true }, // For Admin tenant status
    otp: { type: String },
    otpExpiry: { type: Date },
}, { timestamps: true });

UserSchema.index({ adminId: 1, role: 1 });

module.exports = mongoose.model('User', UserSchema);
