/**
 * Student Productivity Hub - Tasks Controller
 * -------------------------------------------
 * Handles full CRUD operations, filters, priority tagging,
 * and completion toggling for daily student tasks.
 */

let allTasks = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // Set default due date in modal to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('taskDueDate').value = today;

  // Initial load
  loadTasks();

  // Bind filter events
  document.getElementById('filterStatus').addEventListener('change', loadTasks);
  document.getElementById('filterPriority').addEventListener('change', loadTasks);
  document.getElementById('searchTaskInput').addEventListener('input', debounce(loadTasks, 300));

  // Modal events
  const modal = document.getElementById('taskModal');
  const openBtn = document.getElementById('openAddTaskBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const form = document.getElementById('taskForm');

  openBtn.addEventListener('click', () => openModal());
  closeBtn.addEventListener('click', () => closeModal());
  cancelBtn.addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', handleSaveTask);
});

async function loadTasks() {
  const status = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const search = document.getElementById('searchTaskInput').value.trim();

  let query = `?status=${encodeURIComponent(status)}&priority=${encodeURIComponent(priority)}`;
  if (search) {
    query += `&search=${encodeURIComponent(search)}`;
  }

  try {
    const res = await apiFetch(`/tasks${query}`);
    if (!res) return;

    const data = await res.json();
    if (data.success) {
      allTasks = data.tasks;
      renderTasks(allTasks);
      document.getElementById('taskCountLabel').textContent = allTasks.length;
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

function renderTasks(tasks) {
  const tbody = document.getElementById('tasksTableBody');

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>No tasks found matching your filter criteria.</p>
            <button class="btn btn-primary btn-sm" onclick="openModal()">+ Add Your First Task</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  tasks.forEach((task) => {
    const isCompleted = task.status === 'Completed';
    const dueFormatted = new Date(task.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const priorityBadge = task.priority === 'High' ? 'badge-high' : (task.priority === 'Medium' ? 'badge-medium' : 'badge-low');
    const statusBadge = isCompleted ? 'badge-completed' : 'badge-pending';

    html += `
      <tr style="${isCompleted ? 'opacity: 0.7; background: #fafafa;' : ''}">
        <td style="text-align: center;">
          <input 
            type="checkbox" 
            ${isCompleted ? 'checked' : ''} 
            onchange="toggleTaskStatus('${task._id}')" 
            style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);"
            title="Mark as ${isCompleted ? 'Pending' : 'Completed'}"
          >
        </td>
        <td>
          <div style="font-weight: 600; font-size: 14px; ${isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-primary);'}">
            ${escapeHtml(task.title)}
          </div>
          ${task.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(task.description)}</p>` : ''}
        </td>
        <td><span class="badge ${priorityBadge}">${task.priority}</span></td>
        <td><span style="font-size: 13px; font-weight: 500;">${dueFormatted}</span></td>
        <td><span class="badge ${statusBadge}">${task.status}</span></td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="editTask('${task._id}')" style="margin-right: 6px;">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// -----------------------------------------------------------------------------
// Modal & Form Handlers
// -----------------------------------------------------------------------------
function openModal(task = null) {
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('taskForm');

  form.reset();
  document.getElementById('taskId').value = '';

  if (task) {
    title.textContent = 'Edit Task';
    document.getElementById('taskId').value = task._id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate.split('T')[0];
  } else {
    title.textContent = 'Add New Task';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').value = today;
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('taskModal').classList.remove('active');
}

async function handleSaveTask(e) {
  e.preventDefault();

  const taskId = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;

  const saveBtn = document.getElementById('saveTaskBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const isEdit = Boolean(taskId);
    const endpoint = isEdit ? `/tasks/${taskId}` : '/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify({ title, description, priority, dueDate })
    });

    if (res && res.ok) {
      closeModal();
      await loadTasks();
    } else {
      const data = await res.json();
      alert(data.message || 'Error saving task');
    }
  } catch (err) {
    console.error('Error saving task:', err);
    alert('Server error occurred while saving task.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Task';
  }
}

// -----------------------------------------------------------------------------
// Actions: Edit, Delete, Toggle
// -----------------------------------------------------------------------------
function editTask(id) {
  const task = allTasks.find((t) => t._id === id);
  if (task) {
    openModal(task);
  }
}

async function toggleTaskStatus(id) {
  try {
    const res = await apiFetch(`/tasks/${id}/toggle`, { method: 'PATCH' });
    if (res && res.ok) {
      await loadTasks();
    }
  } catch (err) {
    console.error('Error toggling status:', err);
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to permanently delete this task?')) {
    return;
  }

  try {
    const res = await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      await loadTasks();
    }
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

// Utility: Debounce for search input
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
