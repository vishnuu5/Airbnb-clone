"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { listingsAPI } from "../services/api"
import ListingCard from "../components/listings/ListingCard"
import SearchFilters from "../components/common/SearchFilters"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Search, Star, TrendingUp } from "lucide-react"

const Home = () => {
    const [featuredListings, setFeaturedListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // Memoize the featured listings to prevent unnecessary re-renders
    const memoizedFeaturedListings = useMemo(() => featuredListings, [featuredListings])

    useEffect(() => {
        const fetchFeaturedListings = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await listingsAPI.getListings({
                    featured: true,
                    limit: 6,
                    sortBy: "rating",
                })
                console.log('Featured listings response:', response);
                
                if (response.success) {
                    const listings = response.data;
                    if (!Array.isArray(listings)) {
                        throw new Error('Invalid listings data received');
                    }
                    setFeaturedListings(listings);
                } else {
                    throw new Error(response.message || 'Failed to fetch featured listings')
                }
            } catch (error) {
                console.error("Error fetching featured listings:", error)
                setError(error.message || "Failed to load featured listings")
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedListings()
    }, [])

    const handleSearch = (filters) => {
        const searchParams = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "" && value !== 0) {
                if (key === "amenities" && Array.isArray(value)) {
                    if (value.length > 0) {
                        searchParams.append(key, value.join(","))
                    }
                } else if (key === "checkIn" || key === "checkOut") {
                    if (value instanceof Date) {
                        searchParams.append(key, value.toISOString().split("T")[0])
                    }
                } else {
                    searchParams.append(key, value.toString())
                }
            }
        })

        navigate(`/listings?${searchParams.toString()}`)
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Perfect Stay</h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">Discover unique accommodations around the world</p>
                        <Link
                            to="/listings"
                            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Start Exploring
                        </Link>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Search & Filter</h2>
                        <p className="text-gray-600">Find exactly what you're looking for with our advanced search</p>
                    </div>
                    <SearchFilters onFiltersChange={handleSearch} />
                </div>
            </section>

            {/* Featured Listings */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Stays</h2>
                            <p className="text-gray-600">Handpicked properties with exceptional ratings</p>
                        </div>
                        <Link to="/listings" className="text-blue-600 hover:text-blue-700 font-medium">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-card animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {memoizedFeaturedListings.map((listing) => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StayFinder?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We make it easy to find and book the perfect accommodation for your next trip
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Search</h3>
                            <p className="text-gray-600">Advanced filters help you find exactly what you're looking for</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Reviews</h3>
                            <p className="text-gray-600">Real reviews from real guests to help you make informed decisions</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
                            <p className="text-gray-600">Competitive pricing with no hidden fees or booking charges</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of travelers who trust StayFinder for their accommodations
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/listings"
                            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Browse Listings
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Become a Host
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
