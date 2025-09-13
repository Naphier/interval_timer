// Central app state
const state = {
  timers: [], // { name: string, duration: seconds, chime: number }
  currentTimerIndex: 0,
  currentRepeat: 1, // 1-based index for the current timer's repetition
  // Optional chain of consecutive timers with a shared repeat count
  chain: null, // { start: number, end: number, repeats: number, current: number }
  timerInterval: null,
  isRunning: false,
  isPaused: false,
  timeLeft: 0,
  routineElapsed: 0,
  currentTimerElapsed: 0,
  currentRoutineName: '',
  lastTickAtMs: 0,
  speedMultiplier: 1,
};

export function resetProgress() {
  state.currentTimerIndex = 0;
  state.currentRepeat = 1;
  state.timeLeft = 0;
  state.routineElapsed = 0;
  state.currentTimerElapsed = 0;
  if (state.chain) state.chain.current = 1;
}

export default state;

