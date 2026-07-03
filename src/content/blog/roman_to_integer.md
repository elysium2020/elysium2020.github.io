---
title: '罗马数字转整数'
pubDate: 2025-06-24
description: 'LeetCode 13 题解析'
tags: ['leetcode', 'hash table', 'math', 'string']
---

## 分析

这题按题意直接写 `if-else` 也能完成，但那样的写法可读性一般，可扩展性也较差。
但官方解答也有可取之处：
从左往右的角度看，小的数字位于大的左边，则 `ans` 减去当前值。
比如 $IV$，因为 $I < V$，所以我们应该 $\mathrm{ans} - 1 + 5$。
反之则 `ans += val`。

## 解答

```cpp
class Solution {
public:
  int romanToInt(string s) {
    unordered_map<char, int> symbol_values = {
        {'I', 1},   {'V', 5},   {'X', 10},  {'L', 50},
        {'C', 100}, {'D', 500}, {'M', 1000}};
    auto ans = 0;
    auto n = s.length();

    for (auto i = 0; i < n; ++i) {
      auto val = symbol_values[s[i]];
      if (i < n - 1 && val < symbol_values[s[i + 1]])
        ans -= val;
      else
        ans += val;
    }

    return ans;
  }
};
```
