const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["guest", "host", "admin"],
      default: "guest",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiry: Date,
    verificationOTP: String,
    verificationOTPExpiry: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,
    profilePicture: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    listings: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Listing",
      },
    ],
    bookings: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Booking",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Listing",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }

  try {
    console.log("Hashing password for user:", this.email);
    console.log("Password length before hashing:", this.password?.length);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    
    console.log("Password length after hashing:", hashedPassword?.length);
    console.log("Password hashed successfully");
    
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords for user:", this.email);
    console.log("Candidate password:", candidatePassword);
    console.log("Stored password:", this.password);
    
    if (!candidatePassword || !this.password) {
      console.log("Missing password for comparison");
      return false;
    }
    
    // Ensure both passwords are strings
    const candidate = String(candidatePassword);
    const stored = String(this.password);
    
    console.log("Candidate password type:", typeof candidate);
    console.log("Stored password type:", typeof stored);
    
    const isMatch = await bcrypt.compare(candidate, stored);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User; 