---
title: '反转字符串中的单词'
pubDate: 2025-07-07
description: 'LeetCode 151 题解析'
tags: ['leetcode', 'two pointers', 'string']
---

## 分析

这道题难点在于如何正确处理空格。
我的思路是从后往前遍历，
先像 58 题那样处理尾空格，
然后再利用 `substr` 来截取单词。
并根据 `result` 数组是否为空来决定是否加入前置空格。

当然，这道题可以利用 C++ 中的可变字符串特性来解决。
在开始前，我们先反转整个字符串。
然后先退空格，然后利用快慢指针截取单词并翻转。
其中满指针可以通过判断是否值为 0 来决定是否添加空格。

## 解答

```cpp
class Solution {
public:
  string reverseWords(string s) {
    auto n = s.size();
    auto idx = 0;

    reverse(s.begin(), s.end());

    for (auto start = 0; start < n; ++start) {
      if (s[start] != ' ') {
        if (idx != 0)
          s[idx++] = ' ';

        auto end = start;
        while (end < n && s[end] != ' ')
          s[idx++] = s[end++];

        reverse(s.begin() + idx - (end - start), s.begin() + idx);

        start = end;
      }
    }

    s.erase(s.begin() + idx, s.end());
    return s;
  }
};
```
