import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-800 shadow-md hover:shadow-glow transition-all duration-300 text-primary dark:text-primary-light"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative z-10">
        <Sun className={`absolute inset-0 transition-transform duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} size={18} />
        <Moon className={`transition-transform duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} size={18} />
      </div>
      <div className={`absolute inset-0 bg-gradient-to-tr from-brand-lavender/20 to-brand-blue/20 transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-tr from-brand-purple/20 to-primary/20 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}></div>
    </button>
  );
}


