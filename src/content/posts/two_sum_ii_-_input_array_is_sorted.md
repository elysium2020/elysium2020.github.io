---
title: '两数之和 II - 输入有序数组'
pubDate: 2025-07-27
description: 'LeetCode 167 题解析'
tags: ['leetcode', 'array', 'two pointers', 'binary search']
---

## 分析

这道题算不上特别难。
基本上一眼就能得出双指针的方法。
但在介绍双指针方法之前，先来看一看以二分的思路是如何完成的。

二分的思路是先固定一个数字，
然后在右侧二分寻找满足 `numbers[left] + numbers[right] == target` 的 `right`。
换句话说，在固定好一个数字 `numbers[i]` 后，我们需要寻找一个满足`target - numbers[i]` 的 `numbers[mid]`。
由于答案唯一，所以我们在找到后可以直接返回。
注意：这道题在计算中间值 mid 时，由于编译器优化的特性可以考虑用 `>>1` 来替代 `/2`，从而方便编译器优化。

而双指针法则更简单。
我们只需要两个指针 `left` 和 `right`。
在 `numbers[left] + numbers[right] = target` 之前对 `left` 和 `right` 进行向中间移动即可。

## 解答

```cpp
class Solution {
public:
  vector<int> twoSum(vector<int> &numbers, int target) {
    int left = 0, right = numbers.size() - 1;

    while (left < right) {
      auto sum = numbers[left] + numbers[right];

      if (sum == target)
        return {left + 1, right + 1};
      else if (sum > target)
        right--;
      else
        left++;
    }

    return {-1, -1};
  }
};
```
