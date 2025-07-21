---
title: '验证回文串'
pubDate: 2025-07-21
description: 'LeetCode 125 题解析'
tags: ['leetcode', 'two pointers', 'string']
---

## 分析

这道题最直观的方法就是利用双指针进行前后遍历。
我们可以先利用 `erase()` 配合 `remove_if()` 以及 `isalnum()` 移除所有非法字符。
然后利用 `transform()` 将所有字符转换为小写。
接着就可以使用双指针进行前后遍历判断是否回文了。

当然，我们还可以直接在原字符串上判断，从而节省额外空间。
我们可以利用上文提到的 `isalnum()` 函数，在遇见非法字符时进行跳过。
然后直接利用 `tolower()` 对字符进行立即转换并判断。

## 解答

```cpp
class Solution {
public:
  bool isPalindrome(string s) {
    int n = s.size();
    auto left = 0, right = n - 1;

    while (left < right) {
      while (left < right && !isalnum(s[left]))
        left++;
      while (left < right && !isalnum(s[right]))
        right--;
      if (left < right)
        if (tolower(s[left++]) != tolower(s[right--]))
          return false;
    }

    return true;
  }
};
```
