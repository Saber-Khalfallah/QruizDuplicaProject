const pool = require('../config/db');

exports.validateLink = async (req, res, next) => {
    try {
        const { link } = req.params;

        const query = `
            SELECT content_id, expiration_date, max_access, access_count
            FROM links
            WHERE link = $1
        `;
        const result = await pool.query(query, [link]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid or expired link' });
        }

        const linkData = result.rows[0];

        // Validate expiration date
        if (linkData.expiration_date && new Date(linkData.expiration_date) < new Date()) {
            return res.status(403).json({ message: 'Link has expired' });
        }

        // Validate access count
        if (linkData.max_access && linkData.access_count >= linkData.max_access) {
            return res.status(403).json({ message: 'Link has reached its maximum access limit' });
        }

        // Pass link data to the next middleware
        req.linkData = linkData;

        next();
    } catch (err) {
        console.error('Error validating link:', err.message);
        next(err);
    }
};
