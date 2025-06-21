"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { usersAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

const AdminUserDetails = () => {
    const { user } = useAuth()
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null)

    useEffect(() => {
        if (user) {
            fetchUserDetails()
        }
    }, [user, id])

    const fetchUserDetails = async () => {
        if (!id) {
            console.error("No user ID provided");
            toast.error("Invalid user ID");
            navigate("/admin/dashboard");
            return;
        }

        console.log("Fetching user details for ID:", id);

        try {
            const response = await usersAPI.getUser(id)
            console.log("User API response:", response);
            
            if (response.data.success) {
                setUserData(response.data.data)
            } else {
                console.error("API returned error:", response.data.message);
                toast.error(response.data.message || "Failed to load user details")
                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.error("Error fetching user details:", error)
            console.error("Error response:", error.response?.data)
            toast.error(error.response?.data?.message || "Failed to load user details")
            navigate("/admin/dashboard");
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
    };

    const renderUserAvatar = (user) => {
        if (!user) return null;

        if (user.avatar) {
            return (
                <img
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = renderInitials(user.name);
                    }}
                />
            );
        }

        return renderInitials(user.name);
    };

    const renderInitials = (name) => {
        return (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
                <span className="text-primary-600 font-semibold text-4xl">
                    {name.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">User not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
                </div>

                {/* User Details */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        <div className="flex items-start space-x-6">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-primary-100">
                                {userData.avatar ? (
                                    <img
                                        src={getImageUrl(userData.avatar)}
                                        alt={userData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <span class="text-primary-600 font-semibold text-4xl">
                                                        ${userData.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold text-4xl">
                                            {userData.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                                <p className="text-gray-600">{userData.email}</p>
                                <p className="text-gray-500 mt-2">Role: {userData.role}</p>
                                <p className="text-gray-500">Joined: {new Date(userData.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Additional User Information */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                                <p className="text-gray-600">Phone: {userData.phone || "Not provided"}</p>
                                <p className="text-gray-600">Address: {userData.address || "Not provided"}</p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
                                <p className="text-gray-600">Email Verified: {userData.isEmailVerified ? "Yes" : "No"}</p>
                                <p className="text-gray-600">Account Status: {userData.isActive ? "Active" : "Inactive"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminUserDetails 