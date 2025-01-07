const { body, validationResult } = require('express-validator');

// Validation rules for content creation and update
exports.validateContent = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 255 })
        .withMessage('Title cannot exceed 255 characters'),

    body('type')
        .notEmpty()
        .withMessage('Type is required')
        .isIn(['Quiz', 'Survey', 'DragDrop', 'WordCloud', 'FeedbackWall', 'Flashcards', 'MindMap'])
        .withMessage('Invalid content type'),

    body('description')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Description cannot exceed 5000 characters'),

    body('settings')
        .optional()
        .isJSON()
        .withMessage('Settings must be valid JSON'),

    // Middleware to handle validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
exports.validateElements = [
    body('elements')
        .isArray({ min: 1 })
        .withMessage('Elements must be an array and cannot be empty'),

    body('elements.*.element_type')
        .notEmpty()
        .withMessage('Element type is required')
        .isIn(['Question', 'Option', 'Prompt', 'Feedback'])
        .withMessage('Invalid element type'),

    body('elements.*.data')
        .notEmpty()
        .withMessage('Element data is required')
        .isJSON()
        .withMessage('Element data must be valid JSON'),

    body('elements.*.position')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Position must be a positive integer'),

    // Middleware to handle validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
exports.validateSingleElement = [
    body('data')
        .notEmpty()
        .withMessage('Element data is required')
        .isJSON()
        .withMessage('Element data must be valid JSON'),

    body('position')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Position must be a positive integer'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];