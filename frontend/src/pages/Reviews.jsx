"use client"

import { useState, useEffect } from "react"
import { reviewsAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Star, ThumbsUp, Edit, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const Reviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingReview, setEditingReview] = useState(null)

    useEffect(() => {
        fetchMyReviews()
    }, [])

    const fetchMyReviews = async () => {
        try {
            const response = await reviewsAPI.getMyReviews()
            setReviews(response.data.data || [])
        } catch (error) {
            console.error("Error fetching reviews:", error)
            toast.error("Failed to load reviews")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return

        try {
            await reviewsAPI.deleteReview(reviewId)
            setReviews((prev) => prev.filter((review) => review._id !== reviewId))
            toast.success("Review deleted successfully")
        } catch (error) {
            console.error("Error deleting review:", error)
            toast.error("Failed to delete review")
        }
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Reviews</h1>
                    <p className="text-gray-600 mt-1">
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"} written
                    </p>
                </div>

                {/* Reviews List */}
                {reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.listing.title}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setEditingReview(review)}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(review._id)}
                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>

                                {review.categories && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {Object.entries(review.categories).map(([category, rating]) => (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 capitalize">{category}</span>
                                                <div className="flex items-center space-x-1">{renderStars(rating)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <ThumbsUp className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{review.helpful?.length || 0} helpful</span>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Stay: {new Date(review.booking.checkIn).toLocaleDateString()} -{" "}
                                        {new Date(review.booking.checkOut).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-600 mb-6">Reviews will appear here after you complete a stay and leave feedback.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Reviews
