---
title: 'O(1) 时间插入、删除和获取随机元素'

pubDate: 2025-05-22
description: 'LeetCode 380 题解析'
tags: ['leetcode', 'hash table', 'math', 'design', 'array', 'randomized']
---

## 分析

看见插入和删除都要求 $O(1)$，很自然会先想到使用数组。
不过，仅靠数组虽然可以做到按下标随机访问为 $O(1)$，
但删除任意元素通常需要移动后续元素，因此难以保证删除操作也是 $O(1)$。
因此我们需要引入额外的数据结构来配合实现。

注意到题目中并没有限制空间复杂度。
因此我们可以通过引入哈希表，用哈希表记录数组下标。
通过哈希表判断元素是否存在并记录其下标，就可以配合数组满足题目的时间复杂度要求。
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
