/**
 * Student Productivity Hub - Dashboard Controller
 * -----------------------------------------------
 * Fetches aggregated statistics and populates overview widgets.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure student is logged in
  checkAuth();

  await loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await apiFetch('/dashboard');
    if (!res) return;

    const data = await res.json();
    if (!data.success) {
      console.error('Failed to load dashboard:', data.message);
      return;
    }

    const { student, stats, todayClasses, upcomingAssignments, recentTasks, todayName } = data;

    // 1. Populate Welcome Hero
    const welcomeEl = document.getElementById('welcomeStudentName');
    if (welcomeEl && student.name) {
      welcomeEl.textContent = student.name;
    }
    const todayHero = document.getElementById('todayNameHero');
    if (todayHero) todayHero.textContent = todayName;

    const todayLabel = document.getElementById('todayLabel');
    if (todayLabel) todayLabel.textContent = todayName;

    const heroWeeklyHours = document.getElementById('heroWeeklyHours');
    if (heroWeeklyHours) heroWeeklyHours.textContent = `${stats.weeklyStudyHours} hrs`;

    const heroPendingTasks = document.getElementById('heroPendingTasks');
    if (heroPendingTasks) heroPendingTasks.textContent = stats.pendingTasks;

    // 2. Populate Metrics Cards
    document.getElementById('totalTasksCount').textContent = stats.totalTasks;
    document.getElementById('completedTasksCount').textContent = stats.completedTasks;
    document.getElementById('pendingTasksCount').textContent = stats.pendingTasks;
    document.getElementById('totalAssignmentsCount').textContent = stats.totalAssignments;
    document.getElementById('upcomingCount').textContent = stats.upcomingAssignmentsCount;

    // 3. Render Today's Timetable
    renderTodayTimetable(todayClasses);

    // 4. Render Upcoming Deadlines
    renderUpcomingAssignments(upcomingAssignments);

    // 5. Render Recent Tasks
    renderRecentTasks(recentTasks);

  } catch (error) {
    console.error('Error fetching dashboard:', error);
  }
}

function renderTodayTimetable(classes) {
  const container = document.getElementById('todayTimetableContainer');
  if (!classes || classes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <div class="empty-state-icon">🎉</div>
        <p>No classes or study sessions scheduled for today!</p>
        <a href="timetable.html" class="btn btn-outline btn-sm">Add Schedule Slot</a>
      </div>
    `;
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  classes.forEach((c) => {
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
        <div>
          <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${escapeHtml(c.subject)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">
            📍 ${c.room ? escapeHtml(c.room) : 'Room N/A'} • 👤 ${c.instructor ? escapeHtml(c.instructor) : 'Instructor N/A'}
          </div>
        </div>
        <span class="badge" style="background: #e0e7ff; color: #3730a3; font-weight: 600;">
          🕒 ${formatTime(c.startTime)} - ${formatTime(c.endTime)}
        </span>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderUpcomingAssignments(assignments) {
  const container = document.getElementById('upcomingDeadlinesContainer');
  if (!assignments || assignments.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <div class="empty-state-icon">✅</div>
        <p>No upcoming assignment deadlines this week!</p>
        <a href="assignments.html" class="btn btn-outline btn-sm">Add New Assignment</a>
      </div>
    `;
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  assignments.forEach((a) => {
    const d = new Date(a.deadline);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-sm); border-left: 4px solid #ef4444;">
        <div>
          <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${escapeHtml(a.title)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(a.subject)}</div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-upcoming">Due ${dateFormatted}</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderRecentTasks(tasks) {
  const tbody = document.getElementById('dashboardTasksTableBody');
  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
          No pending tasks! You are all caught up. <a href="tasks.html" style="color: var(--primary); font-weight: 600;">Create a new task</a>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  tasks.forEach((t) => {
    const due = new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const priorityClass = t.priority === 'High' ? 'badge-high' : (t.priority === 'Medium' ? 'badge-medium' : 'badge-low');
    
    html += `
      <tr>
        <td>
          <strong style="color: var(--text-primary); font-size: 14px;">${escapeHtml(t.title)}</strong>
          ${t.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${escapeHtml(t.description)}</p>` : ''}
        </td>
        <td><span class="badge ${priorityClass}">${t.priority}</span></td>
        <td>${due}</td>
        <td><span class="badge badge-pending">Pending</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="toggleTaskQuick('${t._id}')">
            Mark Done
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Quick action to complete task from dashboard
async function toggleTaskQuick(taskId) {
  try {
    const res = await apiFetch(`/tasks/${taskId}/toggle`, { method: 'PATCH' });
    if (!res) return;
    const data = await res.json();
    if (data.success) {
      await loadDashboard();
    }
  } catch (err) {
    console.error('Error toggling task:', err);
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
