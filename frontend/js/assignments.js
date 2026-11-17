/**
 * Student Productivity Hub - Assignments Controller
 * -------------------------------------------------
 * Handles assignment CRUD, deadline monitoring, status updates,
 * and highlights for upcoming/overdue submissions.
 */

let allAssignments = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  loadAssignments();

  // Filters
  document.getElementById('assignmentStatusFilter').addEventListener('change', loadAssignments);
  document.getElementById('assignmentSubjectFilter').addEventListener('input', debounce(loadAssignments, 300));

  // Modal setup
  const modal = document.getElementById('assignmentModal');
  const openBtn = document.getElementById('openAddAssignmentBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const form = document.getElementById('assignmentForm');

  openBtn.addEventListener('click', () => openModal());
  closeBtn.addEventListener('click', () => closeModal());
  cancelBtn.addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', handleSaveAssignment);
});

async function loadAssignments() {
  const status = document.getElementById('assignmentStatusFilter').value;
  const subject = document.getElementById('assignmentSubjectFilter').value.trim();

  let query = `?status=${encodeURIComponent(status)}`;
  if (subject) {
    query += `&subject=${encodeURIComponent(subject)}`;
  }

  try {
    const res = await apiFetch(`/assignments${query}`);
    if (!res) return;

    const data = await res.json();
    if (data.success) {
      allAssignments = data.assignments;
      renderAssignments(allAssignments);
      document.getElementById('assignmentCountLabel').textContent = allAssignments.length;
    }
  } catch (error) {
    console.error('Failed to load assignments:', error);
  }
}

function renderAssignments(assignments) {
  const tbody = document.getElementById('assignmentsTableBody');

  if (!assignments || assignments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📖</div>
            <p>No assignments found matching your criteria.</p>
            <button class="btn btn-primary btn-sm" onclick="openModal()">+ Add New Assignment</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  assignments.forEach((a) => {
    const d = new Date(a.deadline);
    const deadlineFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let alertBadge = '<span style="color: var(--text-muted); font-size: 13px;">On Track</span>';
    if (a.isOverdue) {
      alertBadge = '<span class="badge badge-overdue">⚠️ OVERDUE</span>';
    } else if (a.isUpcoming) {
      alertBadge = '<span class="badge badge-upcoming">⏰ DUE SOON</span>';
    } else if (a.status === 'Completed') {
      alertBadge = '<span class="badge badge-completed">DONE</span>';
    }

    let statusBadgeClass = 'badge-not-started';
    if (a.status === 'In Progress') statusBadgeClass = 'badge-in-progress';
    if (a.status === 'Completed') statusBadgeClass = 'badge-completed';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${escapeHtml(a.title)}</div>
          ${a.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(a.description)}</p>` : ''}
        </td>
        <td><strong style="color: var(--primary);">${escapeHtml(a.subject)}</strong></td>
        <td><span style="font-size: 13px; font-weight: 500;">${deadlineFormatted}</span></td>
        <td>${alertBadge}</td>
        <td>
          <select 
            class="form-control" 
            style="width: 130px; padding: 4px 8px; font-size: 12px;" 
            onchange="updateAssignmentStatus('${a._id}', this.value)"
          >
            <option value="Not Started" ${a.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="editAssignment('${a._id}')" style="margin-right: 6px;">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${a._id}')">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// -----------------------------------------------------------------------------
// Modal & Handlers
// -----------------------------------------------------------------------------
function openModal(assignment = null) {
  const modal = document.getElementById('assignmentModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('assignmentForm');

  form.reset();
  document.getElementById('assignmentId').value = '';

  if (assignment) {
    title.textContent = 'Edit Assignment';
    document.getElementById('assignmentId').value = assignment._id;
    document.getElementById('assignmentTitle').value = assignment.title;
    document.getElementById('assignmentSubject').value = assignment.subject;
    document.getElementById('assignmentDescription').value = assignment.description || '';
    
    // Format to YYYY-MM-DDTHH:MM for input datetime-local
    const d = new Date(assignment.deadline);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d - tzOffset).toISOString().slice(0, 16);
    document.getElementById('assignmentDeadline').value = localISOTime;
    document.getElementById('assignmentStatus').value = assignment.status;
  } else {
    title.textContent = 'Add Assignment';
    // Default deadline to 3 days from now at 23:59
    const future = new Date();
    future.setDate(future.getDate() + 3);
    future.setHours(23, 59, 0, 0);
    const tzOffset = future.getTimezoneOffset() * 60000;
    document.getElementById('assignmentDeadline').value = new Date(future - tzOffset).toISOString().slice(0, 16);
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('assignmentModal').classList.remove('active');
}

async function handleSaveAssignment(e) {
  e.preventDefault();

  const assignmentId = document.getElementById('assignmentId').value;
  const title = document.getElementById('assignmentTitle').value.trim();
  const subject = document.getElementById('assignmentSubject').value.trim();
  const description = document.getElementById('assignmentDescription').value.trim();
  const deadline = document.getElementById('assignmentDeadline').value;
  const status = document.getElementById('assignmentStatus').value;

  const saveBtn = document.getElementById('saveAssignmentBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const isEdit = Boolean(assignmentId);
    const endpoint = isEdit ? `/assignments/${assignmentId}` : '/assignments';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify({ title, subject, description, deadline, status })
    });

    if (res && res.ok) {
      closeModal();
      await loadAssignments();
    } else {
      const data = await res.json();
      alert(data.message || 'Error saving assignment');
    }
  } catch (err) {
    console.error('Error saving assignment:', err);
    alert('Server error occurred.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Assignment';
  }
}

async function updateAssignmentStatus(id, newStatus) {
  try {
    const res = await apiFetch(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (res && res.ok) {
      await loadAssignments();
    }
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

function editAssignment(id) {
  const assignment = allAssignments.find((a) => a._id === id);
  if (assignment) {
    openModal(assignment);
  }
}

async function deleteAssignment(id) {
  if (!confirm('Are you sure you want to delete this assignment?')) {
    return;
  }

  try {
    const res = await apiFetch(`/assignments/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      await loadAssignments();
    }
  } catch (err) {
    console.error('Error deleting assignment:', err);
  }
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
