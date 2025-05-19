---
title: 'H 指数'
pubDate: 2025-05-19
description: 'LeetCode 274 题解析'
tags: ['leetcode', 'sorting', 'counting sort']
---

## 分析

这道题难度在于如何减少寻在 H 指数的时间。
一开始我是想到了利用计数排序来实现：
通过引入一个额外的数组 `nums[]`，用类似我们之前建立 Hash Table 的方法来记录引用次数。
其中，`nums[i]` 用于表示引用次数恰好为 $i$ 的论文数。
考虑到 H 指数不可能大于论文发表数，
所以我们可以将所有引用次数超过论文发表数的算入总发表数（即 `nums[nums.length]`）。
接着，我们可以逆序遍历这个数组，当累计引用次数大于当前论文总数时，
即为我们所求的 H 指数。

当然，这个方法虽然很快。但要引入一个辅助数组，这增加了空间复杂度。
因此，我们需要找到一个更好的方法。
我们可以将问题转换为寻找「有 h 篇论文引用次数至少为 h」的最大值。
因此，我们可以利用二分查找快速寻找出这个最大值。
当 `left = right` 时，此时 `left` 即为所求。
解答如下文所示。

## 解答

```cpp
class Solution {
public:
  int hIndex(vector<int> &citations) {
    auto left = 0;
    auto right = citations.size();

    while (left < right) {
      auto mid = (left + right + 1) >> 1;
      auto cnt = count_if(citations.begin(), citations.end(),
                          [mid](auto val) { return val >= mid; });
      if (cnt >= mid)
        left = mid;
      else
        right = mid - 1;
    }
    return left;
  }
};
```
