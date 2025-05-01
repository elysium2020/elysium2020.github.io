---
title: '多数元素'
pubDate: '2025-04-14'
description: 'LeetCode 169 题解析'
tags: ['leetcode', 'array', 'two pointers', 'hash table', 'sorting', 'counting']
---

## 分析

由于多数元素占比超过 $\frac{n}{2}$，
所以我们可以直接通过调用 `sort()` 来排序，
并返回索引为 $\frac{n}{2}$ 的元素。

当然，如果不考虑进阶要求空间复杂度为 $O(1)$，我们也可以通过调用哈希表。
利用键值对来统计每个元素及其出现次数。
并通过类似打擂台的方式来维护最大值。

本题中，最佳办法是官方解法中的 Boyer-Moore 投票算法。
具体算法正确性可见 LeetCode 官方题解。
其原理为：
定义为一个候选众数 `candidate`，并定义出现次数 `count = 0`，当前数为 $x$。

当 `count < 0` 时，定义 $x$ 为 `candidate`。
然后做以下判断：

- `candidate = x; count++;`
- `candidate != x; count--;`

因为众数数量超过数组长度的 $\frac{1}{2}$。
令众数数量为 $n$，则在次情况下总共有 `n - num.size()/2` 的数没有消除。
也就是说，最后得出的 `candidate` 自然为众数。

## 解答

```cpp
class Solution {
public:
  int majorityElement(vector<int> &nums) {
    auto candidate = -1;
    auto count = 0;

    for (auto num : nums) {
      if (num == candidate)
        ++count;
      else if (--count < 0) {
        candidate = num;
        count = 1;
      }
    }

    return candidate;
  }
};
```
