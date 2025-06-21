const express = require("express");
const { body } = require("express-validator");
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getListingsByHost,
  getMyListings,
} = require("../controllers/listingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const listingValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),
  body("price")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Price must be a positive number"),
];

// Get all listings
router.get("/", getListings);

// Get my listings
router.get("/my-listings", protect, getMyListings);

// Create new listing
router.post(
  "/",
  protect,
  authorize("host", "admin"),
  listingValidation,
  createListing
);

// Get listings by host - MUST come before /:id route
router.get("/host/:hostId", getListingsByHost);

// Get single listing
router.get("/:id", getListing);

// Update listing
router.put("/:id", protect, authorize("host", "admin"), updateListing);

// Delete listing
router.delete("/:id", protect, authorize("host", "admin"), deleteListing);

module.exports = router;
