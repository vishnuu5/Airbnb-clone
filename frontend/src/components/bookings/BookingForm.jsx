"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { bookingsAPI } from "../../services/api"
import DatePicker from "react-datepicker"
import toast from "react-hot-toast"
import LoadingSpinner from "../common/LoadingSpinner"

const BookingForm = ({ listing }) => {
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // Check if current user is the host
    const isHost = user?._id === listing?.host?._id

    const [bookingData, setBookingData] = useState({
        checkIn: null,
        checkOut: null,
        guests: {
            adults: 1,
            children: 0,
            infants: 0,
        },
        guestInfo: {
            firstName: user?.name?.split(" ")[0] || "",
            lastName: user?.name?.split(" ")[1] || "",
            email: user?.email || "",
            phone: "",
        },
        specialRequests: "",
    })

    const calculateNights = () => {
        if (!bookingData.checkIn || !bookingData.checkOut) return 0
        const diffTime = Math.abs(bookingData.checkOut - bookingData.checkIn)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const calculateTotalGuests = () => {
        return bookingData.guests.adults + bookingData.guests.children + bookingData.guests.infants
    }

    const calculatePricing = () => {
        const nights = calculateNights()
        const basePrice = listing.price * nights
        const serviceFee = Math.round(basePrice * 0.1)
        const cleaningFee = 50
        const taxes = Math.round((basePrice + serviceFee + cleaningFee) * 0.08)
        const total = basePrice + serviceFee + cleaningFee + taxes

        return {
            nights,
            basePrice,
            serviceFee,
            cleaningFee,
            taxes,
            total,
        }
    }

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".")
            setBookingData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }))
        } else {
            setBookingData((prev) => ({ ...prev, [field]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAuthenticated) {
            toast.error("Please login to make a booking")
            navigate("/login")
            return
        }

        // Check if user is the host
        if (isHost) {
            toast.error("You cannot book your own listing")
            return
        }

        // Validation
        if (!bookingData.checkIn || !bookingData.checkOut) {
            toast.error("Please select check-in and check-out dates")
            return
        }

        if (bookingData.checkIn >= bookingData.checkOut) {
            toast.error("Check-out date must be after check-in date")
            return
        }

        if (calculateTotalGuests() > listing.guests) {
            toast.error(`This property can accommodate maximum ${listing.guests} guests`)
            return
        }

        if (
            !bookingData.guestInfo.firstName ||
            !bookingData.guestInfo.lastName ||
            !bookingData.guestInfo.email ||
            !bookingData.guestInfo.phone
        ) {
            toast.error("Please fill in all guest information")
            return
        }

        setLoading(true)

        try {
            const response = await bookingsAPI.createBooking({
                listingId: listing._id,
                ...bookingData,
            })

            toast.success("Booking created successfully!")
            navigate(`/payment/${response.data.data._id}`)
        } catch (error) {
            console.error("Booking error:", error)
            const message = error.response?.data?.message || "Failed to create booking"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const pricing = calculatePricing()

    return (
        <div className="bg-white rounded-lg shadow-lg border p-6 sticky top-4">
            {isHost ? (
                <div className="text-center py-4">
                    <p className="text-gray-600">You cannot book your own listing</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">${listing.price}</span>
                            <span className="text-gray-600">per night</span>
                        </div>
                        {listing.rating.count > 0 && (
                            <div className="flex items-center mt-1">
                                <span className="text-sm">★ {listing.rating.average.toFixed(1)}</span>
                                <span className="text-gray-500 text-sm ml-1">({listing.rating.count} reviews)</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 border rounded-lg">
                            <div className="p-3 border-r">
                                <label className="block text-xs font-medium text-gray-700 mb-1">CHECK-IN</label>
                                <DatePicker
                                    selected={bookingData.checkIn}
                                    onChange={(date) => handleInputChange("checkIn", date)}
                                    placeholderText="Add date"
                                    className="w-full text-sm border-none p-0 focus:ring-0"
                                    minDate={new Date()}
                                />
                            </div>
                            <div className="p-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">CHECK-OUT</label>
                                <DatePicker
                                    selected={bookingData.checkOut}
                                    onChange={(date) => handleInputChange("checkOut", date)}
                                    placeholderText="Add date"
                                    className="w-full text-sm border-none p-0 focus:ring-0"
                                    minDate={bookingData.checkIn || new Date()}
                                />
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="border rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">GUESTS</label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Adults</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange("guests.adults", Math.max(1, bookingData.guests.adults - 1))}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{bookingData.guests.adults}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange("guests.adults", bookingData.guests.adults + 1)}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Children</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange("guests.children", Math.max(0, bookingData.guests.children - 1))}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{bookingData.guests.children}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange("guests.children", bookingData.guests.children + 1)}
                                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Information */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Guest Information</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={bookingData.guestInfo.firstName}
                                    onChange={(e) => handleInputChange("guestInfo.firstName", e.target.value)}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={bookingData.guestInfo.lastName}
                                    onChange={(e) => handleInputChange("guestInfo.lastName", e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={bookingData.guestInfo.email}
                                onChange={(e) => handleInputChange("guestInfo.email", e.target.value)}
                                className="input"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={bookingData.guestInfo.phone}
                                onChange={(e) => handleInputChange("guestInfo.phone", e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        {/* Special Requests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                            <textarea
                                value={bookingData.specialRequests}
                                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                                placeholder="Any special requests or notes..."
                                className="input h-20 resize-none"
                            />
                        </div>

                        {/* Pricing Breakdown */}
                        {pricing.nights > 0 && (
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>
                                        ${listing.price} x {pricing.nights} nights
                                    </span>
                                    <span>${pricing.basePrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Service fee</span>
                                    <span>${pricing.serviceFee}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Cleaning fee</span>
                                    <span>${pricing.cleaningFee}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Taxes</span>
                                    <span>${pricing.taxes}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${pricing.total}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || pricing.nights === 0}
                            className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creating Booking...
                                </div>
                            ) : (
                                "Reserve"
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">You won't be charged yet</p>
                    </form>
                </>
            )}
        </div>
    )
}

export default BookingForm
