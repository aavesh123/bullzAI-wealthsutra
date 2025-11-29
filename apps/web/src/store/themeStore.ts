import { createSignal } from 'solid-js';

export type Theme = 'light' | 'dark';

const [theme, setThemeSignal] = createSignal<Theme>('dark');

export function currentTheme() {
  return theme();
}

export function setTheme(next: Theme) {
  setThemeSignal(next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('theme', next);
    } catch {
      // ignore storage errors
    }
  }
}

export function toggleTheme() {
  setTheme(theme() === 'dark' ? 'light' : 'dark');
}

export function loadThemeFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setThemeSignal(stored);
      return;
    }

    // Fallback to system preference if nothing stored
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeSignal('dark');
    } else {
      setThemeSignal('light');
    }
  } catch {
    // If anything goes wrong, keep default
  }
}


