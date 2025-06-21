"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { bookingsAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Calendar, MapPin, Users, DollarSign, Eye, X, Check, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const Bookings = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all") // all, pending, confirmed, cancelled, completed
    const [actionLoading, setActionLoading] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchBookings()
        }
    }, [user])

    const fetchBookings = async () => {
        setLoading(true)
        setError(null)
        
        try {
            console.log('Fetching bookings for user:', user._id);
            const response = await bookingsAPI.getBookings()
            console.log('Bookings response:', response.data);
            
            const bookings = response.data.data || [];
            console.log('Processed bookings:', bookings);

            // Validate and filter bookings
            const validBookings = bookings.filter(booking => {
                if (!booking.listing) {
                    console.warn('Booking missing listing:', booking);
                    return false;
                }
                return true;
            });

            setBookings(validBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            console.error("Error details:", error.response?.data);
            setError(error.response?.data?.message || error.message || "Failed to load bookings");
            toast.error(error.response?.data?.message || error.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateBookingStatus = async (bookingId, status) => {
        setActionLoading(bookingId)
        try {
            await bookingsAPI.updateBooking(bookingId, { status })
            toast.success(`Booking ${status} successfully`)
            // Update local state immediately
            setBookings(prevBookings => 
                prevBookings.map(booking => 
                    booking._id === bookingId 
                        ? { ...booking, status } 
                        : booking
                )
            )
            // Fetch fresh data
            await fetchBookings()
        } catch (error) {
            console.error("Error updating booking:", error)
            toast.error(error.response?.data?.message || "Failed to update booking")
        } finally {
            setActionLoading(null)
        }
    }

    const handleCancelBooking = async (bookingId, reason = "Cancelled by user") => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return

        setActionLoading(bookingId)
        try {
            await bookingsAPI.cancelBooking(bookingId, reason)
            toast.success("Booking cancelled successfully")
            fetchBookings() // Refresh bookings
        } catch (error) {
            console.error("Error cancelling booking:", error)
            toast.error(error.response?.data?.message || "Failed to cancel booking")
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-500" />
            case "confirmed":
                return <Check className="w-4 h-4 text-green-500" />
            case "cancelled":
                return <X className="w-4 h-4 text-red-500" />
            case "completed":
                return <Check className="w-4 h-4 text-blue-500" />
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "confirmed":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            case "completed":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const filteredBookings = bookings.filter((booking) => {
        if (filter === "all") return true
        return booking.status === filter
    })

    const filterOptions = [
        { value: "all", label: "All Bookings" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ]

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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchBookings}
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
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600 mt-1">
                        {user.role === "host" ? "Manage bookings for your properties" : "View your travel bookings"}
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                                    ? "bg-primary-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                                    }`}
                            >
                                {option.label}
                                {option.value !== "all" && (
                                    <span className="ml-2 text-xs">({bookings.filter((b) => b.status === option.value).length})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length > 0 ? (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        {/* Booking Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start space-x-4">
                                                {/* Property Image */}
                                                <img
                                                    src={
                                                        booking.listing?.images?.[0]?.url?.startsWith("/uploads")
                                                            ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${booking.listing.images[0].url}`
                                                            : booking.listing?.images?.[0]?.url || "/placeholder.svg?height=80&width=80"
                                                    }
                                                    alt={booking.listing?.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder.svg?height=80&width=80"
                                                    }}
                                                />

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">{booking.listing?.title}</h3>
                                                        <div className="flex items-center space-x-1">
                                                            {getStatusIcon(booking.status)}
                                                            <span
                                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}
                                                            >
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            <span>
                                                                {booking.listing?.location?.city}, {booking.listing?.location?.state}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            <span>
                                                                {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                                                                {new Date(booking.checkOut).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            <span>
                                                                {booking.guests.adults + booking.guests.children + booking.guests.infants} guests
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-1" />
                                                            <span className="font-medium">${booking.totalPrice}</span>
                                                        </div>
                                                    </div>

                                                    {/* Guest/Host Info */}
                                                    <div className="mt-3 text-sm text-gray-600">
                                                        {user.role === "host" ? (
                                                            <p>
                                                                <span className="font-medium">Guest:</span> {booking.guest?.name} (
                                                                {booking.guestInfo?.email})
                                                            </p>
                                                        ) : (
                                                            <p>
                                                                <span className="font-medium">Host:</span> {booking.host?.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Special Requests */}
                                                    {booking.specialRequests && (
                                                        <div className="mt-3 text-sm text-gray-600">
                                                            <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                                            <Link
                                                to={`/bookings/${booking._id}`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Link>

                                            {/* Host Actions */}
                                            {user.role === "host" && booking.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                                                        disabled={actionLoading === booking._id}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === booking._id ? (
                                                            <LoadingSpinner size="sm" className="mr-2" />
                                                        ) : (
                                                            <Check className="w-4 h-4 mr-2" />
                                                        )}
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id, "Declined by host")}
                                                        disabled={actionLoading === booking._id}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === booking._id ? (
                                                            <LoadingSpinner size="sm" className="mr-2" />
                                                        ) : (
                                                            <X className="w-4 h-4 mr-2" />
                                                        )}
                                                        Decline
                                                    </button>
                                                </>
                                            )}

                                            {/* Guest Actions */}
                                            {user.role === "guest" &&
                                                (booking.status === "pending" || booking.status === "confirmed") &&
                                                new Date(booking.checkIn) > new Date() && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        disabled={actionLoading === booking._id}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === booking._id ? (
                                                            <LoadingSpinner size="sm" className="mr-2" />
                                                        ) : (
                                                            <X className="w-4 h-4 mr-2" />
                                                        )}
                                                        Cancel
                                                    </button>
                                                )}

                                            {/* Payment Button for Pending Bookings */}
                                            {user.role === "guest" &&
                                                booking.status === "confirmed" &&
                                                booking.paymentStatus === "pending" && (
                                                    <Link
                                                        to={`/payment/${booking._id}`}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                                                    >
                                                        <DollarSign className="w-4 h-4 mr-2" />
                                                        Pay Now
                                                    </Link>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Timeline */}
                                <div className="bg-gray-50 px-6 py-3 border-t">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        <span>
                                            {booking.priceBreakdown.nights} night{booking.priceBreakdown.nights !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {user.role === "host" ? "Your properties haven't been booked yet" : "You haven't made any bookings yet"}
                        </p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                        >
                            {user.role === "host" ? "Promote Your Listings" : "Browse Listings"}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Bookings
