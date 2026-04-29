const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    punchIn: { type: Date },
    punchInLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    punchInPhoto: { type: String },
    punchOut: { type: Date },
    punchOutLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    punchOutPhoto: { type: String },
    lunchInTime: { type: Date },
    lunchInLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lunchOutTime: { type: Date },
    lunchOutLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    status: { 
        type: String, 
        enum: ['present', 'absent', 'half-day', 'late'], 
        default: 'present' 
    },
    remarks: { type: String }
}, { timestamps: true });

AttendanceSchema.index({ adminId: 1, date: 1 });
AttendanceSchema.index({ adminId: 1, employeeId: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
