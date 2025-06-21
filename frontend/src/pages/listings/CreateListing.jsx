import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { listingsAPI } from "../../api/listings"

const CreateListing = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const response = await listingsAPI.createListing(data)
            toast.success("Listing created successfully!")
            navigate(`/listings/${response.data.data._id}`)
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating listing")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-card p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                                    Property Type
                                </label>
                                <select
                                    {...register("propertyType", {
                                        required: "Property type is required",
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="">Select type</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="condo">Condo</option>
                                </select>
                                {errors.propertyType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            {...register("description", {
                                required: "Description is required",
                                minLength: {
                                    value: 50,
                                    message: "Description must be at least 50 characters",
                                },
                            })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    {...register("city", {
                                        required: "City is required",
                                    })}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <input
                                    {...register("state", {
                                        required: "State is required",
                                    })}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.state && (
                                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price per Night ($)
                                </label>
                                <input
                                    {...register("price", {
                                        required: "Price is required",
                                        min: {
                                            value: 1,
                                            message: "Price must be greater than 0",
                                        },
                                    })}
                                    type="number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                                    Bedrooms
                                </label>
                                <input
                                    {...register("bedrooms", {
                                        required: "Number of bedrooms is required",
                                        min: {
                                            value: 1,
                                            message: "Must have at least 1 bedroom",
                                        },
                                    })}
                                    type="number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.bedrooms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                                    Bathrooms
                                </label>
                                <input
                                    {...register("bathrooms", {
                                        required: "Number of bathrooms is required",
                                        min: {
                                            value: 1,
                                            message: "Must have at least 1 bathroom",
                                        },
                                    })}
                                    type="number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.bathrooms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {["wifi", "parking", "pool", "kitchen", "washer", "dryer", "ac", "tv"].map((amenity) => (
                                <div key={amenity} className="flex items-center">
                                    <input
                                        {...register("amenities")}
                                        type="checkbox"
                                        value={amenity}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900 capitalize">{amenity}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Creating..." : "Create Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateListing 