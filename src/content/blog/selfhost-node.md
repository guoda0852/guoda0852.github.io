---
title: 自建代理节点实践：3x-ui + Caddy + Cloudflare
description: 用 Oracle Cloud + 3x-ui + Caddy + Cloudflare 搭建带伪装的代理节点，记录架构与关键配置。
pubDate: 2026-10-10
tags: [自建服务, 代理, 3x-ui]
lang: zh
---

最近把自己的代理节点重新搭了一遍，架构比以前干净多了，记录一下。

## 架构

```
用户 --TLS--> Cloudflare（CDN, 443）
                |
                v
          Caddy（源站 443，TLS 终止）
            |- panel.域名    --> 3x-ui 面板 (127.0.0.1:2053)
            |- www.域名/ray*  --> Xray VLESS+WS (127.0.0.1:10086)
            |- www.域名/gun   --> Xray VLESS+gRPC (127.0.0.1:10087)
            |- www.域名/sub/* --> 3x-ui 订阅 (127.0.0.1:2053)
            |- www.域名/ 其他  --> 2048 小游戏（伪装回落）
```

核心思路：**Caddy 做统一入口**，只暴露 443 端口；Xray 和面板都只监听本机，不直接对外。

## 几个关键点

### 1. Cloudflare Origin 证书（15 年免费）

Cloudflare 后台 SSL/TLS → Origin Server 可以申请最长 15 年的源站证书。
注意它**只有 Cloudflare 边缘信任**，必须配合小黄云（Proxied）+ Full (Strict) 模式使用。

### 2. Xray 的 TLS 要关掉

因为 TLS 由 Caddy 终止，3x-ui 里 inbound 的 TLS 必须设为 `none`，
Xray 只收本机明文流量。WS 的 `path` 和 gRPC 的 `serviceName` 前后端保持一致。

### 3. 伪装回落

`www.域名` 的其他路径返回一个 2048 小游戏静态页。
有人直接访问域名看到的是个游戏站，节点路径藏在后面。

### 4. 面板藏好

3x-ui 面板监听 `127.0.0.1:2053`，只通过 `panel.域名` 经 Caddy 访问，
2053 端口不对公网开放。

## 客户端

- iOS 小火箭：VLESS + WS，路径 `/ray`，TLS 开，SNI 填域名
- 订阅：`https://www.域名/sub/{subid}`，小火箭 / Loon / Clash 都支持

## 成本

- Oracle Cloud 免费套餐：0 元
- 域名：每年几十块
- Cloudflare：免费版够用

总成本约等于域名的续费。有公网 VPS 的话，这套架构可以直接复用。
