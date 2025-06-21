const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const { validationResult } = require("express-validator");

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true }; // Only get active listings
    if (req.query.featured) query.featured = true;
    if (req.query.propertyType) query.propertyType = req.query.propertyType;
    if (req.query.minPrice) query.price = { $gte: req.query.minPrice };
    if (req.query.maxPrice) query.price = { ...query.price, $lte: req.query.maxPrice };
    if (req.query.guests) query.guests = { $gte: req.query.guests };
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      query.amenities = { $all: amenities };
    }

    // Get total count
    const totalItems = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Get listings with aggregated ratings
    const listings = await Listing.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "listing",
          as: "reviews",
        },
      },
      {
        $addFields: {
          rating: {
            average: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
            count: { $size: "$reviews" },
          },
        },
      },
      {
        $project: {
          reviews: 0, // Exclude the full reviews array to keep payload light
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Manually populate host and images after aggregation
    await User.populate(listings, { path: "host", select: "name email avatar" });
    // Since images are not directly on the listing, you may need a separate populate call
    // if you have an 'Image' model and a ref on the listing.
    // Assuming 'images' is an array of objects on the listing schema itself for now.

    // Format coordinates for each listing
    const formattedListings = listings.map(listing => {
      const listingObj = listing; // Already an object from aggregate
      if (listingObj.location && listingObj.location.coordinates) {
        const [lng, lat] = listingObj.location.coordinates.coordinates;
        listingObj.location.lat = lat;
        listingObj.location.lng = lng;
      }
      return listingObj;
    });

    // For featured listings, return just the listings array
    if (req.query.featured) {
      return res.status(200).json({
        success: true,
        data: formattedListings
      });
    }

    // For regular listings, return with pagination
    res.status(200).json({
      success: true,
      data: {
        listings: formattedListings,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit
        }
      }
    });
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting listings",
      error: error.message
    });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "host",
      "name email avatar"
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Manually fetch reviews and calculate rating
    const reviews = await Review.find({ listing: req.params.id }).populate(
      "user",
      "name avatar"
    );
    const rating =
      reviews.length > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0;

    const listingData = listing.toObject();
    listingData.reviews = reviews;
    listingData.rating = {
        average: rating,
        count: reviews.length
    };


    res.status(200).json({
      success: true,
      data: listingData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get host listings
// @route   GET /api/listings/host/listings
// @access  Private
exports.getHostListings = async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.id })
      .populate("images", "url caption")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Get host listings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting host listings",
    });
  }
};

// @desc    Create listing
// @route   POST /api/listings
// @access  Private
exports.createListing = async (req, res) => {
  try {
    // Add host to req.body
    req.body.host = req.user.id;

    // Format coordinates for MongoDB
    if (req.body.location && req.body.location.coordinates) {
      const { lat, lng } = req.body.location;
      req.body.location.coordinates = {
        type: "Point",
        coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
      };
    }

    const listing = await Listing.create(req.body);

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating listing",
      error: error.message
    });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Make sure user is listing host
    if (listing.host.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating listing",
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Make sure user is listing host or admin
    if (listing.host.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    // Automatically cancel any associated bookings before deleting the listing.
    // We consider bookings that are not already completed or cancelled.
    await Booking.updateMany(
      { 
        listing: req.params.id,
        status: { $in: ['pending', 'confirmed'] } 
      },
      { $set: { status: "cancelled" } }
    );

    // Now, delete the listing itself
    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted and associated bookings have been cancelled.",
      data: {},
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting listing",
      error: error.message
    });
  }
};

// @desc    Get listings by host
// @route   GET /api/listings/host/:hostId
// @access  Public
exports.getListingsByHost = async (req, res) => {
  try {
    const listings = await Listing.find({
      host: req.params.hostId,
      isActive: true,
    }).populate("host", "name avatar");

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Get listings by host error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting host listings",
    });
  }
};

// @desc    Get current user's listings
// @route   GET /api/listings/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.id })
      .populate("images", "url caption")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting listings",
    });
  }
};
