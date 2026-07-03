---
title: '盛最多水的容器'
pubDate: 2025-07-28
description: 'LeetCode 11 题解析'
tags: ['leetcode', 'array', 'two pointers', 'greedy']
---

## 分析

这道题如果有双指针的思想难度不大。
我们只需要设立左右指针，
让他们从两端往中间扫描每个元素，
并确保面积始终为最大值即可。

## 解答

```cpp
class Solution {
public:
  int maxArea(vector<int> &height) {

    int num = height.size();
    auto left = 0, right = num - 1, ans = 0;

    while (left < right) {
      auto min_height = min(height[left], height[right]);
      ans = max((right - left) * min_height, ans);

      if (height[left] >= height[right])
        right--;
      else
        left++;
    }

    return ans;
  }
};
```
