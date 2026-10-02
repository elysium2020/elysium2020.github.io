import { createSignal, onMount } from 'solid-js';

const ThemeToggle = () => {
  const [dark, setDark] = createSignal(false);

  onMount(() => setDark(document.documentElement.classList.contains('dark')));

  const toggle = () => {
    const next = !dark();
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      class="hover:text-foreground text-muted-foreground focus-ring rounded-md p-2 transition-colors"
      aria-label={dark() ? '切换到浅色主题' : '切换到深色主题'}
      aria-pressed={dark()}
    >
      <span
        class={dark() ? 'i-tabler-sun h-4.5 w-4.5' : 'i-tabler-moon h-4.5 w-4.5'}
        aria-hidden="true"
      />
    </button>
  );
};

export default ThemeToggle;
