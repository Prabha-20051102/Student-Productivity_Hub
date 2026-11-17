/**
 * Student Productivity Hub - Pomodoro Timer Controller
 * ----------------------------------------------------
 * High-precision countdown timer, study/break mode switching,
 * sound notification, and persistent MongoDB session logging.
 */

let timerInterval = null;
let currentMode = 'study'; // 'study', 'short_break', 'long_break'
let totalSeconds = 25 * 60;
let remainingSeconds = 25 * 60;
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  loadPomodoroStats();

  // Mode buttons
  const modeButtons = document.querySelectorAll('.timer-mode-btn');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');
      const minutes = parseInt(btn.getAttribute('data-time'), 10);
      setTimerMode(mode, minutes);
    });
  });

  // Action buttons
  document.getElementById('startPauseBtn').addEventListener('click', toggleStartPause);
  document.getElementById('resetBtn').addEventListener('click', resetTimer);
});

function setTimerMode(mode, minutes) {
  pauseTimer();
  currentMode = mode;
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  updateTimerDisplay();

  const labelEl = document.getElementById('timerLabel');
  if (mode === 'study') {
    labelEl.textContent = 'Stay Focused & Concentrate';
  } else if (mode === 'short_break') {
    labelEl.textContent = 'Short Break - Stretch & Relax';
  } else {
    labelEl.textContent = 'Long Break - Rest & Recharge';
  }
}

function toggleStartPause() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  const startBtn = document.getElementById('startPauseBtn');
  startBtn.textContent = 'Pause Timer';
  startBtn.classList.remove('btn-primary');
  startBtn.classList.add('btn-secondary');

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      handleTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;

  clearInterval(timerInterval);
  isRunning = false;
  const startBtn = document.getElementById('startPauseBtn');
  startBtn.textContent = 'Resume Timer';
  startBtn.classList.remove('btn-secondary');
  startBtn.classList.add('btn-primary');
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  updateTimerDisplay();
  const startBtn = document.getElementById('startPauseBtn');
  startBtn.textContent = 'Start Timer';
  startBtn.classList.remove('btn-secondary');
  startBtn.classList.add('btn-primary');
}

function updateTimerDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  document.getElementById('timerDisplay').textContent = formatted;
  document.title = `(${formatted}) Pomodoro - Student Hub`;
}

async function handleTimerComplete() {
  playAlertTone();

  const startBtn = document.getElementById('startPauseBtn');
  startBtn.textContent = 'Start Timer';
  startBtn.classList.remove('btn-secondary');
  startBtn.classList.add('btn-primary');

  if (currentMode === 'study') {
    // 1. Save completed session to MongoDB
    try {
      await apiFetch('/pomodoro/session', {
        method: 'POST',
        body: JSON.stringify({
          durationMinutes: Math.round(totalSeconds / 60),
          sessionType: 'study'
        })
      });
      // 2. Refresh stats
      await loadPomodoroStats();
    } catch (err) {
      console.error('Failed to log pomodoro session:', err);
    }

    alert('🎉 Excellent job! You completed a 25-minute Pomodoro study session! Time for a well-deserved short break.');
    // Auto switch to short break
    const shortBreakBtn = document.querySelector('[data-mode="short_break"]');
    if (shortBreakBtn) shortBreakBtn.click();
  } else {
    alert('⏰ Break is over! Ready to begin another productive study session?');
    const studyBtn = document.querySelector('[data-mode="study"]');
    if (studyBtn) studyBtn.click();
  }
}

async function loadPomodoroStats() {
  try {
    const res = await apiFetch('/pomodoro/stats');
    if (!res) return;

    const data = await res.json();
    if (data.success) {
      document.getElementById('todaySessionsCount').textContent = data.todayCount;
      document.getElementById('todayFocusMinutes').textContent = `${data.todayMinutes} mins`;
      document.getElementById('totalPomodoroCount').textContent = data.totalCount;
    }
  } catch (err) {
    console.error('Error fetching pomodoro stats:', err);
  }
}

// Browser Audio Synth beep (no external audio file required)
function playAlertTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }
  } catch (e) {
    console.warn('Audio tone could not be played:', e);
  }
}
