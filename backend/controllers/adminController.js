const User = require("../models/User");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5),
      Booking.find()
        .populate({
          path: "listing",
          select: "title images location price host",
          populate: [
            {
              path: "images",
              select: "url caption"
            },
            {
              path: "host",
              select: "name email"
            }
          ]
        })
        .populate("guest", "name email avatar")
        .populate("host", "name email avatar")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const stats = {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentUsers: recentUsers.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar
      })),
      recentBookings, // Send the fully populated bookings
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting dashboard stats",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user details",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        select: "title images location price host",
        populate: [
          {
            path: "images",
            select: "url caption"
          },
          {
            path: "host",
            select: "name email"
          }
        ]
      })
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting bookings",
      error: error.message,
    });
  }
};

// @desc    Get booking details
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "listing",
        select: "title images location price host",
        populate: [
          {
            path: "images",
            select: "url caption"
          },
          {
            path: "host",
            select: "name email"
          }
        ]
      })
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar");
      
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting booking details",
      error: error.message,
    });
  }
};

// @desc    Update booking
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "listing",
        select: "title images location price host",
        populate: [
          {
            path: "images",
            select: "url caption"
          },
          {
            path: "host",
            select: "name email"
          }
        ]
      })
      .populate("guest", "name email avatar")
      .populate("host", "name email avatar");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
}; 