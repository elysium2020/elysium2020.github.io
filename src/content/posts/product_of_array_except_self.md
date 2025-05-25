---
title: '除自身以外数组的乘积'
pubDate: 2025-05-25
description: 'LeetCode 238 题解析'
tags: ['leetcode', 'array', 'prefix sum']
---

## 分析

解决本题的难点在于如何在不不使用除法也能完成题目的要求。

一种方法是另外建立两个新数组 `L[len], R[len]`，分别存储 $i - 1$、$i + 1$ 的乘积。
然后在 `ans` 数组中再相乘。
这样做虽然保证了时间复杂度为 $O(N)$，但空间复杂度也为 $O(N)$。

那有什么办法优化呢？我们可以把 `ans[]` 先当成 `L[]` 来进行初始化与计算。
而将 R 数组变成一个跟踪右边元素的乘积。
并实时更新 R 的值。
为了让 R 能正确存储 $i + 1$ 的乘积.
R 应该从 `len - 1` 开始索引。解答如下节所示。

## 解答

```cpp
class Solution {
public:
  vector<int> productExceptSelf(vector<int> &nums) {
    auto length = nums.size();
    vector<int> answer(length);

    answer[0] = 1;
    for (auto i = 1; i < length; ++i)
      answer[i] = nums[i - 1] * answer[i - 1];

    auto R = 1;
    for (int i = length - 1; i >= 0; --i) {
      answer[i] = answer[i] * R;
      R *= nums[i];
    }

    return answer;
  };
};
```
