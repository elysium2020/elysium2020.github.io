---
title: '买卖股票的最佳时机2'
pubDate: '2025-04-17'
description: 'LeetCode 122 题解析'
tags: ['leetcode', 'array', 'dynamic programming', 'greedy']
---

## 分析

这题相比于 121 题，关键在于多了一个条件「可以当天卖出的同时买入，但同时只能持有一股」。
所以问题从「找出最小值，并在此之后找到最大值」变成了「尽可能找到一系列不相交的区间，记录所有区间的左右差值（右减左）大于 $0$
的区间」。

因此这题有两种方案实现：

1. 动态规划。因为当日盈亏情况均由昨日决定。
   所以我们可以通过变量记录昨天是否持有股票（`dp0, dp1`），
   然后通过方程 `dp0_now=max{dp0,dp1+price}` 来记录不持有的情况下收益最大化的转移方程。
   并通过 `dp1_now=max{dp1,dp0-price}` 来记录持有股票的情况下损失最小化的转移方程。
   最后一天要同时做到利益最大化以及损失最小化，所以必然为 `dp0`。
2. 贪心。我们只需要寻找 n 个区间为 $1$，且卖出 $>$ 买入的区间就行。具体代码如下所示。

## 解答

```cpp
class Solution {
public:
  int maxProfit(vector<int> &prices) {
    auto n = prices.size();
    auto ans = 0;

    for (auto i = 1; i < n; ++i)
      ans += max(0, prices[i] - prices[i - 1]);

    return ans;
  }
};
```
