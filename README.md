# Yoga & Mindfulness Studio Booking System

## Live Demo

https://wad2-posscw-2526-start2.onrender.com

> Note: The site is hosted on Render's free tier. If it hasn't been visited recently it may take 30-60 seconds to wake up on first load. This is normal.

## Login Credentials

- Organiser: organiser@yoga.local / organiser123
- Student: student@yoga.local / student123

## How to Run Locally

1. Clone the repository
   git clone https://github.com/Dylanc2105/WAD2_posscw_2526---Start2.git

2. Install dependencies
   npm install

3. Seed the database
   npm run seed

4. Start the server
   npm start

5. Visit http://localhost:3000

## Features Implemented

- Public course listings and course detail pages
- User authentication with bcrypt password hashing and express-session
- Role-based access control (organiser vs student)
- Course booking (full course and individual sessions)
- Organiser dashboard with full course CRUD
- Class lists showing participant names
- User management (add organisers, delete users)
- Responsive UI

## Tech Stack

- Node.js + Express
- NeDB (flat file database)
- Mustache templates
- bcrypt + express-session for authentication