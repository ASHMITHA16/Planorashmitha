import crypto from 'crypto';
import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import sendOtpMail from './utils/sendOtpMail.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add this near the top of your routes, after middleware
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});


app.use('/api', (req, res, next) => {
  console.log('API Request:', req.method, req.url);
  next();
});

// Database connection with better error handling
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

const startServer = async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};


// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Role-based authorization middleware
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth routes
// Get event details

// Add this route for event registration
// Update the registration endpoint

// Get upcoming events
// Get upcoming events
// Add this route to your server.js

// Get registrations for a specific event
app.get(
  '/api/clubs/:clubId/events/:eventId/registrations',
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { clubId, eventId } = req.params;

      // ✅ Ensure event belongs to this club
      const [[event]] = await db.query(
        'SELECT id FROM events WHERE id = ? AND club_id = ?',
        [eventId, clubId]
      );

      if (!event) {
        return res.status(404).json({
          error: 'Event not found in this club'
        });
      }

      // ✅ Fetch registrations
      const [registrations] = await db.query(`
        SELECT 
          r.*,
          u.name AS user_name,
          u.email AS user_email
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.created_at DESC
      `, [eventId]);

      res.json(registrations);

    } catch (error) {
      console.error('Event registrations error:', error);
      res.status(500).json({
        error: 'Failed to fetch registrations'
      });
    }
  }
);

app.patch('/api/clubs/:clubId/events/:eventId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['upcoming', 'past'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query(
      'UPDATE events SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Event status updated successfully' });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});
