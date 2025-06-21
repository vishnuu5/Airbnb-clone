const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query;

    if (req.user.role === "host") {
      // First find all listings owned by the host
      const hostListings = await Listing.find({ host: req.user.id }).select('_id');
      console.log('Host listings:', hostListings); // Debug log
      
      if (!hostListings || hostListings.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0
        });
      }

      const listingIds = hostListings.map(listing => listing._id);
      console.log('Listing IDs:', listingIds); // Debug log
      
      // Then find all bookings for those listings
      query = Booking.find({ listing: { $in: listingIds } });
    } else if (req.user.role === "admin") {
      // Admin can see all bookings
      query = Booking.find({});
    } else {
      // Get bookings made by guest
      query = Booking.find({ guest: req.user.id });
    }

    const bookings = await query
      .populate({
        path: "listing",
        populate: {
          path: "images",
          select: "url caption"
        }
      })
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 });

    // Filter out bookings with invalid references
    const validBookings = bookings.filter(booking => booking.guest && booking.host);

    console.log('Found bookings:', validBookings.length); // Debug log

    res.status(200).json({
      success: true,
      data: validBookings,
      count: validBookings.length
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting bookings",
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "listing",
        select: "title images location price host",
        populate: {
          path: "host",
          select: "name email avatar"
        }
      })
      .populate("guest", "name email avatar phone")
      .populate("host", "name email avatar phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if the booking has valid guest and host references
    if (!booking.guest || !booking.host) {
      return res.status(200).json({
        success: false,
        message: "This booking has invalid references and cannot be displayed",
        data: null
      });
    }

    // Make sure user is booking owner or host
    const isGuest = booking.guest && booking.guest._id && booking.guest._id.toString() === req.user.id;
    const isHost = booking.host && booking.host._id && booking.host._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isGuest && !isHost && !isAdmin) {
      console.error("Booking access denied:", {
        userId: req.user.id,
        userRole: req.user.role,
        bookingGuest: booking.guest?._id,
        bookingHost: booking.host?._id
      });
      return res.status(401).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting booking",
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { listingId, checkIn, checkOut, guests, guestInfo, specialRequests } =
      req.body;

    // Get listing
    const listing = await Listing.findById(listingId).populate("host");
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check if user is trying to book their own listing
    if (listing.host._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own listing",
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Check availability (simplified - in production, you'd want more robust checking)
    const existingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Listing is not available for selected dates",
      });
    }

    // Calculate total guests
    const totalGuests = guests.adults + guests.children + guests.infants;
    if (totalGuests > listing.guests) {
      return res.status(400).json({
        success: false,
        message: `Listing can accommodate maximum ${listing.guests} guests`,
      });
    }

    // Calculate pricing
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const basePrice = listing.price * nights;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    const cleaningFee = 50; // Fixed cleaning fee
    const taxes = Math.round((basePrice + serviceFee + cleaningFee) * 0.08); // 8% tax
    const totalPrice = basePrice + serviceFee + cleaningFee + taxes;

    // Create booking
    const booking = await Booking.create({
      listing: listingId,
      guest: req.user.id,
      host: listing.host._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      priceBreakdown: {
        basePrice,
        nights,
        serviceFee,
        cleaningFee,
        taxes,
      },
      guestInfo,
      specialRequests,
      status: "confirmed",
      paymentStatus: "pending",
    });

    // Add booking to user's bookings array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { bookings: booking._id },
    });

    // Populate booking data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("listing", "title images location")
      .populate("host", "name email");

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating booking",
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only host can confirm/reject bookings, guest can cancel
    if (req.body.status === "confirmed" || req.body.status === "cancelled") {
      if (
        booking.host.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(401).json({
          success: false,
          message: "Not authorized to update this booking",
        });
      }
    }

    // Guest can cancel their own booking
    if (
      req.body.status === "cancelled" &&
      booking.guest.toString() === req.user.id
    ) {
      // Allow guest to cancel
    } else if (
      booking.guest.toString() !== req.user.id &&
      booking.host.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("listing", "title images location")
      .populate("guest", "name email")
      .populate("host", "name email");

    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating booking",
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only guest or host can cancel booking
    if (
      booking.guest.toString() !== req.user.id &&
      booking.host.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    booking.cancellation = {
      cancelledBy: req.user.id,
      cancelledAt: new Date(),
      reason: req.body.reason || "No reason provided",
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error cancelling booking",
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access all bookings",
      });
    }

    const bookings = await Booking.find()
      .populate({
        path: "listing",
        select: "title images location price",
        populate: {
          path: "images",
          select: "url caption"
        }
      })
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting all bookings",
    });
  }
};
