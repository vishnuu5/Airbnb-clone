"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { wishlistAPI } from "../services/api"
import ListingCard from "../components/listings/ListingCard"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Heart, HeartOff, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWishlist()
    }, [])

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.getWishlist()
            setWishlist(response.data.data || [])
        } catch (error) {
            console.error("Error fetching wishlist:", error)
            toast.error("Failed to load wishlist")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFromWishlist = async (listingId) => {
        try {
            await wishlistAPI.removeFromWishlist(listingId)
            setWishlist((prev) => prev.filter((item) => item._id !== listingId))
            toast.success("Removed from wishlist")
        } catch (error) {
            console.error("Error removing from wishlist:", error)
            toast.error("Failed to remove from wishlist")
        }
    }

    const handleClearWishlist = async () => {
        if (!window.confirm("Are you sure you want to clear your entire wishlist?")) return

        try {
            await wishlistAPI.clearWishlist()
            setWishlist([])
            toast.success("Wishlist cleared")
        } catch (error) {
            console.error("Error clearing wishlist:", error)
            toast.error("Failed to clear wishlist")
        }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <Heart className="w-8 h-8 text-red-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
                            <p className="text-gray-600">
                                {wishlist.length} {wishlist.length === 1 ? "property" : "properties"} saved
                            </p>
                        </div>
                    </div>

                    {wishlist.length > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <HeartOff className="w-4 h-4" />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {/* Wishlist Content */}
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((listing) => (
                            <div key={listing._id} className="relative">
                                <ListingCard listing={listing} />
                                <button
                                    onClick={() => handleRemoveFromWishlist(listing._id)}
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                    title="Remove from wishlist"
                                >
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-6">Start exploring and save your favorite places to stay for later.</p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                            Explore Listings
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Wishlist
