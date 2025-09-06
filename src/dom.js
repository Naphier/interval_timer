// DOM references and setup helpers

const timersContainer = document.getElementById('timers-container');
const addTimerBtn = document.getElementById('add-timer');
const routineForm = document.getElementById('routine-form');
const routineNameInput = document.getElementById('routine-name');
const audioEl = document.getElementById('chime-audio');

// Top display (routine + current timer times)
const topDisplay = document.createElement('div');
topDisplay.id = 'top-display';
routineForm.parentNode.insertBefore(topDisplay, routineForm);

// Controls container and buttons
const controlsContainer = document.createElement('div');
controlsContainer.className = 'controls-row';
timersContainer.parentNode.insertBefore(controlsContainer, timersContainer.nextSibling);

const toggleRoutineBtn = document.createElement('button');
toggleRoutineBtn.id = 'toggle-routine';
toggleRoutineBtn.className = 'btn btn--icon btn--primary';

const stopRoutineBtn = document.createElement('button');
stopRoutineBtn.textContent = 'Stop';
stopRoutineBtn.id = 'stop-routine';
stopRoutineBtn.className = 'btn btn--danger';

controlsContainer.appendChild(toggleRoutineBtn);
controlsContainer.appendChild(stopRoutineBtn);

export function updateToggleButton({ isRunning, isPaused }) {
  // Use unicode icons and style via CSS
  toggleRoutineBtn.textContent = (!isRunning || isPaused) ? '\u25B6' : '\u23F8';
}

export {
  timersContainer,
  addTimerBtn,
  routineForm,
  routineNameInput,
  topDisplay,
  controlsContainer,
  toggleRoutineBtn,
  stopRoutineBtn,
  audioEl,
};

