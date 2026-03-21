const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const protect = (req, res, next) => {
    let token;

    if (!process.env.JWT_SECRET) {
        console.error('🛡️ [AUTH_CRITICAL]: JWT_SECRET NOT LOADED ON SERVER!');
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const tokenStr = req.headers.authorization.split(' ')[1];
            
            // Check for potential string representations of null
            if (tokenStr === 'null' || tokenStr === 'undefined' || !tokenStr) {
                return res.status(401).json({ success: false, message: 'Your session has expired or is invalid. Please login again.' });
            }

            const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
            req.user = decoded;
            return next();
        } catch (error) {
            console.error('🛡️ [AUTH_ERROR]: Token verification failed:', error.message);
            return res.status(401).json({ success: false, message: 'Authentication session is invalid. Access denied.' });
        }
    }

    return res.status(401).json({ success: false, message: 'This action requires a gourmet account. Please login to continue.' });
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Administrative privileges required.' });
    }
};

module.exports = { protect, admin };
