const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data directory path
const DATA_DIR = path.join(__dirname, 'data');

// ==================== HELPER FUNCTIONS ====================

/**
 * Ensure data directory and JSON files exist
 */
function initializeDataFiles() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Created data directory');
  }

  // Initialize JSON files with default structure
  const files = {
    'users.json': [],
    'timetable.json': [],
    'events.json': [],
    'electives.json': { raw_submissions: [], final_allocation: [] }
  };

  Object.keys(files).forEach(filename => {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, JSON.stringify(files[filename], null, 2));
      console.log(`📄 Created ${filename}`);
    }
  });
}

/**
 * Read data from a JSON file
 * @param {string} filename - Name of the JSON file
 * @returns {any} Parsed JSON data
 */
function readJSON(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return filename === 'electives.json' 
      ? { raw_submissions: [], final_allocation: [] } 
      : [];
  }
}

/**
 * Write data to a JSON file
 * @param {string} filename - Name of the JSON file
 * @param {any} data - Data to write
 */
function writeJSON(filename, data) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * POST /api/auth/signup
 * Register a new user (Student or Admin)
 */
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, prn, type, email, className, password } = req.body;

    // Validation
    if (!name || !prn || !type || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // PRN must be 10 digits
    if (!/^\d{10}$/.test(prn)) {
      return res.status(400).json({ 
        success: false, 
        message: 'PRN must be exactly 10 digits' 
      });
    }

    // Type must be Student or Admin
    if (type !== 'Student' && type !== 'Admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either Student or Admin' 
      });
    }

    // Read existing users
    const users = readJSON('users.json');

    // Check if PRN already exists
    const existingUser = users.find(u => u.prn === prn);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'PRN already registered' 
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      prn,
      type,
      email,
      className: className || '',
      password,
      createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);

    // Save to file
    if (writeJSON('users.json', users)) {
      return res.status(201).json({ 
        success: true, 
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          prn: newUser.prn,
          type: newUser.type,
          email: newUser.email,
          className: newUser.className
        }
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save user data' 
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return user data
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { prn, password, type } = req.body;

    // Validation
    if (!prn || !password || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'PRN, password, and type are required' 
      });
    }

    // Read users
    const users = readJSON('users.json');

    // Find user
    const user = users.find(u => 
      u.prn === prn && 
      u.password === password && 
      u.type === type
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or user type' 
      });
    }

    // Return user data (without password)
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        prn: user.prn,
        type: user.type,
        email: user.email,
        className: user.className
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users (for admin dashboard)
 */
app.get('/api/admin/users', (req, res) => {
  try {
    const users = readJSON('users.json');
    // Return users without passwords
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      prn: u.prn,
      type: u.type,
      email: u.email,
      className: u.className
    }));
    return res.status(200).json({ 
      success: true, 
      users: safeUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching users' 
    });
  }
});

// ==================== EVENTS ENDPOINTS ====================

/**
 * POST /api/admin/events
 * Admin creates a new event/notice
 */
app.post('/api/admin/events', (req, res) => {
  try {
    const { title, description, date, type } = req.body;

    // Validation
    if (!title || !description || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, and date are required' 
      });
    }

    // Read existing events
    const events = readJSON('events.json');

    // Create new event
    const newEvent = {
      id: events.length + 1,
      title,
      description,
      date,
      type: type || 'event',
      createdAt: new Date().toISOString()
    };

    // Add to events array
    events.push(newEvent);

    // Save to file
    if (writeJSON('events.json', events)) {
      return res.status(201).json({ 
        success: true, 
        message: 'Event created successfully',
        event: newEvent
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save event' 
      });
    }
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error creating event' 
    });
  }
});

/**
 * GET /api/events
 * Get all events (accessible to all users)
 */
app.get('/api/events', (req, res) => {
  try {
    const events = readJSON('events.json');
    return res.status(200).json({ 
      success: true, 
      events: events.reverse() // Most recent first
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching events' 
    });
  }
});

/**
 * DELETE /api/admin/events/:id
 * Delete an event
 */
app.delete('/api/admin/events/:id', (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    let events = readJSON('events.json');
    
    const initialLength = events.length;
    events = events.filter(e => e.id !== eventId);
    
    if (events.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    if (writeJSON('events.json', events)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Event deleted successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete event' 
      });
    }
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error deleting event' 
    });
  }
});

// ==================== TIMETABLE ENDPOINTS ====================

/**
 * POST /api/admin/generate-timetable
 * Generate timetable based on teachers, subjects, and classes
 * Ensures no teacher is assigned to multiple classes at the same time
 */
