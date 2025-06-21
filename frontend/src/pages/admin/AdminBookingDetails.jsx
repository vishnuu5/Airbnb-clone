"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { adminBookingsAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { ArrowLeft, Check, X } from "lucide-react"
import toast from "react-hot-toast"

const AdminBookingDetails = () => {
    const { user } = useAuth()
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(null)

    useEffect(() => {
        if (user) {
            fetchBookingDetails()
        }
    }, [user, id])

    const fetchBookingDetails = async () => {
        if (!id) {
            console.error("No booking ID provided");
            toast.error("Invalid booking ID");
            navigate("/admin/dashboard");
            return;
        }

        console.log("Fetching booking details for ID:", id);

        try {
            const response = await adminBookingsAPI.getBooking(id)
            console.log("Booking API response:", response);
            
            if (response.data.success) {
                setBooking(response.data.data)
            } else {
                console.error("API returned error:", response.data.message);
                toast.error(response.data.message || "Failed to load booking details")
                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.error("Error fetching booking details:", error)
            console.error("Error response:", error.response?.data)
            toast.error(error.response?.data?.message || "Failed to load booking details")
            navigate("/admin/dashboard");
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBookingStatus = async (status) => {
        try {
            await adminBookingsAPI.updateBooking(id, { status })
            toast.success(`Booking ${status} successfully`)
            fetchBookingDetails() // Refresh data
        } catch (error) {
            console.error("Error updating booking:", error)
            toast.error("Failed to update booking")
        }
    }

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
    };

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
                <p className="text-gray-500">Booking not found</p>
            </div>
        )
    }

    const totalGuests = booking.guests ? 
        (booking.guests.adults || 0) + (booking.guests.children || 0) + (booking.guests.infants || 0) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        <div className="flex items-start space-x-6">
                            <img
                                src={getImageUrl(booking.listing?.images?.[0]?.url)}
                                alt={booking.listing?.title}
                                className="w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.src = "/placeholder.svg?height=60&width=60"
                                }}
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{booking.listing?.title}</h2>
                                <p className="text-gray-600">
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                </p>
                                <p className="text-gray-500 mt-2">
                                    Guest: {booking.guest ? `${booking.guest.name} (${booking.guest.email})` : 'Guest information not available'}
                                </p>
                                <p className="text-gray-500">
                                    Host: {booking.host ? `${booking.host.name} (${booking.host.email})` : 'Host information not available'}
                                </p>
                            </div>
                        </div>

                        {/* Booking Status and Actions */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Booking Status</h3>
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full ${
                                        booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                        booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                        booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                                        "bg-red-100 text-red-800"
                                    }`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                    {booking.status === "pending" && (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleUpdateBookingStatus("confirmed")}
                                                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateBookingStatus("cancelled")}
                                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                                <p className="text-gray-600">Total Price: ${booking.totalPrice}</p>
                                <p className="text-gray-600">Payment Status: {booking.paymentStatus || "Not paid"}</p>
                            </div>
                        </div>

                        {/* Additional Booking Information */}
                        <div className="mt-6 p-4 border rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    Total Guests: {
                                        booking.guests ? 
                                            (booking.guests.adults || 0) + 
                                            (booking.guests.children || 0) + 
                                            (booking.guests.infants || 0) 
                                        : 0
                                    }
                                </p>
                                {booking.guests && (
                                    <>
                                        <p className="text-gray-600">Adults: {booking.guests.adults || 0}</p>
                                        <p className="text-gray-600">Children: {booking.guests.children || 0}</p>
                                        <p className="text-gray-600">Infants: {booking.guests.infants || 0}</p>
                                    </>
                                )}
                                <p className="text-gray-600">Created At: {new Date(booking.createdAt).toLocaleString()}</p>
                                {booking.updatedAt && (
                                    <p className="text-gray-600">Last Updated: {new Date(booking.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminBookingDetails 