---
title: '判断子序列'
pubDate: 2025-07-24
description: 'LeetCode 392 题解析'
tags: ['leetcode', 'two pointers', 'string', 'dynamic programming']
---

## 分析

这道题非常简单，双指针即可轻松判断。
因为是子序列，所以后一个字符必须在前一个字符之后出现。
因此我们可以在一个循环内完成判断，当慢指针的指为字符串长度时之间返回 `true`。
当我们在遍历完整个 `t` 时若慢指针的长度不等于 `t` 的长度时返回 `false`。

当然，这道题还可以用动态规划的方法来解决。
但动态规划方法对于这道题而言过于复杂。
因为每个位置的状态依赖后续位置的状态，所以我们通过倒序来装填 `dp[][]`。
首先，我们要确定状态转移的边界。
令 `m = t.size()`。
那我们可以让 `dp[m][i]` 全为 `m` 来表示虚拟边界。
其次，我们写出状态转移方程。

$$
\mathrm{dp[i][j]} =
\begin{cases}
i & \mathrm{t[i]} = j \\
\mathrm{dp[i + 1][j]} & \mathrm{t[i]} \ne j
\end{cases}
$$

根据以上方程，我们即可完成 `dp[][]` 的填充。

现在我们开始查找：
我们先定义一个 `add` 用于表示搜索起始位置。
令 `c = s[i]`，则我们判断 `dp[add][c - 'a']` 是否等于 `m`。
若等于则说明未能找到字符 `c`，即不符合子序列的要求。
若等于我们可以更新 `add` 为 `dp[add][c - 'a'] + 1`。
直到遍历结束。

## 解答

```cpp
class Solution {
public:
  bool isSubsequence(string s, string t) {
    if (s.size() > t.size())
      return false;

    int m = t.size();
    vector<vector<int>> dp(m + 1, vector<int>(26, 0));

    for (auto i = 0; i < 26; ++i)
      dp[m][i] = m;

    for (auto i = m - 1; i >= 0; --i)
      for (auto j = 0; j < 26; ++j)
        dp[i][j] = t[i] == j + 'a' ? i : dp[i + 1][j];

    auto add = 0;

    for (auto c : s) {
      if (dp[add][c - 'a'] == m)
        return false;
      add = dp[add][c - 'a'] + 1;
    }

    return true;
  }
};
```
