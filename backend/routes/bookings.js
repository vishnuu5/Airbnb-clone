const express = require("express");
const { body } = require("express-validator");
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const bookingValidation = [
  body("listingId").isMongoId().withMessage("Invalid listing ID"),
  body("checkIn").isISO8601().withMessage("Invalid check-in date"),
  body("checkOut").isISO8601().withMessage("Invalid check-out date"),
];

// All routes require authentication
router.use(protect);

// Get all bookings for user
router.get("/", getBookings);

// Create new booking
router.post("/", bookingValidation, createBooking);

// Get single booking
router.get("/:id", getBooking);

// Update booking
router.put("/:id", updateBooking);

// Cancel booking
router.delete("/:id", cancelBooking);

module.exports = router;
