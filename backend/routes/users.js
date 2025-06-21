const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

// Get all users (admin only)
router.get("/", protect, authorize("admin"), userController.getAllUsers);

// Get single user by ID (admin only)
router.get("/:id", protect, authorize("admin"), userController.getUserById);

module.exports = router;
