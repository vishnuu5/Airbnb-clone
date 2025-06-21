const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Review = require("../models/Review");

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === "host") {
      // Host dashboard stats
      const listings = await Listing.find({ host: userId });
      const listingIds = listings.map((listing) => listing._id);

      const [
        totalListings,
        totalBookings,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        averageRating,
        totalReviews,
      ] = await Promise.all([
        Listing.countDocuments({ host: userId }),
        Booking.countDocuments({ host: userId }),
        Booking.aggregate([
          { $match: { host: userId, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Booking.countDocuments({ host: userId, status: "pending" }),
        Booking.countDocuments({ host: userId, status: "confirmed" }),
        Booking.countDocuments({ host: userId, status: "completed" }),
        Booking.countDocuments({ host: userId, status: "cancelled" }),
        Review.aggregate([
          { $match: { listing: { $in: listingIds } } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
        Review.countDocuments({ listing: { $in: listingIds } }),
      ]);

      // Recent bookings
      const recentBookings = await Booking.find({ host: userId })
        .populate("listing", "title images")
        .populate("guest", "name email")
        .sort("-createdAt")
        .limit(5);

      // Monthly revenue (last 12 months)
      const monthlyRevenue = await Booking.aggregate([
        {
          $match: {
            host: userId,
            paymentStatus: "paid",
            createdAt: {
              $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      stats = {
        totalListings,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        averageRating: averageRating[0]?.avgRating || 0,
        totalReviews,
        recentBookings,
        monthlyRevenue,
      };
    } else {
      // Guest dashboard stats
      const [
        totalBookings,
        totalSpent,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalReviews,
        favoriteListings,
      ] = await Promise.all([
        Booking.countDocuments({ guest: userId }),
        Booking.aggregate([
          { $match: { guest: userId, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Booking.countDocuments({ guest: userId, status: "pending" }),
        Booking.countDocuments({ guest: userId, status: "confirmed" }),
        Booking.countDocuments({ guest: userId, status: "completed" }),
        Booking.countDocuments({ guest: userId, status: "cancelled" }),
        Review.countDocuments({ user: userId }),
        User.findById(userId).select("favorites"),
      ]);

      // Recent bookings
      const recentBookings = await Booking.find({ guest: userId })
        .populate("listing", "title images location")
        .populate("host", "name email")
        .sort("-createdAt")
        .limit(5);

      stats = {
        totalBookings,
        totalSpent: totalSpent[0]?.total || 0,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalReviews,
        favoriteListings: favoriteListings?.favorites?.length || 0,
        recentBookings,
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting dashboard statistics",
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/analytics/bookings
// @access  Private
exports.getBookingStats = async (req, res) => {
  try {
    const { period = "month", listingId } = req.query;
    const userId = req.user.id;

    const matchCondition = {};
    if (req.user.role === "host") {
      matchCondition.host = userId;
    } else {
      matchCondition.guest = userId;
    }

    if (listingId) {
      matchCondition.listing = listingId;
    }

    // Date range based on period
    const dateRange = new Date();
    switch (period) {
      case "week":
        dateRange.setDate(dateRange.getDate() - 7);
        break;
      case "month":
        dateRange.setMonth(dateRange.getMonth() - 1);
        break;
      case "year":
        dateRange.setFullYear(dateRange.getFullYear() - 1);
        break;
      default:
        dateRange.setMonth(dateRange.getMonth() - 1);
    }

    matchCondition.createdAt = { $gte: dateRange };

    const bookingStats = await Booking.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0],
            },
          },
        },
      },
    ]);

    // Booking trends over time
    const bookingTrends = await Booking.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: period === "week" ? { $dayOfMonth: "$createdAt" } : null,
          },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingStats,
        bookingTrends,
      },
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting booking statistics",
    });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/analytics/revenue
// @access  Private
exports.getRevenueStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const userId = req.user.id;

    if (req.user.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts can access revenue statistics",
      });
    }

    const dateRange = new Date();
    switch (period) {
      case "week":
        dateRange.setDate(dateRange.getDate() - 7);
        break;
      case "month":
        dateRange.setMonth(dateRange.getMonth() - 1);
        break;
      case "year":
        dateRange.setFullYear(dateRange.getFullYear() - 1);
        break;
      default:
        dateRange.setMonth(dateRange.getMonth() - 1);
    }

    const revenueStats = await Booking.aggregate([
      {
        $match: {
          host: userId,
          paymentStatus: "paid",
          createdAt: { $gte: dateRange },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: "$totalPrice" },
          totalServiceFees: { $sum: "$priceBreakdown.serviceFee" },
          totalCleaningFees: { $sum: "$priceBreakdown.cleaningFee" },
          totalTaxes: { $sum: "$priceBreakdown.taxes" },
        },
      },
    ]);

    // Revenue by listing
    const revenueByListing = await Booking.aggregate([
      {
        $match: {
          host: userId,
          paymentStatus: "paid",
          createdAt: { $gte: dateRange },
        },
      },
      {
        $group: {
          _id: "$listing",
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "listings",
          localField: "_id",
          foreignField: "_id",
          as: "listing",
        },
      },
      { $unwind: "$listing" },
      {
        $project: {
          title: "$listing.title",
          revenue: 1,
          bookings: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: revenueStats[0] || {
          totalRevenue: 0,
          totalBookings: 0,
          averageBookingValue: 0,
          totalServiceFees: 0,
          totalCleaningFees: 0,
          totalTaxes: 0,
        },
        revenueByListing,
      },
    });
  } catch (error) {
    console.error("Get revenue stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting revenue statistics",
    });
  }
};

// @desc    Get listing performance
// @route   GET /api/analytics/listing/:listingId
// @access  Private
exports.getListingPerformance = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Verify listing ownership
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.host.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this listing's performance",
      });
    }

    const [
      bookingStats,
      revenueStats,
      reviewStats,
      occupancyRate,
      monthlyPerformance,
    ] = await Promise.all([
      // Booking statistics
      Booking.aggregate([
        { $match: { listing: listing._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue statistics
      Booking.aggregate([
        { $match: { listing: listing._id, paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            averageNightlyRate: {
              $avg: {
                $divide: [
                  "$priceBreakdown.basePrice",
                  "$priceBreakdown.nights",
                ],
              },
            },
            totalNights: { $sum: "$priceBreakdown.nights" },
          },
        },
      ]),

      // Review statistics
      Review.aggregate([
        { $match: { listing: listing._id } },
        {
          $group: {
            _id: null,
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
      ]),

      // Occupancy rate (last 12 months)
      Booking.aggregate([
        {
          $match: {
            listing: listing._id,
            status: { $in: ["confirmed", "completed"] },
            checkIn: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: null,
            totalNights: { $sum: "$priceBreakdown.nights" },
          },
        },
      ]),

      // Monthly performance (last 12 months)
      Booking.aggregate([
        {
          $match: {
            listing: listing._id,
            createdAt: {
              $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0],
              },
            },
            nights: { $sum: "$priceBreakdown.nights" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Calculate occupancy rate (assuming 365 days available per year)
    const totalNightsBooked = occupancyRate[0]?.totalNights || 0;
    const occupancyPercentage = Math.round((totalNightsBooked / 365) * 100);

    res.status(200).json({
      success: true,
      data: {
        listing: {
          id: listing._id,
          title: listing.title,
          price: listing.price,
        },
        bookingStats,
        revenueStats: revenueStats[0] || {
          totalRevenue: 0,
          averageNightlyRate: 0,
          totalNights: 0,
        },
        reviewStats: reviewStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          averageCleanliness: 0,
          averageAccuracy: 0,
          averageCheckIn: 0,
          averageCommunication: 0,
          averageLocation: 0,
          averageValue: 0,
        },
        occupancyRate: occupancyPercentage,
        monthlyPerformance,
      },
    });
  } catch (error) {
    console.error("Get listing performance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting listing performance",
    });
  }
};
