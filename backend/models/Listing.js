const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Please provide an address"],
      },
      city: {
        type: String,
        required: [true, "Please provide a city"],
      },
      state: {
        type: String,
        required: [true, "Please provide a state"],
      },
      country: {
        type: String,
        required: [true, "Please provide a country"],
      },
      zipCode: {
        type: String,
      },
      // GeoJSON Point for MongoDB geospatial queries
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
          index: "2dsphere",
        },
      },
      // Keep lat/lng for easier frontend usage
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    propertyType: {
      type: String,
      required: [true, "Please specify property type"],
      enum: ["apartment", "house", "condo", "villa", "cabin", "other"],
    },
    roomType: {
      type: String,
      required: [true, "Please specify room type"],
      enum: ["entire-place", "private-room", "shared-room"],
    },
    guests: {
      type: Number,
      required: [true, "Please specify maximum guests"],
      min: [1, "Must accommodate at least 1 guest"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Please specify number of bedrooms"],
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Please specify number of bathrooms"],
      min: [0, "Bathrooms cannot be negative"],
    },
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "kitchen",
          "parking",
          "pool",
          "gym",
          "spa",
          "balcony",
          "garden",
          "fireplace",
          "tv",
          "washer",
          "dryer",
          "ac",
          "heating",
          "workspace",
          "breakfast",
          "pets-allowed",
          "smoking-allowed",
        ],
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          default: "",
        },
      },
    ],
    host: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    availability: {
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
      blockedDates: [
        {
          type: Date,
        },
      ],
    },
    rules: {
      checkIn: {
        type: String,
        default: "15:00",
      },
      checkOut: {
        type: String,
        default: "11:00",
      },
      minStay: {
        type: Number,
        default: 1,
      },
      maxStay: {
        type: Number,
        default: 30,
      },
      additionalRules: [
        {
          type: String,
        },
      ],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot be more than 5"],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Review",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
listingSchema.index({ "location.coordinates": "2dsphere" });
listingSchema.index({ price: 1 });
listingSchema.index({ "rating.average": -1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ host: 1 });

// Pre-save middleware to ensure coordinates are in correct format
listingSchema.pre("save", function (next) {
  if (this.location && this.location.lat && this.location.lng) {
    // Set GeoJSON coordinates [longitude, latitude]
    this.location.coordinates = {
      type: "Point",
      coordinates: [this.location.lng, this.location.lat],
    };
  }
  next();
});

module.exports = mongoose.model("Listing", listingSchema);
