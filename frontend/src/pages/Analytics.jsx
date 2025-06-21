"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Star } from "lucide-react"

const Analytics = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState("30d")

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getDashboardStats({ period: dateRange })
            setStats(response.data.data)
        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setLoading(false)
        }
    }

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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track your hosting performance and insights</p>
                    </div>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input w-auto">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Unique Guests</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.uniqueGuests || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and detailed analytics would go here */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-64 flex items-center justify-center text-gray-500">Chart component would go here</div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Booking Rate</h3>
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-64 flex items-center justify-center text-gray-500">Chart component would go here</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
