"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { bookingsAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Calendar, MapPin, Users, Phone, Mail, Check, X, Clock, AlertCircle, ArrowLeft, CreditCard } from "lucide-react"
import toast from "react-hot-toast"
import api from "../services/api"

const BookingDetail = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchBooking()
        
        // Check if user just completed payment
        const urlParams = new URLSearchParams(location.search)
        if (urlParams.get('payment') === 'success') {
            // Show success message and remove the parameter from URL
            toast.success('Payment completed successfully!')
            navigate(`/bookings/${id}`, { replace: true })
        }
    }, [id, location.search])

    const fetchBooking = async () => {
        try {
            console.log('Fetching booking details for ID:', id);
            const response = await bookingsAPI.getBooking(id)
            console.log('Booking API response:', response);
            
            if (!response.data.success) {
                toast.error(response.data.message || "Failed to load booking details")
                navigate("/bookings")
                return
            }
            if (!response.data.data) {
                toast.error("Booking not found or has invalid references")
                navigate("/bookings")
                return
            }
            
            console.log('Setting booking data:', response.data.data);
            console.log('Payment status:', response.data.data.paymentStatus);
            setBooking(response.data.data)
        } catch (error) {
            console.error("Error fetching booking:", error)
            toast.error(error.response?.data?.message || "Failed to load booking details")
            navigate("/bookings")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBookingStatus = async (status) => {
        setActionLoading(true)
        try {
            await bookingsAPI.updateBooking(id, { status })
            toast.success(`Booking ${status} successfully`)
            fetchBooking() // Refresh booking
        } catch (error) {
            console.error("Error updating booking:", error)
            toast.error("Failed to update booking")
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancelBooking = async (reason = "Cancelled by user") => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return

        setActionLoading(true)
        try {
            await bookingsAPI.cancelBooking(id, reason)
            toast.success("Booking cancelled successfully")
            fetchBooking() // Refresh booking
        } catch (error) {
            console.error("Error cancelling booking:", error)
            toast.error("Failed to cancel booking")
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />
            case "confirmed":
                return <Check className="w-5 h-5 text-green-500" />
            case "cancelled":
                return <X className="w-5 h-5 text-red-500" />
            case "completed":
                return <Check className="w-5 h-5 text-blue-500" />
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "confirmed":
                return "bg-green-100 text-green-800 border-green-200"
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200"
            case "completed":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "failed":
                return "bg-red-100 text-red-800"
            case "refunded":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
                    <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
                    <Link to="/bookings" className="btn btn-primary">
                        Back to Bookings
                    </Link>
                </div>
            </div>
        )
    }

    const isHost = user.role === "host"
    const canCancel =
        (booking.status === "pending" || booking.status === "confirmed") && new Date(booking.checkIn) > new Date()

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/bookings" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bookings
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                            <p className="text-gray-600 mt-1">Booking ID: {booking._id}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchBooking}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Refresh Data
                            </button>
                            {booking.paymentStatus === "pending" && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                                            const response = await fetch(`${API_BASE_URL}/payments/test-update-status/${id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                            const result = await response.json();
                                            console.log('Test update result:', result);
                                            if (result.success) {
                                                toast.success('Payment status updated (test)');
                                                fetchBooking();
                                            } else {
                                                toast.error(result.message);
                                            }
                                        } catch (error) {
                                            console.error('Test update error:', error);
                                            toast.error('Test update failed');
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Test Update Payment Status
                                </button>
                            )}
                            <div
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(booking.status)}`}
                            >
                                {getStatusIcon(booking.status)}
                                <span className="font-medium capitalize">{booking.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Property Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                            <div className="flex items-start space-x-4">
                                <img
                                    src={
                                        booking.listing?.images?.[0]?.url?.startsWith("/uploads")
                                            ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${booking.listing.images[0].url}`
                                            : booking.listing?.images?.[0]?.url || "/placeholder.svg?height=120&width=120"
                                    }
                                    alt={booking.listing?.title}
                                    className="w-24 h-24 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.svg?height=120&width=120"
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.listing?.title}</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>
                                                {booking.listing?.location?.address}, {booking.listing?.location?.city},{" "}
                                                {booking.listing?.location?.state}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>
                                                Up to {booking.listing?.guests} guests • {booking.listing?.bedrooms} bedrooms •{" "}
                                                {booking.listing?.bathrooms} bathrooms
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/listings/${booking.listing?._id}`}
                                        className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        View Property →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Booking Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Check-in & Check-out</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-gray-500">
                                            {booking.priceBreakdown.nights} night{booking.priceBreakdown.nights !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Guests</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div>Adults: {booking.guests.adults}</div>
                                        <div>Children: {booking.guests.children}</div>
                                        <div>Infants: {booking.guests.infants}</div>
                                        <div className="font-medium">
                                            Total: {booking.guests.adults + booking.guests.children + booking.guests.infants} guests
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {booking.specialRequests && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-medium text-gray-900 mb-2">Special Requests</h3>
                                    <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                                </div>
                            )}
                        </div>

                        {/* Guest/Host Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {isHost ? "Guest Information" : "Host Information"}
                            </h2>
                            <div className="space-y-4">
                                {isHost ? (
                                    <>
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Primary Guest</h3>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Name:</span> {booking.guestInfo.firstName}{" "}
                                                    {booking.guestInfo.lastName}
                                                </div>
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    <span>{booking.guestInfo.email}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    <span>{booking.guestInfo.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Your Host</h3>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">{booking.host?.name?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{booking.host?.name}</div>
                                                <div className="text-sm text-gray-600">{booking.host?.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cancellation Info */}
                        {booking.status === "cancelled" && booking.cancellation && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-red-900 mb-2">Cancellation Details</h2>
                                <div className="space-y-2 text-sm text-red-700">
                                    <div>
                                        <span className="font-medium">Cancelled on:</span>{" "}
                                        {new Date(booking.cancellation.cancelledAt).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Reason:</span> {booking.cancellation.reason}
                                    </div>
                                    {booking.cancellation.refundAmount > 0 && (
                                        <div>
                                            <span className="font-medium">Refund Amount:</span> ${booking.cancellation.refundAmount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Breakdown */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>
                                        ${booking.listing?.price} x {booking.priceBreakdown.nights} nights
                                    </span>
                                    <span>${booking.priceBreakdown.basePrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service fee</span>
                                    <span>${booking.priceBreakdown.serviceFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cleaning fee</span>
                                    <span>${booking.priceBreakdown.cleaningFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span>${booking.priceBreakdown.taxes}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-semibold text-base">
                                    <span>Total</span>
                                    <span>${booking.totalPrice}</span>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}
                                    >
                                        {booking.paymentStatus}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Payment Method: {booking.paymentMethod || "Not specified"}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                            <div className="space-y-3">
                                {/* Host Actions */}
                                {isHost && booking.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateBookingStatus("confirmed")}
                                            disabled={actionLoading}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {actionLoading ? (
                                                <LoadingSpinner size="sm" className="mr-2" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Confirm Booking
                                        </button>
                                        <button
                                            onClick={() => handleCancelBooking("Declined by host")}
                                            disabled={actionLoading}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        >
                                            {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                            Decline Booking
                                        </button>
                                    </>
                                )}

                                {/* Guest Actions */}
                                {!isHost && canCancel && (
                                    <button
                                        onClick={() => handleCancelBooking()}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                        Cancel Booking
                                    </button>
                                )}

                                {/* Payment Button */}
                                {!isHost && booking.status === "confirmed" && booking.paymentStatus === "pending" && (
                                    <Link
                                        to={`/payment/${booking._id}`}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Complete Payment
                                    </Link>
                                )}

                                {/* Cancel Booking Button - Only show after payment is completed */}
                                {!isHost && booking.status === "confirmed" && booking.paymentStatus === "paid" && (
                                    <>
                                        <div className="text-xs text-gray-500 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <strong>Cancellation Policy:</strong> Free cancellation before check-in. 50% refund if cancelled within 48 hours of check-in. No refund for no-shows.
                                        </div>
                                        <button
                                            onClick={() => handleCancelBooking("Cancelled by guest after payment")}
                                            disabled={actionLoading}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        >
                                            {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                            Cancel Booking
                                        </button>
                                    </>
                                )}

                                {/* Contact Actions */}
                                {booking.status === "confirmed" && (
                                    <div className="pt-3 border-t">
                                        <p className="text-xs text-gray-500 mb-2">Need help with your booking?</p>
                                        <button
                                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={async () => {
                                                try {
                                                    const otherUserId = isHost ? booking.guest._id : booking.host._id;
                                                    const res = await api.post("/messages/start", { userId: otherUserId });
                                                    if (res.data.success && res.data.conversationId) {
                                                        navigate("/messages");
                                                    } else {
                                                        toast.error("Failed to start conversation");
                                                    }
                                                } catch (err) {
                                                    toast.error("Failed to start conversation");
                                                }
                                            }}
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Contact {isHost ? "Guest" : "Host"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    <span>Booking created on {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === "confirmed" && (
                                    <div className="flex items-center text-green-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        <span>Booking confirmed</span>
                                    </div>
                                )}
                                {booking.status === "cancelled" && (
                                    <div className="flex items-center text-red-600">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                        <span>Booking cancelled on {new Date(booking.cancellation?.cancelledAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingDetail
