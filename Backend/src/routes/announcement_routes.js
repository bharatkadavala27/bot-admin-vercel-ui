const express = require('express');
const router = express.Router();
const { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin } = require('../controllers/announcement_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', addAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.patch('/:id/pin', togglePin);

module.exports = router;
