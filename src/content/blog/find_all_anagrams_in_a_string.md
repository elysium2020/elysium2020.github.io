---
title: '找到字符串中所有字母异位词'
pubDate: 2025-09-20
description: 'LeetCode 438 题解析'
tags: ['leetcode', 'hash table', 'string', 'sliding window']
---

## 分析

这道题是适合使用滑动窗口来解决。
一开始，我们可以先比较字符串 `s` 和 `p` 的长度。
当 `s.length() < p.length()` 时，直接返回空数组。
接下来，我们可以定义两个长度为26的数组 `s_count[]` 和 `p_count[]`。
并将 `p.length()` 个字符分别加入 `s_count[]` 和 `p_count[]` 中。
若此时 `s_count[]` 和 `p_count[]` 相等，
则意味着我们找到了第一个异位词，起始索引为 $0$。
此时，我们将 $0$ 压入数组 `ans` 中。
随后，我们开始滑动窗口。
先弹出最左侧字符 `--s_count[s[i] - 'a']`，
然后将 `s[i + p.length()]` 加入 `s_count[]` 中。
此时我们比较 `s_count[]` 和 `p_count[]` 是否相等。
若相等则说明我们找到了一个异位词，起始索引为 $i + 1$，将其压入数组 `ans` 中。
随后，返回数组 `ans` 即可。

上面这个方法有个问题：每次都需要比较 `s_count[]` 和 `p_count[]` 是否完全相等，
这浪费了不少时间。
因此我们可以考虑使用一个变量 `differ` 以及一个数组 `count[]`。
用 `count[]` 存储窗口内字符与 `p` 字符数的差。
用 `differ` 记录 `count[]` 的非零元素个数，即当前窗口与字符串 `p` 中数量不同的字母的个数。
然后我们统计一下情况

$$
\begin{cases}
\text{字符 c 离开窗口} & \mathrm{count[c]} - 1 = &

\begin{cases}
0 & \text{一个多余字符被移除，differ} - 1 \\
-1 & \text{平衡被打破，有新的差异项。differ} + 1
\end{cases} \\

\text{字符 c 进入窗口} & \mathrm{count[c]} + 1 = &

\begin{cases}
0 & \text{一个缺失的字符被添加，differ} - 1 \\
1 & \text{平衡被打破，有新的差异项。differ} + 1
\end{cases}
\end{cases}
$$

也就是说，我们可以仅考虑 `differ` 的变化来判断当前窗口是否满足要求。

## 解答

```cpp
class Solution {
public:
  vector<int> findAnagrams(string s, string p) {
    int s_len = s.length(), p_len = p.length();
    if (s_len < p_len)
      return vector<int>{};

    vector<int> count(26), ans;

    for (auto i = 0; i < p_len; ++i) {
      ++count[s[i] - 'a'];
      --count[p[i] - 'a'];
    }

    auto differ =
        count_if(count.begin(), count.end(), [](int c) { return c != 0; });

    if (differ == 0)
      ans.emplace_back(0);

    for (auto i = 0; i < s_len - p_len; ++i) {
      if (count[s[i] - 'a'] == 1)
        --differ;
      else if (count[s[i] - 'a'] == 0)
        ++differ;

      --count[s[i] - 'a'];

      if (count[s[i + p_len] - 'a'] == -1)
        --differ;
      else if (count[s[i + p_len] - 'a'] == 0)
        ++differ;

      ++count[s[i + p_len] - 'a'];

      if (differ == 0)
        ans.emplace_back(i + 1);
    }

    return ans;
  }
};
```
