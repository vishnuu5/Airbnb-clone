const express = require("express");
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Get all bookings (admin only)
router.get("/all", protect, getAllBookings);

// Get bookings for current user
router.get("/", protect, getBookings);

// Get single booking
router.get("/:id", protect, getBooking);

// Create booking
router.post("/", protect, createBooking);

// Update booking
router.put("/:id", protect, updateBooking);

// Cancel booking
router.delete("/:id", protect, cancelBooking);

module.exports = router; 