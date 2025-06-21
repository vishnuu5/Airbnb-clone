"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { bookingsAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Calendar, DollarSign, Eye, X } from "lucide-react"
import toast from "react-hot-toast"

const GuestDashboard = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0,
    })
    const [recentBookings, setRecentBookings] = useState([])

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        if (!user) return;
        
        try {
            const bookingsResponse = await bookingsAPI.getBookings()
            const bookings = bookingsResponse.data.data || []

            // Calculate stats
            const totalSpent = bookings
                .filter((booking) => booking.status === "completed")
                .reduce((sum, booking) => sum + booking.totalPrice, 0)

            const pendingBookings = bookings.filter(booking => booking.status === "pending")
            const confirmedBookings = bookings.filter(booking => booking.status === "confirmed")
            const completedBookings = bookings.filter(booking => booking.status === "completed")
            const cancelledBookings = bookings.filter(booking => booking.status === "cancelled")

            setStats({
                pendingBookings: pendingBookings.length,
                confirmedBookings: confirmedBookings.length,
                completedBookings: completedBookings.length,
                cancelledBookings: cancelledBookings.length,
                totalSpent,
            })

            // Sort bookings to show pending first, then by date
            const sortedBookings = [...bookings].sort((a, b) => {
                if (a.status === "pending" && b.status !== "pending") return -1;
                if (a.status !== "pending" && b.status === "pending") return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setRecentBookings(sortedBookings.slice(0, 5))
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBookingStatus = async (bookingId, status) => {
        try {
            await bookingsAPI.updateBooking(bookingId, { status })
            toast.success(`Booking ${status} successfully`)
            fetchDashboardData() // Refresh data
        } catch (error) {
            console.error("Error updating booking:", error)
            toast.error("Failed to update booking")
        }
    }

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "/placeholder.svg?height=60&width=60";
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `${import.meta.env.VITE_API_URL}${imageUrl}`;
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
                    <h1 className="text-3xl font-bold text-gray-900">Guest Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your bookings and stays</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Your Bookings</h2>
                            <Link
                                to="/bookings"
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
                                    <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={
                                                    booking.listing?.images?.[0]?.url
                                                        ? getImageUrl(booking.listing.images[0].url)
                                                        : "/placeholder.svg?height=60&width=60"
                                                }
                                                alt={booking.listing?.title}
                                                className="w-12 h-12 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = "/placeholder.svg?height=60&width=60"
                                                }}
                                            />
                                            <div>
                                                <h3 className="font-medium text-gray-900">{booking.listing?.title}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                        booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                        booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                                        booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                                                        "bg-red-100 text-red-800"
                                                    }`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                    {booking.paymentStatus && (
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                            booking.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                                                            booking.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-red-100 text-red-800"
                                                        }`}>
                                                            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/bookings/${booking._id}`}
                                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {(booking.status === "pending" || booking.status === "confirmed") && (
                                                <button
                                                    onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                                    title="Cancel Booking"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                                <p className="text-gray-600 mb-4">Start exploring properties to make your first booking</p>
                                <Link
                                    to="/listings"
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Browse Listings</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GuestDashboard 