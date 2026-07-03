---
title: '旋转数组'
pubDate: '2025-04-14'
description: 'LeetCode 189 题解析'
tags: ['leetcode', 'array', 'two pointers']
---

## 分析

这题其实还算比较简单。
令当前位置为 $i$，数组长度为 $n$，目标位置为 $j$。
那么只需要知道 $j = (i + k) \% n$ 就能利用一个辅助数组快速写出一个空间复杂度为 $O(N)$ 的解法。
若想不出，也可以向我一开始那样通过两个循环先将需要往前移动的数放入数组，
然后再利用 $j = n - i$ 来将剩余元素复制到新数组中。

不过，综合时间复杂度和空间复杂度的情况，这题最优解法为翻转三次数组。
第一次翻转整个数组。此时数组将以倒序方式排列。
随后依次翻转 $[0, k-1], [k, n]$ 区间的元素。
此时所有元素位置均已达目标位置。

## 解答

```cpp
class Solution {
private:
  void reserve(vector<int> &nums, int start, int end) {
    while (start < end)
      swap(nums[start++], nums[end--]);
  }

public:
  void rotate(vector<int> &nums, int k) {
    k %= nums.size();
    reserve(nums, 0, nums.size() - 1);
    reserve(nums, 0, k - 1);
    reserve(nums, k, nums.size() - 1);
  }
};
```
