import { topDisplay } from '../dom.js';
import state from '../state.js';

export function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export function updateTopDisplay({ timers, routineElapsed }) {
  const routineTotal = timers.reduce((sum, t) => sum + (t.duration || 0), 0);
  const routineElapsedStr = formatTime(Math.min(routineElapsed, routineTotal));
  const routineTotalStr = formatTime(routineTotal);
  const name = (state.currentRoutineName || '').trim() || 'unsaved';
  const isCompleted = (!state.isRunning && timers.length > 0 && state.currentTimerIndex >= timers.length) || (routineTotal > 0 && routineElapsed >= routineTotal);

  // Build a progress bar like timer rows
  const checkSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const pct = routineTotal > 0 ? Math.min(100, Math.max(0, (Math.min(routineElapsed, routineTotal) / routineTotal) * 100)) : 0;

  topDisplay.innerHTML = `
    <div class="progress-track routine-progress">
      <div class="progress-fill" style="width:${pct}%"></div>
      ${isCompleted ? `<div class="progress-check">${checkSvg}</div>` : ''}
      <div class="progress-text">
        <span class="progress-left">${name}</span>
        <span class="progress-right">${routineElapsedStr} / ${routineTotalStr}</span>
      </div>
    </div>
  `;
}

