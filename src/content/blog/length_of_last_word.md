---
title: '最后一个单词的长度'
pubDate: 2025-06-28
description: 'LeetCode 58 题解析'
tags: ['leetcode', 'string']
---

## 分析

这题难度不大。
既然只需要计算最后一个单词的长度，那么只需要从后向前遍历一次就可以了。
但需要注意题目中给的例子后面部分有不等数量的空格，
所以在正式计数前我们要先过滤空格。
随后计算遇到下一个空格的位置即可。

## 解答

```cpp
class Solution {
public:
  int lengthOfLastWord(string s) {
    int idx = s.size() - 1;

    while (s[idx] == ' ')
      idx--;

    auto num = 0;

    while (idx >= 0 && s[idx] != ' ') {
      num++;
      idx--;
    }

    return num;
  }
};
```
