"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { authAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { User, Mail, Phone, Edit, Save, X } from "lucide-react"
import LoadingSpinner from "../components/common/LoadingSpinner"

const Profile = () => {
    const { user, updateUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile
    } = useForm({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
        },
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        watch,
        reset: resetPassword
    } = useForm()

    const password = watch("newPassword")

    const onProfileSubmit = async (data) => {
        setLoading(true)
        try {
            const response = await authAPI.updateProfile(data)
            console.log("Profile update response:", response)
            
            if (response.data?.success) {
                // Update user data with the response
                updateUser(response.data.user)
                setEditing(false)
                toast.success("Profile updated successfully")
            } else {
                throw new Error(response.data?.message || "Failed to update profile")
            }
        } catch (error) {
            console.error("Profile update error:", error)
            toast.error(error.response?.data?.message || error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const onPasswordSubmit = async (data) => {
        try {
            await authAPI.changePassword(data)
            toast.success("Password changed successfully")
            setIsChangingPassword(false)
            resetPassword()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password")
        }
    }

    const handleEditClick = () => {
        setEditing(true)
        resetProfile({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
        })
    }

    const handleCancelEdit = () => {
        setEditing(false)
        resetProfile({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
        })
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    {!editing && (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                {...registerProfile("name", { required: "Name is required" })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {profileErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                {...registerProfile("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {profileErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                {...registerProfile("phone")}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                {...registerProfile("bio")}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : "Save Changes"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                <p className="mt-1 text-sm text-gray-900">{user.phone || "Not provided"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                <p className="mt-1 text-sm text-gray-900">{user.bio || "No bio provided"}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                    {isChangingPassword ? (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    {...registerPassword("currentPassword", { required: "Current password is required" })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    {...registerPassword("newPassword", {
                                        required: "New password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    {...registerPassword("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: value => value === password || "Passwords do not match"
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        resetPassword()
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="text-primary-600 hover:text-primary-700"
                        >
                            Change Password
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
