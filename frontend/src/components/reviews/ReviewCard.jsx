"use client"

import { useState } from "react"
import { Star, ThumbsUp, MoreHorizontal, Flag } from "lucide-react"
import { reviewsAPI } from "../../services/api"
import toast from "react-hot-toast"

const ReviewCard = ({ review, onUpdate }) => {
    const [isHelpful, setIsHelpful] = useState(review.helpful?.includes(review.user._id) || false)
    const [helpfulCount, setHelpfulCount] = useState(review.helpful?.length || 0)
    const [loading, setLoading] = useState(false)

    const handleHelpful = async () => {
        setLoading(true)
        try {
            const response = await reviewsAPI.markHelpful(review._id)
            setIsHelpful(response.data.data.isHelpful)
            setHelpfulCount(response.data.data.helpful)
        } catch (error) {
            console.error("Mark helpful error:", error)
            toast.error("Failed to update helpful status")
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{review.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium text-gray-700">{review.rating}</span>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Cleanliness</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.cleanliness)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Accuracy</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.accuracy)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Check-in</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.checkIn)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Communication</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.communication)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Location</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.location)}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Value</div>
                    <div className="flex items-center justify-center mt-1">{renderStars(review.categories.value)}</div>
                </div>
            </div>

            {/* Host Response */}
            {review.response?.comment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-semibold">H</span>
                        </div>
                        <span className="text-sm font-medium text-blue-900">Host Response</span>
                        <span className="text-xs text-blue-600 ml-2">{formatDate(review.response.respondedAt)}</span>
                    </div>
                    <p className="text-sm text-blue-800">{review.response.comment}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                    onClick={handleHelpful}
                    disabled={loading}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${isHelpful ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <ThumbsUp className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`} />
                    <span>Helpful ({helpfulCount})</span>
                </button>

                <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm">
                    <Flag className="w-4 h-4" />
                    <span>Report</span>
                </button>
            </div>
        </div>
    )
}

export default ReviewCard
