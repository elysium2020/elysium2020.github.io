---
title: '无重复字符的最长子串'
pubDate: 2025-08-26
description: 'LeetCode 3 题解析'
tags: ['leetcode', 'hash table', 'string', 'sliding window']
---

## 分析

这道题主要考验滑动窗口的使用。
为了记录字符是否出现过，我们可以使用哈希表来存储每个字符。
用左右指针标明滑动窗口界限。
其中右指针初始值为 -1，左指针初始值为 0。
从而表示此时的滑动窗口为空。

随后我们开始调整滑动窗口。
首先我们可以固定左指针，
当左指针不为0时，左指针会在滑动前滑出指向的字符，从而允许该字符能在右边再次出现。
随后我们开始调整右指针。
右指针会尽可能的向右移动，直到遇到重复的字符或者到达字符串的末尾。
在这期间，程序会更新滑动窗口的最大长度。
从而得出答案。

## 解答

```cpp
class Solution {
public:
  int lengthOfLongestSubstring(string s) {
    unordered_set<char> persist;
    auto right = -1, ans = 0;
    int n = s.size();

    for (auto left = 0; left < n; ++left) {
      if (left != 0)
        persist.erase(s[left - 1]);

      while (right + 1 < n && !persist.count(s[right + 1]))
        persist.insert(s[++right]);

      ans = max(ans, right - left + 1);
    }

    return ans;
  }
};
```
