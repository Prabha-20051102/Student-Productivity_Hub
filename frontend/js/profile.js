/**
 * Student Productivity Hub - Profile Controller
 * ----------------------------------------------
 * Displays student account details, handles profile edits,
 * and securely updates student passwords.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  loadUserProfile();

  document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
});

async function loadUserProfile() {
  try {
    const res = await apiFetch('/auth/profile');
    if (!res) return;

    const data = await res.json();
    if (data.success && data.user) {
      const u = data.user;

      // Update LocalStorage to keep in sync
      setUser(u);

      // Populate Header card
      document.getElementById('profileDisplayName').textContent = u.name;
      document.getElementById('profileDisplayEmail').textContent = u.email;
      document.getElementById('profileDisplayDept').textContent = u.department || 'General Studies';
      document.getElementById('profileDisplaySem').textContent = u.semester || 'Semester 1';
      document.getElementById('profileBigAvatar').textContent = u.name.charAt(0).toUpperCase();

      // Populate Form inputs
      document.getElementById('profileName').value = u.name;
      document.getElementById('profileEmail').value = u.email;
      document.getElementById('profileDepartment').value = u.department || '';
      document.getElementById('profileSemester').value = u.semester || '';
      document.getElementById('profileStudentId').value = u.studentId || '';

      // Update Top Nav Header
      const headerName = document.getElementById('headerUserName');
      const headerRole = document.getElementById('headerUserRole');
      const headerAvatar = document.getElementById('headerAvatar');

      if (headerName) headerName.textContent = u.name;
      if (headerRole) headerRole.textContent = `${u.department || 'Student'} • ${u.semester || ''}`;
      if (headerAvatar) headerAvatar.textContent = u.name.charAt(0).toUpperCase();
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();

  const name = document.getElementById('profileName').value.trim();
  const department = document.getElementById('profileDepartment').value.trim();
  const semester = document.getElementById('profileSemester').value.trim();
  const studentId = document.getElementById('profileStudentId').value.trim();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  const alertBox = document.getElementById('profileAlert');
  alertBox.style.display = 'none';

  const saveBtn = document.getElementById('saveProfileBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Changes...';

  const payload = { name, department, semester, studentId };
  if (newPassword) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
  }

  try {
    const res = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alertBox.textContent = data.message || 'Profile updated successfully!';
      alertBox.className = 'alert alert-success';
      alertBox.style.display = 'block';

      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';

      // Reload profile
      await loadUserProfile();
    } else {
      alertBox.textContent = data.message || 'Failed to update profile.';
      alertBox.className = 'alert alert-danger';
      alertBox.style.display = 'block';
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    alertBox.textContent = 'Server connection error occurred.';
    alertBox.className = 'alert alert-danger';
    alertBox.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}