app.get('/api/events/upcoming', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'upcoming'
      GROUP BY e.id
      ORDER BY e.date ASC
    `);

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// club  description
app.get('/api/clubs', authenticateToken,checkAdmin,async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT id, name, description FROM clubs'
    );

    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// create club
app.post("/api/createclubs", authenticateToken, checkAdmin,async (req, res) => {
  try {
    const { name, description, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !password) {
      return res.status(400).json({
        error: "Club name and password are required"
      });
    }

    // 2️⃣ Check if club already exists
    const [existing] = await db.query(
      "SELECT id FROM clubs WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Club already exists"
      });
    }

    // 3️⃣ Hash club password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Insert into DB
    await db.query(
      "INSERT INTO clubs (name, description, password) VALUES (?, ?, ?)",
      [name, description, hashedPassword]
    );

    // 5️⃣ Success
    res.status(201).json({
      message: "Club created successfully"
    });

  } catch (error) {
    console.error("Create club error:", error);
    res.status(500).json({
      error: "Failed to create club"
    });
  }
});

// Club password verification route
app.post("/api/clubs/verify", authenticateToken, checkAdmin,async (req, res) => {
  const { clubId, password } = req.body;

  const [rows] = await db.query(
    "SELECT password FROM clubs WHERE id = ?",
    [clubId]
  );

  if (!rows.length) {
    return res.status(404).json({ error: "Club not found" });
  }

  const valid = await bcrypt.compare(password, rows[0].password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.json({ success: true });
});
// 

//club description
app.get('/api/clubs/:clubId', authenticateToken, checkAdmin, async (req, res) => {
  const { clubId } = req.params;

  const [[club]] = await db.query(
    "SELECT id, name, description FROM clubs WHERE id = ?",
    [clubId]
  );

  res.json(club);
});
//

// view events of only tht club
// GET events of a specific club
app.get("/api/clubs/:clubId/events",authenticateToken,async (req, res) => {
    try {
      const { clubId } = req.params;

      const [events] = await db.query(
        "SELECT * FROM events WHERE club_id = ? ORDER BY date DESC",
        [clubId]
      );

      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch club events" });
    }
  }
);


// Get past events
app.get('/api/events/past', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'past'
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    res.json(events);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
});

app.post('/api/events/register/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    console.log('Registration attempt:', { eventId, userId }); // Debug log

    // Check if event exists
    const [event] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const [existing] = await db.query(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const [result] = await db.query(
      'INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, ?)',
      [eventId, userId, 'pending']
    );

    console.log('Registration successful:', result); // Debug log

    res.status(201).json({
      message: 'Successfully registered for the event',
      registrationId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Failed to register for event',
      error: error.message
    });
  }
});

// Add this route to get all registrations
app.get('/api/events/registrations', authenticateToken, async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT 
        r.*,
        e.title as event_title,
        u.name as user_name,
        u.email as user_email
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch registrations' 
    });
  }
});
app.get('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );
    
    if (!events.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(events[0]);
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register for event
app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if already registered
    const [existing] = await db.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Create registration
    await db.query(
      'INSERT INTO event_registrations (event_id, user_id, student_id) VALUES (?, ?, ?)',
      [eventId, userId, student_id]
    );

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update the signup route

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(`Generated OTP for ${email}: ${otp}`); // Debug log
    // Save user
    await db.query(
      `INSERT INTO users (name, email, password, role, otp, otp_expires)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, otp, otpExpires]
    );

    console.log(`User ${email} registered with OTP ${otp}`); // Debug log
    // Send OTP mail
    await sendOtpMail(email, otp);

    res.status(201).json({
      message: 'Signup successful. OTP sent to email.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/verify-email', async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    email = email.trim().toLowerCase();
    otp = String(otp).trim();
    console.log('VERIFY REQUEST:', email, otp); // Debug log
    console.log('VERIFY:', email, otp);

    const [users] = await db.query(
      `SELECT id FROM users
       WHERE email = ?
         AND otp = ?
         AND otp_expires IS NOT NULL
         AND otp_expires > NOW()`,
      [email, otp]
    );

    if (!users.length) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await db.query(
      `UPDATE users
       SET is_verified = true,
           otp = NULL,
           otp_expires = NULL
       WHERE email = ?`,
      [email]
    );

    res.json({ message: 'Email verified successfully' });

  } catch (err) {
    console.error('VERIFY ERROR:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});


// Add this before your routes


// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Login route
app.post('/api/login', async (req, res) => {

  try {
    const { email, password } = req.body;
     
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
   
       const user = users[0];
       console.log('User found:', user.email, 'Verified:', user.is_verified); // Debug log
    if (!user.is_verified) {
     return res.status(403).json({
    error: 'Please verify your email before login'
  });
}


 
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response with user data
    res.json({ 
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});
// Add these routes after your existing routes

// Admin Dashboard Routes
// Admin Dashboard route
// ...existing code...

// Events Routes
// Add this route to get all events
// GET events of a specific club (ADMIN)
app.get(
  '/api/clubs/:clubId/manageevents',
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const clubId = Number(req.params.clubId);

      const [events] = await db.query(`
        SELECT 
          e.*,
          COUNT(DISTINCT r.id) AS registration_count
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        WHERE e.club_id = ?
        GROUP BY e.id
        ORDER BY e.date DESC
      `, [clubId]);

      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch club events' });
    }
  }
);


// Modify your event creation endpoint to include created_by
app.post(
  "/api/clubs/:clubId/addevents",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { clubId } = req.params;
      const {
        title,
        description,
        date,
        venue,
        time,
        status
      } = req.body;

      await db.query(
        `INSERT INTO events 
        (title, description, date, venue, time, status, club_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          date,
          venue,
          time,
          status || "upcoming",
          clubId,
          req.user.id
        ]
      );

      res.status(201).json({ message: "Event added under club" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add event" });
    }
  }
);



app.delete('/api/clubs/:clubId/events/:eventId', authenticateToken, checkAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // First delete all registrations for this event
    await connection.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
    
    // Then delete the event
    await connection.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    res.status(204).send();

  } catch (error) {
    await connection.rollback();
    console.error('Event deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete event',
      message: 'Cannot delete event with active registrations'
    });
  } finally {
    connection.release();
  }
});

app.get('/api/admin/dashboard', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('Admin dashboard request received');

    // Default values in case of no data
    const stats = {
      totalEvents: 0,
      totalUsers: 0,
      totalRegistrations: 0
    };

    // Get counts
    const [[eventCount]] = await db.query('SELECT COUNT(*) as count FROM events');
    const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [[regCount]] = await db.query('SELECT COUNT(*) as count FROM registrations');

    stats.totalEvents = eventCount.count;
    stats.totalUsers = userCount.count;
    stats.totalRegistrations = regCount.count;

    // Get recent data - use date instead of created_at for events
    const [events] = await db.query('SELECT * FROM events ORDER BY date DESC LIMIT 5');
    const [registrations] = await db.query(
      `SELECT r.*, e.title as event_title, u.name as user_name 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC LIMIT 5`
    );

    res.json({
      stats,
      recentEvents: events,
      recentRegistrations: registrations
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching admin dashboard data' });
  }
});

// User Dashboard Routes
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get user's registration count
    const [[registrationCount]] = await db.query(
      'SELECT COUNT(*) as count FROM registrations WHERE user_id = ?',
      [req.user.id]
    );
    
    // Get user's upcoming events
    const [upcomingEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       JOIN registrations r ON e.id = r.event_id 
       WHERE r.user_id = ? AND e.date >= CURDATE() 
       ORDER BY e.date ASC LIMIT 5`,
      [req.user.id]
    );
    
    // Get user's past events
    const [pastEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       JOIN registrations r ON e.id = r.event_id 
       WHERE r.user_id = ? AND e.date < CURDATE() 
       ORDER BY e.date DESC LIMIT 5`,
      [req.user.id]
    );

    // Get available upcoming events
    const [availableEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       WHERE e.date >= CURDATE() 
       AND e.id NOT IN (
         SELECT event_id FROM registrations WHERE user_id = ?
       ) 
       ORDER BY e.date ASC LIMIT 5`,
      [req.user.id]
    );

    res.json({
      stats: {
        totalRegistrations: registrationCount.count
      },
      upcomingEvents,
      pastEvents,
      availableEvents
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching user dashboard data' });
  }
});

// Add these utility routes for both dashboards
app.get('/api/events/upcoming', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE date >= CURDATE() ORDER BY date ASC'
    );
    res.json(events);
  } catch (error) {
    console.error('Upcoming events fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Log all requests
  next();
});

// Add this before your routes
app.use('/api', (req, res, next) => {
  console.log('API Request:', req.method, req.url);
  next();
});



// Add this route before your error handlers
app.get('/api/events/past', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching past events...'); // Debug log
    
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'past' OR e.date < CURDATE()
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    console.log('Found past events:', events.length);
    res.json(events);

  } catch (error) {
    console.error('Past events error:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
});


app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const [existing] = await db.execute(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    await db.execute(
      'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
      [eventId, userId]
    );

    res.json({ message: 'Successfully registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update registrations route
app.get('/api/registrations', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? `SELECT r.*, e.title as event_title, u.name as user_name, u.email as user_email 
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         JOIN users u ON r.user_id = u.id`
      : `SELECT r.*, e.title as event_title, u.name as user_name, u.email as user_email 
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         JOIN users u ON r.user_id = u.id 
         WHERE r.user_id = ?`;

    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this error handling middleware at the end of your routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
startServer();
