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
  state.timeLeft--;
  state.currentTimerElapsed++;
  state.routineElapsed++;
  updateTopDisplay(state);
  if (state.timeLeft <= 0) {
    clearInterval(state.timerInterval);
    const timer = state.timers[state.currentTimerIndex];
    playChime(timer?.chime || 1);
    state.currentTimerIndex++;
    runRoutine();
  }
}

export function runRoutine(resume = false) {
  if (state.currentTimerIndex >= state.timers.length) {
    state.isRunning = false;
    state.isPaused = false;
    updateToggleButton(state);
    updateTopDisplay(state);
    return;
  }
  const timer = state.timers[state.currentTimerIndex];
  if (!resume) {
    state.timeLeft = timer.duration || 0;
    state.currentTimerElapsed = 0;
    if (state.currentTimerIndex === 0) state.routineElapsed = 0;
  }
  updateTopDisplay(state);
  updateToggleButton(state);

  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tick, 1000);
}

export function togglePlayPause() {
  if (state.timers.length === 0) return;
  if (!state.isRunning) {
    state.isRunning = true;
    state.isPaused = false;
    state.currentTimerIndex = 0;
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

export function stopRoutine() {
  if (!state.isRunning) return;
  clearInterval(state.timerInterval);
  state.isRunning = false;
  state.isPaused = false;
  resetProgress();
  updateTopDisplay(state);
  updateToggleButton(state);
}

export function stopRoutineIfRunning() {
  if (state.isRunning) stopRoutine();
}

