"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { listingsAPI, bookingsAPI, usersAPI, adminBookingsAPI } from "../../services/api"
import api from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Home, Calendar, DollarSign, Users, Eye, Check, X } from "lucide-react"
import toast from "react-hot-toast"

const AdminDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalListings: 0,
        totalUsers: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
    })
    const [recentBookings, setRecentBookings] = useState([])
    const [recentUsers, setRecentUsers] = useState([])

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        if (!user) return;
        
        try {
            // Use admin API endpoints
            const [dashboardStatsResponse, adminUsersResponse, adminBookingsResponse] = await Promise.all([
                api.get("/admin/dashboard"),
                api.get("/admin/users"),
                api.get("/admin/bookings"),
            ])

            console.log('Admin API Responses:', {
                dashboardStats: dashboardStatsResponse.data,
                adminUsers: adminUsersResponse.data,
                adminBookings: adminBookingsResponse.data
            });

            // Extract data from admin responses
            const dashboardStats = dashboardStatsResponse.data.data || {};
            const users = adminUsersResponse.data.data || [];
            const bookings = adminBookingsResponse.data.data || [];

            // Use dashboard stats for main stats
            setStats({
                totalListings: dashboardStats.totalListings || 0,
                totalUsers: dashboardStats.totalUsers || 0,
                pendingBookings: bookings.filter(booking => booking.status === "pending").length,
                confirmedBookings: bookings.filter(booking => booking.status === "confirmed").length,
                completedBookings: bookings.filter(booking => booking.status === "completed").length,
                cancelledBookings: bookings.filter(booking => booking.status === "cancelled").length,
                totalRevenue: dashboardStats.totalRevenue || 0,
            })

            // Use recent data from dashboard stats or fallback to full data
            const recentBookings = dashboardStats.recentBookings || bookings.slice(0, 5);
            const recentUsers = dashboardStats.recentUsers || users.slice(0, 5);

            setRecentBookings(recentBookings)
            setRecentUsers(recentUsers)
            
            // Debug logging
            console.log('Recent bookings with listings:', recentBookings);
            console.log('Recent users:', recentUsers);
            
            // Additional debugging for booking structure
            if (recentBookings.length > 0) {
                console.log('First booking structure:', {
                    booking: recentBookings[0],
                    listing: recentBookings[0].listing,
                    images: recentBookings[0].listing?.images,
                    host: recentBookings[0].host,
                    guest: recentBookings[0].guest
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBookingStatus = async (bookingId, status) => {
        try {
            await adminBookingsAPI.updateBooking(bookingId, { status })
            toast.success(`Booking ${status} successfully`)
            fetchDashboardData() // Refresh data
        } catch (error) {
            console.error("Error updating booking:", error)
            toast.error("Failed to update booking")
        }
    }

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "/placeholder.svg?height=120&width=120";
        
        if (typeof imageUrl === 'string') {
            if (imageUrl.startsWith('http')) {
                return imageUrl;
            } else if (imageUrl.startsWith('/uploads')) {
                return `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${imageUrl}`;
            } else {
                return imageUrl;
            }
        }
        
        if (imageUrl && typeof imageUrl === 'object' && imageUrl.url) {
            return getImageUrl(imageUrl.url);
        }
        
        return "/placeholder.svg?height=120&width=120";
    };

    const getLocationText = (location) => {
        if (!location) return 'Location not specified';
        
        if (typeof location === 'string') {
            return location;
        }
        
        if (typeof location === 'object') {
            if (location.city && location.state) {
                return `${location.city}, ${location.state}`;
            } else if (location.address) {
                return location.address;
            } else if (location.city) {
                return location.city;
            } else if (location.state) {
                return location.state;
            }
        }
        
        return 'Location not specified';
    };

    const handleViewUser = (userId) => {
        console.log("handleViewUser called with userId:", userId);
        console.log("userId type:", typeof userId);
        
        if (!userId) {
            console.error("No user ID provided to handleViewUser");
            toast.error("Invalid user ID");
            return;
        }
        
        console.log("Navigating to user details page with ID:", userId);
        navigate(`/admin/users/${userId}`);
    };

    const handleViewBooking = (bookingId) => {
        console.log("handleViewBooking called with bookingId:", bookingId);
        console.log("bookingId type:", typeof bookingId);
        
        if (!bookingId) {
            console.error("No booking ID provided to handleViewBooking");
            toast.error("Invalid booking ID");
            return;
        }
        
        console.log("Navigating to booking details page with ID:", bookingId);
        navigate(`/admin/bookings/${bookingId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage the entire platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Confirmed Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                                <Link
                                    to="/admin/users"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {recentUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {recentUsers.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4 min-w-0 flex-1">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {user.avatar ? (
                                                        <img
                                                            src={getImageUrl(user.avatar)}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `
                                                                    <div class="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-semibold text-xl">
                                                                        ${user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                `;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-semibold text-xl">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                                    <p className="text-xs text-gray-500">Role: {user.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewUser(user._id)}
                                                className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">No users found</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                                <Link
                                    to="/admin/bookings"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {recentBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {recentBookings.map((booking) => (
                                        <div key={booking._id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        {booking.listing?.images?.[0] ? (
                                                        <img
                                                                src={getImageUrl(booking.listing.images[0]?.url || booking.listing.images[0])}
                                                                alt={booking.listing?.title || 'Listing image'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = `
                                                                        <div class='w-full h-full flex items-center justify-center bg-gray-200 text-gray-500'>
                                                                            <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'></path>
                                                                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z'></path>
                                                                            </svg>
                                                                        </div>
                                                                    `;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"></path>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{booking.listing?.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                        </p>
                                                        {booking.listing?.location && (
                                                            <p className="text-xs text-gray-500">
                                                                {getLocationText(booking.listing.location)}
                                                            </p>
                                                        )}
                                                        {booking.host && (
                                                            <p className="text-xs text-gray-500">Host: {booking.host.name}</p>
                                                        )}
                                                        {booking.guest && (
                                                            <p className="text-xs text-gray-500">Guest: {booking.guest.name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewBooking(booking._id)}
                                                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {booking.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                                                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                                                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className={`px-2 py-1 rounded-full ${
                                                    booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                    booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                                    booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                                <span className="font-medium">${booking.totalPrice}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">No bookings found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard 