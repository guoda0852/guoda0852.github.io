import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 博客文章集合：src/content/blog/ 下的 Markdown 文件
// 英文扩展：以后在 src/content/blog/en/ 下放英文文章，loader 的 pattern 已覆盖子目录
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lang: z.string().default('zh'), // zh | en，预留英文
  }),
});

export const collections = { blog };
