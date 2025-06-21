import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import HostRoute from "./components/auth/HostRoute"
import AdminRoute from "./components/auth/AdminRoute"

// Pages
import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/Register"
import VerifyOTP from "./pages/VerifyOTP"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import ListingDetail from "./pages/ListingDetail"
import CreateListing from "./pages/CreateListing"
import EditListing from "./pages/EditListing"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Listings from "./pages/Listings"
import Dashboard from "./pages/Dashboard"
import Bookings from "./pages/Bookings"
import BookingDetail from "./pages/BookingDetail"
import Payment from "./pages/Payment"
import Wishlist from "./pages/Wishlist"
import Messages from "./pages/Messages"
import Reviews from "./pages/Reviews"
import Analytics from "./pages/Analytics"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminUserDetails from "./pages/admin/AdminUserDetails"
import AdminBookings from "./pages/admin/AdminBookings"
import AdminBookingDetails from "./pages/admin/AdminBookingDetails"
import AdminDashboard from "./pages/dashboards/AdminDashboard"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:bookingId"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:conversationId"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reviews"
                element={
                  <ProtectedRoute>
                    <Reviews />
                  </ProtectedRoute>
                }
              />

              {/* Host Routes */}
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute>
                    <HostRoute>
                      <CreateListing />
                    </HostRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-listing/:id"
                element={
                  <ProtectedRoute>
                    <HostRoute>
                      <EditListing />
                    </HostRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={["host", "admin"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminUserDetails />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminBookings />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings/:id"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminBookingDetails />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App 