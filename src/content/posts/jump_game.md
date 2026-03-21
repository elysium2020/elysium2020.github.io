---
title: '跳跃游戏'
pubDate: '2025-04-20'
description: 'LeetCode 55 题解析'
tags: ['leetcode', 'array', 'dynamic programming', 'greedy']
---

## 分析

这题的核心在于维护“当前能够到达的最远位置”。

更合适的做法是使用贪心思路来解答。
当 `max_jump` 的值大于等于 `i` 时，意味着此时 `i` 可达。
此时可通过比较 `max_jump` 和 `i + nums[i]` 的最大值，
并将结果存储在 `max_jump` 中。
而当 `max_jump` 大于等于数组最大索引时，说明最后一个位置可达，返回 `true`。
如果遍历过程中出现 `i > max_jump`，则当前位置不可达，应返回 `false`。

## 解答

```cpp
class Solution {
public:
  bool canJump(vector<int> &nums) {
    auto max_jump = 0;
    auto n = nums.size();

    if (n == 1)
      return true;

    for (auto i = 0; i < n; ++i) {
      if (i <= max_jump) {
        max_jump = max(max_jump, i + nums[i]);

        if (max_jump >= n - 1)
          return true;
      } else
        break;
    }

    return false;
  }
};
```
