const pool = require('../config/db');

// Fetch content for participation
exports.getParticipantContent = async (req, res, next) => {
    try {
        const { content_id } = req.linkData;

        const contentQuery = `
            SELECT * FROM content WHERE content_id = $1
        `;
        const contentResult = await pool.query(contentQuery, [content_id]);

        if (contentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Content not found or access denied' });
        }

        const content = contentResult.rows[0];

        // Fetch associated content elements
        const elementsQuery = `
            SELECT * FROM content_elements
            WHERE content_id = $1
            ORDER BY position
        `;
        const elementsResult = await pool.query(elementsQuery, [content_id]);

        res.json({
            success: true,
            content,
            elements: elementsResult.rows,
        });
    } catch (err) {
        console.error('Error fetching content for participation:', err.message);
        next(err);
    }
};

// Submit participation responses
exports.submitResponse = async (req, res, next) => {
    try {
        const { content_id } = req.linkData;
        const { responses } = req.body;
        const userId = req.user?.id || null;
        const isGuest = !req.user;
        const guestName = isGuest ? req.body.guestName : null;

        if (isGuest && !guestName) {
            return res.status(400).json({ message: 'Guest name is required' });
        }

        // Validate if the content and elements exist
        const contentQuery = `
            SELECT * FROM content WHERE content_id = $1
        `;
        const contentResult = await pool.query(contentQuery, [content_id]);

        if (contentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Content not found' });
        }

        const validElementIdsQuery = `
            SELECT element_id FROM content_elements WHERE content_id = $1
        `;
        const validElementIdsResult = await pool.query(validElementIdsQuery, [content_id]);
        const validElementIds = validElementIdsResult.rows.map((row) => row.element_id);

        const invalidResponses = responses.filter(
            (resp) => !validElementIds.includes(resp.element_id)
        );

        if (invalidResponses.length > 0) {
            return res.status(400).json({ message: 'Invalid responses', invalidResponses });
        }

        // Insert into responses table
        const responseQuery = `
            INSERT INTO responses (content_id, user_id, is_guest, guest_name, completed)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING response_id
        `;
        const responseResult = await pool.query(responseQuery, [
            content_id,
            userId,
            isGuest,
            guestName,
            true, // Assuming the response is marked as completed
        ]);
        const responseId = responseResult.rows[0].response_id;

        // Insert into response_details table
        const detailQueries = responses.map((resp) => {
            const query = `
                INSERT INTO response_details (response_id, element_id, answer)
                VALUES ($1, $2, $3)
            `;
            return pool.query(query, [responseId, resp.element_id, resp.answer]);
        });
        await Promise.all(detailQueries);

        res.status(201).json({ success: true, message: 'Response submitted successfully' });
    } catch (err) {
        console.error('Error submitting response:', err.message);
        next(err);
    }
};
