const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
    try {
        const admin = await User.findOne({ _id: req.adminId, role: 'admin' });
        
        if (!admin) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account deactivated. Please contact support.' });
        }

        const now = new Date();
        if (admin.subscriptionEndDate && admin.subscriptionEndDate < now) {
            return res.status(403).json({ message: 'Subscription expired. Please renew.' });
        }

        // Attach plan for feature limiting in controllers
        req.subscriptionPlan = admin.subscriptionPlan;
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking subscription' });
    }
};

module.exports = { checkSubscription };
