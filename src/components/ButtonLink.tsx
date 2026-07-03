import { type JSX, splitProps } from 'solid-js';

type Properties = {
  href: string;
  variant?: 'primary' | 'secondary';
  class?: string;
  children?: JSX.Element;
};

const ButtonLink = (properties: Properties) => {
  const [local, others] = splitProps(properties, ['href', 'variant', 'class', 'children']);

  return (
    <a
      href={local.href}
      class={`inline-flex gap-2 rounded-md px-4 py-2 text-sm font-medium transition items-center${local.variant === 'primary' ? ' bg-foreground text-background hover:opacity-80' : ' border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground border'}`}
      {...others}
    >
      {local.children}
    </a>
  );
};

export default ButtonLink;
