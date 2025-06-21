"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Home, Search, User, Menu, X, Plus, Calendar, Settings, LogOut, Heart, MessageCircle } from "lucide-react"
import LoadingSpinner from "../common/LoadingSpinner"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { user, isAuthenticated, loading, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        navigate("/")
    }

    const isActive = (path) => location.pathname === path

    if (loading) {
        return (
            <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="w-8 h-8">
                            <LoadingSpinner size="sm" />
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    const renderAuthenticatedMenu = () => (
        <>
            {/* Host specific menu items */}
            {user?.role === "host" && (
                <Link
                    to="/create-listing"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Listing</span>
                </Link>
            )}

            {/* Common menu items for all authenticated users */}
            <Link
                to="/bookings"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/bookings")
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                }`}
            >
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
            </Link>
            <Link
                to="/wishlist"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/wishlist")
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                }`}
            >
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
            </Link>
            <Link
                to="/messages"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/messages")
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                }`}
            >
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
            </Link>
            {/* User Menu */}
            <div className="relative">
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Link>
                        <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    )

    const renderMobileAuthenticatedMenu = () => (
        <>
            {/* Host specific menu items */}
            {user?.role === "host" && (
                <Link
                    to="/create-listing"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Listing</span>
                </Link>
            )}

            {/* Common menu items for all authenticated users */}
            <Link
                to="/bookings"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
            >
                <Calendar className="w-5 h-5" />
                <span>My Bookings</span>
            </Link>
            <Link
                to="/wishlist"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
            >
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
            </Link>
            <Link
                to="/messages"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
            >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
            </Link>
            <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
            >
                <User className="w-5 h-5" />
                <span>Profile</span>
            </Link>
            <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
            >
                <Settings className="w-5 h-5" />
                <span>Dashboard</span>
            </Link>
            <button
                onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 w-full text-left"
            >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </>
    )

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">StayFinder</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/listings"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive("/listings")
                                    ? "text-primary-600 bg-primary-50"
                                    : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                            }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Explore</span>
                        </Link>

                        {isAuthenticated && user ? (
                            renderAuthenticatedMenu()
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col space-y-2">
                            <Link
                                to="/listings"
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <Search className="w-5 h-5" />
                                <span>Explore</span>
                            </Link>

                            {isAuthenticated && user ? (
                                renderMobileAuthenticatedMenu()
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
