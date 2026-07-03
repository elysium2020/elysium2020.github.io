import rss from '@astrojs/rss';
import { sortedPosts } from '@/lib/blog';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context: { site: string }) {
  return rss({
    title: "Elysium's Blog",
    description: 'FullStack / DevOps。',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      content: sanitizeHtml(parser.render(post.body || '')),
    })),
    customData: `<language>zh-CN</language>`,
  });
}
