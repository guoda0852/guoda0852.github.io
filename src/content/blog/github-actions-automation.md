---
title: 用 GitHub Actions 做自动化：定时任务与博客部署
description: GitHub 免费的 CI 能力不止能跑测试，还能做定时任务和自动部署，这个博客就是这么上线的。
pubDate: 2026-10-10
tags: [自动化, GitHub Actions]
lang: zh
---

GitHub Actions 的免费额度对个人项目很慷慨：公开仓库无限时长，
私有仓库每月 2000 分钟。除了跑测试，它还能干两件事：定时任务和自动部署。

## 定时任务

仓库里放一个 workflow 文件，用 cron 语法定时触发：

```yaml
on:
  schedule:
    - cron: '0 10 * * 1-5'  # 工作日 18:00（北京时间）
```

我之前用它做过每天的股票数据分析：定时拉数据、跑脚本、发邮件。
注意两点：

1. GitHub 的 cron 用的是 UTC 时间，北京时间要减 8 小时
2. 整点任务多，调度可能延迟；错开整点（比如 16:17）更准时

## 博客自动部署

这个博客的部署也是 Actions 做的。仓库里 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

逻辑很简单：push 到 main 分支 → 自动构建 → 部署到 GitHub Pages。
写完 Markdown 提交，几分钟后博客就更新了。

## 仓库设置

首次使用要在仓库 Settings → Pages 里把 Source 设为 **GitHub Actions**，
之后推送代码就会自动部署。

## 小结

| 场景 | 做法 |
|------|------|
| 定时脚本 | schedule 触发 + 脚本 |
| 博客部署 | push 触发 + 构建部署 |
| 定时提醒 | schedule 触发 + 发邮件/消息 |

免费、稳定、不用自己维护服务器。个人自动化先看它够不够用，
不够再考虑自建。
