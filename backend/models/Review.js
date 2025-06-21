const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.ObjectId,
      ref: "Listing",
      required: [true, "Review must belong to a listing"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must have a user"],
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "Review must be associated with a booking"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    title: {
      type: String,
      required: [true, "Please provide a review title"],
      maxlength: [100, "Review title cannot be more than 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a review comment"],
      maxlength: [1000, "Review comment cannot be more than 1000 characters"],
    },
    categories: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      accuracy: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      checkIn: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      location: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    helpful: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    response: {
      comment: {
        type: String,
        maxlength: [500, "Response cannot be more than 500 characters"],
      },
      respondedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Calculate average rating from categories
reviewSchema.pre("save", function (next) {
  const categories = this.categories;
  const total =
    categories.cleanliness +
    categories.accuracy +
    categories.checkIn +
    categories.communication +
    categories.location +
    categories.value;
  this.rating = Math.round((total / 6) * 10) / 10; // Round to 1 decimal place
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
