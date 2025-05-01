---
title: '移除元素2'
pubDate: '2025-04-13'
description: 'LeetCode 80 题解析'
tags: ['leetcode', 'array', 'two pointers']
---

## 分析

这题核心思想在于快慢指针开始的位置和比较位置。
当我们从 0 开始时，对于 $[0,0,1,1,1]$ 以及 $[0,0,0,1,1]$，
我们只能不断修改判断条件去满足这种避免情况。
但如果我们从 2 开始，则只需要判断 `slow - 2 != fast` 的情况即可。

## 解答

```cpp
class Solution {
public:
  int removeDuplicates(vector<int> &nums) {
    auto n = nums.size();
    if (n < 2)
      return n;
    auto slow = 2;

    for (auto fast = 2; fast < n; ++fast) {
      if (nums[fast] != nums[slow - 2]) {
        nums[slow++] = nums[fast];
      }
    }

    return slow;
  }
};
```
