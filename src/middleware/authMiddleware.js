const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Treat the user as a guest if no token is provided
        req.user = { role: 'guest' }; 
        return next();
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data (e.g., id, role) to req.user
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.requireAuthenticatedUser = (req, res, next) => {
    if (!req.user || req.user.role === 'guest') {
        return res.status(403).json({ error: 'Access denied. Only authenticated users can access this resource.' });
    }
    next();
};
exports.validateGuestToken = async (req, res, next) => {
    const { id } = req.params; // Content ID
    const { guest_token } = req.headers; // Guest token from headers

    if (!req.user) {
        // Validate guest token
        const storedToken = await redisClient.get(`guest:content:${id}`);
        if (!storedToken || storedToken !== guest_token) {
            return res.status(403).json({ message: 'Invalid or missing guest token' });
        }
    }

    next();
};

