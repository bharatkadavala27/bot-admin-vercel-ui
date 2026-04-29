const express = require('express');
const router = express.Router();
const { createTicket, updateTicketStatus, getTickets } = require('../controllers/ticket_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', createTicket);
router.put('/:id/status', updateTicketStatus);
router.get('/', getTickets);

module.exports = router;
