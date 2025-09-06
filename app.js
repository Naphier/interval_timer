// Basic structure for timers and routine logic

const timers = [];
let currentTimerIndex = 0;
let timerInterval = null;

// Place these after DOM elements are defined
// DOM elements
const timersContainer = document.getElementById('timers-container');
const addTimerBtn = document.getElementById('add-timer');
const routineForm = document.getElementById('routine-form');
const routineNameInput = document.getElementById('routine-name');

// --- NEW: Top display for routine and current timer ---
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
// --- END NEW ---

// Render timers list
function renderTimers() {
    timersContainer.innerHTML = '';
    timers.forEach((timer, idx) => {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'timer-item';
        timerDiv.draggable = true;
        timerDiv.dataset.index = idx;

        // Drag events
        timerDiv.addEventListener('dragstart', handleDragStart);
        timerDiv.addEventListener('dragover', handleDragOver);
        timerDiv.addEventListener('drop', handleDrop);

        // Handle icon for drag
        const handle = document.createElement('span');
        handle.className = 'drag-handle';
        handle.innerHTML = '&#9776;'; // Unicode "hamburger" icon

        // Timer name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = timer.name;
        nameInput.className = 'timer-name';
        nameInput.placeholder = 'Timer Name';
        nameInput.addEventListener('input', (e) => {
            timers[idx].name = e.target.value;
            stopRoutineIfRunning();
            autoSaveRoutine();
        });

        // Timer duration input (minutes)
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.value = Math.floor(timer.duration / 60);
        durationInput.className = 'timer-duration';
        durationInput.min = 0;
        durationInput.title = 'Minutes';
        durationInput.style.width = '24px'; // half the previous size
        durationInput.addEventListener('input', (e) => {
            const minutes = parseInt(e.target.value) || 0;
            timers[idx].duration = minutes * 60 + (timers[idx].duration % 60);
            stopRoutineIfRunning();
            autoSaveRoutine();
        });

        // Timer duration label ":":
        const colonLabel = document.createElement('span');
        colonLabel.className = 'timer-label';
        colonLabel.textContent = ':';

        // Timer seconds input
        const secondsInput = document.createElement('input');
        secondsInput.type = 'number';
        secondsInput.value = timer.duration % 60;
        secondsInput.className = 'timer-seconds';
        secondsInput.min = 0;
        secondsInput.max = 59;
        secondsInput.title = 'Seconds';
        secondsInput.style.width = '24px'; // half the previous size
        secondsInput.addEventListener('input', (e) => {
            let secs = parseInt(e.target.value);
            if (isNaN(secs) || secs < 0) secs = 0;
            if (secs > 59) secs = 59;
            timers[idx].duration = Math.floor(timers[idx].duration / 60) * 60 + secs;
            stopRoutineIfRunning();
            autoSaveRoutine();
        });

        // Timer seconds label "s"
        const secLabel = document.createElement('span');
        secLabel.className = 'timer-label';
        secLabel.textContent = 's';

        // Chime select
        const chimeSelect = document.createElement('select');
        chimeSelect.className = 'timer-chime';
        for (let i = 1; i <= 10; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Alarm ${i}`;
            if (timer.chime === i) opt.selected = true;
            chimeSelect.appendChild(opt);
        }
        chimeSelect.addEventListener('change', (e) => {
            timers[idx].chime = parseInt(e.target.value);
            stopRoutineIfRunning();
            autoSaveRoutine();
        });

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-timer';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            timers.splice(idx, 1);
            renderTimers();
            stopRoutineIfRunning();
            autoSaveRoutine();
        });

        // Add handle and inputs to timerDiv
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

// Drag and drop logic
let dragSrcIdx = null;
function handleDragStart(e) {
    dragSrcIdx = Number(e.currentTarget.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) {
    e.preventDefault();
}
function handleDrop(e) {
    const targetIdx = Number(e.currentTarget.dataset.index);
    if (dragSrcIdx !== null && dragSrcIdx !== targetIdx) {
        const moved = timers.splice(dragSrcIdx, 1)[0];
        timers.splice(targetIdx, 0, moved);
        renderTimers();

        // Save routine after reordering
        const routineName = routineNameInput.value.trim();
        if (routineName) {
            localStorage.setItem(
                `routine_${routineName}`,
                JSON.stringify(timers)
            );
            localStorage.setItem('last_used_routine', routineName);
        }
    }
    dragSrcIdx = null;
}

// Add timer
addTimerBtn.addEventListener('click', () => {
    addTimer();
});

function addTimer(name = '', duration = 60) {
    timers.push({ name, duration, chime: 1 });
    renderTimers();
}

// Routine summary
const startRoutineBtn = document.createElement('button');
startRoutineBtn.textContent = 'Start';
startRoutineBtn.id = 'start-routine';
timersContainer.parentNode.insertBefore(startRoutineBtn, timersContainer.nextSibling);

let isRunning = false;
let timeLeft = 0;

// Display for current timer and time left
// Removed currentTimerDisplay element creation and insertion

startRoutineBtn.addEventListener('click', () => {
    if (timers.length === 0) return;
    if (isRunning) return;
    isRunning = true;
    currentTimerIndex = 0;
    startRoutineBtn.disabled = true;
    runRoutine();
});

// Add Pause and Stop buttons
const pauseRoutineBtn = document.createElement('button');
pauseRoutineBtn.textContent = 'Pause';
pauseRoutineBtn.id = 'pause-routine';

const stopRoutineBtn = document.createElement('button');
stopRoutineBtn.textContent = 'Stop';
stopRoutineBtn.id = 'stop-routine';

startRoutineBtn.parentNode.insertBefore(pauseRoutineBtn, startRoutineBtn.nextSibling);
pauseRoutineBtn.parentNode.insertBefore(stopRoutineBtn, pauseRoutineBtn.nextSibling);

// Create a container for control buttons
const controlsContainer = document.createElement('div');
controlsContainer.className = 'controls-row';

// Style buttons for flex grow and uniform height
[startRoutineBtn, pauseRoutineBtn, stopRoutineBtn].forEach(btn => {
    btn.style.flex = '1';
    btn.style.height = '44px';
    btn.style.marginBottom = '0';
    btn.style.display = 'block';
    btn.style.minWidth = '0';
    btn.style.boxSizing = 'border-box';
});

// Remove previous insertions if present
if (startRoutineBtn.parentNode) startRoutineBtn.parentNode.removeChild(startRoutineBtn);
if (pauseRoutineBtn.parentNode) pauseRoutineBtn.parentNode.removeChild(pauseRoutineBtn);
if (stopRoutineBtn.parentNode) stopRoutineBtn.parentNode.removeChild(stopRoutineBtn);

// Add buttons to the controls container
controlsContainer.appendChild(startRoutineBtn);
controlsContainer.appendChild(pauseRoutineBtn);
controlsContainer.appendChild(stopRoutineBtn);

// Insert controls container after timersContainer
timersContainer.parentNode.insertBefore(controlsContainer, timersContainer.nextSibling);

let isPaused = false;

// Pause button logic
pauseRoutineBtn.addEventListener('click', () => {
    if (!isRunning || isPaused) return;
    isPaused = true;
    clearInterval(timerInterval);
    pauseRoutineBtn.disabled = true;
    startRoutineBtn.disabled = false;
});

// Resume logic (startRoutineBtn)
startRoutineBtn.addEventListener('click', () => {
    if (timers.length === 0) return;
    if (isRunning && !isPaused) return;
    if (isPaused) {
        isPaused = false;
        pauseRoutineBtn.disabled = false;
        startRoutineBtn.disabled = true;
        runRoutine(true); // resume
    } else {
        isRunning = true;
        currentTimerIndex = 0;
        startRoutineBtn.disabled = true;
        pauseRoutineBtn.disabled = false;
        runRoutine();
    }
});

// Stop button logic
stopRoutineBtn.addEventListener('click', () => {
    stopRoutineIfRunning()
});

let routineElapsed = 0;
let currentTimerElapsed = 0;

// Update runRoutine to support resume
function runRoutine(resume = false) {
    if (currentTimerIndex >= timers.length) {
        isRunning = false;
        startRoutineBtn.disabled = false;
        pauseRoutineBtn.disabled = false;
        return;
    }
    const timer = timers[currentTimerIndex];
    if (!resume) {
        timeLeft = timer.duration;
        currentTimerElapsed = 0;
        if (currentTimerIndex === 0) routineElapsed = 0;
    }
    updateTopDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        currentTimerElapsed++;
        routineElapsed++;
        updateTopDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playChime(timer.chime);
            currentTimerIndex++;
            runRoutine();
        }
    }, 1000);
}

function playChime(chimeNumber) {
    const audio = document.getElementById('chime-audio');
    const numStr = chimeNumber.toString().padStart(2, '0');
    audio.src = `sounds/Alarm${numStr}.wav`;
    audio.play();
}

function updateTopDisplay() {
    // Routine elapsed time
    let routineTotal = timers.reduce((sum, t) => sum + t.duration, 0);
    let routineElapsedStr = formatTime(routineElapsed);
    let routineTotalStr = formatTime(routineTotal);

    // Current timer elapsed and duration
    let currentTimerDur = timers[currentTimerIndex] ? timers[currentTimerIndex].duration : 0;
    let currentTimerElapsedStr = formatTime(currentTimerElapsed);
    let currentTimerDurStr = formatTime(currentTimerDur);

    topDisplay.innerHTML = `
        <span style="float:left;">Routine: ${routineElapsedStr} | ${routineTotalStr}</span>
        <span style="float:right;">Current: ${currentTimerElapsedStr} | ${currentTimerDurStr}</span>
    `;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

// Reference to the routine select dropdown
let loadSelect;

// Create load routine dropdown (update this part if needed)
function setupLoadRoutineDropdown() {
    // Remove old form if present
    const oldForm = document.getElementById('load-routine-form');
    if (oldForm) oldForm.remove();

    const loadForm = document.createElement('form');
    loadForm.id = 'load-routine-form';
    loadForm.style.display = 'flex';
    loadForm.style.gap = '12px';
    loadForm.style.marginBottom = '16px';

    loadSelect = document.createElement('select');
    loadSelect.id = 'load-routine-select';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Routine';
    loadSelect.appendChild(defaultOption);

    function populateRoutineDropdown() {
        while (loadSelect.options.length > 1) {
            loadSelect.remove(1);
        }
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('routine_')) {
                const name = key.replace('routine_', '');
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                loadSelect.appendChild(opt);
            }
        }
    }
    populateRoutineDropdown();

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
            localStorage.removeItem(`routine_${selectedName}`);
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
        loadRoutine(selectedName);
    });

    // Update dropdown after saving a routine
    routineForm.addEventListener('submit', () => {
        populateRoutineDropdown();
    });
}

// Call this once on page load
setupLoadRoutineDropdown();

// Load last used routine on page load
window.addEventListener('DOMContentLoaded', () => {
    const lastRoutine = localStorage.getItem('last_used_routine');
    if (lastRoutine && localStorage.getItem(`routine_${lastRoutine}`)) {
        loadRoutine(lastRoutine);
        if (loadSelect) loadSelect.value = lastRoutine;
    }
});

// Update last used routine when loading or saving
function loadRoutine(routineName) {
    const data = localStorage.getItem(`routine_${routineName}`);
    if (data) {
        const loadedTimers = JSON.parse(data);
        timers.length = 0;
        loadedTimers.forEach(t => timers.push(t));
        renderTimers();
        routineNameInput.value = routineName; // Autofill routine name field
        localStorage.setItem('last_used_routine', routineName); // Save last used
        if (loadSelect) loadSelect.value = routineName;
    } else {
        alert(`Routine "${routineName}" not found.`);
    }
}

routineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const routineName = routineNameInput.value.trim();
    if (!routineName) return;
    localStorage.setItem(
        `routine_${routineName}`,
        JSON.stringify(timers)
    );
    localStorage.setItem('last_used_routine', routineName); // Save last used
    alert(`Routine "${routineName}" saved!`);
});

function autoSaveRoutine() {
    const routineName = routineNameInput.value.trim();
    if (routineName) {
        localStorage.setItem(
            `routine_${routineName}`,
            JSON.stringify(timers)
        );
        localStorage.setItem('last_used_routine', routineName);
    }
}

// Initial render
renderTimers();
updateTopDisplay();

// Remove Pause and Start buttons, replace with a single toggle button
const toggleRoutineBtn = document.createElement('button');
toggleRoutineBtn.id = 'toggle-routine';
toggleRoutineBtn.style.flex = '1';
toggleRoutineBtn.style.height = '44px';
toggleRoutineBtn.style.marginBottom = '0';
toggleRoutineBtn.style.display = 'block';
toggleRoutineBtn.style.minWidth = '0';
toggleRoutineBtn.style.boxSizing = 'border-box';

// Helper to set icon and label
function updateToggleButton() {
    if (!isRunning || isPaused) {
        // Play icon (▶)
        toggleRoutineBtn.innerHTML = '<span style="font-size:24px;">&#9654;</span>';
    } else {
        // Pause icon (⏸)
        toggleRoutineBtn.innerHTML = '<span style="font-size:24px;">&#10073;&#10073;</span>';
    }
}

// Remove previous buttons from controlsContainer
controlsContainer.innerHTML = '';
controlsContainer.appendChild(toggleRoutineBtn);
controlsContainer.appendChild(stopRoutineBtn);

// Initial state
updateToggleButton();

// Toggle button logic
toggleRoutineBtn.addEventListener('click', () => {
    if (timers.length === 0) return;
    if (!isRunning) {
        // Start
        isRunning = true;
        isPaused = false;
        currentTimerIndex = 0;
        toggleRoutineBtn.disabled = false;
        stopRoutineBtn.disabled = false;
        runRoutine();
        updateToggleButton();
    } else if (!isPaused) {
        // Pause
        isPaused = true;
        clearInterval(timerInterval);
        updateToggleButton();
    } else {
        // Resume
        isPaused = false;
        runRoutine(true);
        updateToggleButton();
    }
});

// Update toggle button on stop
stopRoutineBtn.addEventListener('click', () => {
    if (!isRunning) return;
    clearInterval(timerInterval);
    updateTopDisplay();
    isRunning = false;
    isPaused = false;
    toggleRoutineBtn.disabled = false;
    stopRoutineBtn.disabled = false;
    updateToggleButton();
});

// Update toggle button in runRoutine and stopRoutineIfRunning
function runRoutine(resume = false) {
    if (currentTimerIndex >= timers.length) {
        isRunning = false;
        isPaused = false;
        toggleRoutineBtn.disabled = false;
        stopRoutineBtn.disabled = false;
        updateToggleButton();
        return;
    }
    const timer = timers[currentTimerIndex];
    if (!resume) {
        timeLeft = timer.duration;
        currentTimerElapsed = 0;
        if (currentTimerIndex === 0) routineElapsed = 0;
    }
    updateTopDisplay();
    updateToggleButton();

    timerInterval = setInterval(() => {
        if (isPaused) {
            clearInterval(timerInterval);
            return;
        }
        timeLeft--;
        currentTimerElapsed++;
        routineElapsed++;
        updateTopDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playChime(timer.chime);
            currentTimerIndex++;
            runRoutine();
        }
    }, 1000);
}

function stopRoutineIfRunning() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        isPaused = false;
        routineElapsed = 0;
        currentTimerElapsed = 0;
        console.log("timers cleared");
        updateTopDisplay();
        updateToggleButton();
        console.log('Routine stopped');
    }
}