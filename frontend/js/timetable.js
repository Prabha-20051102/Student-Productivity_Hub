/**
 * Student Productivity Hub - Timetable Controller
 * -----------------------------------------------
 * Manages weekly schedule slots, day filter tabs, and modal actions.
 */

let allSlots = [];
let selectedDay = 'All';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  loadTimetable();

  // Day filter tabs
  const tabs = document.querySelectorAll('.day-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.classList.remove('btn-primary');
        t.classList.add('btn-secondary');
      });
      tab.classList.add('active');
      tab.classList.remove('btn-secondary');
      tab.classList.add('btn-primary');

      selectedDay = tab.getAttribute('data-day');
      renderTimetable();
    });
  });

  // Modal setup
  const modal = document.getElementById('timetableModal');
  const openBtn = document.getElementById('openAddSlotBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const form = document.getElementById('timetableForm');

  openBtn.addEventListener('click', () => openModal());
  closeBtn.addEventListener('click', () => closeModal());
  cancelBtn.addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', handleSaveSlot);
});

async function loadTimetable() {
  try {
    const res = await apiFetch('/timetable');
    if (!res) return;

    const data = await res.json();
    if (data.success) {
      allSlots = data.timetable;
      renderTimetable();
    }
  } catch (error) {
    console.error('Failed to load timetable:', error);
  }
}

function renderTimetable() {
  const tbody = document.getElementById('timetableTableBody');

  let filtered = allSlots;
  if (selectedDay !== 'All') {
    filtered = allSlots.filter((s) => s.day === selectedDay);
  }

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <p>No timetable entries found for ${selectedDay === 'All' ? 'this week' : selectedDay}.</p>
            <button class="btn btn-primary btn-sm" onclick="openModal()">+ Add Schedule Slot</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach((slot) => {
    html += `
      <tr>
        <td><strong style="color: var(--primary);">${escapeHtml(slot.day)}</strong></td>
        <td>
          <span class="badge" style="background: #eef2ff; color: #4338ca; font-size: 13px;">
            🕒 ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}
          </span>
        </td>
        <td><strong style="font-size: 14px; color: var(--text-primary);">${escapeHtml(slot.subject)}</strong></td>
        <td>${slot.room ? `📍 ${escapeHtml(slot.room)}` : '<span style="color: var(--text-muted);">-</span>'}</td>
        <td>${slot.instructor ? `👤 ${escapeHtml(slot.instructor)}` : '<span style="color: var(--text-muted);">-</span>'}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="editSlot('${slot._id}')" style="margin-right: 6px;">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteSlot('${slot._id}')">
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
function openModal(slot = null) {
  const modal = document.getElementById('timetableModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('timetableForm');

  form.reset();
  document.getElementById('slotId').value = '';

  if (slot) {
    title.textContent = 'Edit Timetable Slot';
    document.getElementById('slotId').value = slot._id;
    document.getElementById('subjectName').value = slot.subject;
    document.getElementById('dayOfWeek').value = slot.day;
    document.getElementById('startTime').value = slot.startTime;
    document.getElementById('endTime').value = slot.endTime;
    document.getElementById('roomNumber').value = slot.room || '';
    document.getElementById('instructorName').value = slot.instructor || '';
  } else {
    title.textContent = 'Add Timetable Slot';
    if (selectedDay !== 'All') {
      document.getElementById('dayOfWeek').value = selectedDay;
    }
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('timetableModal').classList.remove('active');
}

async function handleSaveSlot(e) {
  e.preventDefault();

  const slotId = document.getElementById('slotId').value;
  const subject = document.getElementById('subjectName').value.trim();
  const day = document.getElementById('dayOfWeek').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const room = document.getElementById('roomNumber').value.trim();
  const instructor = document.getElementById('instructorName').value.trim();

  const saveBtn = document.getElementById('saveSlotBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const isEdit = Boolean(slotId);
    const endpoint = isEdit ? `/timetable/${slotId}` : '/timetable';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify({ subject, day, startTime, endTime, room, instructor })
    });

    if (res && res.ok) {
      closeModal();
      await loadTimetable();
    } else {
      const data = await res.json();
      alert(data.message || 'Error saving timetable slot');
    }
  } catch (err) {
    console.error('Error saving slot:', err);
    alert('Server error occurred.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Slot';
  }
}

function editSlot(id) {
  const slot = allSlots.find((s) => s._id === id);
  if (slot) {
    openModal(slot);
  }
}

async function deleteSlot(id) {
  if (!confirm('Are you sure you want to remove this timetable slot?')) {
    return;
  }

  try {
    const res = await apiFetch(`/timetable/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      await loadTimetable();
    }
  } catch (err) {
    console.error('Error deleting slot:', err);
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hour, min] = timeStr.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedH = h % 12 || 12;
  return `${formattedH}:${min} ${ampm}`;
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
