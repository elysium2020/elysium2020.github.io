---
title: '跳跃游戏2'
pubDate: '2025-04-20'
description: 'LeetCode 45 题解析'
tags: ['leetcode', 'array', 'dynamic programming', 'greedy']
---

## 分析

个人比起 55 题更难了。
这题的重点在于如何进行「贪心」地向后查找。
以 `[2, 3, 1, 1, 4]` 为例：
`i = 0` 时，最大跳跃距离为 2， `i = 1` 时，最大跳跃距离为 3。
因此，我们可以维护一个当前可到达的边界 `max_jump`。
到达边界时，更新边界值并增加跳跃次数。

## 解答

```cpp
class Solution {
public:
  int jump(vector<int> &nums) {
    auto count = 0;
    auto end = 0;
    auto max_jump = 0;
    auto n = nums.size();

    for (auto i = 0; i < n - 1; ++i) {
      max_jump = max(max_jump, nums[i] + i);

      if (max_jump >= n - 1)
        return count + 1;

      if (i == end) {
        end = max_jump;
        count++;
      }
    }

    return count;
  }
};
```
