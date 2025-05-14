---
title: '买卖股票的最佳时机'
pubDate: '2025-04-16'
description: 'LeetCode 121 题解析'
tags: ['leetcode', 'array', 'dynamic programming']
---

## 分析

这题抓住一个点：找到历史最低点购入，并在这之后找到利润最高点。
即求「卖出价格-买入价格」的最大值。

## 解答

```cpp
class Solution {
public:
  int maxProfit(vector<int> &prices) {
    auto buy = prices[0];
    auto profit = 0;

    for (auto price : prices) {
      profit = max(profit, price - buy);
      buy = min(buy, price);
    }

    return profit;
  }
};
```
