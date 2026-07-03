---
title: '找出字符串中第一个匹配项的下标'
pubDate: 2025-07-09
description: 'LeetCode 28 题解析'
tags: ['leetcode', 'two pointers', 'string', 'string matching']
---

## 分析

这道题虽然标是 easy，但仅在使用暴力时为 easy。
如果要用 KMP 算法的思路去做那么难度将会大大上升。

先从暴力搜索的思路去看，
因为我们是匹配字符串，所以要确保相应的字符串是连续且完全匹配的。
现在我们定义两个变量如下：

```cpp
auto n = haystack.size();
auto m = needle.size();
```

因为我们要确保字符串连续且相同，所以外层循环中结束条件应为 `i + m <= n`。
内层循环中，为了减少开始位置的判断，我们可以始终令 `j = 0`。
而具体的判断的索引则为 `i + j`。
当匹配过程中发现不匹配时，应该立即打断而不是返回 -1。
因为可能存在诸如被匹配项为 `aaaaaaaab`，匹配项为 `aaab` 的情况。

关于 KMP 解法。
我们要先算出 PM 数组。
然后使用 PM 数组和要匹配的字符串进行比较。
当遍历到 PM 最后一项且相等时，匹配成功。

## 解答

```cpp
class Solution {
public:
  int strStr(string haystack, string needle) {
    if (needle.size() == 0)
      return 0;

    auto n = haystack.size();
    auto m = needle.size();

    vector<int> pm(m);

    for (auto i = 1, j = 0; i < m; ++i) {
      while (j > 0 && needle[i] != needle[j])
        j = pm[j - 1];
      if (needle[i] == needle[j])
        ++j;
      pm[i] = j;
    }

    for (auto i = 0, j = 0; i < n; ++i) {
      while (j > 0 && haystack[i] != needle[j])
        j = pm[j - 1];
      if (haystack[i] == needle[j])
        ++j;
      if (j == m)
        return i - m + 1;
    }

    return -1;
  }
};
```
