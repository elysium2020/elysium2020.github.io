---
layout: ../../layouts/BlogPost.astro
title: '移除元素'
pubDate: '2025-03-28 20:35'
description: 'LeetCode 27 题解析'
tags: ['leetcode', 'array', 'two pointers']
---

## 分析

这题取决于你有没有快慢指针的概念，如果有那这题相当于 $1 + 1 = 2$ 了。

我们可以取两个指针，慢指针用于逐个读取元素，快指针在 `nums[fast] = val` 时跳过。
然后我们仅需返回 slow 的值。
这样一来时间复杂度为 $O(N)$，空间复杂度为 $O(1)$。

## 解答

```cpp
class Solution {
public:
  int removeElement(vector<int> &nums, int val) {
    auto slow = 0;

    for (auto fast = 0; fast < nums.size(); ++fast) {
      if (nums[fast] != val)
        nums[slow++] = nums[fast];
    }

    return slow;
  };
};
```