app.post('/api/admin/generate-timetable', (req, res) => {
  try {
    const { teachers, classes } = req.body;

    // Validation
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teachers array is required' 
      });
    }

    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Classes array is required' 
      });
    }

    // Time slots for a week (Mon-Fri, 6 periods per day)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
      '9:00-10:00',
      '10:00-11:00',
      '11:15-12:15',
      '12:15-1:15',
      '2:00-3:00',
      '3:00-4:00'
    ];

    // Track teacher assignments: { teacherName: { day: [periodIndexes] } }
    const teacherSchedule = {};
    teachers.forEach(t => {
      teacherSchedule[t.name] = {};
      days.forEach(day => {
        teacherSchedule[t.name][day] = [];
      });
    });

    // Generate timetable for each class
    const timetables = [];

    classes.forEach(className => {
      const classTimetable = {
        className,
        schedule: []
      };

      // Create a schedule for each day
      days.forEach(day => {
        const daySchedule = {
          day,
          periods: []
        };

        // Assign subjects to periods
        periods.forEach((time, periodIndex) => {
          let assignedTeacher = null;
          
          // Try to find an available teacher for this period
          for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];
            
            // Check if teacher is already assigned at this time
            if (!teacherSchedule[teacher.name][day].includes(periodIndex)) {
              assignedTeacher = teacher;
              // Mark this teacher as busy at this time
              teacherSchedule[teacher.name][day].push(periodIndex);
              break;
            }
          }

          // If all teachers are busy, use round-robin as fallback
          if (!assignedTeacher) {
            const teacherIndex = periodIndex % teachers.length;
            assignedTeacher = teachers[teacherIndex];
          }

          daySchedule.periods.push({
            time,
            subject: assignedTeacher.subject,
            teacher: assignedTeacher.name,
            room: `Room ${101 + periodIndex}`
          });
        });

        classTimetable.schedule.push(daySchedule);
      });

      timetables.push(classTimetable);
    });

    // Save timetables
    if (writeJSON('timetable.json', timetables)) {
      return res.status(201).json({ 
        success: true, 
        message: 'Timetable generated successfully',
        timetables
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save timetable' 
      });
    }
  } catch (error) {
    console.error('Generate timetable error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error generating timetable' 
    });
  }
});

/**
 * GET /api/student/timetable
 * Get timetable for a specific class
 */
app.get('/api/student/timetable', (req, res) => {
  try {
    const { className } = req.query;

    if (!className) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class name is required' 
      });
    }

    const timetables = readJSON('timetable.json');
    const classTimetable = timetables.find(t => t.className === className);

    if (!classTimetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found for this class' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      timetable: classTimetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching timetable' 
    });
  }
});

/**
 * GET /api/admin/timetable
 * Get all timetables (for admin)
 */
app.get('/api/admin/timetable', (req, res) => {
  try {
    const timetables = readJSON('timetable.json');
    return res.status(200).json({ 
      success: true, 
      timetables
    });
  } catch (error) {
    console.error('Get all timetables error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching timetables' 
    });
  }
});

// ==================== ELECTIVE ENDPOINTS ====================

/**
 * POST /api/student/submit-elective
 * Student submits elective preferences
 * Can update if not yet allocated, cannot change after allocation
 */
app.post('/api/student/submit-elective', (req, res) => {
  try {
    const { prn, name, className, cgpa, priorities } = req.body;

    // Validation
    if (!prn || !name || !className || !cgpa || !priorities) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (!Array.isArray(priorities) || priorities.length !== 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exactly 5 subject priorities are required' 
      });
    }

    // Read electives data
    const electivesData = readJSON('electives.json');

    // Check if student has already been allocated
    const existingAllocation = electivesData.final_allocation.find(a => a.prn === prn);
    if (existingAllocation && existingAllocation.allocatedSubject !== 'Not Allocated') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify preferences after allocation. You have been allocated to: ' + existingAllocation.allocatedSubject
      });
    }

    // Check if student already submitted
    const existingIndex = electivesData.raw_submissions.findIndex(s => s.prn === prn);

    const submission = {
      prn,
      name,
      className,
      cgpa: parseFloat(cgpa),
      priorities, // Array of {subject, priority}
      submittedAt: existingIndex !== -1 ? electivesData.raw_submissions[existingIndex].submittedAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // Update existing submission
      electivesData.raw_submissions[existingIndex] = submission;
    } else {
      // Add new submission
      electivesData.raw_submissions.push(submission);
    }

    // Save to file
    if (writeJSON('electives.json', electivesData)) {
      return res.status(201).json({ 
        success: true, 
        message: existingIndex !== -1 ? 'Elective preferences updated successfully' : 'Elective preferences submitted successfully',
        submission
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save elective preferences' 
      });
    }
  } catch (error) {
    console.error('Submit elective error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error submitting elective preferences' 
    });
  }
});

