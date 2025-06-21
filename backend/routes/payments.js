const express = require("express");
const { protect } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Stripe webhook (must use express.raw middleware, no auth)
const expressRaw = require('express').raw;
router.post('/webhook', expressRaw({type: 'application/json'}), paymentController.stripeWebhook);

// Mock payment controller functions
const processPayment = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: { transactionId: "mock_" + Date.now() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};

const getPaymentMethods = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: ["credit_card", "paypal", "stripe"],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment methods",
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Refund processing failed",
    });
  }
};

// All routes below require authentication
router.use(protect);

// Process payment
router.post("/process", paymentController.processPayment || processPayment);

// Get payment methods
router.get("/methods", paymentController.getPaymentMethods || getPaymentMethods);

// Process refund
router.post("/refund", paymentController.refundPayment || refundPayment);

// Create Stripe PaymentIntent
router.post("/create-intent", paymentController.createPaymentIntent);

// Update payment status after successful payment
router.put("/update-status/:bookingId", paymentController.updatePaymentStatus);

// Test endpoint to manually update payment status (for debugging)
router.put("/test-update-status/:bookingId", paymentController.testUpdatePaymentStatus);

module.exports = router;
