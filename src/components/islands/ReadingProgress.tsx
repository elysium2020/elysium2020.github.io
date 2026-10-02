import { onMount } from 'solid-js';

const ReadingProgress = () => {
  let bar: HTMLDivElement | undefined;

  onMount(() => {
    const update = () => {
      if (!bar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });

  return (
    <div
      ref={(element) => {
        bar = element;
      }}
      aria-hidden="true"
      class="bg-accent fixed left-0 top-0 z-50 h-0.5 w-full origin-left"
      style={{ transform: 'scaleX(0)' }}
    />
  );
};

export default ReadingProgress;
