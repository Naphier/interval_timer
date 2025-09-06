import { timersContainer } from './dom.js';

// Renders the list of timers with drag-and-drop and inline editing
export function renderTimers(state, { onChange }) {
  timersContainer.innerHTML = '';
  const { timers } = state;

  let dragSrcIdx = null;

  timers.forEach((timer, idx) => {
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
    removeBtn.className = 'remove-timer btn btn--danger';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.timers.splice(idx, 1);
      onChange?.('remove');
      renderTimers(state, { onChange });
    });

    timerDiv.appendChild(handle);
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

