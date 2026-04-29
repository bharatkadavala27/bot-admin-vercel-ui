const express = require('express');
const router = express.Router();
const { getLeads, addLead, updateLead, deleteLead } = require('../controllers/lead_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getLeads);
router.post('/', addLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
