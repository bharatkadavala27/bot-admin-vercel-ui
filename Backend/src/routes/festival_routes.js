const express = require('express');
const router = express.Router();
const { getFestivals, createFestival, updateFestival, deleteFestival } = require('../controllers/festival_controller');
const { protect } = require('../middleware/auth.middleware');

const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/', getFestivals);
router.post('/', upload.single('poster'), createFestival);
router.put('/:id', upload.single('poster'), updateFestival);
router.delete('/:id', deleteFestival);

module.exports = router;
