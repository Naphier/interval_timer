// DOM references and setup helpers

const timersContainer = document.getElementById('timers-container');
const addTimerBtn = document.getElementById('add-timer');
const routineForm = document.getElementById('routine-form');
const routineNameInput = document.getElementById('routine-name');
const audioEl = document.getElementById('chime-audio');

// Top display (routine + current timer times)
const topDisplay = document.createElement('div');
topDisplay.id = 'top-display';
topDisplay.style.display = 'flex';
topDisplay.style.justifyContent = 'space-between';
topDisplay.style.alignItems = 'center';
topDisplay.style.fontSize = '18px';
topDisplay.style.color = '#a3a3a3';
topDisplay.style.fontWeight = 'bold';
topDisplay.style.marginBottom = '18px';
routineForm.parentNode.insertBefore(topDisplay, routineForm);

// Controls container and buttons
const controlsContainer = document.createElement('div');
controlsContainer.className = 'controls-row';
timersContainer.parentNode.insertBefore(controlsContainer, timersContainer.nextSibling);

const toggleRoutineBtn = document.createElement('button');
toggleRoutineBtn.id = 'toggle-routine';
toggleRoutineBtn.style.flex = '1';
toggleRoutineBtn.style.height = '44px';
toggleRoutineBtn.style.marginBottom = '0';
toggleRoutineBtn.style.display = 'block';
toggleRoutineBtn.style.minWidth = '0';
toggleRoutineBtn.style.boxSizing = 'border-box';

const stopRoutineBtn = document.createElement('button');
stopRoutineBtn.textContent = 'Stop';
stopRoutineBtn.id = 'stop-routine';
stopRoutineBtn.style.flex = '1';
stopRoutineBtn.style.height = '44px';
stopRoutineBtn.style.marginBottom = '0';
stopRoutineBtn.style.display = 'block';
stopRoutineBtn.style.minWidth = '0';
stopRoutineBtn.style.boxSizing = 'border-box';

controlsContainer.appendChild(toggleRoutineBtn);
controlsContainer.appendChild(stopRoutineBtn);

export function updateToggleButton({ isRunning, isPaused }) {
  if (!isRunning || isPaused) {
    toggleRoutineBtn.innerHTML = '<span style="font-size:24px;">&#9654;</span>';
  } else {
    toggleRoutineBtn.innerHTML = '<span style="font-size:24px;">&#10073;&#10073;</span>';
  }
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

