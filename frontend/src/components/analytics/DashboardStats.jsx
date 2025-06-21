"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "../../services/api"
import LoadingSpinner from "../common/LoadingSpinner"
import { Home, Calendar, DollarSign, Star, Clock, CheckCircle, XCircle, Heart } from "lucide-react"
import toast from "react-hot-toast"

const DashboardStats = ({ userRole }) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await analyticsAPI.getDashboardStats()
            setStats(response.data.data)
        } catch (error) {
            console.error("Fetch stats error:", error)
            toast.error("Failed to load dashboard statistics")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load statistics</p>
            </div>
        )
    }

    const hostStats = [
        {
            title: "Total Listings",
            value: stats.totalListings,
            icon: Home,
            color: "bg-blue-500",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: Calendar,
            color: "bg-green-500",
        },
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: "bg-purple-500",
        },
        {
            title: "Average Rating",
            value: stats.averageRating?.toFixed(1) || "0.0",
            icon: Star,
            color: "bg-yellow-500",
        },
    ]

    const guestStats = [
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: Calendar,
            color: "bg-blue-500",
        },
        {
            title: "Total Spent",
            value: `$${stats.totalSpent?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: "bg-green-500",
        },
        {
            title: "Reviews Written",
            value: stats.totalReviews,
            icon: Star,
            color: "bg-purple-500",
        },
        {
            title: "Favorite Listings",
            value: stats.favoriteListings,
            icon: Heart,
            color: "bg-red-500",
        },
    ]

    const currentStats = userRole === "host" ? hostStats : guestStats

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                                <span className="text-sm text-gray-600">Pending</span>
                            </div>
                            <span className="font-medium">{stats.pendingBookings || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm text-gray-600">Confirmed</span>
                            </div>
                            <span className="font-medium">{stats.confirmedBookings || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                                <span className="text-sm text-gray-600">Completed</span>
                            </div>
                            <span className="font-medium">{stats.completedBookings || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-sm text-gray-600">Cancelled</span>
                            </div>
                            <span className="font-medium">{stats.cancelledBookings || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                    {stats.recentBookings && stats.recentBookings.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentBookings.slice(0, 5).map((booking) => (
                                <div
                                    key={booking._id}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={
                                                booking.listing?.images?.[0]?.url?.startsWith("/uploads")
                                                    ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${booking.listing.images[0].url}`
                                                    : booking.listing?.images?.[0]?.url || "/placeholder.svg?height=40&width=40"
                                            }
                                            alt={booking.listing?.title}
                                            className="w-10 h-10 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = "/placeholder.svg?height=40&width=40"
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {booking.listing?.title || "Unknown Property"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {userRole === "host" ? booking.guest?.name : booking.host?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">${booking.totalPrice}</p>
                                        <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent bookings</p>
                    )}
                </div>
            </div>

            {/* Monthly Revenue Chart (Host Only) */}
            {userRole === "host" && stats.monthlyRevenue && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {stats.monthlyRevenue.map((month, index) => {
                            const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue))
                            const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 200 : 0

                            return (
                                <div key={index} className="flex flex-col items-center">
                                    <div
                                        className="bg-primary-500 rounded-t-md w-8 transition-all duration-300 hover:bg-primary-600"
                                        style={{ height: `${height}px` }}
                                        title={`$${month.revenue}`}
                                    ></div>
                                    <span className="text-xs text-gray-500 mt-2">
                                        {month._id.month}/{month._id.year}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardStats
