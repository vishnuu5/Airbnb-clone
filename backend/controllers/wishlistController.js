const User = require("../models/User");
const Listing = require("../models/Listing");

// Get all wishlist items for the logged-in user
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json({ success: true, data: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// Add a listing to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ success: false, message: "Listing ID is required" });
    }
    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(listingId)) {
      return res.status(400).json({ success: false, message: "Listing already in wishlist" });
    }
    user.wishlist.push(listingId);
    await user.save();
    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add to wishlist" });
  }
};

// Remove a listing from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== listingId
    );
    await user.save();
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = [];
    await user.save();
    res.json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear wishlist" });
  }
}; 