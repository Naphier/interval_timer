import { topDisplay } from '../dom.js';

export function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export function updateTopDisplay({ timers, routineElapsed, currentTimerElapsed, currentTimerIndex }) {
  const routineTotal = timers.reduce((sum, t) => sum + (t.duration || 0), 0);
  const routineElapsedStr = formatTime(routineElapsed);
  const routineTotalStr = formatTime(routineTotal);

  const currentTimerDur = timers[currentTimerIndex] ? timers[currentTimerIndex].duration : 0;
  const currentTimerElapsedStr = formatTime(currentTimerElapsed);
  const currentTimerDurStr = formatTime(currentTimerDur);

  topDisplay.innerHTML = `
    <span style="float:left;">Routine: ${routineElapsedStr} | ${routineTotalStr}</span>
    <span style="float:right;">Current: ${currentTimerElapsedStr} | ${currentTimerDurStr}</span>
  `;
}

