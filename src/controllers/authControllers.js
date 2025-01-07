const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { updateResetToken, getUserByEmail, getUserByResetToken, resetUserPassword } = require('../models/authModel');

const { registerUser, loginUser } = require('../models/authModel'); // Import authModel
const { body, validationResult } = require('express-validator');

// User Registration Controller
exports.registerUser = [
    // Input validation using express-validator
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation error');
            error.status = 400;
            error.details = errors.array();
            return next(error);
        }

        const { username, email, password } = req.body;

        try {
            // Call the model to register the user
            const user = await registerUser(username, email, password);

            // Exclude sensitive fields from the response
            const { password_hash, ...safeUserData } = user;

            res.status(201).json({
                message: 'User registered successfully',
                user: safeUserData,
            });
        } catch (err) {
            next(err); // Pass the error to the global error handler
        }
    },
];

// User Login Controller
exports.loginUser = [
    // Input validation using express-validator
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation error');
            error.status = 400;
            error.details = errors.array();
            return next(error);
        }

        const { email, password } = req.body;

        try {
            // Call the model to fetch user data
            const user = await loginUser(email);

            if (!user) {
                const error = new Error('Invalid credentials');
                error.status = 400;
                throw error;
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                const error = new Error('Invalid credentials');
                error.status = 400;
                throw error;
            }

            // Generate a JWT token
            const token = jwt.sign(
                { id: user.user_id, role: user.role }, // Add role if available
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '1h' }
            );

            res.json({ message: 'Login successful', token });
        } catch (err) {
            next(err); // Pass the error to the global error handler
        }
    },
];
// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
      const { email } = req.body;

      // Check if user exists
      const user = await getUserByEmail(email);
      if (!user) {
          const error = new Error('User not found');
          error.status = 404;
          throw error;
      }

      // Generate reset token and expiration
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // Save the token in the database
      await updateResetToken(user.user_id, resetToken, resetPasswordExpires);

      // Send email with the reset link
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      await sendEmail(
          email,
          'Password Reset Request',
          `You requested a password reset. Click the link to reset your password: ${resetUrl}`
      );

      res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
      next(err); // Pass error to global error handler
  }
};
// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
      const { token, newPassword } = req.body;

      // Validate token and expiration
      const user = await getUserByResetToken(token);
      if (!user || user.reset_password_expires < new Date()) {
          const error = new Error('Token is invalid or has expired');
          error.status = 400;
          throw error;
      }

      // Hash new password
        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Save new password and clear reset token
      await resetUserPassword(user.user_id, hashedPassword);

      res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
      next(err); // Pass error to global error handler
  }
};


