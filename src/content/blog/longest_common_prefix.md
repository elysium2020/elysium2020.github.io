---
title: '最长公共前缀'
pubDate: 2025-06-28
description: 'LeetCode 14 题解析'
tags: ['leetcode', 'string']
---

## 分析

这道题其实非常简单。
按照常规思维来看，我们只需要对字符串进行纵向扫描，
分别对比字符串的每个字母，当字母不一样时停止扫描并返回当前存储的结果。

但是，这道题的思路可以进一步拓展。
首先，假设字符串成员为 `strs = ['leet', 'leetcode', 'lee', 'le']`。
我们可以对字符串进行分治。即分别对 `strs = ['leet', 'leetcode']` 和 `strs = ['lee', 'le']` 进行分治。
求出 `strs = ['leet', 'leetcode']` 的最长公共前缀为 `leet`，
`strs = ['lee', 'le']` 的最长公共前缀为 `le`。
随后，我们对这两个字符串进行比较，得到 `leet` 与 `le` 的最长公共前缀为 `le`。

当然，此题还可以利用二分查找的思路进行解答。
显然，最长公共前缀小于等于最短字符串的长度，
所以我们先找出最短字符串的长度 `min_len`。
然后，我们取字符串中间值 `mid`，
先比较每个字符串的前 `mid` 个字符，若都相同则以 `mid+1` 为起点比较后 `len - (mid + 1)` 个字符。
从而将搜索范围缩小，得出答案。

## 解答

```cpp
class Solution {
public:
  string longestCommonPrefix(vector<string> &strs) {
    if (!strs.size())
      return "";

    auto min_len = min_element(strs.begin(), strs.end(),
                               [](const string &s, const string &t) {
                                 return s.size() < t.size();
                               })
                       ->size();
    auto low = 0;
    auto high = min_len;

    while (low < high) {
      auto mid = (high - low + 1) / 2 + low;

      if (isCommonPrefix(strs, mid))
        low = mid;
      else
        high = mid - 1;
    }

    return strs[0].substr(0, low);
  }

  bool isCommonPrefix(const vector<string> &strs, int len) {
    auto str0 = strs[0].substr(0, len);
    auto cnt = strs.size();

    for (auto i = 0; i < cnt; ++i) {
      auto str = strs[i];

      for (auto j = 0; j < len; ++j)
        if (str[j] != str0[j])
          return false;
    }

    return true;
  }
};
```
