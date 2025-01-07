const pool = require('../config/db'); // Import your database connection

exports.getDashboardOverview = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Check for user role
        if (!userId || !userRole) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }

        // Define query conditions based on role
        const isAdmin = userRole === 'admin';
        const contentCondition = isAdmin ? '' : 'WHERE user_id = $1';
        const userCondition = isAdmin ? '' : 'WHERE content.user_id = $1';

        const values = isAdmin ? [] : [userId];

        // Queries
        // 1. Total content created
        const totalContentQuery = `
            SELECT COUNT(*) AS total_content
            FROM content
            ${contentCondition}
        `;
        const totalContentResult = await pool.query(totalContentQuery, values);

        // 2. Breakdown of content types
        const contentTypeQuery = `
            SELECT type, COUNT(*) AS count
            FROM content
            ${contentCondition}
            GROUP BY type
        `;
        const contentTypeResult = await pool.query(contentTypeQuery, values);

        // 3. Total participants across all content
        const totalParticipantsQuery = `
            SELECT COUNT(*) AS total_participants
            FROM responses
            WHERE content_id IN (
                SELECT content_id FROM content
                ${contentCondition}
            )
        `;
        const totalParticipantsResult = await pool.query(totalParticipantsQuery, values);

        // 4. Average completion rate
        const completionRateQuery = `
            SELECT AVG(completed::INT) AS avg_completion_rate
            FROM responses
            WHERE content_id IN (
                SELECT content_id FROM content
                ${contentCondition}
            )
        `;
        const completionRateResult = await pool.query(completionRateQuery, values);

        // 5. Average score across all content
        const averageScoreQuery = `
            SELECT AVG((answer->>'score')::NUMERIC) AS average_score
            FROM response_details
            INNER JOIN responses ON responses.response_id = response_details.response_id
            WHERE responses.content_id IN (
                SELECT content_id FROM content
                ${contentCondition}
            )
        `;
        const averageScoreResult = await pool.query(averageScoreQuery, values);

        // Combine results
        const dashboardOverview = {
            totalContent: parseInt(totalContentResult.rows[0].total_content, 10) || 0,
            contentTypeBreakdown: contentTypeResult.rows || [],
            totalParticipants: parseInt(totalParticipantsResult.rows[0].total_participants, 10) || 0,
            averageCompletionRate: parseFloat(completionRateResult.rows[0].avg_completion_rate || 0),
            averageScore: parseFloat(averageScoreResult.rows[0].average_score || 0),
        };

        res.json({ success: true, dashboardOverview });
    } catch (err) {
        console.error('[getDashboardOverview] Error:', err.message);
        next(err);
    }
};
