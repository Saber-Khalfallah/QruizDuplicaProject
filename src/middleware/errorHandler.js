// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        details: err.details || null,
    });
};

module.exports = errorHandler;
