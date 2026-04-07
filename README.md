# Yoga & Mindfulness Studio Booking System

## How to Run Locally

1. Clone the repository
2. Install dependencies:
   npm install
3. Seed the database:
   node seed/seed.js
4. Start the server:
   npm start
5. Visit http://localhost:3000

## Login Credentials

- Organiser: organiser@yoga.local / organiser123
- Student: student@yoga.local / student123

## Features Implemented

- Public course listings and course detail pages
- User authentication with bcrypt password hashing and express-session
- Role-based access control (organiser vs student)
- Course booking (full course and individual sessions)
- Organiser dashboard with full course CRUD
- Class lists showing participant names
- User management (add organisers, delete users)
- Responsive UI
