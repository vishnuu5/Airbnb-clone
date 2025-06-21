# The Gen Task - Full Stack Booking Platform

This is a full-stack web application that allows users to browse, book, and manage property listings. It features a complete authentication system, dashboards for different user roles (admin, host, guest), and analytics.

## ✨ Features

- **User Authentication**: Secure user registration and login system with JWT.
- **Listing Management**: Users can create, view, update, and delete property listings.
- **Booking System**: Users can book available listings for specific dates.
- **Review System**: Users can leave reviews and ratings for listings they have booked.
- **Wishlist**: Users can add and remove listings from their personal wishlist.
- **Dashboards**: Role-based dashboards for guests, hosts, and administrators.
  - **Admin Dashboard**: Manage users, bookings, and view site-wide analytics.
  - **Host Dashboard**: View property-specific analytics and manage bookings for their listings.
- **Search and Filter**: Easily find listings with search and filter functionality.
- **Image Uploads**: Hosts can upload images for their listings.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Multer for image uploads

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- `npm` (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (you can use a local instance or a cloud-hosted one like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vishnuu5/Airbnb-clone.git
    cd the-gen-task
    ```
    (Replace `your-username` with your actual GitHub username if you forked it)

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `/backend` directory. This file will store your environment variables.
    ```
    # .env file for backend

    # Server port
    PORT=5000

    # MongoDB Connection URI
    MONGODB_URI=<your_mongodb_connection_string>

    # JWT Secret for token signing
    JWT_SECRET=<your_super_secret_jwt_key>
    ```
    Replace the placeholder values with your actual MongoDB connection string and a secure JWT secret key.

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```
    The frontend is configured to proxy API requests to the backend server running on `localhost:5000`. No special `.env` configuration is needed for it to connect to the backend out-of-the-box.

### Running the Application

1.  **Start the Backend Server:**
    Open a terminal, navigate to the `/backend` directory, and run:
    ```bash
    npm start
    ```
    The backend server should now be running on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    Open a *second* terminal, navigate to the `/frontend` directory, and run:
    ```bash
    npm run dev
    ```
    The React application should now be running and will open automatically in your browser at `http://localhost:5173` (or another port if 5173 is in use).



## 🔐 API Routes

Here are some of the main API routes available. All are prefixed with `/api`.

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Log in a user and get a JWT.
-   `GET /api/listings`: Get all listings (can be filtered with query params).
-   `POST /api/listings`: Create a new listing (protected).
-   `GET /api/listings/:id`: Get details for a single listing.
-   `PUT /api/listings/:id`: Update a listing (protected, owner only).
-   `DELETE /api/listings/:id`: Delete a listing (protected, owner only).
-   `GET /api/bookings`: Get bookings for the logged-in user.
-   `POST /api/bookings`: Create a new booking (protected).
-   `...and many more for users, reviews, wishlist, etc.`
