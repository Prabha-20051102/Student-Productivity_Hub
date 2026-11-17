/**
 * Student Productivity Hub - Study Progress Controller
 * ----------------------------------------------------
 * Logs study sessions, renders progress bars, calculates weekly metrics,
 * and maintains history of daily academic efforts.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // Set default study date to today
  document.getElementById('studyDate').value = new Date().toISOString().split('T')[0];

  loadAllProgressData();

  // Bind log form
  document.getElementById('logStudyForm').addEventListener('submit', handleLogStudy);
});

async function loadAllProgressData() {
  await Promise.all([loadProgressSummary(), loadStudyHistory()]);
}

async function loadProgressSummary() {
  try {
    const res = await apiFetch('/progress/summary');
    if (!res) return;

    const data = await res.json();
    if (!data.success) return;

    const s = data.summary;

    // 1. Metric cards
    document.getElementById('weeklyHoursVal').textContent = `${s.weeklyHours} hrs`;
    document.getElementById('taskRateVal').textContent = `${s.taskCompletionRate}%`;
    document.getElementById('taskCountsDesc').textContent = `${s.completedTasks} of ${s.totalTasks} completed`;

    document.getElementById('assignmentRateVal').textContent = `${s.assignmentCompletionRate}%`;
    document.getElementById('assignmentCountsDesc').textContent = `${s.completedAssignments} of ${s.totalAssignments} completed`;

    // 2. Goal Progress Bar
    document.getElementById('progressHoursText').textContent = s.weeklyHours;
    document.getElementById('progressTargetText').textContent = s.weeklyTarget;
    document.getElementById('weeklyPercentageText').textContent = `${s.weeklyProgressPercentage}%`;
    document.getElementById('weeklyGoalBar').style.width = `${s.weeklyProgressPercentage}%`;

    // 3. Subject-wise distribution
    renderSubjectBreakdown(s.subjectBreakdown);

  } catch (error) {
    console.error('Failed to load progress summary:', error);
  }
}

function renderSubjectBreakdown(breakdown) {
  const container = document.getElementById('subjectBreakdownContainer');

  if (!breakdown || breakdown.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 0;">
        <div class="empty-state-icon">📚</div>
        <p>No study hours logged this week yet. Use the form to log your study sessions!</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 14px;">';
  breakdown.forEach((item) => {
    html += `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
          <span style="color: var(--text-primary);">${escapeHtml(item.subject)}</span>
          <span style="color: var(--primary);">${item.hours} hrs (${item.percentage}%)</span>
        </div>
        <div class="progress-container" style="height: 8px;">
          <div class="progress-bar" style="width: ${item.percentage}%;"></div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function loadStudyHistory() {
  try {
    const res = await apiFetch('/progress');
    if (!res) return;

    const data = await res.json();
    if (!data.success) return;

    const tbody = document.getElementById('studyHistoryTableBody');
    const records = data.records;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No study records found. Log your first study session above!
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    records.forEach((r) => {
      const dateFormatted = new Date(r.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      html += `
        <tr>
          <td><span style="font-weight: 500;">${dateFormatted}</span></td>
          <td><strong style="color: var(--primary);">${escapeHtml(r.subject)}</strong></td>
          <td><span class="badge" style="background: #eef2ff; color: #4338ca; font-size: 13px;">${r.hoursSpent} hrs</span></td>
          <td style="color: var(--text-secondary); font-size: 13px;">${r.notes ? escapeHtml(r.notes) : '-'}</td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm" onclick="deleteRecord('${r._id}')">
              🗑️
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (error) {
    console.error('Failed to load study history:', error);
  }
}

async function handleLogStudy(e) {
  e.preventDefault();

  const subject = document.getElementById('studySubject').value.trim();
  const hoursSpent = parseFloat(document.getElementById('studyHours').value);
  const date = document.getElementById('studyDate').value;
  const notes = document.getElementById('studyNotes').value.trim();

  const logBtn = document.getElementById('logBtn');
  logBtn.disabled = true;
  logBtn.textContent = 'Recording...';

  try {
    const res = await apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify({ subject, hoursSpent, date, notes })
    });

    if (res && res.ok) {
      document.getElementById('studySubject').value = '';
      document.getElementById('studyHours').value = '';
      document.getElementById('studyNotes').value = '';
      await loadAllProgressData();
    } else {
      const errData = await res.json();
      alert(errData.message || 'Error logging study hours');
    }
  } catch (err) {
    console.error('Error logging study:', err);
    alert('Server connection error.');
  } finally {
    logBtn.disabled = false;
    logBtn.textContent = 'Record Study Session';
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to remove this study log?')) return;

  try {
    const res = await apiFetch(`/progress/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      await loadAllProgressData();
    }
  } catch (err) {
    console.error('Error deleting record:', err);
  }
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
