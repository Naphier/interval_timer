import { topDisplay } from '../dom.js';
import state from '../state.js';

export function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export function updateTopDisplay({ timers, routineElapsed }) {
  let routineTotal = timers.reduce((sum, t) => {
    const reps = Math.min(99, Math.max(1, parseInt(t.repeats || 1, 10)));
    return sum + (t.duration || 0) * reps;
  }, 0);
  if (state.chain) {
    const block = timers.slice(state.chain.start, state.chain.end + 1).reduce((sum, t) => {
      const reps = Math.min(99, Math.max(1, parseInt(t.repeats || 1, 10)));
      return sum + (t.duration || 0) * reps;
    }, 0);
    const chainReps = Math.min(99, Math.max(1, parseInt(state.chain.repeats || 1, 10)));
    routineTotal += block * (chainReps - 1);
  }
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

