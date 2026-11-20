export type ToastTone = 'info' | 'hit' | 'ok' | 'error' | 'gold';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export type Listener = (t: ToastItem) => void;
export const listeners = new Set<Listener>();
let nextId = 1;

export function toast(message: string, tone: ToastTone = 'info') {
  const item = { id: nextId++, message, tone };
  listeners.forEach((l) => l(item));
}

