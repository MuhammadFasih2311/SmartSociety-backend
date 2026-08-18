import express from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();


const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),

  body('flatNumber')
    .trim()
    .notEmpty()
    .withMessage('Flat / House number is required'),

  body('blockName')
    .trim()
    .notEmpty()
    .withMessage('Block name is required'),

  body('occupancyType')
    .optional()
    .isIn(['owner', 'tenant', 'rental'])
    .withMessage('Invalid occupancy type'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender')
];


const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];


router.post(
  '/register',
  registerValidation,
  register
);

router.post(
  '/login',
  loginValidation,
  login
);

router.post(
  '/forgot-password',
  forgotPassword
);

router.post(
  '/reset-password',
  resetPassword
);

router.get(
  '/me',
  authMiddleware,
  getMe
);

router.post(
  '/logout',
  authMiddleware,
  logout
);

export default router;