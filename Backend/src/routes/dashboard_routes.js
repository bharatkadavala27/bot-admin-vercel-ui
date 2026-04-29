const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboard_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/summary', getSummary);

module.exports = router;
