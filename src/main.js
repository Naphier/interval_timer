import state from './state.js';
import { addTimerBtn, routineForm, routineNameInput, toggleRoutineBtn, stopRoutineBtn } from './dom.js';
import { updateTopDisplay } from './ui/topDisplay.js';
import { updateToggleButton } from './dom.js';
import { renderTimers } from './timersList.js';
import { stopRoutineIfRunning, togglePlayPause, stopRoutine } from './runner.js';
import { saveRoutine, loadRoutine, listRoutines, deleteRoutine, getLastUsedRoutine } from './storage.js';

function autoSave() {
  const name = routineNameInput.value.trim();
  if (name) saveRoutine(name, state.timers);
}

// Timers change handler: stop if running, then autosave
function onTimersChanged() {
  stopRoutineIfRunning();
  autoSave();
  updateTopDisplay(state);
}

// Add timer button
addTimerBtn.addEventListener('click', () => {
  state.timers.push({ name: '', duration: 60, chime: 1 });
  renderTimers(state, { onChange: onTimersChanged });
  onTimersChanged();
});

// Controls
toggleRoutineBtn.addEventListener('click', () => {
  togglePlayPause();
});

stopRoutineBtn.addEventListener('click', () => {
  stopRoutine();
});

// Save routine form
routineForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = routineNameInput.value.trim();
  if (!name) return;
  saveRoutine(name, state.timers);
  alert(`Routine "${name}" saved!`);
  populateRoutineDropdown();
});

// Load/Delete UI
let loadSelect;

function buildLoadUI() {
  const oldForm = document.getElementById('load-routine-form');
  if (oldForm) oldForm.remove();

  const loadForm = document.createElement('form');
  loadForm.id = 'load-routine-form';
  loadForm.style.display = 'flex';
  loadForm.style.gap = '12px';
  loadForm.style.marginBottom = '16px';

  loadSelect = document.createElement('select');
  loadSelect.id = 'load-routine-select';
  const def = document.createElement('option');
  def.value = '';
  def.textContent = 'Select Routine';
  loadSelect.appendChild(def);

  const loadBtn = document.createElement('button');
  loadBtn.type = 'submit';
  loadBtn.textContent = 'Load Routine';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Delete Routine';
  deleteBtn.addEventListener('click', () => {
    const selectedName = loadSelect.value;
    if (!selectedName) return;
    if (confirm(`Delete routine "${selectedName}"? This cannot be undone.`)) {
      deleteRoutine(selectedName);
      populateRoutineDropdown();
      loadSelect.value = '';
      alert(`Routine "${selectedName}" deleted.`);
    }
  });

  loadForm.appendChild(loadSelect);
  loadForm.appendChild(loadBtn);
  loadForm.appendChild(deleteBtn);
  routineForm.parentNode.insertBefore(loadForm, routineForm.nextSibling);

  loadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedName = loadSelect.value;
    if (!selectedName) return;
    const loaded = loadRoutine(selectedName);
    if (!loaded) {
      alert(`Routine "${selectedName}" not found.`);
      return;
    }
    state.timers.length = 0;
    loaded.forEach((t) => state.timers.push(t));
    renderTimers(state, { onChange: onTimersChanged });
    routineNameInput.value = selectedName;
    updateTopDisplay(state);
  });
}

function populateRoutineDropdown() {
  // clear existing options except first
  while (loadSelect.options.length > 1) loadSelect.remove(1);
  listRoutines().forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    loadSelect.appendChild(opt);
  });
}

// Initialize
buildLoadUI();
populateRoutineDropdown();

// Load last used routine if available
window.addEventListener('DOMContentLoaded', () => {
  const last = getLastUsedRoutine();
  if (last) {
    const loaded = loadRoutine(last);
    if (loaded) {
      state.timers.length = 0;
      loaded.forEach((t) => state.timers.push(t));
      renderTimers(state, { onChange: onTimersChanged });
      routineNameInput.value = last;
      if (loadSelect) loadSelect.value = last;
    }
  }
  // First paint
  renderTimers(state, { onChange: onTimersChanged });
  updateTopDisplay(state);
  updateToggleButton(state);
});

