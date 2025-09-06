import state from './state.js';
import { addTimerBtn, routineForm, toggleRoutineBtn, stopRoutineBtn, openSaveModal, closeSaveModal, saveModalNameInput, saveModalSaveBtn, saveModalCancelBtn, saveModal, showToast, openConfirmModal, closeConfirmModal, confirmModal, confirmModalConfirmBtn, confirmModalCancelBtn } from './dom.js';
import { updateTopDisplay } from './ui/topDisplay.js';
import { updateToggleButton } from './dom.js';
import { renderTimers } from './timersList.js';
import { stopRoutineIfRunning, togglePlayPause, stopRoutine } from './runner.js';
import { saveRoutine, loadRoutine, listRoutines, deleteRoutine, getLastUsedRoutine, setLastUsedRoutine } from './storage.js';

function autoSave() {
  const name = state.currentRoutineName?.trim();
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

// Save routine form opens modal
routineForm.addEventListener('submit', (e) => {
  e.preventDefault();
  openSaveModal(state.currentRoutineName || '');
});

// Modal events
saveModalSaveBtn.addEventListener('click', () => {
  const name = (saveModalNameInput.value || '').trim();
  if (!name) { saveModalNameInput.focus(); return; }
  state.currentRoutineName = name;
  saveRoutine(name, state.timers);
  closeSaveModal();
  populateRoutineDropdown();
  if (loadSelect) loadSelect.value = name;
  updateDeleteButtonState();
  showToast(`Saved "${name}"`);
});
saveModalCancelBtn.addEventListener('click', () => closeSaveModal());
// Confirm modal keyboard support
document.addEventListener('keydown', (e) => {
  if (!confirmModal || !confirmModal.classList.contains('open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeConfirmModal();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    confirmModalConfirmBtn?.click();
  }
});
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.matches('#save-modal .modal-backdrop')) closeSaveModal();
  if (t && t.matches('#confirm-modal .modal-backdrop')) closeConfirmModal();
});

// Modal keyboard support: Enter = Save, Escape = Cancel
document.addEventListener('keydown', (e) => {
  if (!saveModal || !saveModal.classList.contains('open')) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeSaveModal();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const name = (saveModalNameInput.value || '').trim();
    if (!name) { saveModalNameInput.focus(); return; }
    state.currentRoutineName = name;
    saveRoutine(name, state.timers);
    closeSaveModal();
    populateRoutineDropdown();
    if (loadSelect) loadSelect.value = name;
    updateDeleteButtonState();
    showToast(`Saved "${name}"`);
  }
});

// Load/Delete UI wired to elements inside #routine-form
const loadSelect = document.getElementById('load-routine-select');
const deleteBtn = document.getElementById('delete-routine-btn');

function updateDeleteButtonState() {
  if (!deleteBtn) return;
  const hasSelection = !!(loadSelect && loadSelect.value);
  deleteBtn.disabled = !hasSelection;
}

// Populate select options
function populateRoutineDropdown() {
  if (!loadSelect) return;
  // clear existing options
  while (loadSelect.firstChild) loadSelect.removeChild(loadSelect.firstChild);
  const def = document.createElement('option');
  def.value = '';
  def.textContent = 'Select Routine';
  loadSelect.appendChild(def);
  listRoutines().forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    loadSelect.appendChild(opt);
  });
  updateDeleteButtonState();
}

// Auto-load when a routine is selected
if (loadSelect) {
  loadSelect.addEventListener('change', () => {
    const selectedName = loadSelect.value;
    updateDeleteButtonState();
    if (!selectedName) return;
    const loaded = loadRoutine(selectedName);
    if (!loaded) { showToast(`"${selectedName}" not found.`); return; }
    state.timers.length = 0;
    loaded.forEach((t) => state.timers.push(t));
    renderTimers(state, { onChange: onTimersChanged });
    state.currentRoutineName = selectedName;
    setLastUsedRoutine(selectedName);
    updateTopDisplay(state);
  });
}

// Delete button behavior
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    if (!loadSelect) return;
    const selectedName = loadSelect.value;
    if (!selectedName) return;
    openConfirmModal(`Delete routine \"${selectedName}\"? This cannot be undone.`);
    const onConfirm = () => {
      deleteRoutine(selectedName);
      populateRoutineDropdown();
      if (loadSelect) loadSelect.value = '';
      updateDeleteButtonState();
      // Clear all timers and reset UI
      state.timers.length = 0;
      state.currentRoutineName = '';
      renderTimers(state, { onChange: onTimersChanged });
      updateTopDisplay(state);
      showToast(`Deleted \"${selectedName}\"`);
      closeConfirmModal();
    };
    const onCancel = () => {
      closeConfirmModal();
    };
    confirmModalConfirmBtn?.addEventListener('click', onConfirm, { once: true });
    confirmModalCancelBtn?.addEventListener('click', onCancel, { once: true });
  });
}

// Initialize
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
      state.currentRoutineName = last;
      if (loadSelect) loadSelect.value = last;
      updateDeleteButtonState();
    }
  }
  // First paint
  renderTimers(state, { onChange: onTimersChanged });
  updateTopDisplay(state);
  updateToggleButton(state);
});

