# Smart Campus Utility Hub

A comprehensive web application for managing campus activities including timetable generation, event management, and elective subject allocation.

## Features

### For Students

- 📅 **View Timetable**: Access class-specific timetables
- 📝 **Elective Selection**: Submit subject preferences based on CGPA
- 📢 **Events Feed**: Stay updated with campus events and announcements
- ✅ **Allocation Status**: Check allocated elective subjects

### For Admins

- 🕐 **Timetable Generator**: Create non-conflicting timetables automatically
- 📣 **Events Management**: Post and manage campus events
- 🎓 **Elective Management**: Allocate subjects based on CGPA and student priorities
- 📊 **Analytics**: View statistics and allocation results

## Tech Stack

### Frontend

- React with TypeScript
- Vite
- TailwindCSS
- Shadcn/ui Components
- React Router

### Backend

- Node.js
- Express.js
- JSON file-based database

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or bun

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:

```bash
cd ..
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Quick Start

1. Start the backend server (in backend directory): `npm start`
2. Start the frontend (in root directory): `npm run dev`
3. Open `http://localhost:5173` in your browser
4. Sign up as Student or Admin to begin

## Usage Guide

### Creating an Account

**Sign Up Fields:**

- Name: Your full name
- PRN: Exactly 10 digits (e.g., 1234567890)
- Type: Select "Student" or "Admin"
- Email: Your email address
- Class: Your class name (e.g., CSE-A)
- Password: Your chosen password

### Admin Features

1. **Timetable Generator**: Add teachers, subjects, and classes to generate schedules
2. **Events Management**: Post campus events and notices
3. **Elective Management**: View submissions and run CGPA-based allocation

### Student Features

1. **My Timetable**: View your class schedule
2. **Elective Selection**: Submit subject preferences (ranked 1-5)
3. **Events Feed**: Browse campus events and announcements

## API Endpoints

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/events` - Get all events
- `POST /api/admin/generate-timetable` - Generate timetable
- `GET /api/student/timetable?className=CSE-A` - Get timetable
- `POST /api/student/submit-elective` - Submit elective preferences
- `POST /api/admin/allocate-electives` - Run allocation algorithm

For complete API documentation, see `backend/README.md`

## How It Works

### Elective Allocation Algorithm

1. Students submit 5 subject choices ranked by priority
2. System sorts students by CGPA (highest first)
3. Allocates subjects based on availability and priority
4. Each subject has a capacity limit (60 students)

## Security Notes

⚠️ **For Educational Purposes Only**

This application stores passwords in plain text and should NOT be used in production without proper security measures.

## Troubleshooting

- **Backend won't start**: Check if port 5000 is available
- **Frontend won't connect**: Verify backend is running on port 5000
- **Can't login**: Ensure PRN is exactly 10 digits

## License

MIT License - Free for educational use

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
