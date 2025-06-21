const express = require("express");
const { body } = require("express-validator");
const {
  getListingReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  markHelpful,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const reviewValidation = [
  body("bookingId").isMongoId().withMessage("Invalid booking ID"),
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("comment")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
  body("categories.cleanliness")
    .isInt({ min: 1, max: 5 })
    .withMessage("Cleanliness rating must be between 1 and 5"),
  body("categories.accuracy")
    .isInt({ min: 1, max: 5 })
    .withMessage("Accuracy rating must be between 1 and 5"),
  body("categories.checkIn")
    .isInt({ min: 1, max: 5 })
    .withMessage("Check-in rating must be between 1 and 5"),
  body("categories.communication")
    .isInt({ min: 1, max: 5 })
    .withMessage("Communication rating must be between 1 and 5"),
  body("categories.location")
    .isInt({ min: 1, max: 5 })
    .withMessage("Location rating must be between 1 and 5"),
  body("categories.value")
    .isInt({ min: 1, max: 5 })
    .withMessage("Value rating must be between 1 and 5"),
];

// Public routes
router.get("/listing/:listingId", getListingReviews);

// Protected routes
router.use(protect);

router.route("/").post(reviewValidation, createReview);
router.get("/my-reviews", getMyReviews);
router.route("/:id").put(updateReview).delete(deleteReview);
router.post("/:id/helpful", markHelpful);

module.exports = router;
