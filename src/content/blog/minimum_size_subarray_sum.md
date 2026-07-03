---
title: '长度最小的子数组'
pubDate: 2025-08-04
description: 'LeetCode 209 题解析'
tags: ['leetcode', 'array', 'binary search', 'sliding window', 'prefix sum']
---

## 分析

如果仅追求能跑的话，这道题其实很简单。
两轮循环即可。
但在实际中数据量很大。

因此我们可以考虑在两轮循环的基础上使用二分查找。
而如何改写成二分查找呢？
我们可以利用前缀和的思想。
我们先创建个辅助数组 `sums` 用于保存前缀和。
为了方便计算，我们在 `sums` 的最前面插入一个 0。
随后我们可以先固定一个指针 `i`，然后对整个数组进行二分查找。
注意：我们要找的目标是 `target + suns[i - 1]`。
其中 `suns[i - 1]` 就是前 `i - 1` 个元素的前缀和。
而 `target + suns[i - 1]` 就是目标值的前缀和。
随后我们要对结果进行处理，因为我们二分查找的是前缀和，所以我们要将结果减去 `suns[i - 1]`，
并与现有的结果进行比较，取最小值。
其中，二分查找可以用现成的函数，但更推荐自己实现。
在此给出一种针对该题的实现方式：

```cpp
auto binary_search(const vector<int> &nums, int i, int j, const int target) {
  auto ans = -1;

  while (i <= j) {
    auto mid = i + ((j - i) >> 1);

    if (nums[mid] >= target) {
      ans = mid;
      j = mid - 1;
    } else
      i = mid + 1;
  }

  return ans;
}
```

当然，这道题最优的解法还是使用滑动窗口的办法。
前两种方法都是固定一个指针然后进行查找。
而我们可以通过指定两个指针 `start ,end` 来表示滑动窗口的范围。
初始情况下，两指针均为 0。
在 `end` 指针移动过程中，我们先求出 `end` 指针的前缀和，
然后通过移动 `start` 指针来缩小滑动窗口。
从而找出满足条件的子数组。

## 解答

```cpp
class Solution {
public:
  int minSubArrayLen(int target, vector<int> &nums) {
    int n = nums.size();

    if (n == 0)
      return 0;

    auto ans = INT_MAX, start = 0, end = 0, sum = 0;

    while (end < n) {
      sum += nums[end];

      while (sum >= target) {
        ans = min(ans, end - start + 1);
        sum -= nums[start++];
      }

      end++;
    }

    return ans == INT_MAX ? 0 : ans;
  }
};
```
