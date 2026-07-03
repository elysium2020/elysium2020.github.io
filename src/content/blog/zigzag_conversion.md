---
title: 'Z 字形变换'
pubDate: 2025-07-08
description: 'LeetCode 6 题解析'
tags: ['leetcode', 'string']
---

## 分析

这道题题目误导性有点强。
准确说来说应该是个反向的 N 而不是 Z。
现在让我们重新来看一下题目给出的例子。
在压缩不必要的空行后，不难看出，
这个排列是自上往下，从 0 递增到 `numRows - 1`。
当到达 `numRows - 1` 时，改变遍历方向，
从下往上递减回 0。
因此，我们不难想到利用一个参数 flag。
在当前索引为 0 或者 `numRows - 1` 时，改变 flag 的正负。
从而实现控制遍历方向的功能。

当然，这样的解法还有优化的空间。
在此之前，我们先需要推导一下这个反向 N 的变化逻辑。
还是以题目的例子为例。
我们先需要向下遍历 $r = 3$ 行（一开始为空所以需要从 0 开始遍历），
然后向上遍历回到 $r - 2 = 1$ 行。
因此周期为 $t = r + r - 2 = 2r - 2$。
而每个周期会占用 $1 + r - 2 = r - 1$ 列。

假设最后一个周期为完整的周期，那我们不难的得出总共有 $\begin{bmatrix} n \\ t \end{bmatrix}$ 个周期。
乘上每个周期的列数，则得到矩阵的列数为 $\begin{bmatrix} n \\ t \end{bmatrix} \cdot (r - 1)$。

因此，对于第一行非空字符，其索引均为周期的倍数。
令索引为 $\mathrm{idx}$，则有 $\mathrm{idx} = 0\pmod{t}$。
最后一行则有 $\mathrm{idx} = r - 1\pmod{t}$。
而对于其余行，假设行号为 $i$。
在题目的例子中每个周期内中间行有两个字符。
因此分别满足 $\mathrm{idx}=i\pmod{t}$ 和 $\mathrm{idx} = t - i\pmod{t}$。

## 解答

```cpp
class Solution {
public:
  string convert(string s, int numRows) {
    if (numRows < 2)
      return s;

    int n = s.size();
    auto r = numRows;

    string ans;

    auto t = r * 2 - 2;

    for (auto i = 0; i < r; ++i)
      for (auto j = 0; j + i < n; j += t) {
        ans += s[j + i];
        if (i > 0 && i < r - 1 && j + t - i < n)
          ans += s[j + t - i];
      }

    return ans;
  }
};
```
