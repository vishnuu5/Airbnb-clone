const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAllBookings,
  getBookingDetails,
  updateBooking,
  deleteBooking,
} = require("../controllers/adminController");

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize("admin"));

// Dashboard routes
router.get("/dashboard", getDashboardStats);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Booking management routes
router.get("/bookings", getAllBookings);
router.get("/bookings/:id", getBookingDetails);
router.put("/bookings/:id", updateBooking);
router.delete("/bookings/:id", deleteBooking);

module.exports = router; 