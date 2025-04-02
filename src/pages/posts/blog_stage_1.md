---
layout: ../../layouts/BlogPost.astro
title: '搭建我的博客（一）'
description: '初搭建博客的一些碎碎念'
pubDate: 2025-03-27 10:32
tags: ['astro', 'blog']
---

好不容易把这个博客搭建出来了，赶紧记录下搭建流程。

## 规划阶段

其实我一开始想着用 Hugo，因为它具有操作简单、模板多的特点，
生成静态网页的速度也挺快的，非常适合我这种纯小白。
但后来看见别人推崇我现在用的这个框架，即 Astro，说这个框架比诸如 Hexo、Hugo 等网页生成器都强。
所以我决定尝试下这个传说中的框架。

## 准备阶段

首先是安装必要的依赖：

```sh
bun create astro --template minimal
```

可能有些人会问：为什么不是用 npm 呢？答案很简单：慢。
虽然 bun 官方很抽象，打包的脚本甚至出现了 `#!/usr/bin/node` 这种东西，
但还是挡不住bun作为一个包管理器是合格的，甚至接近完美的。

让我们来做个简单的 benchmark，以安装这个博客所需的项目依赖为例：

```sh
❯ hyperfine -p 'rm -rf node_modules/ package-lock.json' -w 3 'npm install'
Benchmark 1: npm install
  Time (mean ± σ):      8.499 s ±  0.097 s    [User: 10.868 s, System: 2.921 s]
  Range (min … max):    8.290 s …  8.642 s    10 runs

❯ dust | rg node_modules
187M   ┌─┴ node_modules                       │██████████████████████████ │ 100%

❯ hyperfine -p 'rm -rf node_modules/ bun.lock' -w 3 'bun install'
Benchmark 1: bun install
  Time (mean ± σ):     650.6 ms ±   4.4 ms    [User: 94.6 ms, System: 613.0 ms]
  Range (min … max):   643.8 ms … 657.4 ms    10 runs

❯ dust | rg node_modules
217M   ┌─┴ node_modules                   │██████████████████████████████ │ 100%
```

根据以上数据，我们可以做个这样的统计

|       测试数据       |   npm   |   bun    |
| :------------------: | :-----: | :------: |
|     平均运行时间     | 8.499 s | 650.6 ms |
| `node_modules/` 体积 |  187 M  |  217 M   |

可以看出，虽然 bun 安装后 `node_modules/` 体积比 npm 稍微大了点，但速度比 npm 快了 13 倍。
不得不说这点牺牲还是值得的。

在这之后，出于之前使用 Hugo 的习惯，我刚开始是打算使用现成的主题的。
但我在 Github Topic 搜索 _astro-theme_ 后发现大部分现成主题配置都难以维护，
于是决定自己写个。

## 设计

我在这里选择了老朋友 Tailwind CSS + FlowBite，
跟着[官方教程](https://docs.astro.build/en/tutorial/)还是很快就搭建出一个雏形。
也在这里列一下未来的工作：

- [x] 进一步美化
  - 标题栏
  - 脚注
- [ ] 搜索
- [ ] Rss 订阅
- [ ] 暗黑模式
- [ ] 移动端
- [x] 更好的元信息
