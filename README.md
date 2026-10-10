# 技术爱好者 · 个人主页与技术博客

Astro + TypeScript + Markdown + 原生 CSS 搭建的个人主页和技术博客，
部署在 GitHub Pages（免费）。

- 显示名称：技术爱好者
- 简介：记录技术实践、自动化工具与自建服务
- 语言：中文为主，`/en/` 路径预留英文扩展
- 外观：浅色极简

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 构建到 dist/
npm run preview  # 预览构建结果
```

## 新建 GitHub 仓库并上线（待你操作）

> 当前状态：项目文件已备好，**仓库未创建、代码未提交、未部署**。

1. 在 GitHub 新建仓库：
   - 个人主页效果：仓库名取 `guoda0852.github.io`（访问地址就是这个域名）
   - 也可以用其他仓库名，此时按 `astro.config.mjs` 里的注释改 `site` 和 `base`
2. 把本目录文件推送到仓库的 `main` 分支：
   ```bash
   cd tech-blog
   git init
   git add .
   git commit -m "init: 个人主页与技术博客"
   git branch -M main
   git remote add origin git@github.com:guoda0852/你的仓库名.git
   git push -u origin main
   ```
3. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
4. 推送后 `.github/workflows/deploy.yml` 自动构建部署，几分钟后上线

## 写文章

在 `src/content/blog/` 下新建 Markdown 文件，frontmatter 格式：

```markdown
---
title: 文章标题
description: 一句话简介
pubDate: 2026-10-10
tags: [标签1, 标签2]
lang: zh
---

正文……
```

英文文章：`lang: en`，可放在 `src/content/blog/en/` 子目录。

## 目录结构

```
├── .github/workflows/deploy.yml  # Pages 自动部署（已备好，未运行）
├── public/favicon.svg
├── src/
│   ├── content.config.ts          # 博客内容集合定义
│   ├── content/blog/              # Markdown 文章
│   ├── layouts/BaseLayout.astro   # 基础布局（导航/页脚）
│   ├── pages/
│   │   ├── index.astro            # 首页
│   │   ├── about.astro            # 关于
│   │   ├── blog/index.astro       # 博客列表
│   │   ├── blog/[...slug].astro   # 文章页
│   │   └── en/index.astro         # 英文预留页
│   └── styles/global.css          # 浅色极简样式（原生 CSS）
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
