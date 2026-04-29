const express = require('express');
const router = express.Router();
const { 
    loginRequest, 
    verifyOtp, 
    getProfile, 
    getUsers, 
    getEmployees,
    createUser, 
    updateUser, 
    updateProfile,
    deleteUser 
} = require('../controllers/user_controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

// Auth routes
router.post('/login-request', loginRequest);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('logo'), updateProfile);

// Management routes (Protected)
router.use(protect);
router.get('/', getUsers);
router.get('/employees', getEmployees);
router.post('/employees', createUser);
router.put('/employees/:id', updateUser);
router.delete('/employees/:id', deleteUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
