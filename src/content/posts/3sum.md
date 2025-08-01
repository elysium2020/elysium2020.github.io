---
title: '三数之和'
pubDate: 2025-08-01
description: 'LeetCode 15 题解析'
tags: ['leetcode', 'array', 'two pointers', 'sorting']
---

## 分析

这道题个人感觉不太像个算法题。
一开始想着先利用两轮循环确定两个数字，然后使用二分来寻找剩余的数字中是否有满足条件的数字。
随后想到这其中可能有大量的重复计算，遂考虑 DP。
但在实现过程中发现该方法时间复杂度 $O(n^2\log{n})$，似乎不太像 LeetCode 的答案。

官方解答前几个步骤和我前面想法类似。
都是先用两轮循环固定住两个数字，但官方解答在寻找第三个数的时候使用了额外的指针。
由于题目要求 $i \ne j,\ j \ne k,\ i \ne k$，
所以我们在定义第二个和第三个指针的时候要确保内容不能与前一个指针重复。
且第三个指针必须要在第二个指针的后面。

当第二个指针和第三个指针相遇时，就不会有 $a + b + c = 0$ 且 $b < c$ 的情况。
此时我们可以跳过。
当找到满足条件的 c 时，我们可以将 `{a, b, c}` 压入答案数组 `res` 中。

## 解答

```cpp
class Solution {
public:
  vector<vector<int>> threeSum(vector<int> &nums) {
    int n = nums.size();
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;

    for (auto i = 0; i < n; i++) {
      if (i > 0 && nums[i] == nums[i - 1])
        continue;

      auto k = n - 1, target = -nums[i];

      for (auto j = i + 1; j < n; j++) {
        if (j > i + 1 && nums[j] == nums[j - 1])
          continue;
        while (j < k && nums[j] + nums[k] > target)
          k--;
        if (j == k)
          break;
        if (nums[j] + nums[k] == target)
          res.push_back({nums[i], nums[j], nums[k]});
      }
    }

    return res;
  }
};
```
