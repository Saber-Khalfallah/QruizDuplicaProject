const pool = require('../config/db'); // Import your database connection

// Get Content Statistics
exports.getContentStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate if the content exists
        const contentCheckQuery = `SELECT * FROM content WHERE content_id = $1`;
        const contentCheckResult = await pool.query(contentCheckQuery, [id]);

        if (contentCheckResult.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Total participants
        const totalParticipantsQuery = `
            SELECT COUNT(*) AS total_participants
            FROM responses
            WHERE content_id = $1
        `;
        const totalParticipantsResult = await pool.query(totalParticipantsQuery, [id]);

        // Completion rate
        const completionRateQuery = `
            SELECT COUNT(*) AS completed_responses
            FROM responses
            WHERE content_id = $1 AND completed = TRUE
        `;
        const completionRateResult = await pool.query(completionRateQuery, [id]);

        // Average score (for quizzes)
        const averageScoreQuery = `
            SELECT AVG((answer->>'score')::NUMERIC) AS average_score
            FROM response_details
            INNER JOIN responses ON responses.response_id = response_details.response_id
            WHERE responses.content_id = $1
        `;
        const averageScoreResult = await pool.query(averageScoreQuery, [id]);

        // Combine results
        const stats = {
            totalParticipants: parseInt(totalParticipantsResult.rows[0].total_participants, 10) || 0,
            completionRate: totalParticipantsResult.rows[0].total_participants > 0
                ? parseFloat(completionRateResult.rows[0].completed_responses || 0) /
                  parseInt(totalParticipantsResult.rows[0].total_participants, 10)
                : null,
            averageScore: parseFloat(averageScoreResult.rows[0].average_score || 0),
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching content statistics:', err.message);
        next(err);
    }
};

