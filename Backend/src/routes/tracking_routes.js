const express = require('express');
const router = express.Router();
const { updateLocation, getLatestLocations } = require('../controllers/tracking_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/update', updateLocation);
router.get('/latest', getLatestLocations);

module.exports = router;
