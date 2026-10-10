import { defineConfig } from 'astro/config';

// GitHub Pages 部署说明：
// - 用户主页：仓库名取 guoda0852.github.io，site 保持下面这样，base 不用设
// - 项目页面：仓库名任意，site 改成 https://guoda0852.github.io，base 改成 '/仓库名'
export default defineConfig({
  site: 'https://guoda0852.github.io',
});
