// Central app state
const state = {
  timers: [], // { name: string, duration: seconds, chime: number }
  currentTimerIndex: 0,
  timerInterval: null,
  isRunning: false,
  isPaused: false,
  timeLeft: 0,
  routineElapsed: 0,
  currentTimerElapsed: 0,
  currentRoutineName: '',
};

export function resetProgress() {
  state.currentTimerIndex = 0;
  state.timeLeft = 0;
  state.routineElapsed = 0;
  state.currentTimerElapsed = 0;
}

export default state;

