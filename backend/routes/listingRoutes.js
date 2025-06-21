const express = require("express");
const router = express.Router();
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getListingsByHost,
  getMyListings,
} = require("../controllers/listingController");
const { protect } = require("../middleware/authMiddleware");

// Get all listings
router.get("/", getListings);

// Get my listings
router.get("/my-listings", protect, getMyListings);

// Get host listings
router.get("/host/:hostId", getListingsByHost);

// Get single listing
router.get("/:id", getListing);

// Create listing
router.post("/", protect, createListing);

// Update listing
router.put("/:id", protect, updateListing);

// Delete listing
router.delete("/:id", protect, deleteListing);

module.exports = router; 