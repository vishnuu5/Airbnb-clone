const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const wishlistController = require("../controllers/wishlistController");

// Get all wishlist items
router.get("/", protect, wishlistController.getWishlist);
// Add to wishlist
router.post("/", protect, wishlistController.addToWishlist);
// Remove from wishlist
router.delete("/:listingId", protect, wishlistController.removeFromWishlist);
// Clear wishlist
router.delete("/", protect, wishlistController.clearWishlist);

module.exports = router; 