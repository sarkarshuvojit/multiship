// Small localStorage wrapper. Storage may be unavailable (private mode), so every
// access is guarded and the app works without it.

const KEY = 'multiship:prefs';

export interface Prefs {
  name: string;
  avatar: string;
  muted: boolean;
}

const defaults: Prefs = { name: '', avatar: '', muted: false };

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function savePrefs(patch: Partial<Prefs>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...loadPrefs(), ...patch }));
  } catch {
    /* ignore */
  }
}

const ADJ = ['Swift', 'Silent', 'Iron', 'Salty', 'Lucky', 'Rogue', 'Brave', 'Stormy', 'Crimson', 'Arctic'];
const NOUN = ['Kraken', 'Marlin', 'Barracuda', 'Gull', 'Narwhal', 'Orca', 'Corsair', 'Mariner', 'Squid', 'Pike'];

export function randomCallSign(): string {
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  return `${pick(ADJ)} ${pick(NOUN)}`;
}
