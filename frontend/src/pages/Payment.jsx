"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { bookingsAPI, paymentAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { Lock, ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
import toast from "react-hot-toast"
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY).catch(error => {
    console.error('Failed to load Stripe:', error);
    return null;
});

function StripePaymentForm({ bookingId, onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [cardholderName, setCardholderName] = useState('');
    const [billingAddress, setBillingAddress] = useState({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        async function fetchClientSecret() {
            try {
                const res = await paymentAPI.createPaymentIntent({ bookingId });
                setClientSecret(res.data.clientSecret);
            } catch (err) {
                console.error('Payment initialization error:', err);
                if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
                    setError('Network error: Unable to connect to payment service. Please check your internet connection and try again.');
                } else {
                    setError('Failed to initialize payment. Please try again.');
                }
            }
        }
        fetchClientSecret();
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        
        try {
        if (!stripe || !elements) {
            setError('Stripe not loaded');
            setProcessing(false);
            return;
        }

            if (!cardholderName.trim()) {
                setError('Cardholder name is required');
                setProcessing(false);
                return;
            }

            // Validate billing address for Indian transactions
            if (!billingAddress.address || !billingAddress.city || !billingAddress.state || !billingAddress.zipCode || !billingAddress.country) {
                setError('Complete billing address is required for payment processing');
                setProcessing(false);
                return;
            }

        const cardElement = elements.getElement(CardElement);
            
            // Debug: Log the data being sent
            console.log('Payment submission data:', {
                clientSecret: clientSecret ? 'present' : 'missing',
                cardElement: cardElement ? 'present' : 'missing',
                billingDetails: {
                    name: cardholderName,
                    address: {
                        line1: billingAddress.address,
                        city: billingAddress.city,
                        state: billingAddress.state,
                        postal_code: billingAddress.zipCode,
                        country: billingAddress.country
                    }
                }
            });
            
            // Prepare billing details with complete address
            const billingDetails = {
                name: cardholderName,
                address: {
                    line1: billingAddress.address,
                    city: billingAddress.city,
                    state: billingAddress.state,
                    postal_code: billingAddress.zipCode,
                    country: billingAddress.country || 'IN' // Default to India if empty
                }
            };
            
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                    billing_details: billingDetails
            },
        });
            
        if (stripeError) {
                console.error('Stripe payment error:', stripeError);
                console.error('Error details:', {
                    code: stripeError.code,
                    decline_code: stripeError.decline_code,
                    param: stripeError.param,
                    message: stripeError.message
                });
            setError(stripeError.message);
            setProcessing(false);
            return;
        }
            
        if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded! PaymentIntent:', paymentIntent);
            console.log('Updating payment status for booking:', bookingId);
            
            // Update payment status in database
            try {
                const updateResponse = await paymentAPI.updatePaymentStatus(bookingId, paymentIntent.id);
                console.log('Payment status update response:', updateResponse);
                console.log('Payment status updated successfully');
                toast.success('Payment completed successfully!');
            } catch (updateError) {
                console.error('Failed to update payment status:', updateError);
                console.error('Update error response:', updateError.response?.data);
                // Don't fail the payment if status update fails
                // The webhook should handle this as a fallback
                toast.error('Payment completed but status update failed. Please refresh the page.');
            }
            onPaymentSuccess();
        } else {
            console.error('Payment failed or status not succeeded:', paymentIntent);
            setError('Payment failed.');
        }
        } catch (error) {
            console.error('Payment submission error:', error);
            console.error('Error stack:', error.stack);
            setError('Payment processing failed. Please try again.');
        } finally {
        setProcessing(false);
        }
    };

    if (!clientSecret) return <LoadingSpinner size="lg" />;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                
                {/* Cardholder Name */}
                <div className="mb-6">
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                    </label>
                    <input
                        type="text"
                        id="cardholderName"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Name on card"
                        required
                    />
                </div>

                {/* Card Details */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Details *
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                        <CardElement 
                            options={{ 
                                hidePostalCode: true,
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#374151',
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                        '::placeholder': {
                                            color: '#9CA3AF',
                                        },
                                    },
                                    invalid: {
                                        color: '#EF4444',
                                    },
                                },
                            }} 
                        />
                    </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Billing Address *</h3>
                    
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            id="address"
                            value={billingAddress.address}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="123 Main St"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={billingAddress.city}
                                onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="City"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                id="state"
                                value={billingAddress.state}
                                onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="State"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                                ZIP Code *
                            </label>
                            <input
                                type="text"
                                id="zipCode"
                                value={billingAddress.zipCode}
                                onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="12345"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={billingAddress.country}
                                onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="India"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={processing || !stripe} 
                className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {processing ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                    </>
                ) : (
                    'Complete Payment'
                )}
            </button>
        </form>
    );
}

