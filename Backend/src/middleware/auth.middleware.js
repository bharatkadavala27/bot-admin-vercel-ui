const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.adminId = decoded.adminId;
            req.userId = decoded.userId;
            req.user = decoded;

            const user = await User.findById(req.userId);
            if (!user || user.status === 'inactive') {
                return res.status(401).json({ message: 'Not authorized, user inactive or not found' });
            }

            // If it's an admin-level check (tenant check)
            if (user.role === 'employee') {
                const admin = await User.findById(req.adminId);
                if (!admin || !admin.isActive) {
                    return res.status(401).json({ message: 'Not authorized, tenant inactive' });
                }
            } else if (!user.isActive) {
                return res.status(401).json({ message: 'Not authorized, tenant inactive' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
