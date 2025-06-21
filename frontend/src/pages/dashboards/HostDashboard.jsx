"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { listingsAPI, bookingsAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Home, Calendar, DollarSign, Users, Plus, Edit, Trash2, Eye, Check, X } from "lucide-react"
import toast from "react-hot-toast"

const HostDashboard = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
    })
    const [recentListings, setRecentListings] = useState([])
    const [recentBookings, setRecentBookings] = useState([])

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        } else {
            setError("Please log in to view your dashboard")
            setLoading(false)
        }
    }, [user])

    const fetchDashboardData = async () => {
        setLoading(true)
        setError(null)
        
        try {
            console.log('Fetching dashboard data for user:', user._id)
            
            // Fetch listings and bookings in parallel
            const [listingsResponse, bookingsResponse] = await Promise.all([
                listingsAPI.getMyListings(),
                bookingsAPI.getBookings(),
            ])

            if (!listingsResponse.data.success || !bookingsResponse.data.success) {
                throw new Error("Failed to fetch dashboard data")
            }

            const listings = listingsResponse.data.data || []
            const bookings = bookingsResponse.data.data || []

            // Calculate stats
            const pendingBookings = bookings.filter(booking => booking.status === "pending")
            const confirmedBookings = bookings.filter(booking => booking.status === "confirmed")
            const completedBookings = bookings.filter(booking => booking.status === "completed")
            const cancelledBookings = bookings.filter(booking => booking.status === "cancelled")

            setStats({
                pendingBookings: pendingBookings.length,
                confirmedBookings: confirmedBookings.length,
                completedBookings: completedBookings.length,
                cancelledBookings: cancelledBookings.length,
            })

            // Sort bookings to show pending first, then by date
            const sortedBookings = [...bookings].sort((a, b) => {
                if (a.status === "pending" && b.status !== "pending") return -1
                if (a.status !== "pending" && b.status === "pending") return 1
                return new Date(b.createdAt) - new Date(a.createdAt)
            })

            setRecentListings(listings.slice(0, 5))
            setRecentBookings(sortedBookings.slice(0, 5))
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            console.error("Error details:", error.response?.data)
            setError(error.response?.data?.message || "Failed to load dashboard data")
            toast.error(error.response?.data?.message || "Failed to load dashboard data")
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
            toast.error(error.response?.data?.message || "Failed to update booking")
        }
    }

    const handleDeleteListing = async (listingId) => {
        // Updated confirmation message to be more explicit
        if (!window.confirm("Are you sure you want to delete this listing? This will automatically cancel any active bookings associated with it.")) {
            return
        }

        try {
            const response = await listingsAPI.deleteListing(listingId)
            // Use the success message from the API
            toast.success(response.data.message || "Listing deleted successfully")
            fetchDashboardData() // Refresh data
        } catch (error) {
            console.error("Error deleting listing:", error)
            toast.error(error.response?.data?.message || "Failed to delete listing")
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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your listings and bookings</p>
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
                                <Calendar className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Cancelled Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.cancelledBookings}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Listings */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
                                <Link
                                    to="/create-listing"
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Listing</span>
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {recentListings.length > 0 ? (
                                <div className="space-y-4">
                                    {recentListings.map((listing) => (
                                        <div key={listing._id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={
                                                        listing.images?.[0]?.url
                                                            ? getImageUrl(listing.images[0].url)
                                                            : "/placeholder.svg?height=60&width=60"
                                                    }
                                                    alt={listing.title}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder.svg?height=60&width=60"
                                                    }}
                                                />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{listing.title}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {listing.location.city}, {listing.location.state}
                                                    </p>
                                                    <p className="text-sm font-medium text-primary-600">${listing.price}/night</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    to={`/listings/${listing._id}`}
                                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/edit-listing/${listing._id}`}
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteListing(listing._id)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                                    title="Delete listing"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                                    <p className="text-gray-600 mb-4">Start by creating your first listing</p>
                                    <Link
                                        to="/create-listing"
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Listing</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
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
                                                {booking.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                                                            title="Confirm Booking"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                                            title="Cancel Booking"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === "confirmed" && new Date(booking.checkOut) < new Date() && (
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id, "completed")}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                                                        title="Mark as Completed"
                                                    >
                                                        <Check className="w-4 h-4" />
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
                                    <p className="text-gray-600">Your bookings will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HostDashboard 