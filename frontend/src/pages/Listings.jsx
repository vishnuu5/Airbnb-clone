"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { listingsAPI } from "../services/api"
import ListingCard from "../components/listings/ListingCard"
import ListingMap from "../components/listings/ListingMap"
import SearchFilters from "../components/common/SearchFilters"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Grid, Map, Filter } from "lucide-react"

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState("grid") // 'grid' or 'map'
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 12
    })
    const [currentPage, setCurrentPage] = useState(1)

    // Parse initial filters from URL
    const getInitialFilters = () => {
        const filters = {}
        for (const [key, value] of searchParams.entries()) {
            if (key === "amenities") {
                filters[key] = value.split(",")
            } else if (key === "checkIn" || key === "checkOut") {
                filters[key] = new Date(value)
            } else if (key === "guests" || key === "minPrice" || key === "maxPrice") {
                filters[key] = Number.parseInt(value) || ""
            } else {
                filters[key] = value
            }
        }
        return filters
    }

    const [filters, setFilters] = useState(getInitialFilters())

    useEffect(() => {
        fetchListings()
    }, [filters, currentPage])

    const fetchListings = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = {
                page: currentPage,
                limit: 12,
                ...filters,
                checkIn: filters.checkIn ? new Date(filters.checkIn).toISOString() : undefined,
                checkOut: filters.checkOut ? new Date(filters.checkOut).toISOString() : undefined,
                amenities: filters.amenities?.join(","),
            }

            const response = await listingsAPI.getListings(params)
            
            if (response.success) {
                const listings = response.data.listings
                const paginationData = response.data.pagination
                
                setListings(listings)
                setPagination({
                    currentPage: paginationData.currentPage,
                    totalPages: paginationData.totalPages,
                    totalItems: paginationData.totalItems,
                    limit: paginationData.limit
                })
            } else {
                throw new Error(response.message || "Failed to fetch listings")
            }
        } catch (error) {
            console.error("Error fetching listings:", error)
            setError(error.message || "Failed to fetch listings")
            setListings([])
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                limit: 12
            })
        } finally {
            setLoading(false)
        }
    }

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)

        // Update URL params
        const params = new URLSearchParams()
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== "" && value !== 0) {
                if (key === "amenities" && Array.isArray(value)) {
                    if (value.length > 0) {
                        params.append(key, value.join(","))
                    }
                } else if (key === "checkIn" || key === "checkOut") {
                    if (value instanceof Date) {
                        params.append(key, value.toISOString().split("T")[0])
                    }
                } else {
                    params.append(key, value.toString())
                }
            }
        })
        setSearchParams(params)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleMarkerClick = (listing) => {
        // Scroll to listing card or highlight it
        const element = document.getElementById(`listing-${listing._id}`)
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
            element.classList.add("ring-2", "ring-primary-500")
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-primary-500")
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Explore Stays</h1>
                        <p className="text-gray-600 mt-1">
                            {loading ? "Loading..." : 
                             pagination.total > 0 ? `${pagination.total} properties found` : 
                             "Discover amazing places to stay"}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "grid" 
                                    ? "bg-primary-600 text-white" 
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                            <span>Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "map" 
                                    ? "bg-primary-600 text-white" 
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <Map className="w-4 h-4" />
                            <span>Map</span>
                        </button>
                    </div>
                </div>

                {/* Search Filters */}
                <div className="mb-8">
                    <SearchFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={fetchListings}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" ? (
                            <>
                                {/* Grid View */}
                                {listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                        {listings.map((listing) => (
                                            <div key={listing._id} id={`listing-${listing._id}`}>
                                                <ListingCard listing={listing} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                                        <p className="text-gray-600">Try adjusting your search filters to find more results.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Map View */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                                        {listings.map((listing) => (
                                            <div key={listing._id} id={`listing-${listing._id}`}>
                                                <ListingCard listing={listing} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="sticky top-4 h-[calc(100vh-200px)]">
                                        <ListingMap listings={listings} onMarkerClick={handleMarkerClick} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {currentPage} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                    className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Listings
