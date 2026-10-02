export const SITE = {
  title: "Elysium's Blog",
  author: 'Elysium',
  tagline: 'Fullstack / DevOps',
  description: 'Elysium 的个人技术博客，记录算法题解与工程实践。',
  url: 'https://elysium2020.github.io',
  lang: 'zh-CN',
};

export const NAV_ITEMS: readonly { title: string; href: string }[] = [
  { title: '文章', href: '/blog' },
  { title: '标签', href: '/tags' },
  { title: '关于', href: '/about' },
];

export const SOCIAL_LINKS: readonly { name: string; href: string; icon: string }[] = [
  { name: 'GitHub', href: 'https://github.com/elysium2020', icon: 'i-tabler-brand-github' },
  { name: 'RSS', href: '/rss.xml', icon: 'i-tabler-rss' },
];

export const STACK: { label: string; items: { name: string; icon: string }[] }[] = [
  {
    label: 'language',
    items: [
      { name: 'TypeScript', icon: 'i-tabler-brand-typescript' },
      { name: 'Go', icon: 'i-tabler-brand-golang' },
      { name: 'Rust', icon: 'i-tabler-brand-rust' },
    ],
  },
  {
    label: 'frontend',
    items: [
      { name: 'Astro', icon: 'i-tabler-brand-astro' },
      { name: 'SolidJS', icon: 'i-tabler-brand-solidjs' },
      { name: 'Vue', icon: 'i-tabler-brand-vue' },
      { name: 'React', icon: 'i-tabler-brand-react' },
    ],
  },
  {
    label: 'backend',
    items: [
      { name: 'Axum', icon: 'i-tabler-server' },
      { name: 'Gin', icon: 'i-tabler-server' },
    ],
  },
  {
    label: 'DevOps',
    items: [
      { name: 'Docker', icon: 'i-tabler-brand-docker' },
      { name: 'Kubernetes', icon: 'i-mdi-kubernetes' },
      { name: 'Ansible', icon: 'i-tabler-brand-ansible' },
    ],
  },
];
