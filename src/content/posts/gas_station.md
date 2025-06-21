---
title: '加油站'
pubDate: 2025-06-10
description: 'LeetCode 134 题解析'
tags: ['leetcode', 'array', 'greedy']
---

## 分析

此题核心思路在于如何减少遍历的次数。
依据题意，我们不难得出需要针对 `(i + 1) % n` 进行两次遍历。
假设符合题意的起点加油站为 $x$，终点站为 $y$。$z$ 为两者中间的任意一个加油站。
则我们耐心观察后就会得出以下两个等式：

1. $\sum^y_{i=x} \mathrm{gas[i]} < \sum^y_{i=x}{\mathrm{cost[i]}}$。
   即到达最后的加油站后，前往下一个加油站所需要消耗的油量比现有油量要多
2. $\sum^y_{i=x} \mathrm{gas[i]} \ge \sum^j_{i=x}{\mathrm{cost[i]}}$。
   即在到最后的加油站以及之前所需的油量比现有油量少。

因此，我们可以做以下变形：

$$
\begin{aligned}
\sum^y_{i=z}\mathrm{gas[i]} &= \sum^y_{i=x}\mathrm{gas[i]} - \sum^{z-1}_{i=x}\mathrm{gas[i]} \\
&\le \sum^y_{i=x}\mathrm{cost[i]} - \sum^{z-1}_{i=x}\mathrm{gas[i]} \\
&\le \sum^y_{i=x}\mathrm{cost[i]} - \sum^{z-1}_{i=x}\mathrm{cost[i]} \\
&= \sum^y_{i=z}\mathrm{cost[i]}
\end{aligned}
$$

即 $x$ 与 $y$ 之间，不存在任何一个加油站，使得汽车能到达 $y$ 后下一个加油站。

因此，我们可以先从 0 号加油站开始检查并判断能否环绕一周。
如果不能则从第一个失败的加油站重新开始检查。
以此类推，直到得出结果。

## 解答

```cpp
class Solution {
public:
  int canCompleteCircuit(vector<int> &gas, vector<int> &cost) {
    auto n = gas.size();
    auto i = 0;

    while (i < n) {
      auto sum_cost = 0;
      auto sum_gas = 0;
      auto cnt = 0;

      while (cnt < n) {
        auto j = (i + cnt) % n;
        sum_gas += gas[j];
        sum_cost += cost[j];

        if (sum_cost > sum_gas)
          break;

        cnt++;
      }

      if (cnt == n)
        return i;
      else
        i = i + cnt + 1;
    }

    return -1;
  }
};
```
