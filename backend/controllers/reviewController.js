const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { validationResult } = require("express-validator");

// @desc    Get reviews for a listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
exports.getListingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name avatar")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out reviews where the user has been deleted
    const filteredReviews = reviews.filter(review => review.user);

    const total = await Review.countDocuments({
      listing: req.params.listingId,
    });

    res.status(200).json({
      success: true,
      count: filteredReviews.length,
      total,
      data: filteredReviews,
    });
  } catch (error) {
    console.error("Get listing reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting reviews",
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { bookingId, title, comment, categories } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.guest.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to review this booking",
      });
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    const review = await Review.create({
      listing: booking.listing._id,
      user: req.user.id,
      booking: bookingId,
      title,
      comment,
      categories,
    });

    // Update listing average rating
    await updateListingRating(booking.listing._id);

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name avatar"
    );

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating review",
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Make sure user owns review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name avatar");

    // Update listing average rating
    await updateListingRating(review.listing);

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating review",
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Make sure user owns review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await review.deleteOne();

    // Update listing average rating
    await updateListingRating(review.listing);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting review",
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("listing", "title images location")
      .populate("booking", "checkIn checkOut")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting reviews",
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const isAlreadyHelpful = review.helpful.includes(req.user.id);

    if (isAlreadyHelpful) {
      // Remove from helpful
      review.helpful = review.helpful.filter(
        (userId) => userId.toString() !== req.user.id
      );
    } else {
      // Add to helpful
      review.helpful.push(req.user.id);
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: {
        helpful: review.helpful.length,
        isHelpful: !isAlreadyHelpful,
      },
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating review",
    });
  }
};

// Helper function to update listing average rating
const updateListingRating = async (listingId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { listing: listingId },
      },
      {
        $group: {
          _id: "$listing",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          averageCleanliness: { $avg: "$categories.cleanliness" },
          averageAccuracy: { $avg: "$categories.accuracy" },
          averageCheckIn: { $avg: "$categories.checkIn" },
          averageCommunication: { $avg: "$categories.communication" },
          averageLocation: { $avg: "$categories.location" },
          averageValue: { $avg: "$categories.value" },
        },
      },
    ]);

    if (stats.length > 0) {
      await Listing.findByIdAndUpdate(listingId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].totalReviews,
        ratingBreakdown: {
          cleanliness: Math.round(stats[0].averageCleanliness * 10) / 10,
          accuracy: Math.round(stats[0].averageAccuracy * 10) / 10,
          checkIn: Math.round(stats[0].averageCheckIn * 10) / 10,
          communication: Math.round(stats[0].averageCommunication * 10) / 10,
          location: Math.round(stats[0].averageLocation * 10) / 10,
          value: Math.round(stats[0].averageValue * 10) / 10,
        },
      });
    } else {
      await Listing.findByIdAndUpdate(listingId, {
        rating: 0,
        reviewCount: 0,
        ratingBreakdown: {
          cleanliness: 0,
          accuracy: 0,
          checkIn: 0,
          communication: 0,
          location: 0,
          value: 0,
        },
      });
    }
  } catch (error) {
    console.error("Update listing rating error:", error);
  }
};
