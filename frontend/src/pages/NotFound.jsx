"use client"

import { Link } from "react-router-dom"
import { Home, Search, ArrowLeft } from "lucide-react"

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
                    <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                    <p className="text-lg text-gray-600 mb-2">Oops! The page you're looking for doesn't exist.</p>
                    <p className="text-gray-500">It might have been moved, deleted, or you entered the wrong URL.</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Go Home
                    </Link>

                    <Link
                        to="/listings"
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Browse Listings
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center w-full px-6 py-3 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our{" "}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                            support team
                        </a>{" "}
                        or visit our{" "}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                            help center
                        </a>
                        .
                    </p>
                </div>

                {/* Popular Links */}
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Popular Pages</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <Link to="/listings" className="text-primary-600 hover:text-primary-700">
                            Browse Properties
                        </Link>
                        <Link to="/register" className="text-primary-600 hover:text-primary-700">
                            Become a Host
                        </Link>
                        <Link to="/login" className="text-primary-600 hover:text-primary-700">
                            Sign In
                        </Link>
                        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound
