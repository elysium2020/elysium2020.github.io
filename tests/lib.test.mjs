import test from 'node:test';
import assert from 'node:assert/strict';
import { readingMinutes } from '../src/lib/reading-time.ts';
import { sortPosts, getTagCounts, getPopularTags, getRelated, getPrevNext } from '../src/lib/derive.ts';

const P = (id, tags, day) => ({ id, tags, pubDate: new Date(`2026-01-${String(day).padStart(2, '0')}`) });

test('readingMinutes: 围栏代码块不计入', () => {
  assert.equal(readingMinutes('```ts\n' + 'word '.repeat(700) + '\n```'), 1);
});
test('readingMinutes: 块级与行内公式不计入', () => {
  assert.equal(readingMinutes('$$ ' + 'word '.repeat(700) + ' $$'), 1);
  assert.equal(readingMinutes('$' + 'word '.repeat(700) + '$'), 1);
});
test('readingMinutes: 700 词基数反证（未剔除时应为 2）', () => {
  assert.equal(readingMinutes('word '.repeat(700)), 2);
});
test('readingMinutes: CJK 按字数、拉丁按词数，350/分钟', () => {
  const zh = '中'.repeat(700);
  assert.equal(readingMinutes(zh), 2);
  assert.equal(readingMinutes(Array(350).fill('word').join(' ')), 1);
});

test('sortPosts: pubDate 降序且不改原数组', () => {
  const input = [P('a', [], 1), P('b', [], 3)];
  assert.deepEqual(sortPosts(input).map((p) => p.id), ['b', 'a']);
  assert.deepEqual(input.map((p) => p.id), ['a', 'b']);
});

test('getTagCounts / getPopularTags', () => {
  const posts = [P('a', ['x', 'y'], 1), P('b', ['x'], 2), P('c', ['z'], 3)];
  assert.equal(getTagCounts(posts).get('x'), 2);
  assert.deepEqual(getPopularTags(posts, 2), ['x', 'y']);
});

test('getRelated: 共享标签数优先，同分按时间降序', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['x'], 2), P('c', ['y'], 3), P('d', ['z'], 4)]);
  const rel = getRelated(posts.find((p) => p.id === 'a'), posts, 2);
  assert.deepEqual(rel.map((p) => p.id), ['b', 'd']);
});

test('getRelated: 无共享标签时回退最近', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['y'], 2), P('c', ['z'], 3)]);
  const rel = getRelated(posts.find((p) => p.id === 'a'), posts, 2);
  assert.deepEqual(rel.map((p) => p.id), ['c', 'b']);
});

test('getRelated: 单篇文章返回空数组', () => {
  const only = [P('a', ['x'], 1)];
  assert.deepEqual(getRelated(only[0], only), []);
});

test('getPrevNext: 优先同标签', () => {
  const posts = sortPosts([P('a', ['x'], 1), P('b', ['y'], 2), P('c', ['x'], 3)]);
  const { prev, next } = getPrevNext(posts.find((p) => p.id === 'c'), posts);
  assert.equal(prev.id, 'a');
  assert.equal(next, undefined);
});

test('getPrevNext: 单篇时两端皆 undefined', () => {
  const only = [P('a', [], 1)];
  assert.deepEqual(getPrevNext(only[0], only), { prev: undefined, next: undefined });
});
