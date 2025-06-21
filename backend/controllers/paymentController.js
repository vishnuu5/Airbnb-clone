// Mock payment controller - In production, integrate with Stripe, PayPal, etc.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Listing = require('../models/Listing');

// @desc    Process payment (Mock)
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Mock payment processing
    // In production, integrate with actual payment gateway
    const mockPaymentResult = {
      success: Math.random() > 0.1, // 90% success rate for demo
      transactionId: `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      amount: booking.totalPrice,
      currency: "USD",
      paymentMethod: paymentMethod,
    };

    if (mockPaymentResult.success) {
      // Update booking payment status and method
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.paymentMethod = paymentMethod;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: {
          transactionId: mockPaymentResult.transactionId,
          amount: mockPaymentResult.amount,
          booking: booking,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment failed. Please try again.",
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing payment",
    });
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
exports.getPaymentMethods = async (req, res) => {
  try {
    // Mock payment methods
    const paymentMethods = [
      {
        id: "card",
        name: "Credit/Debit Card",
        icon: "credit-card",
        enabled: true,
      },
      {
        id: "paypal",
        name: "PayPal",
        icon: "paypal",
        enabled: true,
      },
      {
        id: "apple-pay",
        name: "Apple Pay",
        icon: "apple",
        enabled: false,
      },
      {
        id: "google-pay",
        name: "Google Pay",
        icon: "google",
        enabled: false,
      },
    ];

    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting payment methods",
    });
  }
};

// @desc    Refund payment (Mock)
// @route   POST /api/payments/refund
// @access  Private
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Mock refund processing
    const mockRefundResult = {
      success: true,
      refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount || booking.totalPrice,
      reason: reason,
    };

    if (mockRefundResult.success) {
      booking.paymentStatus = "refunded";
      booking.cancellation.refundAmount = mockRefundResult.amount;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        data: mockRefundResult,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Refund failed. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Refund processing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing refund",
    });
  }
};

// Create Stripe PaymentIntent for a booking
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }
    
    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Calculate amount in cents (USD) or paise (INR)
    const baseAmount = booking.totalPrice || booking.priceBreakdown?.basePrice || booking.listing.price;
    const amount = Math.round(baseAmount * 100); // Convert to smallest currency unit
    
    console.log('Creating payment intent:', {
      bookingId,
      baseAmount,
      amount,
      currency: 'usd'
    });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd', // Using USD for better compatibility
      metadata: { 
        bookingId: booking._id.toString(), 
        userId: booking.guest.toString() 
      },
      description: `Payment for booking ${booking._id}`,
      // Add automatic payment method collection
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });
    
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

// Stripe webhook endpoint to update booking paymentStatus after Stripe payment
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "paid",
        status: "confirmed",
        paymentMethod: "card"
      });
    }
  }

  res.json({ received: true });
};

// Update payment status after successful payment
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;

    console.log('updatePaymentStatus called with:', { bookingId, paymentIntentId });

    if (!bookingId) {
      console.log('No bookingId provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required' 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('Booking not found:', bookingId);
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log('Found booking:', {
      id: booking._id,
      currentPaymentStatus: booking.paymentStatus,
      currentStatus: booking.status
    });

    // Verify payment intent with Stripe if provided
    if (paymentIntentId) {
      try {
        console.log('Verifying payment intent with Stripe:', paymentIntentId);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('Stripe payment intent status:', paymentIntent.status);
        if (paymentIntent.status !== 'succeeded') {
          console.log('Payment intent not succeeded');
          return res.status(400).json({ 
            success: false, 
            message: 'Payment not completed successfully' 
          });
        }
      } catch (stripeError) {
        console.error('Stripe verification error:', stripeError);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment intent' 
        });
      }
    }

    // Update booking payment status
    console.log('Updating booking payment status to paid');
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentMethod = "card";
    await booking.save();

    console.log('Booking updated successfully:', {
      id: booking._id,
      newPaymentStatus: booking.paymentStatus,
      newStatus: booking.status
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        booking: booking,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status',
      error: error.message 
    });
  }
};

// Test endpoint to manually update payment status (for debugging)
exports.testUpdatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('testUpdatePaymentStatus called with bookingId:', bookingId);

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required' 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log('Current booking status:', {
      paymentStatus: booking.paymentStatus,
      status: booking.status
    });

    // Update booking payment status
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentMethod = "card";
    await booking.save();

    console.log('Booking updated successfully:', {
      paymentStatus: booking.paymentStatus,
      status: booking.status
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully (test)",
      data: {
        booking: booking,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Test update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status',
      error: error.message 
    });
  }
};
