"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
    listingsAPI,
    reviewsAPI,
    wishlistAPI,
    messagesAPI,
} from "../services/api"
import BookingForm from "../components/bookings/BookingForm"
import ListingMap from "../components/listings/ListingMap"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ReviewCard from "../components/reviews/ReviewCard"
import ReviewForm from "../components/reviews/ReviewForm"
import {
    MapPin,
    Star,
    Users,
    Bed,
    Bath,
    Wifi,
    Car,
    Tv,
    Coffee,
    Waves,
    Dumbbell,
    Wind,
    Flame,
    Briefcase,
    UtensilsCrossed,
    PawPrint,
    Cigarette,
    ChevronLeft,
    ChevronRight,
    X,
    Heart,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext"

const ListingDetail = () => {
    const { id } = useParams()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showImageModal, setShowImageModal] = useState(false)
    const [error, setError] = useState(null)
    const [wishlisted, setWishlisted] = useState(false)
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const { user, isAuthenticated } = useAuth()
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [userBookings, setUserBookings] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchListing()
        if (isAuthenticated) {
            wishlistAPI
                .getWishlist()
                .then(res => {
                    const wishlistedListing = (res.data.data || []).find(
                        item => item._id === id
                    )
                    setWishlisted(!!wishlistedListing)
                })
                .catch(() => {})
        }
        // Fetch user bookings for review eligibility
        if (isAuthenticated) {
            import("../services/api").then(({ bookingsAPI }) => {
                bookingsAPI
                    .getBookings()
                    .then(res => {
                        setUserBookings(res.data.data || [])
                    })
                    .catch(() => {})
            })
        }
    }, [id, isAuthenticated])

    const fetchListing = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listingsAPI.getListing(id)
            if (response.data.success) {
                setListing(response.data.data)
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch listing"
                )
            }
        } catch (error) {
            console.error("Error fetching listing:", error)
            setError(
                error.message || "An error occurred while fetching the listing."
            )
        } finally {
            setLoading(false)
        }
    }

    // Handle image URL with better fallback logic
    const getImageUrl = imageUrl => {
        if (!imageUrl) return "/placeholder.svg?height=400&width=600"

        // If it's already a full URL (starts with http), use it directly
        if (imageUrl.startsWith("http")) return imageUrl

        // If it starts with /uploads or /api/uploads, prepend the backend URL
        if (
            imageUrl.startsWith("/uploads") ||
            imageUrl.startsWith("/api/uploads")
        ) {
            const backendUrl =
                import.meta.env.VITE_API_URL || "http://localhost:5000"
            return `${backendUrl}${imageUrl}`
        }

        // If it's a relative path, prepend the backend URL and /uploads
        const backendUrl =
            import.meta.env.VITE_API_URL || "http://localhost:5000"
        return `${backendUrl}/uploads/${imageUrl}`
    }

    const getAmenityIcon = amenity => {
        const icons = {
            wifi: <Wifi className="w-5 h-5" />,
            kitchen: <Coffee className="w-5 h-5" />,
            parking: <Car className="w-5 h-5" />,
            pool: <Waves className="w-5 h-5" />,
            gym: <Dumbbell className="w-5 h-5" />,
            tv: <Tv className="w-5 h-5" />,
            ac: <Wind className="w-5 h-5" />,
            heating: <Flame className="w-5 h-5" />,
            workspace: <Briefcase className="w-5 h-5" />,
            breakfast: <UtensilsCrossed className="w-5 h-5" />,
            "pets-allowed": <PawPrint className="w-5 h-5" />,
            "smoking-allowed": <Cigarette className="w-5 h-5" />,
        }
        return icons[amenity] || <div className="w-5 h-5 bg-gray-300 rounded" />
    }

    const nextImage = () => {
        if (listing?.images?.length > 0) {
            setCurrentImageIndex(prev => (prev + 1) % listing.images.length)
        }
    }

    const prevImage = () => {
        if (listing?.images?.length > 0) {
            setCurrentImageIndex(
                prev => (prev - 1 + listing.images.length) % listing.images.length
            )
        }
    }

    const handleImageError = e => {
        console.error("Image failed to load:", e.target.src)
        e.target.src = "/placeholder.svg?height=400&width=600"
    }

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to use wishlist.")
            return
        }
        setWishlistLoading(true)
        try {
            if (wishlisted) {
                await wishlistAPI.removeFromWishlist(listing._id)
                setWishlisted(false)
                toast.success("Removed from wishlist")
            } else {
                await wishlistAPI.addToWishlist(listing._id)
                setWishlisted(true)
                toast.success("Added to wishlist")
            }
        } catch (err) {
            toast.error("Failed to update wishlist")
        } finally {
            setWishlistLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Listing not found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The listing you're looking for doesn't exist.
                    </p>
                    <Link to="/listings" className="btn btn-primary">
                        Browse Listings
                    </Link>
                </div>
            </div>
        )
    }

    const currentImage = listing.images?.[currentImageIndex]
    const imageUrl = getImageUrl(currentImage?.url)

    // Safe access to location coordinates for map
    const getMapCenter = () => {
        if (!listing.location) return null

        if (listing.location.lat && listing.location.lng) {
            return [listing.location.lat, listing.location.lng]
        }

        if (
            listing.location.coordinates?.coordinates &&
            Array.isArray(listing.location.coordinates.coordinates)
        ) {
            // GeoJSON format [longitude, latitude]
            return [
                listing.location.coordinates.coordinates[1],
                listing.location.coordinates.coordinates[0],
            ]
        }

        return null
    }

    const mapCenter = getMapCenter()

    const handleMessageHost = async () => {
        if (!isAuthenticated) {
            toast.error("Please log in to message the host.")
            return navigate("/login")
        }
        if (!listing.host?._id) {
            toast.error("Host information is not available.");
            return;
        }

        try {
            const response = await messagesAPI.startConversation({
                userId: listing.host._id,
                listingId: listing._id,
            })

            if (response.data.success) {
                const conversationId =
                    response.data?.conversation?._id ||
                    response.data?.conversationId
                if (conversationId) {
                    navigate(`/messages/${conversationId}`)
                } else {
                    navigate("/messages")
                }
            } else {
                throw new Error(
                    response.data.message || "Failed to start conversation."
                )
            }
        } catch (err) {
            console.error("Message host error:", err)
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "An unknown error occurred."
            toast.error(errorMessage)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                </div>
            ) : error ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Image Gallery */}
                    <div className="mb-8">
                        {listing.images && listing.images.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <img
                                        src={getImageUrl(listing.images[0].url)}
                                        alt={listing.title}
                                        className="w-full h-[400px] object-cover rounded-lg"
                                        onError={handleImageError}
                                    />
                                </div>
                                {listing.images.slice(1).map((image, index) => (
                                    <div key={index}>
                                        <img
                                            src={getImageUrl(image.url)}
                                            alt={`${listing.title} - Image ${
                                                index + 2
                                            }`}
                                            className="w-full h-[200px] object-cover rounded-lg"
                                            onError={handleImageError}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
                                <p className="text-gray-500">
                                    No images available
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Property Info */}
                            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h1 className="text-3xl font-bold text-gray-900">
                                                {listing.title}
                                            </h1>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={handleWishlist}
                                                    className={`p-2 rounded-full bg-white shadow ${
                                                        wishlisted
                                                            ? "text-red-500"
                                                            : "text-gray-400"
                                                    }`}
                                                    title={
                                                        wishlisted
                                                            ? "Remove from wishlist"
                                                            : "Add to wishlist"
                                                    }
                                                    disabled={wishlistLoading}
                                                >
                                                    <Heart
                                                        className={`w-7 h-7 ${
                                                            wishlisted
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                <span>
                                                    {listing.guests} guests
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Bed className="w-4 h-4 mr-1" />
                                                <span>
                                                    {listing.bedrooms} bedroom
                                                    {listing.bedrooms !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Bath className="w-4 h-4 mr-1" />
                                                <span>
                                                    {listing.bathrooms} bathroom
                                                    {listing.bathrooms !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${listing.price}
                                        </div>
                                        <div className="text-gray-600">
                                            per night
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        {listing.description}
                                    </p>
                                </div>
                            </div>

                            {/* Amenities */}
                            {listing.amenities?.length > 0 && (
                                <div className="bg-white rounded-lg p-6 shadow-sm border">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        What this place offers
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {listing.amenities.map(
                                            (amenity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-3"
                                                >
                                                    {getAmenityIcon(amenity)}
                                                    <span className="text-gray-700 capitalize">
                                                        {amenity.replace(
                                                            "-",
                                                            " "
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* House Rules */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    House Rules
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">
                                            Check-in
                                        </span>
                                        <span className="font-medium">
                                            {listing.rules?.checkIn || "15:00"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">
                                            Check-out
                                        </span>
                                        <span className="font-medium">
                                            {listing.rules?.checkOut ||
                                                "11:00"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">
                                            Minimum stay
                                        </span>
                                        <span className="font-medium">
                                            {listing.rules?.minStay || 1} night
                                            {(listing.rules?.minStay || 1) !==
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">
                                            Maximum stay
                                        </span>
                                        <span className="font-medium">
                                            {listing.rules?.maxStay || 30}{" "}
                                            night
                                            {(listing.rules?.maxStay || 30) !==
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                                {listing.rules?.additionalRules?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Additional Rules
                                        </h4>
                                        <ul className="space-y-1">
                                            {listing.rules.additionalRules.map(
                                                (rule, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-gray-700"
                                                    >
                                                        • {rule}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Where you'll be
                                </h3>
                                <div className="mb-4">
                                    <p className="text-gray-700">
                                        {listing.location?.address},{" "}
                                        {listing.location?.city},{" "}
                                        {listing.location?.state}{" "}
                                        {listing.location?.zipCode}
                                    </p>
                                </div>
                                {mapCenter && (
                                    <ListingMap
                                        listings={[listing]}
                                        center={mapCenter}
                                        zoom={15}
                                    />
                                )}
                            </div>

                            {/* Host Info */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Meet your host
                                </h3>
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">
                                            {listing.host?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "H"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                            {listing.host?.name || "Host"}
                                        </h4>
                                        <p className="text-gray-600 text-sm">
                                            Joined{" "}
                                            {listing.host?.createdAt
                                                ? new Date(
                                                      listing.host.createdAt
                                                  ).getFullYear()
                                                : "Recently"}
                                        </p>
                                        {listing.host?.bio && (
                                            <p className="text-gray-700 mt-2">
                                                {listing.host.bio}
                                            </p>
                                        )}
                                        {isAuthenticated &&
                                            listing.host &&
                                            user?._id !== listing.host._id && (
                                                <button
                                                    className="btn btn-primary mt-4"
                                                    onClick={handleMessageHost}
                                                >
                                                    Message Host
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <div className="lg:col-span-1">
                            <BookingForm listing={listing} />
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={listing.title}
                            className="max-w-full max-h-full object-contain"
                            onError={handleImageError}
                        />
                        {listing.images?.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Reviews
                            </h3>
                            {listing.rating && listing.rating.count > 0 ? (
                               <div className="flex items-center mt-1">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${
                                                    i <
                                                    Math.round(listing.rating.average)
                                                        ? "text-yellow-400 fill-current"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-gray-600">
                                        {listing.rating.average.toFixed(1)} (
                                        {listing.rating.count} reviews)
                                    </span>
                                </div>
                            ) : (
                                <p className="text-gray-600 mt-1">No reviews yet.</p>
                            )}
                        </div>
                        {isAuthenticated &&
                            userBookings.some(
                                b => b.listing?._id === listing._id && b.status === "completed"
                            ) && !(listing.reviews || []).some(r => r.user?._id === user?._id) && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="btn btn-primary"
                                >
                                    Write a Review
                                </button>
                            )}
                    </div>
                    {showReviewForm && (
                        <ReviewForm
                            listingId={listing._id}
                            onClose={() => setShowReviewForm(false)}
                            onSubmit={fetchListing}
                        />
                    )}
                    {listing.reviews && listing.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {listing.reviews.map(review => (
                                <ReviewCard key={review._id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                No reviews for this listing yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ListingDetail
