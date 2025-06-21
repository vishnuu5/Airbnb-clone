import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout for complex queries
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Clean up review data on the fly
    if (response.config.url.includes("/reviews/listing/")) {
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.filter(review => review.user);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  verifyRegistrationOTP: (data) => api.post("/auth/verify-registration", data),
  resendOTP: (data) => api.post("/auth/resend-otp", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  },
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
};

// Listings API
export const listingsAPI = {
  getListings: async (params) => {
    try {
      const response = await api.get("/listings", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  },
  getAllListings: () => api.get("/listings"),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (listingData) => api.post("/listings", listingData),
  updateListing: (id, listingData) => api.put(`/listings/${id}`, listingData),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getHostListings: (hostId) => api.get(`/listings/host/${hostId}`),
  getMyListings: () => api.get("/listings/my-listings"),
  searchListings: (searchParams) =>
    api.get("/listings/search", { params: searchParams }),
  getFeaturedListings: () => api.get("/listings/featured"),
  toggleFavorite: (id) => api.post(`/listings/${id}/favorite`),
  getFavorites: () => api.get("/listings/favorites"),
};

// Bookings API
export const bookingsAPI = {
  getBookings: () => api.get("/bookings/"),
  getAllBookings: () => api.get("/bookings/all"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  updateBooking: (id, updateData) => api.put(`/bookings/${id}`, updateData),
  cancelBooking: (id, reason) =>
    api.delete(`/bookings/${id}`, { data: { reason } }),
  getBookingsByListing: (listingId) =>
    api.get(`/bookings/listing/${listingId}`),
  confirmBooking: (id) => api.put(`/bookings/${id}/confirm`),
  completeBooking: (id) => api.put(`/bookings/${id}/complete`),
};

// Admin Bookings API
export const adminBookingsAPI = {
  getAllBookings: () => api.get("/admin/bookings"),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
  updateBooking: (id, updateData) => api.put(`/admin/bookings/${id}`, updateData),
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),
};

// Payment API
export const paymentAPI = {
  processPayment: (paymentData) => api.post("/payments/process", paymentData),
  getPaymentMethods: () => api.get("/payments/methods"),
  refundPayment: (refundData) => api.post("/payments/refund", refundData),
  getPaymentHistory: () => api.get("/payments/history"),
  createPaymentIntent: (bookingData) =>
    api.post("/payments/create-intent", bookingData),
  updatePaymentStatus: (bookingId, paymentIntentId) =>
    api.put(`/payments/update-status/${bookingId}`, { paymentIntentId }),
};

// Upload API
export const uploadAPI = {
  uploadImages: (formData) => {
    return api.post("/uploads/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(response => {
      // Ensure we always return an array of images
      if (!Array.isArray(response.data.data)) {
        response.data.data = [response.data.data];
      }
      return response;
    });
  },
  deleteImage: (imageUrl) =>
    api.delete("/uploads/image", { data: { imageUrl } }),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getAllUsers: () => api.get("/users"),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get("/users/stats"),
  verifyUser: (id) => api.put(`/users/${id}/verify`),
  suspendUser: (id) => api.put(`/users/${id}/suspend`),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (listingId) => api.get(`/reviews/listing/${listingId}`),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: () => api.get("/reviews/my-reviews"),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  getReviewStats: (listingId) => api.get(`/reviews/stats/${listingId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get("/analytics/dashboard"),
  getBookingStats: (params) => api.get("/analytics/bookings", { params }),
  getRevenueStats: (params) => api.get("/analytics/revenue", { params }),
  getListingPerformance: (listingId) =>
    api.get(`/analytics/listing/${listingId}`),
  getUserStats: () => api.get("/analytics/users"),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get("/notifications/unread-count"),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get("/messages/conversations"),
  getAvailableUsers: () => api.get("/messages/available-users"),
  getAvailableUsersTest: () => api.get("/messages/available-users-test"), // Temporary test
  testConversations: () => api.get("/messages/test-conversations"), // Debug test
  startConversation: (data) => api.post("/messages/start", data),
  getMessages: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (messageData) => api.post("/messages", messageData),
  markAsRead: (conversationId) =>
    api.put(`/messages/conversations/${conversationId}/read`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (listingId) => api.post("/wishlist", { listingId }),
  removeFromWishlist: (listingId) => api.delete(`/wishlist/${listingId}`),
  clearWishlist: () => api.delete("/wishlist"),
};

export default api;
