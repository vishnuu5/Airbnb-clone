import { Link } from "react-router-dom"
import { MapPin, Star, Users, Bed, Bath, Wifi, Car, Heart } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { wishlistAPI } from "../../services/api"
import toast from "react-hot-toast"

const ListingCard = ({ listing, initialWishlisted }) => {
    const {
        _id,
        title,
        description,
        price,
        location,
        images,
        rating,
        guests,
        bedrooms,
        bathrooms,
        amenities,
        propertyType,
    } = listing

    const [imageError, setImageError] = useState(false)
    const [wishlisted, setWishlisted] = useState(initialWishlisted || false)
    const [loading, setLoading] = useState(false)
    const isAuthenticated = Boolean(localStorage.getItem("token"))

    // Optionally, fetch wishlist status on mount if not provided
    useEffect(() => {
        if (initialWishlisted === undefined && isAuthenticated) {
            wishlistAPI.getWishlist().then(res => {
                const ids = (res.data.data || []).map(item => item._id)
                setWishlisted(ids.includes(_id))
            }).catch(() => {})
        }
    }, [initialWishlisted, isAuthenticated, _id])

    // Memoize image URL calculation
    const imageUrl = useMemo(() => {
        if (imageError) return "/placeholder.svg?height=200&width=300"
        
        const mainImage = images?.[0]?.url
        if (!mainImage) return "/placeholder.svg?height=200&width=300"

        // If it's already a full URL (starts with http), use it directly
        if (mainImage.startsWith("http")) return mainImage

        // If it starts with /uploads, prepend the backend URL
        if (mainImage.startsWith("/uploads")) {
            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
            return `${backendUrl}${mainImage}`
        }

        // If it's a relative path, prepend the backend URL
        const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
        return `${backendUrl}/uploads/${mainImage}`
    }, [images, imageError])

    const getAmenityIcon = (amenity) => {
        switch (amenity) {
            case "wifi":
                return <Wifi className="w-4 h-4" />
            case "parking":
                return <Car className="w-4 h-4" />
            default:
                return null
        }
    }

    // Safe access to location data
    const locationText = location ? `${location.city || ""}, ${location.state || ""}` : "Location not specified"
    const hasRating = rating && rating.count > 0

    const handleWishlist = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.error("Please login to use wishlist.")
            return
        }
        setLoading(true)
        try {
            if (wishlisted) {
                await wishlistAPI.removeFromWishlist(_id)
                setWishlisted(false)
                toast.success("Removed from wishlist")
            } else {
                await wishlistAPI.addToWishlist(_id)
                setWishlisted(true)
                toast.success("Added to wishlist")
            }
        } catch (err) {
            toast.error("Failed to update wishlist")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Link to={`/listings/${_id}`} className="block">
            <div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden card-hover">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                        src={imageUrl}
                        alt={title || "Property image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onError={() => setImageError(true)}
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium z-10">
                        {propertyType || "Property"}
                    </div>
                    {isAuthenticated && (
                        <button
                            onClick={handleWishlist}
                            className={`absolute top-2 left-2 p-2 rounded-full z-20 bg-white shadow ${wishlisted ? "text-red-500" : "text-gray-400"}`}
                            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            disabled={loading}
                        >
                            <Heart className={`w-6 h-6 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Location and Rating */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{locationText}</span>
                        </div>
                        {hasRating && (
                            <div className="flex items-center text-sm">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span className="font-medium">{rating.average.toFixed(1)}</span>
                                <span className="text-gray-500 ml-1">({rating.count})</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title || "Untitled Property"}</h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description || "No description available"}</p>

                    {/* Property Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{guests || 0} guests</span>
                        </div>
                        <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>
                                {bedrooms || 0} bed{bedrooms !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span>
                                {bathrooms || 0} bath{bathrooms !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Amenities */}
                    {amenities && amenities.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                            {amenities.slice(0, 3).map((amenity, index) => (
                                <div key={index} className="flex items-center text-gray-500">
                                    {getAmenityIcon(amenity)}
                                    <span className="text-xs ml-1 capitalize">{amenity.replace("-", " ")}</span>
                                </div>
                            ))}
                            {amenities.length > 3 && <span className="text-xs text-gray-500">+{amenities.length - 3} more</span>}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xl font-bold text-gray-900">${price || 0}</span>
                            <span className="text-gray-600 text-sm ml-1">/ night</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ListingCard
