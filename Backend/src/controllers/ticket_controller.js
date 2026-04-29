const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create({ ...req.body, adminId: req.adminId });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;
        const ticket = await Ticket.findOneAndUpdate(
            { _id: req.params.id, adminId: req.adminId },
            { status, adminRemark },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ adminId: req.adminId }).populate('employeeId', 'name');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
