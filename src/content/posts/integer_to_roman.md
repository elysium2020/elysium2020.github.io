---
title: '整数转罗马数字'
pubDate: 2025-06-24
description: 'LeetCode 12 题解析'
tags: ['leetcode', 'hash table', 'math', 'string']
---

## 分析

开始以为和 13 题一样从后往前遍历就行，后来发现代码有点长于是便直接看了眼答案。

答案中给了两种方法。
第一种是从大到小先建立一个映射表 `tabel` 并开始遍历，
当发现当前值 `num` 小于 `tabel[i]` 时便输出推入对应的字符并减去相应的值。
从而得出答案。
但这样的方法有个问题：虽然时间复杂度为 $O(1)$，但实际运行会受到映射大小的影响。
本题条件最大的循环次数不会超过15。

第二种虽然也是通过映射实现，但比第一种考虑得更周到：
通过归纳，我们不难发现：

* 千位只能由 M 表示。
* 百位只能由 C, CD, D, CM 表示。
* 十位只能由 X，XL，L 和 XC 表示。
* 个位只能由 I，IV，V 和 IX 表示。

因此，我们可以将其分为四组，且每组没有公共符号。
因此，每个数字我们都可以进行单独处理。
即，我们可以根据每个位上的数字来寻找对应的罗马字符。
随后拼接在一起，即为所求。

## 解答

```cpp
class Solution {
public:
  string intToRoman(int num) {
    const string thousands[] = {"", "M", "MM", "MMM"};
    const string hundreds[] = {"",  "C",  "CC",  "CCC",  "CD",
                               "D", "DC", "DCC", "DCCC", "CM"};
    const string tens[] = {"",  "X",  "XX",  "XXX",  "XL",
                           "L", "LX", "LXX", "LXXX", "XC"};
    const string ones[] = {"",  "I",  "II",  "III",  "IV",
                           "V", "VI", "VII", "VIII", "IX"};

    return thousands[num / 1000] + hundreds[num % 1000 / 100] +
           tens[num % 100 / 10] + ones[num % 10];
  }
};

```
