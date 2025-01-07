const pool = require('../config/db');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.id || req.user.id; // Use param ID for admin, otherwise authenticated user's ID
        const isAdmin = req.user?.role === 'admin';

        // Allow admin to fetch any user profile or authenticated user to fetch their own
        if (!isAdmin && userId != req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const query = `SELECT user_id, username, email, role, created_at, updated_at FROM users WHERE user_id = $1`;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Error fetching user profile:', err.message);
        next(err);
    }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.id || req.user.id; // Use param ID for admin, otherwise authenticated user's ID
        const isAdmin = req.user?.role === 'admin';

        // Allow admin to update any user profile or authenticated user to update their own
        if (!isAdmin && userId != req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { username, email, password } = req.body;

        const query = `
            UPDATE users
            SET
                username = COALESCE($1, username),
                email = COALESCE($2, email),
                password_hash = COALESCE($3, password_hash),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4
            RETURNING user_id, username, email, role, created_at, updated_at
        `;
        const values = [username, email, password, userId];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found or update failed' });
        }

        res.json({ success: true, message: 'User profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error updating user profile:', err.message);
        next(err);
    }
};
