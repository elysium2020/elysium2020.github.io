---
title: '串联所有单词的子串'
pubDate: 2025-09-21
description: 'LeetCode 30 题解析'
tags: ['leetcode', 'hash table', 'string', 'sliding window']
---

## 分析

这道题和 438 题类似，都是利用滑动窗口来解决，思路也大抵一样。
不过需要留意：438 题中是针对单个字符，而此题是针对整个字符串。
因此， `differ` 也从一个数组变成了一个哈希表。
我们令 n 为每个单词的长度， m 为数组 `words` 的长度， `s_len` 为字符串 s 的长度。
因为我们要逐个对比字符串中的字符，所以可以用 $m \times n$ 来摊平需要比较的字符，
用 `i` 作为偏移量比较对这些窗口逐个比对。
因此，我们可以设置一个初始为 $0$ 的循环。结束条件为偏移量小于单词长度并小于等于窗口长度。
随后，我们可以设置一个哈希表 `differ`。
接下来的步骤和 438 题类似：
先用 `differ` 统计第一个窗口中各个单词出现的次数。
然后遍历 `words` 数组，减去 `differ` 中对应单词的计数。
此时，`differ` 变成了「窗口与 `words` 差异」的统计。

现在让我们开始滑动窗口。
用 `start` 表示窗口索引，步长为 $n$。
接着我们可以套用 438 题的逻辑：

1. 在窗口最左侧移除旧单词（`differ[word]--`）。
2. 在窗口右侧加入新单词（`differ[word]++`）。
3. 如果某个单词的计数为 $0$，那么删除它（`differ.erase(word)`）。

最后，如果 `differ` 为空，若为空，那么 `start` 就是一个答案，加入答案数组。

## 解答

```cpp 
class Solution {
public:
  vector<int> findSubstring(string s, vector<string> &words) {
    int m = words.size(), n = words[0].size(), s_len = s.size();
    vector<int> ans;

    for (auto i = 0; i < n && i + m * n <= s_len; ++i) {
      unordered_map<string, int> differ;
      for (auto j = 0; j < m; ++j)
        ++differ[s.substr(i + j * n, n)];

      for (auto &word : words)
        if (--differ[word] == 0)
          differ.erase(word);

      for (auto start = i; start < s_len - m * n + 1; start += n) {
        if (start != i) {
          auto word = s.substr(start - n, n);
          if (--differ[word] == 0)
            differ.erase(word);

          word = s.substr(start + (m - 1) * n, n);
          if (++differ[word] == 0)
            differ.erase(word);
        }

        if (differ.empty())
          ans.emplace_back(start);
      }
    }

    return ans;
  }
};
```
