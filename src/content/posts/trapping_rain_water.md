---
title: '接雨水'
pubDate: 2025-07-16
description: 'LeetCode 42 题解析'
tags:
  [
    'leetcode',
    'array',
    'two pointers',
    'dynamic programming',
    'stack',
    'monotonic stack',
  ]
---

## 分析

要解答这题，首先要搞懂什么情况下可以接到雨水。
从题目给出的图不难看出：在当前高度小于左右两侧任意一边的高度时，可以接到雨水。
因此，我们可以参照 135 题那样的办法，通过前后两次遍历来解决。
首先，我们从左往右遍历，记录每个位置的最大高度 `max(height[i], max_left[i-1])`。
然后，我们再从右往左遍历，记录每个位置的最大高度 `max(height[i], max_right[i+1])`。
最后，我们取这两个位置的交集，从而计算出每个位置可以接到的雨水，即 `min(max_left[i], max_right[i]) - height[i]`。

我们也可以使用单调栈的方法来解决这个问题。
在此题中，我们用单调栈存储下标。
当遍历到下标 `i` 时，我们做以下判断：

- 如果当前柱子高度不高于栈顶柱子，则直接将 `i` 压入栈。
- 如果当前柱子高于栈顶柱子，说明此时一个储水区域已经形成。这时：
  - 栈顶元素 `top` 为区域底部。
  - 当前元素 `i` 为区域右墙。
  - `top` 出栈的栈顶元素 `left` 为区域左墙。

因此，该区域的宽度为 $\mathrm{i} - \mathrm{left} - 1$，
高度为 $\min{(\mathrm{height}[\mathrm{left}], \mathrm{height}[\mathrm{i}])} - \mathrm{height}[\mathrm{top}]$。
由于右墙 `i` 可能为递增序列，因此我们需要重复出栈和计算的过程。
直到该单调栈为空或者找到一个低于当前右墙高度的柱子为止。

同 135 题一样，我们也可以在两次遍历的基础上使用双指针进行优化。
经过观察，我们不难发现 `i` 处能接到的雨水取决于 `left[i]` 和 `right[i]` 的最小值。
我们可以将这两个数组改为指针，并分别设置两个变量表示这两个数组的最大值。
随后，两个指针分别从最左侧或最右侧开始向中间遍历。
此时有：

- $\mathrm{height}[\mathrm{left}]<\mathrm{height}[\mathrm{right}]$。
  此时 $\mathrm{max\_left} < \mathrm{max\_right}$。
  `left` 处能接到的雨水为 `max_left - height[left]`。
  并将 `left` 向右移动。
- $\mathrm{height}[\mathrm{left}]\ge\mathrm{height}[\mathrm{right}]$。
  此时 $\mathrm{max\_left} \ge \mathrm{max\_right}$。
  `right` 处能接到的雨水为 `max_right - height[right]`。
  并将 `right` 向左移动。

当两个指针相遇时，即可得到最终结果。

## 解答

```cpp
class Solution {
public:
  int trap(vector<int> &height) {
    auto ans = 0, left = 0, max_left = 0, max_right = 0;
    int right = height.size() - 1;

    while (left < right) {
      max_left = max(max_left, height[left]);
      max_right = max(max_right, height[right]);

      ans += height[left] < height[right] ? max_left - height[left++]
                                          : max_right - height[right--];
    }

    return ans;
  }
};
```
