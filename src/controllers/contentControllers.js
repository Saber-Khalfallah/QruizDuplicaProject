const pool = require('../config/db');
const redisClient = require('../config/redis');
const crypto = require('crypto');

// Helper function to generate secret codes
const generateSecretCode = () => crypto.randomBytes(4).toString('hex');

// Create content
exports.createContent = async (req, res, next) => {
    try {
        const { title, type, description, settings, is_public } = req.body;
        const userId = req.user.id; // Extracted from JWT by middleware
        const role = req.user.role;

        // Guests can only create "Quiz" type content
        if (role === 'guest' && type !== 'Quiz') {
            return res.status(403).json({ message: 'Guests can only create Quiz content' });
        }

        // Insert content into the database
        const result = await pool.query(
            'INSERT INTO content (user_id, title, type, description, settings, is_public, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            [userId, title, type, description, settings || '{}', is_public || false]
        );

        const content = result.rows[0];

        // If content is private, generate and cache a secret code
        if (!is_public) {
            const secretCode = generateSecretCode();
            await redisClient.setEx(`content:${content.content_id}:secret_code`, 3600, secretCode); // Expires in 1 hour
            content.secret_code = secretCode; // Attach secret code to response
        }

        res.status(201).json({ message: 'Content created successfully', content });
    } catch (err) {
        next(err);
    }
};

// Fetch all content
exports.getAllContent = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?.id || null; // Null for guests
        const userRole = req.user?.role || 'guest'; // Default role is guest

        // Define base query and conditions
        let query = '';
        const values = [];

        // Pagination
        const offset = (page - 1) * limit;

        if (userRole === 'guest') {
            // Guests cannot view content
            return res.status(403).json({
                success: false,
                message: 'Access denied. Guests cannot view content.',
            });
        } else if (userRole === 'registered') {
            // Registered users: View only their content
            query = `
                SELECT * FROM content
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            `;
            values.push(userId, limit, offset);
        } else if (userRole === 'admin') {
            // Admins: View all content
            query = `
                SELECT * FROM content
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;
            values.push(limit, offset);
        }

        // Execute query
        const result = await pool.query(query, values);

        res.json({
            success: true,
            content: result.rows,
        });
    } catch (err) {
        console.error('Error fetching content:', err.message);
        next(err);
    }
};



// Fetch content by ID with secret code validation
exports.getContentById = async (req, res, next) => {
    try {
        const { id } = req.params; // Content ID
        const { secret_code } = req.query; // Secret code from query
        const userId = req.user?.id || null; // Authenticated user ID (null for guests)
        const userRole = req.user?.role || 'guest'; // Role of the user

        // Step 1: Fetch content from the database
        const query = 'SELECT * FROM content WHERE content_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            console.error(`[getContentById] Content ID ${id} not found`);
            return res.status(404).json({ message: 'Content not found' });
        }

        const content = result.rows[0];
        console.log(`[getContentById] Fetched Content:`, content);

        // Step 2: Check access permissions
        if (!content.is_public) {
            console.log(`[getContentById] Content is not public`);

            // Allow the owner to access their content
            if (content.user_id === userId) {
                console.log(`[getContentById] Access granted to owner`);
                return res.json({ success: true, content });
            }

            // Admins can access any content
            if (userRole === 'admin') {
                console.log(`[getContentById] Access granted to admin`);
                return res.json({ success: true, content });
            }

            // Enforce secret code validation for other users
            if (!secret_code) {
                console.error(`[getContentById] Secret code required`);
                console.error(`[UserID]: `,userId);
                console.error(`[content user id ]: `,content.user_id);
                return res.status(403).json({ message: 'Secret code required for private content' });
            }

            const storedCode = await redisClient.get(`content:${id}:secret_code`);
            console.log(`[getContentById] Stored Secret Code: ${storedCode}, Provided Code: ${secret_code}`);

            if (storedCode !== secret_code) {
                console.error(`[getContentById] Invalid or expired secret code`);
                return res.status(403).json({ message: 'Invalid or expired secret code' });
            }
        } else {
            console.log(`[getContentById] Content is public`);
        }

        // Step 3: Return the content
        res.json({ success: true, content });
    } catch (err) {
        console.error(`[getContentById] Error: ${err.message}`);
        next(err);
    }
};



// Update content
exports.updateContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, type, description, settings, is_public } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

        // Guests cannot update content
        if (role === 'guest') {
            return res.status(403).json({ message: 'Guests cannot update content' });
        }

        // Check if the content exists and if the user has permission to edit
        const queryCheck = `
            SELECT * FROM content
            WHERE content_id = $1
              AND (user_id = $2 OR $3 = 'admin')
        `;
        const resultCheck = await pool.query(queryCheck, [id, userId, role]);

        if (resultCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Content not found or access denied' });
        }

        // Update the content
        const queryUpdate = `
            UPDATE content
            SET title = $1, type = $2, description = $3, settings = $4, is_public = $5, updated_at = CURRENT_TIMESTAMP
            WHERE content_id = $6
            RETURNING *
        `;
        const resultUpdate = await pool.query(queryUpdate, [
            title,
            type,
            description,
            settings || '{}',
            is_public,
            id,
        ]);

        res.json({ message: 'Content updated successfully', content: resultUpdate.rows[0] });
    } catch (err) {
        next(err);
    }
};

// Delete content
exports.deleteContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const queryCheck = `
            SELECT * FROM content
            WHERE content_id = $1
              AND (user_id = $2 OR $3 = 'admin')
        `;
        const resultCheck = await pool.query(queryCheck, [id, userId, role]);

        if (resultCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Content not found or access denied' });
        }

        const queryDelete = `
            DELETE FROM content
            WHERE content_id = $1
            RETURNING *
        `;
        const resultDelete = await pool.query(queryDelete, [id]);

        res.json({ message: 'Content deleted successfully', content: resultDelete.rows[0] });
    } catch (err) {
        next(err);
    }
};
