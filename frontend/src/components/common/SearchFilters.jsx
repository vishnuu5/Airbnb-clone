"use client"

import { useState } from "react"
import { Search, MapPin, Calendar, Users, DollarSign, Filter, X } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from "react-router-dom"

// Custom styles for DatePicker
const customDatePickerStyles = {
    width: "100%",
    paddingLeft: "2.5rem",
    paddingRight: "1rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "#374151",
    backgroundColor: "white",
    outline: "none",
    transition: "all 0.2s",
}

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const navigate = useNavigate()
    const [filters, setFilters] = useState({
        search: "",
        city: "",
        checkIn: null,
        checkOut: null,
        guests: 1,
        minPrice: "",
        maxPrice: "",
        propertyType: "",
        roomType: "",
        amenities: [],
        ...initialFilters,
    })

    const [showAdvanced, setShowAdvanced] = useState(false)

    const propertyTypes = [
        { value: "", label: "Any Type" },
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "condo", label: "Condo" },
        { value: "villa", label: "Villa" },
        { value: "cabin", label: "Cabin" },
        { value: "other", label: "Other" },
    ]

    const roomTypes = [
        { value: "", label: "Any Room" },
        { value: "entire-place", label: "Entire Place" },
        { value: "private-room", label: "Private Room" },
        { value: "shared-room", label: "Shared Room" },
    ]

    const amenitiesList = [
        "wifi",
        "kitchen",
        "parking",
        "pool",
        "gym",
        "spa",
        "balcony",
        "garden",
        "fireplace",
        "tv",
        "washer",
        "dryer",
        "ac",
        "heating",
    ]

    const handleInputChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }))
    }

    const handleAmenityToggle = (amenity) => {
        setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }))
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const queryParams = new URLSearchParams({
            location: filters.city || "",
            checkIn: filters.checkIn ? filters.checkIn.toISOString() : "",
            checkOut: filters.checkOut ? filters.checkOut.toISOString() : "",
            guests: filters.guests
        })
        navigate(`/listings?${queryParams.toString()}`)
    }

    const clearFilters = () => {
        setFilters({
            search: "",
            city: "",
            checkIn: null,
            checkOut: null,
            guests: 1,
            minPrice: "",
            maxPrice: "",
            propertyType: "",
            roomType: "",
            amenities: [],
        })
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <form onSubmit={handleSearch}>
                {/* Basic Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search destinations..."
                            value={filters.search}
                            onChange={(e) => handleInputChange("search", e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Location */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="City"
                            value={filters.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Check-in Date */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        <DatePicker
                            selected={filters.checkIn}
                            onChange={(date) => handleInputChange("checkIn", date)}
                            placeholderText="Check-in"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            minDate={new Date()}
                            dateFormat="MMM d, yyyy"
                            wrapperClassName="w-full"
                            popperClassName="z-50"
                            popperPlacement="bottom-start"
                            popperModifiers={[
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, 8]
                                    }
                                }
                            ]}
                        />
                    </div>

                    {/* Check-out Date */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        <DatePicker
                            selected={filters.checkOut}
                            onChange={(date) => handleInputChange("checkOut", date)}
                            placeholderText="Check-out"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            minDate={filters.checkIn || new Date()}
                            dateFormat="MMM d, yyyy"
                            wrapperClassName="w-full"
                            popperClassName="z-50"
                            popperPlacement="bottom-start"
                            popperModifiers={[
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, 8]
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>

                {/* Guests and Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filters.guests}
                                onChange={(e) => handleInputChange("guests", Number.parseInt(e.target.value))}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <option key={num} value={num}>
                                        {num} Guest{num > 1 ? "s" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Advanced Filters</span>
                        </button>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Clear</span>
                        </button>

                        <button
                            type="submit"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="border-t pt-4 space-y-4 mt-4">
                        {/* Price Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={filters.minPrice}
                                    onChange={(e) => handleInputChange("minPrice", e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Property and Room Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleInputChange("propertyType", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {propertyTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.roomType}
                                onChange={(e) => handleInputChange("roomType", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {roomTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {amenitiesList.map((amenity) => (
                                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.amenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{amenity.replace("-", " ")}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}

export default SearchFilters