const Payment = () => {
    const { bookingId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookingAndPaymentMethods()
    }, [bookingId])

    const fetchBookingAndPaymentMethods = async () => {
        try {
            const [bookingResponse] = await Promise.all([
                bookingsAPI.getBooking(bookingId),
            ])

            const bookingData = bookingResponse.data.data
            setBooking(bookingData)

            // Check if user can access this booking
            if (bookingData.guest._id !== user._id) {
                toast.error("You don't have permission to access this booking")
                navigate("/bookings")
                return
            }

            // Check if payment is already completed
            if (bookingData.paymentStatus === "paid") {
                toast.info("This booking has already been paid")
                navigate(`/bookings/${bookingId}`)
                return
            }

            // Check if booking is confirmed
            if (bookingData.status !== "confirmed") {
                toast.error("This booking is not confirmed yet")
                navigate(`/bookings/${bookingId}`)
                return
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load payment information")
            navigate("/bookings")
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

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
                    <p className="text-gray-600 mb-4">The booking you're trying to pay for doesn't exist.</p>
                    <button onClick={() => navigate("/bookings")} className="btn btn-primary">
                        Back to Bookings
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/bookings/${bookingId}`)}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Booking
                    </button>
                    <div className="flex items-center space-x-2">
                        <Lock className="w-6 h-6 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
                    </div>
                    <p className="text-gray-600 mt-1">Complete your booking payment securely</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <Elements stripe={stripePromise}>
                            <StripePaymentForm bookingId={bookingId} onPaymentSuccess={() => navigate(`/bookings/${bookingId}?payment=success`)} />
                        </Elements>
                    </div>

                    {/* Booking Summary */}
                    <div className="space-y-6">
                        {/* Property Summary */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <img
                                        src={
                                            booking.listing?.images?.[0]?.url?.startsWith("/uploads")
                                                ? `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000"}${booking.listing.images[0].url}`
                                                : booking.listing?.images?.[0]?.url || "/placeholder.svg?height=80&width=80"
                                        }
                                        alt={booking.listing?.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = "/placeholder.svg?height=80&width=80"
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{booking.listing?.title}</h3>
                                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                <span>
                                                    {booking.listing?.location?.city}, {booking.listing?.location?.state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                                            {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                                            {new Date(booking.checkOut).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{booking.guests.adults + booking.guests.children + booking.guests.infants} guests</span>
                                    </div>
                                    <div className="text-gray-500">
                                        {booking.priceBreakdown.nights} night{booking.priceBreakdown.nights !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>
                                        ${booking.listing?.price} x {booking.priceBreakdown.nights} nights
                                    </span>
                                    <span>${booking.priceBreakdown.basePrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service fee</span>
                                    <span>${booking.priceBreakdown.serviceFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cleaning fee</span>
                                    <span>${booking.priceBreakdown.cleaningFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span>${booking.priceBreakdown.taxes}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-semibold text-base">
                                    <span>Total (USD)</span>
                                    <span>${booking.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>
                                    <span className="font-medium">Free cancellation</span> before check-in date
                                </p>
                                <p>
                                    <span className="font-medium">50% refund</span> if cancelled within 48 hours of check-in
                                </p>
                                <p>
                                    <span className="font-medium">No refund</span> for no-shows or early departures
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment
