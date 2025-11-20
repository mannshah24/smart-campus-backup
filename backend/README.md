# Smart Campus Utility Hub - Backend

Backend server for the Smart Campus Utility Hub application built with Node.js, Express, and JSON file-based storage.

## Features

- **Authentication System**: Sign up and login for Students and Admins
- **Timetable Generation**: Automated timetable creation with conflict prevention
- **Events Management**: Post and view campus events and notices
- **Elective Allocation**: CGPA-based subject allocation system

## Tech Stack

- Node.js
- Express.js
- CORS
- Body-Parser
- File System (fs) for JSON database

## Project Structure

```
backend/
├── server.js           # Main server file with all endpoints
├── package.json        # Dependencies and scripts
└── data/              # JSON database files
    ├── users.json     # User authentication data
    ├── timetable.json # Generated timetables
    ├── events.json    # Campus events
    └── electives.json # Student preferences and allocations
```

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events
- `POST /api/admin/events` - Create new event (Admin)
- `DELETE /api/admin/events/:id` - Delete event (Admin)

### Timetable
- `POST /api/admin/generate-timetable` - Generate timetable (Admin)
- `GET /api/admin/timetable` - Get all timetables (Admin)
- `GET /api/student/timetable?className=...` - Get class timetable (Student)

### Electives
- `POST /api/student/submit-elective` - Submit preferences (Student)
- `GET /api/student/elective-status?prn=...` - Get allocation status (Student)
- `GET /api/admin/elective-submissions` - Get all submissions (Admin)
- `POST /api/admin/allocate-electives` - Run allocation algorithm (Admin)
- `GET /api/admin/elective-allocations` - Get allocation results (Admin)

## Data Storage

All data is stored in JSON files in the `/data` directory:

- **users.json**: Stores user accounts (Name, PRN, Type, Email, Class, Password)
- **timetable.json**: Stores generated class timetables
- **events.json**: Stores campus events and notices
- **electives.json**: Stores student preferences and final allocations

## Elective Allocation Algorithm

The allocation algorithm works as follows:

1. Students submit 5 subject preferences ranked by priority (1-5)
2. Admin triggers the allocation algorithm
3. Students are sorted by CGPA (highest to lowest)
4. Each student is allocated based on:
   - Available seats (60 per subject by default)
   - Their priority preferences
   - First-come basis for equal CGPA
5. Results are saved and students can view their allocated subject

## CORS Configuration

The server allows requests from:
- http://localhost:5173 (Vite default)
- http://localhost:8080
- http://localhost:3000

## Environment Variables

Currently, the server uses hardcoded values. For production, consider using environment variables:

- `PORT`: Server port (default: 5000)
- `DATA_DIR`: Data directory path

## Notes

- PRN must be exactly 10 digits
- Passwords are stored in plain text (for educational purposes only)
- For production, implement proper password hashing and JWT authentication
- The timetable generator uses a simple round-robin algorithm
- Subject capacity for electives is set to 60 by default

## Future Enhancements

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation with express-validator
- MongoDB integration
- File upload support
- Email notifications
- More sophisticated timetable generation algorithm
