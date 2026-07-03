---
title: '文本左右对齐'
pubDate: 2025-07-21
description: 'LeetCode 68 题解析'
tags: ['leetcode', 'array', 'string', 'simulation']
---

## 分析

这道题相对同组其他题来说比较繁琐，
究其原因是因为这更像道业务逻辑题而不是算法题。
我们只需要抓住三种情况：

- 当前行是最后一行：单词左对齐，单词间有且仅有一个空格。
  其余空格在末尾补充从而对齐。
- 当前行不是最后一行，但只有一个单词：该单词左对齐，在末尾填充空格从而对齐。
- 当前行不是最后一行且不止一个单词：设当前单词数为 `num_words`，
  单词间空格数为 `num_spaces` 。
  因为我们要在单词周围均匀分配空格，
  所以单词之间至少有空格
  $\mathrm{avg\_spaces} = \frac{\mathrm{num\_spaces}}{\mathrm{num\_words - 1}}$
  对于多出来的空格
  $\mathrm{extra\_spaces} = \mathrm{num\_spaces}\bmod{(\mathrm{num\_words} - 1)}$，
  应该填充在前 `extra_spaces` 个单词的之间。
  也就是说，前 `extra_spaces` 个单词应该填充 `avg_spaces + 1` 个空格，其余的单词应该填充 `avg_spaces` 个空格。

## 解答

```cpp
class Solution {
private:
  auto blank(int n) { return string(n, ' '); }
  auto join(const vector<string> &words, int left, int right,
            const string &sep) {
    auto s = words[left];
    for (auto i = left + 1; i < right; ++i)
      s += sep + words[i];

    return s;
  }

public:
  vector<string> fullJustify(vector<string> &words, int maxWidth) {
    vector<string> ans;
    auto right = 0;
    int n = words.size();
    while (true) {
      auto left = right;
      auto sum_len = 0;

      while (right < n &&
             sum_len + words[right].length() + right - left <= maxWidth)
        sum_len += words[right++].length();

      if (right == n) {
        auto s = join(words, left, n, " ");
        ans.emplace_back(s + blank(maxWidth - s.length()));
        return ans;
      }

      auto num_words = right - left;
      auto num_spaces = maxWidth - sum_len;

      if (num_words == 1) {
        ans.emplace_back(words[left] + blank(num_spaces));
        continue;
      }

      auto avg_spaces = num_spaces / (num_words - 1);
      auto extra_spaces = num_spaces % (num_words - 1);
      auto s1 =
          join(words, left, left + extra_spaces + 1, blank(avg_spaces + 1));
      auto s2 = join(words, left + extra_spaces + 1, right, blank(avg_spaces));
      ans.emplace_back(s1 + blank(avg_spaces) + s2);
    }
  }
};
```
