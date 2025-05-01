---
title: '跳跃游戏'
pubDate: '2025-04-20'
description: 'LeetCode 55 题解析'
tags: ['leetcode', 'array', 'dynamic programming', 'greedy']
---

## 分析

这题保持一个思路「维护一个最大值，当最大值大于当前值时使用最大值 $- 1$ 的步数」即可硬解出来。

当然这其实有点 trick，正确的做法应该是使用贪心的思路去解答。
当 `max_jump` 的值大于 `i` 时，意味着此时 `i` 的值可达。
此时可通过比较 `max_jump` 和 `i + nums[i]` 的最大值，
并将结果存储与 `max` 中。
而当 `max_jump` 大于等于数组最大索引时，满足条目条件，返回真值。
当 `max_jump` 不大于 `i` 时，意味着不可达。
返回假值。

## 解答

```cpp
class Solution {
public:
  bool canJump(vector<int> &nums) {
    auto max_jump = 0;
    auto n = nums.size();

    if (n == 1)
      return count;

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
