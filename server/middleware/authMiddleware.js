const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const protect = (req, res, next) => {
    let token;

    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET NOT LOADED ON SERVER!');
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Check for potential string representations of null
            if (token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Not authorized, invalid token format' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_if_missing');
            req.user = decoded;
            return next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
