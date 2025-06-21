"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { listingsAPI, uploadAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { MapPin, DollarSign, Upload, X, Plus, Minus } from "lucide-react"
import toast from "react-hot-toast"

const CreateListing = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: {
            address: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            coordinates: {
                lat: 40.7128,
                lng: -74.006,
            },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 1,
        bedrooms: 1,
        bathrooms: 1,
        amenities: [],
        images: [],
        rules: {
            checkIn: "15:00",
            checkOut: "11:00",
            minStay: 1,
            maxStay: 30,
            additionalRules: [],
        },
    })

    const [errors, setErrors] = useState({})
    const [newRule, setNewRule] = useState("")

    const propertyTypes = [
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "condo", label: "Condo" },
        { value: "villa", label: "Villa" },
        { value: "cabin", label: "Cabin" },
        { value: "other", label: "Other" },
    ]

    const roomTypes = [
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
        "workspace",
        "breakfast",
        "pets-allowed",
        "smoking-allowed",
    ]

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".")
            if (parent === "location" && child === "coordinates") {
                const [coordField, coordValue] = value.split(":")
                setFormData((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: {
                            ...prev.location.coordinates,
                            [coordField]: Number.parseFloat(coordValue),
                        },
                    },
                }))
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                    },
                }))
            }
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }))
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleAmenityToggle = (amenity) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }))
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploadingImages(true)
        try {
                const formData = new FormData()
            files.forEach(file => {
                formData.append("images", file)
            })
            const response = await uploadAPI.uploadImages(formData)
            const uploadedImages = response.data.data

            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...uploadedImages.map((img) => ({ url: img.url, caption: "" }))],
            }))
            toast.success("Images uploaded successfully!")
        } catch (error) {
            console.error("Image upload error:", error)
            toast.error("Failed to upload images")
        } finally {
            setUploadingImages(false)
        }
    }

    const handleRemoveImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }))
    }

    const addRule = () => {
        if (newRule.trim()) {
            setFormData((prev) => ({
                ...prev,
                rules: {
                    ...prev.rules,
                    additionalRules: [...prev.rules.additionalRules, newRule.trim()],
                },
            }))
            setNewRule("")
        }
    }

    const removeRule = (index) => {
        setFormData((prev) => ({
            ...prev,
            rules: {
                ...prev.rules,
                additionalRules: prev.rules.additionalRules.filter((_, i) => i !== index),
            },
        }))
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            // Title validation
            if (!formData.title || formData.title.trim().length < 5) {
                newErrors.title = "Title must be at least 5 characters"
            } else if (formData.title.trim().length > 100) {
                newErrors.title = "Title cannot exceed 100 characters"
            }

            // Description validation
            if (!formData.description || formData.description.trim().length < 20) {
                newErrors.description = "Description must be at least 20 characters"
            } else if (formData.description.trim().length > 2000) {
                newErrors.description = "Description cannot exceed 2000 characters"
            }

            // Price validation
            if (!formData.price || formData.price <= 0) {
                newErrors.price = "Valid price is required"
            }
        }

        if (step === 2) {
            if (!formData.location.address.trim()) newErrors["location.address"] = "Address is required"
            if (!formData.location.city.trim()) newErrors["location.city"] = "City is required"
            if (!formData.location.state.trim()) newErrors["location.state"] = "State is required"
            if (!formData.location.country.trim()) newErrors["location.country"] = "Country is required"
        }

        if (step === 4) {
            if (formData.images.length === 0) newErrors.images = "At least one image is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 5))
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep(currentStep)) return

        try {
            setLoading(true)
            setErrors({})

            // Format the data according to the backend requirements
            const { lat, lng } = formData.location.coordinates
            const listingData = {
                ...formData,
                location: {
                    ...formData.location,
                    lat,
                    lng,
                    coordinates: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }
            }

            const response = await listingsAPI.createListing(listingData)
            if (response.data.success) {
                toast.success("Listing created successfully!")
                navigate(`/listings/${response.data.data._id}`)
            } else {
                throw new Error(response.data.message || "Failed to create listing")
            }
        } catch (error) {
            console.error("Create listing error:", error)
            const message = error.response?.data?.message || "Failed to create listing"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { number: 1, title: "Basic Info", description: "Title, description, and price" },
        { number: 2, title: "Location", description: "Where is your property located?" },
        { number: 3, title: "Property Details", description: "Type, capacity, and amenities" },
        { number: 4, title: "Photos", description: "Upload photos of your property" },
        { number: 5, title: "House Rules", description: "Set your house rules and policies" },
    ]

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
                    <p className="text-gray-600 mt-1">Share your space with travelers around the world</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                                            ? "bg-primary-600 border-primary-600 text-white"
                                            : "border-gray-300 text-gray-500"
                                        }`}
                                >
                                    {step.number}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? "bg-primary-600" : "bg-gray-300"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
                        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Title <span className="text-red-500">*</span>
                                        <span className="text-sm text-gray-500 ml-2">(5-100 characters)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                            errors.title ? "border-red-500" : ""
                                        }`}
                                        minLength={5}
                                        maxLength={100}
                                        required
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm text-gray-500">
                                            {formData.title.length}/100 characters
                                        </span>
                                        {errors.title && (
                                            <span className="text-red-500 text-sm">{errors.title}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description * (20-2000 characters)
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        className={`input resize-none ${errors.description ? "border-red-500" : ""}`}
                                        placeholder="Describe your space, what makes it special, and what guests can expect..."
                                        minLength={20}
                                        maxLength={2000}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                        <p className="text-sm text-gray-500">
                                            {formData.description.length}/2000 characters
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                        Price per night (USD) *
                                    </label>
                                        <input
                                            id="price"
                                            type="number"
                                            min="1"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange("price", Number.parseInt(e.target.value))}
                                        className={`input ${errors.price ? "border-red-500" : ""}`}
                                            placeholder="100"
                                        />
                                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            id="address"
                                            type="text"
                                            value={formData.location.address}
                                            onChange={(e) => handleInputChange("location.address", e.target.value)}
                                            className={`input pl-10 ${errors["location.address"] ? "border-red-500" : ""}`}
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    {errors["location.address"] && (
                                        <p className="mt-1 text-sm text-red-600">{errors["location.address"]}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={formData.location.city}
                                            onChange={(e) => handleInputChange("location.city", e.target.value)}
                                            className={`input ${errors["location.city"] ? "border-red-500" : ""}`}
                                            placeholder="New York"
                                        />
                                        {errors["location.city"] && <p className="mt-1 text-sm text-red-600">{errors["location.city"]}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                            State/Province *
                                        </label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={formData.location.state}
                                            onChange={(e) => handleInputChange("location.state", e.target.value)}
                                            className={`input ${errors["location.state"] ? "border-red-500" : ""}`}
                                            placeholder="NY"
                                        />
                                        {errors["location.state"] && (
                                            <p className="mt-1 text-sm text-red-600">{errors["location.state"]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                            Country *
                                        </label>
                                        <input
                                            id="country"
                                            type="text"
                                            value={formData.location.country}
                                            onChange={(e) => handleInputChange("location.country", e.target.value)}
                                            className={`input ${errors["location.country"] ? "border-red-500" : ""}`}
                                            placeholder="United States"
                                        />
                                        {errors["location.country"] && (
                                            <p className="mt-1 text-sm text-red-600">{errors["location.country"]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP/Postal Code
                                        </label>
                                        <input
                                            id="zipCode"
                                            type="text"
                                            value={formData.location.zipCode}
                                            onChange={(e) => handleInputChange("location.zipCode", e.target.value)}
                                            className="input"
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            id="lat"
                                            type="number"
                                            step="any"
                                            value={formData.location.coordinates.lat}
                                            onChange={(e) => handleInputChange("location.coordinates", `lat:${e.target.value}`)}
                                            className="input"
                                            placeholder="40.7128"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            id="lng"
                                            type="number"
                                            step="any"
                                            value={formData.location.coordinates.lng}
                                            onChange={(e) => handleInputChange("location.coordinates", `lng:${e.target.value}`)}
                                            className="input"
                                            placeholder="-74.0060"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Property Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                                            Property Type
                                        </label>
                                        <select
                                            id="propertyType"
                                            value={formData.propertyType}
                                            onChange={(e) => handleInputChange("propertyType", e.target.value)}
                                            className="input"
                                        >
                                            {propertyTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Type
                                        </label>
                                        <select
                                            id="roomType"
                                            value={formData.roomType}
                                            onChange={(e) => handleInputChange("roomType", e.target.value)}
                                            className="input"
                                        >
                                            {roomTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("guests", Math.max(1, formData.guests - 1))}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-medium w-8 text-center">{formData.guests}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("guests", formData.guests + 1)}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("bedrooms", Math.max(0, formData.bedrooms - 1))}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-medium w-8 text-center">{formData.bedrooms}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("bedrooms", formData.bedrooms + 1)}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("bathrooms", Math.max(0, formData.bathrooms - 1))}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-medium w-8 text-center">{formData.bathrooms}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange("bathrooms", formData.bathrooms + 1)}
                                                className="p-2 border rounded-md hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {amenitiesList.map((amenity) => (
                                            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.amenities.includes(amenity)}
                                                    onChange={() => handleAmenityToggle(amenity)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">{amenity.replace("-", " ")}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Photos */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Property Photos *</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <div className="space-y-2">
                                            <p className="text-lg font-medium text-gray-900">Upload your photos</p>
                                            <p className="text-gray-600">Choose photos that showcase your space</p>
                                        </div>
                                        <div className="mt-4">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    disabled={uploadingImages}
                                                />
                                                <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                                                    {uploadingImages ? (
                                                        <>
                                                            <LoadingSpinner size="sm" className="mr-2" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Choose Files
                                                        </>
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                                </div>

                                {formData.images.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {formData.images.map((image, index) => {
                                                const imageUrl = image?.url || "/placeholder.svg?height=128&width=128"
                                                const fullUrl = imageUrl.startsWith("/uploads")
                                                    ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${imageUrl}`
                                                    : imageUrl

                                                return (
                                                <div key={index} className="relative group">
                                                    <img
                                                            src={fullUrl}
                                                        alt={`Property ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.target.src = "/placeholder.svg?height=128&width=128"
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: House Rules */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                                            Check-in Time
                                        </label>
                                        <input
                                            id="checkIn"
                                            type="time"
                                            value={formData.rules.checkIn}
                                            onChange={(e) => handleInputChange("rules.checkIn", e.target.value)}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                                            Check-out Time
                                        </label>
                                        <input
                                            id="checkOut"
                                            type="time"
                                            value={formData.rules.checkOut}
                                            onChange={(e) => handleInputChange("rules.checkOut", e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="minStay" className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Stay (nights)
                                        </label>
                                        <input
                                            id="minStay"
                                            type="number"
                                            min="1"
                                            value={formData.rules.minStay}
                                            onChange={(e) => handleInputChange("rules.minStay", Number.parseInt(e.target.value))}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="maxStay" className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Stay (nights)
                                        </label>
                                        <input
                                            id="maxStay"
                                            type="number"
                                            min="1"
                                            value={formData.rules.maxStay}
                                            onChange={(e) => handleInputChange("rules.maxStay", Number.parseInt(e.target.value))}
                                            className="input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional House Rules</label>
                                    <div className="flex space-x-2 mb-3">
                                        <input
                                            type="text"
                                            value={newRule}
                                            onChange={(e) => setNewRule(e.target.value)}
                                            placeholder="Add a house rule..."
                                            className="input flex-1"
                                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addRule}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {formData.rules.additionalRules.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.rules.additionalRules.map((rule, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <span className="text-sm text-gray-700">{rule}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRule(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Creating...
                                        </div>
                                    ) : (
                                        "Create Listing"
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateListing
