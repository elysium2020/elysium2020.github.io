---
title: 'O(1) 时间插入、删除和获取随机元素'

pubDate: 2025-05-22
description: 'LeetCode 380 题解析'
tags: ['leetcode', 'hash table', 'math', 'design', 'array', 'randomized']
---

## 分析

看见插入和删除都要 $O(1)$，很自然想到利用可变长数组进行操作。
但这样就引入了一个问题：变长数组中，获取单个元素通常都要求数组有序，
且绝大部分时间复杂度都大于 $O(1)$。
因此我们需要其他方法来实现。

注意到题目中并没有限制空间复杂度。
因此我们可以通过引入哈希表，用哈希表记录数组下标。
通过哈希表来判断元素是否存在，即可完美实现 $O(1)$ 的要求。
删除操作中，由于直接删除会涉及到后续元素的前移，
所以我们可以交换目标元素与数组最后一个元素的位置。
从而在常数时间里移除元素。

## 解答

```cpp
class RandomizedSet {
private:
  vector<int> nums;
  unordered_map<int, int> indices;
  mt19937 rng;
  uniform_int_distribution<int> dist;

public:
  RandomizedSet() {}

  bool insert(int val) {
    if (indices.count(val))
      return false;

    auto index = nums.size();
    nums.emplace_back(val);
    indices[val] = index;

    return true;
  }

  bool remove(int val) {
    if (!indices.count(val))
      return false;

    auto index = indices[val];
    auto last = nums.back();
    nums[index] = last;
    indices[last] = index;
    nums.pop_back();
    indices.erase(val);

    return true;
  }

  int getRandom() {
    uniform_int_distribution<int>::param_type parm(0, nums.size() - 1);

    return nums[dist(rng, parm)];
  }
};
```
