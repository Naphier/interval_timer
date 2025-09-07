// DOM references and setup helpers

const timersContainer = document.getElementById('timers-container');
const appRoot = document.querySelector('.app');
const addTimerBtn = document.getElementById('add-timer');
const routineForm = document.getElementById('routine-form');
const audioEl = document.getElementById('chime-audio');

// Top display (routine + current timer times)
const topDisplay = document.createElement('div');
topDisplay.id = 'top-display';
routineForm.parentNode.insertBefore(topDisplay, routineForm);

// Controls container and buttons (placed above timers list)
const controlsContainer = document.createElement('div');
controlsContainer.className = 'controls-row';
// Insert before the timers list to appear above it
timersContainer.parentNode.insertBefore(controlsContainer, timersContainer);

const toggleRoutineBtn = document.createElement('button');
toggleRoutineBtn.id = 'toggle-routine';
toggleRoutineBtn.className = 'btn btn--icon btn--primary';

const stopRoutineBtn = document.createElement('button');
stopRoutineBtn.textContent = '\u23F9'; // Stop icon ⏹
stopRoutineBtn.id = 'stop-routine';
stopRoutineBtn.className = 'btn btn--danger btn--icon';
stopRoutineBtn.setAttribute('aria-label', 'Stop');
stopRoutineBtn.title = 'Stop';

controlsContainer.appendChild(toggleRoutineBtn);
controlsContainer.appendChild(stopRoutineBtn);

export function updateToggleButton({ isRunning, isPaused }) {
  // Use unicode icons and style via CSS
  toggleRoutineBtn.textContent = (!isRunning || isPaused) ? '\u25B6' : '\u23F8';
  // Disable adding timers while routine is running (paused or not)
  if (addTimerBtn) addTimerBtn.disabled = !!isRunning;
}

export {
  timersContainer,
  addTimerBtn,
  routineForm,
  topDisplay,
  controlsContainer,
  toggleRoutineBtn,
  stopRoutineBtn,
  audioEl,
};

// Save modal elements
const saveModal = document.getElementById('save-modal');
const saveModalNameInput = document.getElementById('save-modal-name');
const saveModalSaveBtn = document.getElementById('save-modal-save');
const saveModalCancelBtn = document.getElementById('save-modal-cancel');

const toast = document.getElementById('toast');

export { saveModal, saveModalNameInput, saveModalSaveBtn, saveModalCancelBtn, toast };

let previouslyFocusedEl = null;

export function openSaveModal(prefill = '') {
  if (!saveModal || !saveModalNameInput) return;
  previouslyFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (typeof prefill === 'string' && prefill.length > 0) {
    saveModalNameInput.value = prefill;
  } else {
    saveModalNameInput.value = '';
  }
  saveModal.classList.add('open');
  saveModal.setAttribute('aria-hidden', 'false');
  if (appRoot) appRoot.setAttribute('inert', '');
  // focus after open
  setTimeout(() => saveModalNameInput && saveModalNameInput.focus(), 0);
}

export function closeSaveModal() {
  if (!saveModal) return;
  // Move focus out of the hidden region BEFORE hiding it
  const active = document.activeElement;
  if (active && saveModal.contains(active)) {
    if (previouslyFocusedEl && document.contains(previouslyFocusedEl)) {
      previouslyFocusedEl.focus();
    } else {
      const primaryBtn = routineForm?.querySelector('button[type="submit"]');
      if (primaryBtn) primaryBtn.focus();
    }
  }
  saveModal.classList.remove('open');
  saveModal.setAttribute('aria-hidden', 'true');
  if (appRoot) appRoot.removeAttribute('inert');
}

let toastTimer = null;
export function showToast(message = '', timeout = 2000) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, timeout);
}

// Confirm modal elements and helpers
const confirmModal = document.getElementById('confirm-modal');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm');
const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');

export { confirmModal, confirmModalMessage, confirmModalConfirmBtn, confirmModalCancelBtn };

export function openConfirmModal(message = 'Are you sure?') {
  if (!confirmModal) return;
  previouslyFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (confirmModalMessage) confirmModalMessage.textContent = message;
  confirmModal.classList.add('open');
  confirmModal.setAttribute('aria-hidden', 'false');
  if (appRoot) appRoot.setAttribute('inert', '');
  // focus the confirm button for quick keyboard action
  setTimeout(() => confirmModalConfirmBtn && confirmModalConfirmBtn.focus(), 0);
}

export function closeConfirmModal() {
  if (!confirmModal) return;
  const active = document.activeElement;
  if (active && confirmModal.contains(active)) {
    if (previouslyFocusedEl && document.contains(previouslyFocusedEl)) {
      previouslyFocusedEl.focus();
    } else {
      const primaryBtn = routineForm?.querySelector('#delete-routine-btn');
      if (primaryBtn) primaryBtn.focus();
    }
  }
  confirmModal.classList.remove('open');
  confirmModal.setAttribute('aria-hidden', 'true');
  if (appRoot) appRoot.removeAttribute('inert');
}

