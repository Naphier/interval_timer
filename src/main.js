import state from './state.js';
import { addTimerBtn, routineForm, toggleRoutineBtn, stopRoutineBtn, openSaveModal, closeSaveModal, saveModalNameInput, saveModalSaveBtn, saveModalCancelBtn, saveModal, showToast, openConfirmModal, closeConfirmModal, confirmModal, confirmModalConfirmBtn, confirmModalCancelBtn } from './dom.js';
import { updateTopDisplay } from './ui/topDisplay.js';
import { updateToggleButton } from './dom.js';
import { renderTimers } from './timersList.js';
import { stopRoutineIfRunning, togglePlayPause, stopRoutine } from './runner.js';
import { saveRoutine, loadRoutine, listRoutines, deleteRoutine, getLastUsedRoutine, setLastUsedRoutine } from './storage.js';

function autoSave() {
  const name = state.currentRoutineName?.trim();
  if (name) saveRoutine(name, { timers: state.timers, chain: state.chain });
}

// Timers change handler: stop if running, then autosave
function onTimersChanged() {
  stopRoutineIfRunning();
  autoSave();
  updateTopDisplay(state);
}

// Add timer button
addTimerBtn.addEventListener('click', () => {
  state.timers.push({ name: '', duration: 60, chime: 1, repeats: 1 });
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
  saveRoutine(name, { timers: state.timers, chain: state.chain });
  closeSaveModal();
  populateRoutineDropdown();
  if (loadSelect) loadSelect.value = name;
  updateDeleteButtonState();
  showToast(`Saved "${name}"`);
  updateTopDisplay(state);
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
    saveRoutine(name, { timers: state.timers, chain: state.chain });
    closeSaveModal();
    populateRoutineDropdown();
    if (loadSelect) loadSelect.value = name;
    updateDeleteButtonState();
    showToast(`Saved "${name}"`);
    updateTopDisplay(state);
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
    loaded.timers.forEach((t) => state.timers.push(t));
    state.chain = loaded.chain ? { ...loaded.chain, current: 1 } : null;
    renderTimers(state, { onChange: onTimersChanged });
    state.currentRoutineName = selectedName;
    setLastUsedRoutine(selectedName);
    updateTopDisplay(state);
  });
}

// Re-render timers on runner updates (ticks/start/stop)
document.addEventListener('timers:updated', () => {
  renderTimers(state, { onChange: onTimersChanged });
  // Start/stop RAF-based smooth progress updates
  if (state.isRunning && !state.isPaused) startProgressAnimation();
  else stopProgressAnimation();
});

// Smooth progress animation using requestAnimationFrame
let progressRafId = 0;
function startProgressAnimation() {
  if (progressRafId) return;
  progressRafId = requestAnimationFrame(progressFrame);
}
function stopProgressAnimation() {
  if (progressRafId) cancelAnimationFrame(progressRafId);
  progressRafId = 0;
}
function progressFrame() {
  if (!state.isRunning || state.isPaused) { stopProgressAnimation(); return; }
  const rows = document.querySelectorAll('#timers-container .timer-item--progress');
  const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  rows.forEach((row, idx) => {
    const t = state.timers[idx];
    if (!t) return;
    const duration = t.duration || 0;
    const fill = row.querySelector('.progress-fill');
    if (!fill) return;
    let elapsed = 0;
    if (idx < state.currentTimerIndex) {
      elapsed = duration;
    } else if (idx === state.currentTimerIndex) {
      const last = state.lastTickAtMs || now;
      const speed = Math.max(1, state.speedMultiplier || 1);
      const frac = Math.max(0, (now - last) / 1000 * speed);
      elapsed = state.currentTimerElapsed + frac;
    } else {
      elapsed = 0;
    }
    const pct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
    fill.style.width = pct + '%';
  });
  // Update top display bar smoothly
  const topFill = document.querySelector('#top-display .progress-fill');
  if (topFill) {
    let total = state.timers.reduce((s, t) => {
      const reps = Math.min(99, Math.max(1, parseInt(t.repeats || 1, 10)));
      return s + (t.duration || 0) * reps;
    }, 0);
    if (state.chain) {
      const block = state.timers.slice(state.chain.start, state.chain.end + 1).reduce((s, t) => {
        const reps = Math.min(99, Math.max(1, parseInt(t.repeats || 1, 10)));
        return s + (t.duration || 0) * reps;
      }, 0);
      const chainReps = Math.min(99, Math.max(1, parseInt(state.chain.repeats || 1, 10)));
      total += block * (chainReps - 1);
    }
    const last = state.lastTickAtMs || now;
    const speed = Math.max(1, state.speedMultiplier || 1);
    const frac = Math.max(0, (now - last) / 1000 * speed);
    const elapsed = Math.min(total, state.routineElapsed + frac);
    const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
    topFill.style.width = pct + '%';
  }
  progressRafId = requestAnimationFrame(progressFrame);
}
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
  // Dev-only speed control via URL (?speed=10) or localStorage ('debug_speed')
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('speed');
    const fromLs = localStorage.getItem('debug_speed');
    const parsed = parseFloat(fromUrl || fromLs || '1');
    if (Number.isFinite(parsed) && parsed > 0) {
      // Cap to avoid runaway animations
      state.speedMultiplier = Math.min(200, parsed);
    }
  } catch {}

  const last = getLastUsedRoutine();
  if (last) {
    const loaded = loadRoutine(last);
    if (loaded) {
      state.timers.length = 0;
      loaded.timers.forEach((t) => state.timers.push(t));
      state.chain = loaded.chain ? { ...loaded.chain, current: 1 } : null;
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

