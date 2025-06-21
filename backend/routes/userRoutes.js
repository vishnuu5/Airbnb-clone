const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

// Get all users (admin only)
router.get("/", protect, authorize("admin"), userController.getAllUsers);

// Get user by ID (admin only)
router.get("/:id", protect, authorize("admin"), userController.getUserById);

module.exports = router; 