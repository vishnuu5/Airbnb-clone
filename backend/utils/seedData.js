const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stayfinder_dev", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log("🌱 Starting seed process...");

    // Clear existing data
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Cleared existing listings and users");

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("✅ Created uploads directory");
    }

    // Create a generic user for host reference (not exposed)
    const hashedPassword = await bcrypt.hash("seeduserpassword", 10);
    const seedUser = await User.create({
      name: "Seed User",
      email: "seeduser@example.com",
        password: hashedPassword,
      role: "host"
    });

    // Create additional host users for testing
    const additionalHosts = await User.create([
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: hashedPassword,
        role: "host"
      },
      {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        password: hashedPassword,
        role: "host"
      },
      {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        password: hashedPassword,
        role: "host"
      },
      {
        name: "David Thompson",
        email: "david.thompson@example.com",
        password: hashedPassword,
        role: "host"
      },
      {
        name: "Lisa Wang",
        email: "lisa.wang@example.com",
        password: hashedPassword,
        role: "host"
      }
    ]);

    console.log("✅ Created seed user and additional host users");

    // Create sample listings with the generic user as host
    const listings = await Listing.create([
      {
        title: "Beautiful Downtown Apartment",
        description:
          "A stunning apartment in the heart of the city with amazing views and modern amenities. Perfect for business travelers and tourists alike.",
        price: 120,
        location: {
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          country: "USA",
          zipCode: "10001",
          lat: 40.7128,
          lng: -74.006,
          coordinates: {
            type: "Point",
            coordinates: [-74.006, 40.7128],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "kitchen", "tv", "ac", "workspace"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            caption: "Living room with city view",
          },
          {
            url: "https://images.unsplash.com/photo-1556911220-bff31c812dba",
            caption: "Modern kitchen",
          },
        ],
        rating: {
          average: 4.8,
          count: 24,
        },
        featured: true,
        host: seedUser._id,
      },
      // Add listings for additional hosts
      {
        title: "Sarah's Cozy Studio",
        description: "A charming studio apartment perfect for solo travelers or couples.",
        price: 85,
        location: {
          address: "456 Oak Avenue",
          city: "San Francisco",
          state: "CA",
          country: "USA",
          zipCode: "94102",
          lat: 37.7749,
          lng: -122.4194,
          coordinates: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "ac"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
            caption: "Cozy studio space",
          },
        ],
        rating: {
          average: 4.6,
          count: 12,
        },
        featured: false,
        host: additionalHosts[0]._id, // Sarah Johnson
      },
      {
        title: "Michael's Modern Loft",
        description: "Contemporary loft with industrial design and city views.",
        price: 150,
        location: {
          address: "789 Industrial Blvd",
          city: "Austin",
          state: "TX",
          country: "USA",
          zipCode: "73301",
          lat: 30.2672,
          lng: -97.7431,
          coordinates: {
            type: "Point",
            coordinates: [-97.7431, 30.2672],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 3,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "workspace", "gym"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            caption: "Modern loft interior",
          },
        ],
        rating: {
          average: 4.7,
          count: 18,
        },
        featured: false,
        host: additionalHosts[1]._id, // Michael Chen
      },
      {
        title: "Emily's Garden Cottage",
        description: "Charming cottage surrounded by beautiful gardens.",
        price: 110,
        location: {
          address: "321 Garden Lane",
          city: "Portland",
          state: "OR",
          country: "USA",
          zipCode: "97201",
          lat: 45.5155,
          lng: -122.6789,
          coordinates: {
            type: "Point",
            coordinates: [-122.6789, 45.5155],
          },
        },
        propertyType: "house",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "garden", "fireplace"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
            caption: "Garden cottage exterior",
          },
        ],
        rating: {
          average: 4.8,
          count: 15,
        },
        featured: false,
        host: additionalHosts[2]._id, // Emily Rodriguez
      },
      {
        title: "David's Luxury Condo",
        description: "High-end condo with premium amenities and stunning views.",
        price: 250,
        location: {
          address: "555 Luxury Tower",
          city: "Miami",
          state: "FL",
          country: "USA",
          zipCode: "33139",
          lat: 25.7617,
          lng: -80.1918,
          coordinates: {
            type: "Point",
            coordinates: [-80.1918, 25.7617],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "gym", "pool", "spa", "parking"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
            caption: "Luxury condo interior",
          },
        ],
        rating: {
          average: 4.9,
          count: 22,
        },
        featured: true,
        host: additionalHosts[3]._id, // David Thompson
      },
      {
        title: "Lisa's Boutique Hotel Room",
        description: "Elegant boutique hotel room with personalized service.",
        price: 180,
        location: {
          address: "888 Boutique Street",
          city: "Nashville",
          state: "TN",
          country: "USA",
          zipCode: "37201",
          lat: 36.1627,
          lng: -86.7816,
          coordinates: {
            type: "Point",
            coordinates: [-86.7816, 36.1627],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "breakfast", "gym"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            caption: "Boutique hotel room",
          },
        ],
        rating: {
          average: 4.7,
          count: 16,
        },
        featured: false,
        host: additionalHosts[4]._id, // Lisa Wang
      },
      {
        title: "Cozy Beach House",
        description:
          "Relax in this charming beach house just steps away from the ocean. Enjoy stunning sunsets and the sound of waves from your private deck.",
        price: 200,
        location: {
          address: "456 Ocean Drive",
          city: "Miami",
          state: "FL",
          country: "USA",
          zipCode: "33139",
          lat: 25.7617,
          lng: -80.1918,
          coordinates: {
            type: "Point",
            coordinates: [-80.1918, 25.7617],
          },
        },
        propertyType: "house",
        roomType: "entire-place",
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["wifi", "kitchen", "parking", "pool", "balcony"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455",
            caption: "Beach house exterior",
          },
          {
            url: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
            caption: "Ocean view from deck",
          },
        ],
        rating: {
          average: 4.9,
          count: 18,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Mountain View Cabin",
        description:
          "Escape to this rustic cabin nestled in the mountains. Perfect for nature lovers and those seeking peace and quiet.",
        price: 150,
        location: {
          address: "789 Pine Road",
          city: "Denver",
          state: "CO",
          country: "USA",
          zipCode: "80202",
          lat: 39.7392,
          lng: -104.9903,
          coordinates: {
            type: "Point",
            coordinates: [-104.9903, 39.7392],
          },
        },
        propertyType: "cabin",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "fireplace", "kitchen", "garden"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
            caption: "Cabin exterior with mountain view",
          },
          {
            url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            caption: "Cozy interior with fireplace",
          },
        ],
        rating: {
          average: 4.7,
          count: 15,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Luxury Penthouse Suite",
        description:
          "Experience luxury living in this stunning penthouse with panoramic city views and high-end amenities.",
        price: 300,
        location: {
          address: "1000 Sky Tower",
          city: "Chicago",
          state: "IL",
          country: "USA",
          zipCode: "60601",
          lat: 41.8781,
          lng: -87.6298,
          coordinates: {
            type: "Point",
            coordinates: [-87.6298, 41.8781],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "gym", "pool", "spa", "parking"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
            caption: "Luxury living room",
          },
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            caption: "Modern kitchen",
          },
        ],
        rating: {
          average: 4.9,
          count: 32,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Historic Brownstone",
        description:
          "Stay in this beautifully restored historic brownstone in the heart of the city. Classic architecture meets modern comfort.",
        price: 250,
        location: {
          address: "555 Heritage Lane",
          city: "Boston",
          state: "MA",
          country: "USA",
          zipCode: "02108",
          lat: 42.3601,
          lng: -71.0589,
          coordinates: {
            type: "Point",
            coordinates: [-71.0589, 42.3601],
          },
        },
        propertyType: "house",
        roomType: "entire-place",
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["wifi", "garden", "fireplace", "kitchen"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
            caption: "Historic exterior",
          },
          {
            url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
            caption: "Elegant interior",
          },
        ],
        rating: {
          average: 4.8,
          count: 28,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Modern Studio Loft",
        description:
          "Contemporary studio loft perfect for solo travelers or couples. Located in a vibrant neighborhood with easy access to attractions.",
        price: 90,
        location: {
          address: "222 Art District",
          city: "Los Angeles",
          state: "CA",
          country: "USA",
          zipCode: "90012",
          lat: 34.0522,
          lng: -118.2437,
          coordinates: {
            type: "Point",
            coordinates: [-118.2437, 34.0522],
          },
        },
        propertyType: "apartment",
        roomType: "entire-place",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "workspace", "gym", "ac"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
            caption: "Modern studio space",
          },
          {
            url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
            caption: "City view from window",
          },
        ],
        rating: {
          average: 4.6,
          count: 20,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Seaside Villa",
        description:
          "Luxurious villa with private beach access and stunning ocean views. Perfect for a family vacation or romantic getaway.",
        price: 400,
        location: {
          address: "888 Coastal Highway",
          city: "Malibu",
          state: "CA",
          country: "USA",
          zipCode: "90265",
          lat: 34.0259,
          lng: -118.7798,
          coordinates: {
            type: "Point",
            coordinates: [-118.7798, 34.0259],
          },
        },
        propertyType: "villa",
        roomType: "entire-place",
        guests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ["wifi", "pool", "kitchen", "parking", "balcony"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            caption: "Villa exterior",
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            caption: "Private pool",
          },
        ],
        rating: {
          average: 4.9,
          count: 45,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Urban Treehouse",
        description:
          "Unique treehouse experience in the heart of the city. A perfect blend of nature and urban living.",
        price: 180,
        location: {
          address: "333 Green Street",
          city: "Portland",
          state: "OR",
          country: "USA",
          zipCode: "97201",
          lat: 45.5155,
          lng: -122.6789,
          coordinates: {
            type: "Point",
            coordinates: [-122.6789, 45.5155],
          },
        },
        propertyType: "other",
        roomType: "entire-place",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "garden", "kitchen", "balcony"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            caption: "Treehouse exterior",
          },
          {
            url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
            caption: "Cozy interior",
          },
        ],
        rating: {
          average: 4.7,
          count: 16,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Desert Oasis",
        description:
          "Escape to this luxurious desert retreat with stunning views and modern amenities. Perfect for stargazing and relaxation.",
        price: 220,
        location: {
          address: "777 Desert Road",
          city: "Phoenix",
          state: "AZ",
          country: "USA",
          zipCode: "85001",
          lat: 33.4484,
          lng: -112.0740,
          coordinates: {
            type: "Point",
            coordinates: [-112.0740, 33.4484],
          },
        },
        propertyType: "house",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "pool", "spa", "garden"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            caption: "Desert view",
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            caption: "Private pool",
          },
        ],
        rating: {
          average: 4.8,
          count: 22,
        },
        featured: true,
        host: seedUser._id,
      },
      {
        title: "Lakeside Cottage",
        description:
          "Charming cottage on the lake with private dock and fishing access. Perfect for water activities and nature lovers.",
        price: 175,
        location: {
          address: "444 Lake View Drive",
          city: "Seattle",
          state: "WA",
          country: "USA",
          zipCode: "98101",
          lat: 47.6062,
          lng: -122.3321,
          coordinates: {
            type: "Point",
            coordinates: [-122.3321, 47.6062],
          },
        },
        propertyType: "house",
        roomType: "entire-place",
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "fireplace", "garden"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            caption: "Lakeside view",
          },
          {
            url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
            caption: "Cozy interior",
          },
        ],
        rating: {
          average: 4.7,
          count: 19,
        },
        featured: true,
        host: seedUser._id,
      }
    ]);

    console.log("✅ Created sample listings");
    console.log(`\n📊 Created ${listings.length} sample listings`);

    // Create sample bookings
    const sampleBookings = [
      {
        listing: listings[0]._id,
        guest: additionalHosts[0]._id, // Sarah Johnson as guest
        host: listings[0].host,
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        guests: { adults: 2, children: 1, infants: 0 },
        totalPrice: 360,
        priceBreakdown: {
          basePrice: 120,
          nights: 3,
          serviceFee: 36,
          cleaningFee: 50,
          taxes: 24
        },
        guestInfo: {
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          phone: "+1234567890"
        },
        specialRequests: "Early check-in if possible",
        status: "pending",
        paymentStatus: "pending"
      },
      {
        listing: listings[1]._id,
        guest: additionalHosts[1]._id, // Michael Chen as guest
        host: listings[1].host,
        checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        guests: { adults: 1, children: 0, infants: 0 },
        totalPrice: 255,
        priceBreakdown: {
          basePrice: 85,
          nights: 3,
          serviceFee: 25.5,
          cleaningFee: 30,
          taxes: 17
        },
        guestInfo: {
          name: "Michael Chen",
          email: "michael.chen@example.com",
          phone: "+1234567891"
        },
        specialRequests: "Late check-out if possible",
        status: "confirmed",
        paymentStatus: "paid"
      },
      {
        listing: listings[2]._id,
        guest: additionalHosts[2]._id, // Emily Rodriguez as guest
        host: listings[2].host,
        checkIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        checkOut: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        guests: { adults: 2, children: 0, infants: 0 },
        totalPrice: 450,
        priceBreakdown: {
          basePrice: 150,
          nights: 3,
          serviceFee: 45,
          cleaningFee: 40,
          taxes: 30
        },
        guestInfo: {
          name: "Emily Rodriguez",
          email: "emily.rodriguez@example.com",
          phone: "+1234567892"
        },
        specialRequests: "Quiet room preferred",
        status: "completed",
        paymentStatus: "paid"
      }
    ];

    const bookings = await Booking.create(sampleBookings);
    console.log(`✅ Created ${bookings.length} sample bookings`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("📦 Connected to MongoDB");
  seedData();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

mongoose.connection.on("disconnected", () => {
  console.log("📦 Disconnected from MongoDB");
});
