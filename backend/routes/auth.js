const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyRegistrationOTP,
  resendOTP,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { authValidation } = require("../validations/authValidation");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["guest", "host", "admin"])
    .withMessage("Role must be either guest, host, or admin"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes - Simple and clean for Express 5.x
router.post("/register", validateRequest(authValidation.register), register);
router.post("/login", validateRequest(authValidation.login), login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Forgot Password
router.post("/forgot-password", validateRequest(authValidation.forgotPassword), forgotPassword);

// Verify OTP
router.post("/verify-otp", validateRequest(authValidation.verifyOTP), verifyOTP);

// Reset Password
router.post("/reset-password", validateRequest(authValidation.resetPassword), resetPassword);

// Verify Registration OTP
router.post("/verify-registration", validateRequest(authValidation.verifyOTP), verifyRegistrationOTP);

// Resend OTP
router.post("/resend-otp", validateRequest(authValidation.resendOTP), resendOTP);

module.exports = router;
