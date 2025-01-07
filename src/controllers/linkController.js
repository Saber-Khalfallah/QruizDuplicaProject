const crypto = require('crypto');
const pool = require('../config/db');

exports.generateLink = async (req, res, next) => {
    try {
        const { id } = req.params; // Content ID
        const { expirationDate, maxAccess, secretCode } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Verify that the user owns the content or is an admin
        const contentCheckQuery = `
            SELECT * FROM content
            WHERE content_id = $1 AND (user_id = $2 OR $3 = 'admin')
        `;
        const contentCheckResult = await pool.query(contentCheckQuery, [id, userId, userRole]);

        if (contentCheckResult.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied or content not found' });
        }

        // Generate a unique link
        const uniqueLink = crypto.randomBytes(16).toString('hex');

        // Insert the link into the database
        const insertLinkQuery = `
            INSERT INTO links (content_id, link, expiration_date, max_access)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const insertLinkResult = await pool.query(insertLinkQuery, [
            id,
            uniqueLink,
            expirationDate || null,
            maxAccess || null,
        ]);

        // Store the secret code in Redis if provided
        if (secretCode) {
            await redisClient.setEx(`content:${uniqueLink}:secret_code`, 3600, secretCode); // Expires in 1 hour
        }

        res.status(201).json({
            message: 'Link generated successfully',
            link: `${process.env.BASE_URL || 'http://localhost:3000'}/content/${uniqueLink}`,
            details: insertLinkResult.rows[0],
        });
    } catch (err) {
        console.error('Error generating link:', err.message);
        next(err);
    }
};

exports.getActiveLinks = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Fetch links for the user's content or all content if admin
        const query = `
            SELECT links.*, content.title, content.type
            FROM links
            INNER JOIN content ON links.content_id = content.content_id
            WHERE $1 = 'admin' OR content.user_id = $2
        `;
        const result = await pool.query(query, [userRole, userId]);

        res.json({ success: true, links: result.rows });
    } catch (err) {
        console.error('Error fetching active links:', err.message);
        next(err);
    }
};

exports.deleteLink = async (req, res, next) => {
    try {
        const { link } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Verify ownership or admin privileges
        const queryCheck = `
            SELECT links.link_id
            FROM links
            INNER JOIN content ON links.content_id = content.content_id
            WHERE links.link = $1 AND (content.user_id = $2 OR $3 = 'admin')
        `;
        const resultCheck = await pool.query(queryCheck, [link, userId, userRole]);

        if (resultCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied or link not found' });
        }

        // Delete the link
        const queryDelete = `DELETE FROM links WHERE link = $1`;
        await pool.query(queryDelete, [link]);

        res.json({ success: true, message: 'Link deleted successfully' });
    } catch (err) {
        console.error('Error deleting link:', err.message);
        next(err);
    }
};

exports.updateLinkSettings = async (req, res, next) => {
    try {
        const { link } = req.params;
        const { expirationDate, maxAccess } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Verify that the user owns the content associated with the link
        const queryCheck = `
            SELECT links.link_id
            FROM links
            INNER JOIN content ON links.content_id = content.content_id
            WHERE links.link = $1 AND (content.user_id = $2 OR $3 = 'admin')
        `;
        const resultCheck = await pool.query(queryCheck, [link, userId,userRole]);

        if (resultCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found or access denied' });
        }

        // Update the link settings
        const queryUpdate = `
            UPDATE links
            SET expiration_date = $1, max_access = $2
            WHERE link = $3
            RETURNING *
        `;
        const resultUpdate = await pool.query(queryUpdate, [expirationDate || null, maxAccess || null, link]);

        res.json({ success: true, link: resultUpdate.rows[0] });
    } catch (err) {
        console.error('Error updating link settings:', err.message);
        next(err);
    }
};
