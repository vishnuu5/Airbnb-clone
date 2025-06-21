"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { bookingsAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Eye, Check, X } from "lucide-react"
import toast from "react-hot-toast"

const AdminBookings = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])

    useEffect(() => {
        if (user) {
            fetchBookings()
        }
    }, [user])

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getAllBookings()
            const sortedBookings = [...response.data.data].sort((a, b) => {
                if (a.status === "pending" && b.status !== "pending") return -1;
                if (a.status !== "pending" && b.status === "pending") return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setBookings(sortedBookings)
        } catch (error) {
            console.error("Error fetching bookings:", error)
            toast.error("Failed to load bookings")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBookingStatus = async (bookingId, status) => {
        try {
            await bookingsAPI.updateBooking(bookingId, { status })
            toast.success(`Booking ${status} successfully`)
            fetchBookings() // Refresh data
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
                    <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                    <p className="text-gray-600 mt-1">Manage platform bookings</p>
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={getImageUrl(booking.listing?.images?.[0]?.url)}
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
                                                    <p className="text-sm text-gray-500">
                                                        Guest: {booking.guest?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    to={`/admin/bookings/${booking._id}`}
                                                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
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
    )
}

export default AdminBookings 