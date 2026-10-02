import rss from '@astrojs/rss';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { sortedPosts } from '@/lib/posts';
import { SITE } from '@/lib/site';

// Dedicated processor: no heading-anchor links, matching the site's math setup.
const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});

export async function GET(context: { site: string }) {
  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      const { code } = await processor.render(post.body ?? '');
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        content: code,
      };
    }),
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items,
    customData: `<language>${SITE.lang}</language>`,
  });
}
