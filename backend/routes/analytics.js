const express = require("express");
const {
  getDashboardStats,
  getBookingStats,
  getRevenueStats,
  getListingPerformance,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/bookings", getBookingStats);
router.get("/revenue", getRevenueStats);
router.get("/listing/:listingId", getListingPerformance);

module.exports = router;
