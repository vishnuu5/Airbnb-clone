"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { usersAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Eye } from "lucide-react"
import toast from "react-hot-toast"

const AdminUsers = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])

    useEffect(() => {
        if (user) {
            fetchUsers()
        }
    }, [user])

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAllUsers()
            setUsers(response.data.data || [])
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (imageUrl) => {
        try {
            if (!imageUrl) return null;
            
            // If it's already a full URL, return it
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                return imageUrl;
            }
            
            // If it's a relative path, prepend the API URL
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            return `${apiUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
        } catch (error) {
            console.error('Error processing image URL:', error);
            return null;
        }
    };

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
                    <p className="text-gray-600 mt-1">Manage platform users</p>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6">
                        {users.length > 0 ? (
                            <div className="space-y-4">
                                {users.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-primary-100 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={getImageUrl(user.avatar)}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `
                                                                <span class="text-primary-600 font-semibold text-xl">
                                                                    ${user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            `;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-primary-600 font-semibold text-xl">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                                <p className="text-xs text-gray-500">Role: {user.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <Link
                                                to={`/admin/users/${user._id}`}
                                                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">No users found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminUsers 