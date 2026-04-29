const express = require('express');
const router = express.Router();
const { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } = require('../controllers/leave_type_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getLeaveTypes);
router.post('/', createLeaveType);
router.put('/:id', updateLeaveType);
router.delete('/:id', deleteLeaveType);

module.exports = router;
