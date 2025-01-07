const pool = require('../config/db');

exports.getContentByLink = async (req, res, next) => {
    try {
        const { link } = req.params;
        const { secretCode } = req.query;

        // Fetch the link details
        const linkQuery = `SELECT * FROM links WHERE link = $1`;
        const linkResult = await pool.query(linkQuery, [link]);

        if (linkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired link' });
        }

        const contentId = linkResult.rows[0].content_id;

        // Fetch the associated content
        const contentQuery = `SELECT * FROM content WHERE content_id = $1`;
        const contentResult = await pool.query(contentQuery, [contentId]);

        if (contentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const content = contentResult.rows[0];

        // Validate secret code for private content
        if (!content.is_public) {
            const storedCode = await redisClient.get(`content:${link}:secret_code`);
            if (!storedCode || storedCode !== secretCode) {
                return res.status(403).json({ error: 'Invalid or missing secret code' });
            }
        }

        // Increment access count
        const incrementAccessQuery = `UPDATE links SET access_count = access_count + 1 WHERE link = $1`;
        await pool.query(incrementAccessQuery, [link]);

        res.json({ success: true, content });
    } catch (err) {
        console.error('Error accessing content by link:', err.message);
        next(err);
    }
};

