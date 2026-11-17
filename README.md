# Student Productivity Hub 🎓

A complete, full-stack web application designed to help students manage academic activities, organize daily tasks, maintain study timetables, track assignment deadlines, log daily study progress, and maintain deep focus using a Pomodoro timer.

---

## 📑 Table of Contents
1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [Complete Project Architecture](#-complete-project-architecture)
3. [Technology Stack & Justification](#-technology-stack--justification)
4. [File & Directory Structure](#-file--directory-structure)
5. [Detailed Module Breakdown](#-detailed-module-breakdown)
6. [How Authentication & Data Security Works](#-how-authentication--data-security-works)
7. [How to Run the Application Locally](#-how-to-run-the-application-locally)
8. [Comprehensive College Viva & Interview Guide](#-comprehensive-college-viva--interview-guide)

---

## 🎯 Project Overview & Problem Statement

### The Problem
College students juggle numerous responsibilities: lecture schedules, lab assignments, homework deadlines, semester examinations, and self-study targets. Most students rely on scattered notes, paper planners, or multiple disconnected apps, resulting in:
- Missed assignment deadlines.
- Disorganized schedules and lack of visibility into daily classes.
- Inability to track whether weekly study targets are being achieved.
- Procrastination and lack of structured study intervals.

### The Solution: Student Productivity Hub
A unified, responsive, student-friendly platform where a student can:
1. Authenticate securely with their student profile.
2. View an intelligent **Dashboard** summarizing upcoming deadlines, today's schedule, and pending tasks.
3. Manage daily tasks with priority levels and due dates (**My Tasks**).
4. Maintain a structured weekly class and study schedule (**Timetable**).
5. Track coursework deadlines with automatic overdue warnings (**Assignments**).
6. Log daily study hours and visualize weekly progress bars (**Study Progress**).
7. Execute focused 25-minute study intervals with automated MongoDB tracking (**Pomodoro Timer**).
8. Maintain and update student details and account credentials (**My Profile**).

---

## 🏗️ Complete Project Architecture

The application implements the classic **3-Tier Client-Server Architecture**:

```
+---------------------------------------------------------------------------------+
|                         TIER 1: PRESENTATION LAYER (FRONTEND)                   |
|                                                                                 |
|   - Separate HTML5 Pages: index, register, dashboard, tasks, timetable,         |
|     assignments, progress, pomodoro, profile.                                   |
|   - Modern CSS3: Dark Navy Sidebar (#0f172a), Light Body (#f8fafc), White Cards|
|   - Pure Vanilla JavaScript: DOM Manipulation & Native Fetch API                |
+----------------------------------------+----------------------------------------+
                                         |
                                         | HTTP/1.1 Requests
                                         | (JSON Body + Authorization: Bearer <JWT>)
                                         |
+----------------------------------------v----------------------------------------+
|                         TIER 2: APPLICATION LAYER (BACKEND)                     |
|                                                                                 |
|   Node.js (Runtime) + Express.js (REST API Framework)                           |
|   - Middlewares: cors, express.json, authMiddleware (JWT Verification)          |
|   - Controllers: auth, task, timetable, assignment, progress, pomodoro          |
|   - Routers: Modular endpoints (/api/auth, /api/tasks, etc.)                    |
+----------------------------------------+----------------------------------------+
                                         |
                                         | Mongoose ODM Queries (BSON)
                                         |
+----------------------------------------v----------------------------------------+
|                         TIER 3: DATA STORAGE LAYER (DATABASE)                   |
|                                                                                 |
|   MongoDB Database (Collections):                                               |
|   - users: Student accounts & bcrypt-hashed passwords                           |
|   - tasks: Daily student tasks with priority & status                           |
|   - timetables: Weekly class schedule entries                                   |
|   - assignments: Coursework deadlines and completion tracking                   |
|   - studyprogresses: Daily logged study hours and notes                         |
|   - pomodorosessions: Completed focus session records                           |
+---------------------------------------------------------------------------------+
```

---

## 💡 Technology Stack & Justification

| Technology | Role | Why This Technology Was Chosen |
| :--- | :--- | :--- |
| **HTML5** | Semantic Markup | Uses clean semantic tags (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`) ensuring high accessibility, proper document hierarchy, and compliance with modern web standards. |
| **CSS3** | Visual Styling & Layout | Custom CSS variables (`:root`), Flexbox, and CSS Grid allow a professional dark navy sidebar and card design without heavy external frameworks like Bootstrap or Tailwind, reducing page weight and load times. |
| **Vanilla JavaScript** | Client-Side Interactivity | Native DOM manipulation and the `fetch()` API handle user events and server communication without framework abstractions (no React, Angular, or Vue). This provides deep understanding of browser core mechanics. |
| **Node.js** | Server-Side Runtime | High-performance, non-blocking asynchronous event loop that handles high concurrency with minimal CPU and memory overhead, allowing JavaScript to run unified on both frontend and backend. |
| **Express.js** | Backend Web Framework | Lightweight and unopinionated framework providing clean REST routing, middleware chaining, JSON parsing, and HTTP utility methods. |
| **MongoDB** | NoSQL Database | Stores documents in JSON-like format (BSON). Flexible schema design allows academic data (e.g. timetable slots, tasks) to map 1:1 with JavaScript objects without complex SQL join overhead. |
| **Mongoose** | Object Data Modeling (ODM) | Enforces schema validation, field types, default values, references between collections (`ref: 'User'`), and pre-save hooks (for password hashing). |
| **JWT (JSON Web Token)** | Stateless Authentication | Cryptographically signs student credentials, allowing stateless API authentication. The server does not need to maintain server-side session memory. |
| **bcryptjs** | Password Security | Industry-standard salted cryptographic hashing algorithm. Ensures passwords are never stored in plain text, guarding against rainbow table and brute-force attacks. |

---

## 📁 File & Directory Structure

```
student-productivity-hub/
│
├── frontend/                     # Client-side presentation layer
│   ├── index.html                # Student Login page
│   ├── register.html             # Student Registration page
│   ├── dashboard.html            # Main academic metrics overview
│   ├── tasks.html                # Daily tasks management (CRUD)
│   ├── timetable.html            # Weekly timetable schedule
│   ├── assignments.html          # Assignment deadline tracker
│   ├── progress.html             # Daily & weekly study hours tracker
│   ├── pomodoro.html             # 25/5/15 Pomodoro study timer
│   ├── profile.html              # Student profile & account settings
│   │
│   ├── css/
│   │   ├── style.css             # Base theme (navy sidebar, cards, tables, buttons)
│   │   ├── auth.css              # Styling for login & register forms
│   │   └── responsive.css        # Media queries for tablet & mobile devices
│   │
│   └── js/
│       ├── auth.js               # Global auth helpers, token management & header binder
│       ├── dashboard.js          # Dashboard metric calculations and widget rendering
│       ├── tasks.js              # Tasks CRUD & status toggles
│       ├── timetable.js          # Timetable grid & day filter tabs
│       ├── assignments.js        # Assignment CRUD & deadline urgency badges
│       ├── progress.js           # Study progress logging & bar calculations
│       ├── pomodoro.js           # Countdown timer & auto database session logging
│       └── profile.js            # Profile updates & password modification
│
├── backend/                      # Server-side application layer
│   ├── server.js                 # Express server entry point & static frontend host
│   ├── package.json              # Backend dependencies and run scripts
│   ├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose
│   ├── models/                   # Mongoose data schemas
│   │   ├── User.js               # Student accounts schema & password hashing
│   │   ├── Task.js               # Task schema (title, priority, due date, status)
│   │   ├── Timetable.js          # Timetable schema (day, timeslot, subject, room)
│   │   ├── Assignment.js         # Assignment schema (deadline, subject, status)
│   │   ├── StudyProgress.js      # Study hours logged by subject and date
│   │   └── PomodoroSession.js    # Completed Pomodoro focus session records
│   ├── controllers/              # REST API business logic handlers
│   │   ├── authController.js     # Register, login, profile operations
│   │   ├── taskController.js     # Task CRUD & toggle status
│   │   ├── timetableController.js# Timetable CRUD
│   │   ├── assignmentController.js# Assignment CRUD & deadline computation
│   │   ├── progressController.js # Progress logs & weekly summary analytics
│   │   ├── pomodoroController.js # Session logging & daily metrics
│   │   └── dashboardController.js# Overview aggregation for dashboard
│   ├── routes/                   # Express router definitions
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── timetableRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── pomodoroRoutes.js
│   │   └── dashboardRoutes.js
│   └── middleware/
│       └── authMiddleware.js     # JWT verification middleware protecting API routes
│
└── README.md                     # Documentation & viva preparation guide
```

---

## 🔍 Detailed Module Breakdown

### 1. Authentication Module (`index.html`, `register.html`, `authController.js`)
- **Registration:** Accepts student Name, Email, Department, Semester, Roll Number, and Password. Validates input format and checks for duplicate emails.
- **Password Hashing:** Uses `bcrypt.hash()` with a salt factor of 10 in a Mongoose `pre('save')` hook.
- **Login:** Compares entered password against the bcrypt hash using `bcrypt.compare()`.
- **JWT Generation:** Signs a JSON Web Token containing the student's unique MongoDB `_id` and an expiration time (7 days).
- **Session Storage:** Stores the token in the browser's `localStorage` under `student_token`.

### 2. Dashboard Module (`dashboard.html`, `dashboardController.js`)
- Displays a personalized welcome banner with the student's name, department, and current weekday.
- Renders 5 summary cards:
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
  - Total Assignments
  - Upcoming Deadlines (due within the next 7 days)
- Shows today's lecture schedule automatically filtered by the current day of the week.
- Displays urgent tasks and allows one-click completion.

### 3. My Tasks Module (`tasks.html`, `taskController.js`)
- Supports complete CRUD operations (Create, Read, Update, Delete).
- Every task includes: Title, Description, Priority (`High`, `Medium`, `Low`), Due Date, and Status (`Pending`, `Completed`).
- Filters tasks dynamically by completion status and priority level.
- Live search bar allows searching tasks by title in real-time.
- Checkbox allows one-click status toggling directly from the table.

### 4. Timetable Module (`timetable.html`, `timetableController.js`)
- Weekly class schedule organizer covering Monday through Sunday.
- Stores Subject name, Day of week, Start time, End time, Room/Hall number, and Instructor name.
- Day-filter tabs (`All Days`, `Monday`, `Tuesday`, etc.) allow focused daily viewing.
- Automatic sorting by day sequence and start time.

### 5. Assignments Module (`assignments.html`, `assignmentController.js`)
- Tracks academic submissions and coursework.
- Stores Assignment Title, Subject, Description, Submission Deadline (date & time), and Status (`Not Started`, `In Progress`, `Completed`).
- Calculates deadline urgency dynamically:
  - **OVERDUE** badge: Highlighted in red with a pulsing animation if the deadline has passed and status is not completed.
  - **DUE SOON** badge: Highlighted in amber if due within the next 7 days.
  - **COMPLETED** badge: Green.

### 6. Study Progress Module (`progress.html`, `progressController.js`)
- Logs daily study sessions with Subject, Hours spent (e.g. 2.5 hrs), Date, and Notes.
- Calculates weekly achievement against a target of 20 study hours per week.
- Displays visual percentage progress bars for weekly goal completion and subject-wise study distribution.
- Tracks task completion rate (%) and assignment completion rate (%).
- Maintains a historical log of all logged study sessions.

### 7. Pomodoro Timer Module (`pomodoro.html`, `pomodoroController.js`)
- Built-in study timer implementing the proven Pomodoro Technique:
  - 25-minute Study Session
  - 5-minute Short Break
  - 15-minute Long Break
- Includes Start, Pause, and Reset controls.
- When a 25-minute study cycle finishes, an audio notification chimes, and the session is **automatically recorded to MongoDB**.
- Displays today's completed session count and total focus minutes.

### 8. Profile Module (`profile.html`, `authController.js`)
- Displays current student details, department, semester, and email.
- Allows updating student profile information.
- Secure password change facility requiring verification of current password.
- Safe logout action clearing stored browser tokens.

---

## 🔒 How Authentication & Data Security Works

1. **Password Salt & Hash:** Passwords are never stored in plain text. A random 10-round cryptographic salt is generated and prepended to the password hash.
2. **Stateless JWT:** The server does not maintain session tables in RAM. Instead, a cryptographically signed token is issued:
   $$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$
3. **Data Isolation (Multi-Tenant Security):** Every single database query filters by `user: req.user._id`:
   ```javascript
   // Guaranteed student isolation:
   const tasks = await Task.find({ user: req.user._id });
   ```
   A student can never access, edit, or delete another student's tasks, timetable, or assignments.

---

## 🚀 How to Run the Application Locally

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port 27017:
- On Windows: Run `net start MongoDB` or start the MongoDB service from Windows Services.
- Alternatively, you can use a free cloud database cluster from [MongoDB Atlas](https://www.mongodb.com/atlas) and paste your connection string into `backend/.env`.

### Step 2: Start the Backend Server
Open PowerShell or your terminal and navigate to the backend directory:
```powershell
cd "c:\Music Website\student-productivity-hub\backend"
npm start
```

You will see:
```
======================================================
🎓 Student Productivity Hub is live!
🌐 Application URL: http://localhost:5000
🩺 Health API URL:  http://localhost:5000/api/health
======================================================
```

### Step 3: Open in Browser
Open your browser and navigate to:
```
http://localhost:5000
```
- Click **"Register here"** to create your student account.
- Once registered, you will be automatically redirected to your personal **Dashboard**!

---

## 🎓 Comprehensive College Viva & Interview Guide

### Q1: What is the architecture of this project?
**Answer:** The project follows a **Three-Tier Architecture**:
1. **Presentation Layer (Frontend):** Pure HTML5, CSS3, and Vanilla JavaScript using the Fetch API.
2. **Application Layer (Backend):** Node.js and Express.js providing RESTful API endpoints.
3. **Data Layer (Database):** MongoDB managed through Mongoose ODM.

### Q2: Why did you not use React or Bootstrap?
**Answer:** 
1. Using pure Vanilla JavaScript and native CSS eliminates large bundle overheads, improves initial load performance, and demonstrates a thorough understanding of core web fundamentals: DOM manipulation, event handling, asynchronous networking, and responsive CSS Grid/Flexbox layouts.
2. Avoiding heavy CSS frameworks ensures complete control over design customization, allowing a lightweight dark navy sidebar and card theme.

### Q3: How does the client communicate with the backend?
**Answer:** The client sends asynchronous HTTP requests using the native browser `fetch()` API. Each request sends JSON data with the `Content-Type: application/json` header, and includes the student's JWT token in the `Authorization: Bearer <token>` header. The Express backend receives the request, passes it through authentication middleware, processes business logic in controllers, and returns a JSON response.

### Q4: How is security handled for student data?
**Answer:**
1. Passwords are salted and hashed using `bcryptjs` before being saved to MongoDB.
2. API routes are protected using JWT authentication middleware (`protect`).
3. Database queries strictly scope records by `user: req.user._id`, ensuring complete privacy and isolation between different student accounts.

### Q5: What is the purpose of Mongoose?
**Answer:** MongoDB is naturally schema-less. Mongoose acts as an Object Data Modeling (ODM) layer on top of MongoDB, providing schema definitions, type checking, validation rules, default values, and relational references between models.
