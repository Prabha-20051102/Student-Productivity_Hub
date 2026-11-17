/**
 * Student Productivity Hub - Auth & Global Utilities
 * --------------------------------------------------
 * Handles token storage, route protection, API request headers,
 * student session state, and shared header/sidebar behaviors.
 */

// Relative API URL works seamlessly on any host and port
const API_BASE = '/api';

// -----------------------------------------------------------------------------
// Token & Session Storage
// -----------------------------------------------------------------------------
function getToken() {
  return localStorage.getItem('student_token');
}

function setToken(token) {
  localStorage.setItem('student_token', token);
}

function getUser() {
  const userStr = localStorage.getItem('student_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('student_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('student_token');
  localStorage.removeItem('student_user');
}

// -----------------------------------------------------------------------------
// Route Guards
// -----------------------------------------------------------------------------
// Call on protected pages (dashboard, tasks, timetable, etc.)
function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
  }
}

// Call on login / register pages
function redirectIfLoggedIn() {
  const token = getToken();
  if (token) {
    window.location.href = 'dashboard.html';
  }
}

// Logout student
function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// -----------------------------------------------------------------------------
// Helper: Authorized Fetch
// -----------------------------------------------------------------------------
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized (token expired / invalid), auto logout
  if (response.status === 401) {
    clearSession();
    window.location.href = 'index.html?session=expired';
    return;
  }

  return response;
}

// -----------------------------------------------------------------------------
// Header & UI Shared Initializer
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate current date
  const dateEl = document.getElementById('currentDateText');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // 2. Populate user info in header
  const user = getUser();
  if (user) {
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const avatarEl = document.getElementById('headerAvatar');

    if (nameEl) nameEl.textContent = user.name || 'Student';
    if (roleEl) roleEl.textContent = `${user.department || 'Student'} • ${user.semester || ''}`;
    if (avatarEl && user.name) {
      avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  // 3. Bind Logout buttons
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    });
  });

  // 4. Mobile sidebar toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  let overlay = document.querySelector('.sidebar-overlay');

  if (!overlay && sidebar) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }
});
