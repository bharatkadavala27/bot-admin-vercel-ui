const express = require('express');
const router = express.Router();
const { getShifts, createShift, updateShift, deleteShift } = require('../controllers/shift_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getShifts);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

module.exports = router;
