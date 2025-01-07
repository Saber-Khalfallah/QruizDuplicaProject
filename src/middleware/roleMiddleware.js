exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is authorized
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient role.' });
        }
        next(); // Proceed to the next middleware or route handler
    };
};
