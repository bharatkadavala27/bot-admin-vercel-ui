const express = require('express');
const router = express.Router();
const { punchIn, punchOut, lunchIn, lunchOut, getReports, updateAttendance } = require('../controllers/attendance_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.post('/lunch-in', lunchIn);
router.post('/lunch-out', lunchOut);
router.get('/reports', getReports);
router.put('/:id', updateAttendance);

module.exports = router;
