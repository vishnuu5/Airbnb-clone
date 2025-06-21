"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"
import { reviewsAPI } from "../../services/api"
import LoadingSpinner from "../common/LoadingSpinner"
import toast from "react-hot-toast"

const ReviewForm = ({ booking, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        comment: "",
        categories: {
            cleanliness: 5,
            accuracy: 5,
            checkIn: 5,
            communication: 5,
            location: 5,
            value: 5,
        },
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const categoryLabels = {
        cleanliness: "Cleanliness",
        accuracy: "Accuracy",
        checkIn: "Check-in",
        communication: "Communication",
        location: "Location",
        value: "Value",
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleCategoryChange = (category, rating) => {
        setFormData((prev) => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: rating,
            },
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = "Review title is required"
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters"
        }

        if (!formData.comment.trim()) {
            newErrors.comment = "Review comment is required"
        } else if (formData.comment.length < 10) {
            newErrors.comment = "Comment must be at least 10 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setSubmitting(true)
        try {
            const reviewData = {
                bookingId: booking._id,
                ...formData,
            }

            const response = await reviewsAPI.createReview(reviewData)
            toast.success("Review submitted successfully!")
            onSubmit(response.data.data)
            onClose()
        } catch (error) {
            console.error("Submit review error:", error)
            const message = error.response?.data?.message || "Failed to submit review"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const renderStarRating = (category, rating) => {
        return (
            <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleCategoryChange(category, index + 1)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={`w-6 h-6 transition-colors ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-300"
                                }`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">{rating}</span>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Booking Info */}
                <div className="p-6 border-b bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <img
                            src={
                                booking.listing?.images?.[0]?.url?.startsWith("/uploads")
                                    ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${booking.listing.images[0].url}`
                                    : booking.listing?.images?.[0]?.url || "/placeholder.svg?height=60&width=60"
                            }
                            alt={booking.listing?.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                                e.target.src = "/placeholder.svg?height=60&width=60"
                            }}
                        />
                        <div>
                            <h3 className="font-medium text-gray-900">{booking.listing?.title}</h3>
                            <p className="text-sm text-gray-600">
                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Ratings */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Rate your experience</h3>
                        <div className="space-y-4">
                            {Object.entries(categoryLabels).map(([category, label]) => (
                                <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 w-24">{label}</span>
                                    {renderStarRating(category, formData.categories[category])}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title *
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className={`input ${errors.title ? "border-red-500" : ""}`}
                            placeholder="Summarize your experience..."
                            maxLength={100}
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
                    </div>

                    {/* Review Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review *
                        </label>
                        <textarea
                            id="comment"
                            rows={6}
                            value={formData.comment}
                            onChange={(e) => handleInputChange("comment", e.target.value)}
                            className={`input resize-none ${errors.comment ? "border-red-500" : ""}`}
                            placeholder="Share details about your stay, what you liked, and any suggestions for improvement..."
                            maxLength={1000}
                        />
                        {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment}</p>}
                        <p className="mt-1 text-xs text-gray-500">{formData.comment.length}/1000 characters</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Submitting...
                                </div>
                            ) : (
                                "Submit Review"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewForm
