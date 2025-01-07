const pool = require('../config/db');

// Helper function to check user permissions
const checkOwnership = async (contentId, userId, userRole) => {
    const query = 'SELECT user_id FROM content WHERE content_id = $1';
    const result = await pool.query(query, [contentId]);

    if (result.rows.length === 0) return false; // Content does not exist

    const contentOwnerId = result.rows[0].user_id;

    // Admin can bypass ownership check
    if (userRole === 'admin') return true;

    // Registered user can access their own content
    return contentOwnerId === userId;
};

// Add elements to content
exports.addElements = async (req, res, next) => {
    const { id } = req.params; // Content ID
    const { elements } = req.body;
    const { id: userId, role: userRole } = req.user;

    try {
        // Check permissions
        const hasAccess = await checkOwnership(id, userId, userRole);
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Insert elements
        const queries = elements.map((element, index) => {
            const query = `
                INSERT INTO content_elements (content_id, element_type, data, position)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            return pool.query(query, [id, element.element_type, element.data, index + 1]);
        });

        const results = await Promise.all(queries);

        res.status(201).json({
            success: true,
            message: 'Elements added successfully',
            elements: results.map(result => result.rows[0]),
        });
    } catch (err) {
        console.error('Error adding elements:', err.message);
        next(err);
    }
};

// Fetch elements by content ID
exports.getElements = async (req, res, next) => {
    const { id } = req.params; // Content ID
    const { id: userId, role: userRole } = req.user || {}; // Guest may not have a user

    try {
        const contentQuery = 'SELECT * FROM content WHERE content_id = $1';
        const contentResult = await pool.query(contentQuery, [id]);

        if (contentResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        const content = contentResult.rows[0];

        // Permission check
        if (!content.is_public && content.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Fetch elements
        const query = 'SELECT * FROM content_elements WHERE content_id = $1 ORDER BY position';
        const result = await pool.query(query, [id]);

        res.json({ success: true, elements: result.rows });
    } catch (err) {
        console.error('Error fetching elements:', err.message);
        next(err);
    }
};

// Update an element
exports.updateElement = async (req, res, next) => {
    const { elementId } = req.params;
    const { data, position } = req.body;
    const { id: userId, role: userRole } = req.user;

    try {
        // Check ownership of the content the element belongs to
        const query = `
            SELECT c.user_id
            FROM content_elements ce
            INNER JOIN content c ON ce.content_id = c.content_id
            WHERE ce.element_id = $1
        `;
        const result = await pool.query(query, [elementId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Element not found' });
        }

        const contentOwnerId = result.rows[0].user_id;

        if (userRole !== 'admin' && contentOwnerId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Update element
        const updateQuery = `
            UPDATE content_elements
            SET data = $1, position = $2, updated_at = CURRENT_TIMESTAMP
            WHERE element_id = $3
            RETURNING *
        `;
        const updateResult = await pool.query(updateQuery, [data, position, elementId]);

        res.json({ success: true, element: updateResult.rows[0] });
    } catch (err) {
        console.error('Error updating element:', err.message);
        next(err);
    }
};

// Delete an element
exports.deleteElement = async (req, res, next) => {
    const { elementId } = req.params;
    const { id: userId, role: userRole } = req.user;

    try {
        // Check ownership
        const query = `
            SELECT c.user_id
            FROM content_elements ce
            INNER JOIN content c ON ce.content_id = c.content_id
            WHERE ce.element_id = $1
        `;
        const result = await pool.query(query, [elementId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Element not found' });
        }

        const contentOwnerId = result.rows[0].user_id;

        if (userRole !== 'admin' && contentOwnerId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Delete element
        const deleteQuery = 'DELETE FROM content_elements WHERE element_id = $1 RETURNING *';
        const deleteResult = await pool.query(deleteQuery, [elementId]);

        res.json({ success: true, message: 'Element deleted successfully', element: deleteResult.rows[0] });
    } catch (err) {
        console.error('Error deleting element:', err.message);
        next(err);
    }
};