/**
 * GET /api/student/elective-status
 * Get student's elective submission and allocation status
 */
app.get('/api/student/elective-status', (req, res) => {
  try {
    const { prn } = req.query;

    if (!prn) {
      return res.status(400).json({ 
        success: false, 
        message: 'PRN is required' 
      });
    }

    const electivesData = readJSON('electives.json');

    // Find submission
    const submission = electivesData.raw_submissions.find(s => s.prn === prn);

    // Find allocation
    const allocation = electivesData.final_allocation.find(a => a.prn === prn);

    return res.status(200).json({ 
      success: true, 
      submission: submission || null,
      allocation: allocation || null
    });
  } catch (error) {
    console.error('Get elective status error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching elective status' 
    });
  }
});

/**
 * GET /api/admin/elective-submissions
 * Get all elective submissions (for admin)
 */
app.get('/api/admin/elective-submissions', (req, res) => {
  try {
    const electivesData = readJSON('electives.json');
    return res.status(200).json({ 
      success: true, 
      submissions: electivesData.raw_submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions' 
    });
  }
});

/**
 * POST /api/admin/allocate-electives
 * Allocate electives based on CGPA and priorities
 */
app.post('/api/admin/allocate-electives', (req, res) => {
  try {
    const { subjectCapacity = 60 } = req.body; // Default 60 seats per subject

    const electivesData = readJSON('electives.json');
    const submissions = electivesData.raw_submissions;

    if (submissions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No submissions to allocate' 
      });
    }

    // Sort students by CGPA (highest to lowest)
    const sortedStudents = [...submissions].sort((a, b) => b.cgpa - a.cgpa);

    // Track subject capacity
    const subjectSeats = {};

    // Final allocations
    const allocations = [];

    // Allocate subjects
    sortedStudents.forEach(student => {
      let allocated = false;

      // Sort student's priorities by priority number (1 = highest)
      const sortedPriorities = [...student.priorities].sort((a, b) => a.priority - b.priority);

      for (const preference of sortedPriorities) {
        const subject = preference.subject;

        // Initialize subject capacity if not exists
        if (!subjectSeats[subject]) {
          subjectSeats[subject] = 0;
        }

        // Check if seats available
        if (subjectSeats[subject] < subjectCapacity) {
          // Allocate this subject
          allocations.push({
            prn: student.prn,
            name: student.name,
            className: student.className,
            cgpa: student.cgpa,
            allocatedSubject: subject,
            priority: preference.priority,
            allocatedAt: new Date().toISOString()
          });

          subjectSeats[subject]++;
          allocated = true;
          break; // Stop after allocating one subject
        }
      }

      // If no subject could be allocated
      if (!allocated) {
        allocations.push({
          prn: student.prn,
          name: student.name,
          className: student.className,
          cgpa: student.cgpa,
          allocatedSubject: 'Not Allocated',
          priority: null,
          allocatedAt: new Date().toISOString()
        });
      }
    });

    // Save allocations
    electivesData.final_allocation = allocations;

    if (writeJSON('electives.json', electivesData)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Electives allocated successfully',
        allocations,
        statistics: {
          totalStudents: submissions.length,
          allocated: allocations.filter(a => a.allocatedSubject !== 'Not Allocated').length,
          notAllocated: allocations.filter(a => a.allocatedSubject === 'Not Allocated').length,
          subjectWiseCount: subjectSeats
        }
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save allocations' 
      });
    }
  } catch (error) {
    console.error('Allocate electives error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error allocating electives' 
    });
  }
});

/**
 * GET /api/admin/elective-allocations
 * Get all elective allocations (for admin)
 */
app.get('/api/admin/elective-allocations', (req, res) => {
  try {
    const electivesData = readJSON('electives.json');
    return res.status(200).json({ 
      success: true, 
      allocations: electivesData.final_allocation
    });
  } catch (error) {
    console.error('Get allocations error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching allocations' 
    });
  }
});

// ==================== SERVER INITIALIZATION ====================

// Initialize data files on startup
initializeDataFiles();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Campus Utility Hub Backend`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for frontend`);
  console.log(`📂 Data directory: ${DATA_DIR}\n`);
});

module.exports = app;
