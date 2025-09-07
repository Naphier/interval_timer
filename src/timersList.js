import { timersContainer } from './dom.js';
import { formatTime } from './ui/topDisplay.js';

// Renders the list of timers with drag-and-drop and inline editing
export function renderTimers(state, { onChange } = {}) {
  timersContainer.innerHTML = '';
  const { timers, isRunning, currentTimerIndex, currentTimerElapsed, timeLeft } = state;
  const isCompleted = !isRunning && timers.length > 0 && currentTimerIndex >= timers.length;

  let dragSrcIdx = null;

  timers.forEach((timer, idx) => {
    // Running or completed view: progress bars
    if (isRunning || isCompleted) {
      const row = document.createElement('div');
      row.className = 'timer-item timer-item--progress';

      const track = document.createElement('div');
      track.className = 'progress-track';

      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      const duration = timer.duration || 0;
      let elapsed = 0;
      if (isCompleted) {
        elapsed = duration;
      } else if (idx < currentTimerIndex) {
        elapsed = duration;
      } else if (idx === currentTimerIndex) {
        elapsed = currentTimerElapsed;
      } else {
        elapsed = 0;
      }
      const pct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
      fill.style.width = pct + '%';

      const text = document.createElement('div');
      text.className = 'progress-text';
      const left = document.createElement('span');
      left.className = 'progress-left';
      const totalRepeats = Math.min(99, Math.max(1, parseInt(timer.repeats || 1, 10)));
      const showRepeats = isRunning && idx === currentTimerIndex && totalRepeats > 1;
      const repPrefix = showRepeats
        ? `${Math.max(1, state.currentRepeat || 1)}/${totalRepeats} `
        : '';
      left.textContent = `${repPrefix}${timer.name || `Timer ${idx + 1}`}`;
      const right = document.createElement('span');
      right.className = 'progress-right';
      const shownElapsed = Math.min(duration, elapsed);
      // Show elapsed / total for each timer while running
      right.textContent = `${formatTime(shownElapsed)} / ${formatTime(duration)}`;

      text.appendChild(left);
      text.appendChild(right);

      track.appendChild(fill);
      // Show a centered checkmark when this timer is complete
      if (idx < currentTimerIndex) {
        const check = document.createElement('div');
        check.className = 'progress-check';
        check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        track.appendChild(check);
      }
      track.appendChild(text);
      row.appendChild(track);
      timersContainer.appendChild(row);
      return; // skip editor row while running
    }

    // Editor view (not running)
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer-item';
    timerDiv.draggable = true;
    timerDiv.dataset.index = String(idx);

    timerDiv.addEventListener('dragstart', (e) => {
      dragSrcIdx = Number(timerDiv.dataset.index);
      e.dataTransfer.effectAllowed = 'move';
    });
    timerDiv.addEventListener('dragover', (e) => e.preventDefault());
    timerDiv.addEventListener('drop', () => {
      const targetIdx = Number(timerDiv.dataset.index);
      if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
        const moved = timers.splice(dragSrcIdx, 1)[0];
        timers.splice(targetIdx, 0, moved);
        onChange?.('reorder');
        renderTimers(state, { onChange });
      }
      dragSrcIdx = null;
    });

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '&#9776;';

    // Repeats input (before name)
    const repeatsInput = document.createElement('input');
    repeatsInput.type = 'number';
    repeatsInput.min = 1;
    repeatsInput.max = 99;
    repeatsInput.value = Math.min(99, Math.max(1, parseInt(timer.repeats || 1, 10)));
    repeatsInput.className = 'timer-repeats';
    repeatsInput.title = 'Repeats';
    repeatsInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      e.target.value = String(val);
      timers[idx].repeats = val;
      onChange?.('edit');
    });

    const repeatLabel = document.createElement('span');
    repeatLabel.className = 'timer-label';
    repeatLabel.textContent = 'x';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = timer.name || '';
    nameInput.className = 'timer-name';
    nameInput.placeholder = 'Timer Name';
    nameInput.addEventListener('input', (e) => {
      timers[idx].name = e.target.value;
      onChange?.('edit');
    });

    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.value = Math.floor((timer.duration || 0) / 60);
    durationInput.className = 'timer-duration';
    durationInput.min = 0;
    durationInput.title = 'Minutes';
    // width styled via CSS
    durationInput.addEventListener('input', (e) => {
      const minutes = parseInt(e.target.value, 10) || 0;
      timers[idx].duration = minutes * 60 + (timers[idx].duration % 60 || 0);
      onChange?.('edit');
    });

    const colonLabel = document.createElement('span');
    colonLabel.className = 'timer-label';
    colonLabel.textContent = ':';

    const secondsInput = document.createElement('input');
    secondsInput.type = 'number';
    secondsInput.value = (timer.duration || 0) % 60;
    secondsInput.className = 'timer-seconds';
    secondsInput.min = 0;
    secondsInput.max = 59;
    secondsInput.title = 'Seconds';
    // width styled via CSS
    secondsInput.addEventListener('input', (e) => {
      let secs = parseInt(e.target.value, 10);
      if (isNaN(secs) || secs < 0) secs = 0;
      if (secs > 59) secs = 59;
      timers[idx].duration = Math.floor((timers[idx].duration || 0) / 60) * 60 + secs;
      onChange?.('edit');
    });

    const secLabel = document.createElement('span');
    secLabel.className = 'timer-label';
    secLabel.textContent = 's';

    const chimeSelect = document.createElement('select');
    chimeSelect.className = 'timer-chime';
    for (let i = 1; i <= 10; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `Alarm ${i}`;
      if ((timer.chime || 1) === i) opt.selected = true;
      chimeSelect.appendChild(opt);
    }
    chimeSelect.addEventListener('change', (e) => {
      timers[idx].chime = parseInt(e.target.value, 10);
      onChange?.('edit');
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-timer btn btn--danger btn--icon';
    removeBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 6l1-3h6l1 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="6" width="12" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    removeBtn.setAttribute('aria-label', 'Remove');
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.timers.splice(idx, 1);
      onChange?.('remove');
      renderTimers(state, { onChange });
    });

    timerDiv.appendChild(handle);
    timerDiv.appendChild(repeatsInput);
    timerDiv.appendChild(repeatLabel);
    timerDiv.appendChild(nameInput);
    timerDiv.appendChild(durationInput);
    timerDiv.appendChild(colonLabel);
    timerDiv.appendChild(secondsInput);
    timerDiv.appendChild(secLabel);
    timerDiv.appendChild(chimeSelect);
    timerDiv.appendChild(removeBtn);

    timersContainer.appendChild(timerDiv);
  });
}

