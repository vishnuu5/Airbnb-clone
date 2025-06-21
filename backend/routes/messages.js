const express = require("express");
const { protect } = require("../middleware/auth");
const messagesController = require("../controllers/messagesController");
const router = express.Router();

// Test route to verify messages router is working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Messages router is working" });
});

// Test route for debugging user conversations
router.get("/test-conversations", protect, messagesController.testUserConversations);

// Test available users route without auth (temporary for debugging)
router.get("/available-users-test", (req, res) => {
  res.json({ success: true, message: "Available users route is accessible", data: [] });
});

// Get available users for starting conversations (must come before /conversations/:id)
router.get("/available-users", protect, messagesController.getAvailableUsers);

// Start or get a conversation between two users
router.post("/start", protect, messagesController.startConversation);

// Get all conversations for the logged-in user
router.get("/conversations", protect, messagesController.getConversations);

// Get messages for a conversation
router.get("/conversations/:conversationId", protect, messagesController.getMessages);

// Send a message
router.post("/", protect, messagesController.sendMessage);

// Mark conversation as read
router.put("/conversations/:conversationId/read", protect, messagesController.markAsRead);

module.exports = router; 