import { Link } from "react-router-dom"
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react"

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">StayFinder</span>
                        </Link>
                        <p className="text-gray-300 text-sm">
                            Discover and book unique accommodations around the world. Your perfect stay is just a click away.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/listings" className="text-gray-300 hover:text-white transition-colors">
                                    Explore Listings
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                                    Become a Host
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Trust & Safety
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Cancellation Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-300">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">support@stayfinder.com</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">+91 5551234567</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Mumbai, MH</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                       <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} StayFinder. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Cookie Policy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Accessibility
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

