const ROUTINE_PREFIX = 'routine_';
const LAST_USED_KEY = 'last_used_routine';

export function saveRoutine(name, timers) {
  if (!name) return;
  localStorage.setItem(`${ROUTINE_PREFIX}${name}`, JSON.stringify(timers));
  setLastUsedRoutine(name);
}

export function loadRoutine(name) {
  const data = localStorage.getItem(`${ROUTINE_PREFIX}${name}`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function deleteRoutine(name) {
  localStorage.removeItem(`${ROUTINE_PREFIX}${name}`);
}

export function listRoutines() {
  const names = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(ROUTINE_PREFIX)) {
      names.push(key.replace(ROUTINE_PREFIX, ''));
    }
  }
  names.sort((a, b) => a.localeCompare(b));
  return names;
}

export function getLastUsedRoutine() {
  return localStorage.getItem(LAST_USED_KEY) || '';
}

export function setLastUsedRoutine(name) {
  if (name) localStorage.setItem(LAST_USED_KEY, name);
}

