import { type JSX, splitProps } from 'solid-js';

type Properties = {
  href: string;
  class?: string;
  serif?: boolean;
  onClick?: () => void;
  children?: JSX.Element;
};

const LinkWithUnderline = (properties: Properties) => {
  const [local, others] = splitProps(properties, ['href', 'class', 'serif', 'onClick', 'children']);

  return (
    <a
      href={local.href}
      onClick={local.onClick}
      class={`group inline-block tracking-wide transition-colors relative${local.serif ? ' font-serif font-normal' : ' font-sans font-medium'}`}
      {...others}
    >
      {local.children}

      <span class="pointer-events-none absolute -bottom-1 left-1/2 h-px w-full origin-center -translate-x-1/2 scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
};

export default LinkWithUnderline;
