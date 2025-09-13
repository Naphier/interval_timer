import state, { resetProgress } from './state.js';
import { audioEl, stopRoutineBtn, toggleRoutineBtn } from './dom.js';
import { updateTopDisplay } from './ui/topDisplay.js';
import { updateToggleButton } from './dom.js';

function playChime(chimeNumber) {
  const numStr = (chimeNumber || 1).toString().padStart(2, '0');
  audioEl.src = `sounds/Alarm${numStr}.wav`;
  audioEl.play();
}

function tick() {
  if (state.isPaused) return;
  state.lastTickAtMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const speed = Math.max(1, Math.floor(state.speedMultiplier || 1));
  const advance = Math.min(speed, Math.max(0, state.timeLeft || 0));
  state.timeLeft -= advance;
  state.currentTimerElapsed += advance;
  state.routineElapsed += advance;
  updateTopDisplay(state);
  document.dispatchEvent(new CustomEvent('timers:updated'));
  if (state.timeLeft <= 0) {
    clearInterval(state.timerInterval);
    const timer = state.timers[state.currentTimerIndex];
    playChime(timer?.chime || 1);
    const totalRepeats = Math.min(99, Math.max(1, parseInt(timer?.repeats || 1, 10)));
    if (state.currentRepeat < totalRepeats) {
      // Next repetition of the same timer
      state.currentRepeat++;
      runRoutine(false);
    } else {
      // Move to next timer
      state.currentTimerIndex++;
      state.currentRepeat = 1;
      runRoutine();
    }
  }
}

export function runRoutine(resume = false) {
  if (state.currentTimerIndex >= state.timers.length) {
    state.isRunning = false;
    state.isPaused = false;
    updateToggleButton(state);
    updateTopDisplay(state);
    document.dispatchEvent(new CustomEvent('timers:updated'));
    return;
  }
  const timer = state.timers[state.currentTimerIndex];
  if (!resume) {
    state.timeLeft = timer.duration || 0;
    state.currentTimerElapsed = 0;
    if (state.currentTimerIndex === 0) state.routineElapsed = 0;
  }
  state.lastTickAtMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  updateTopDisplay(state);
  updateToggleButton(state);
  document.dispatchEvent(new CustomEvent('timers:updated'));

  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tick, 1000);
}

export function togglePlayPause() {
  if (state.timers.length === 0) return;
  if (!state.isRunning) {
    state.isRunning = true;
    state.isPaused = false;
    state.currentTimerIndex = 0;
    state.currentRepeat = 1;
    stopRoutineBtn.disabled = false;
    runRoutine();
  } else if (!state.isPaused) {
    state.isPaused = true;
    clearInterval(state.timerInterval);
    updateTopDisplay(state);
  } else {
    state.isPaused = false;
    runRoutine(true);
  }
  updateToggleButton(state);
}

export function skipCurrentTimer() {
  if (!state.isRunning) return;
  const remaining = Math.max(0, state.timeLeft || 0);
  state.routineElapsed += remaining;
  clearInterval(state.timerInterval);
  state.currentTimerIndex++;
  state.currentRepeat = 1;
  runRoutine();
}

export function stopRoutine() {
  // Always reset the routine, even if not currently running
  clearInterval(state.timerInterval);
  state.isRunning = false;
  state.isPaused = false;
  resetProgress();
  updateTopDisplay(state);
  updateToggleButton(state);
  document.dispatchEvent(new CustomEvent('timers:updated'));
}

export function stopRoutineIfRunning() {
  if (state.isRunning) stopRoutine();
}

