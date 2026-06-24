import { SortedSet } from "../src/index.js";

describe("SortedSet — basic operations", () => {
  test("add and has", () => {
    const s = new SortedSet<number>();
    expect(s.add(3)).toBe(true);
    expect(s.add(1)).toBe(true);
    expect(s.add(2)).toBe(true);
    expect(s.size).toBe(3);
    expect(s.has(1)).toBe(true);
    expect(s.has(4)).toBe(false);
  });

  test("add duplicate returns false", () => {
    const s = new SortedSet<number>();
    s.add(5);
    expect(s.add(5)).toBe(false);
    expect(s.size).toBe(1);
  });

  test("delete existing element", () => {
    const s = new SortedSet<number>(undefined, [1, 2, 3]);
    expect(s.delete(2)).toBe(true);
    expect(s.has(2)).toBe(false);
    expect(s.size).toBe(2);
  });

  test("delete non-existing returns false", () => {
    const s = new SortedSet<number>();
    expect(s.delete(99)).toBe(false);
  });

  test("iteration in sorted order", () => {
    const s = new SortedSet<number>(undefined, [5, 3, 1, 4, 2]);
    expect([...s]).toEqual([1, 2, 3, 4, 5]);
  });

  test("string elements sorted lexicographically", () => {
    const s = new SortedSet<string>(undefined, ["banana", "apple", "cherry"]);
    expect([...s]).toEqual(["apple", "banana", "cherry"]);
  });

  test("clear empties the set", () => {
    const s = new SortedSet<number>(undefined, [1, 2, 3]);
    s.clear();
    expect(s.size).toBe(0);
    expect([...s]).toEqual([]);
  });

  test("toArray returns sorted array", () => {
    const s = new SortedSet<number>(undefined, [3, 1, 2]);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  test("forEach iterates in order", () => {
    const s = new SortedSet<number>(undefined, [3, 1, 2]);
    const result: number[] = [];
    s.forEach(v => result.push(v));
    expect(result).toEqual([1, 2, 3]);
  });
});

describe("SortedSet — floor/ceiling/lower/higher", () => {
  let s: SortedSet<number>;
  beforeEach(() => {
    s = new SortedSet<number>(undefined, [10, 20, 30, 40, 50]);
  });

  test("floor: largest element ≤ key", () => {
    expect(s.floor(25)).toBe(20);
    expect(s.floor(20)).toBe(20); // exact match
    expect(s.floor(50)).toBe(50);
    expect(s.floor(9)).toBeUndefined();
  });

  test("ceiling: smallest element ≥ key", () => {
    expect(s.ceiling(25)).toBe(30);
    expect(s.ceiling(30)).toBe(30); // exact match
    expect(s.ceiling(10)).toBe(10);
    expect(s.ceiling(51)).toBeUndefined();
  });

  test("lower: largest element strictly < key", () => {
    expect(s.lower(25)).toBe(20);
    expect(s.lower(20)).toBe(10); // strict, not equal
    expect(s.lower(10)).toBeUndefined();
    expect(s.lower(51)).toBe(50);
  });

  test("higher: smallest element strictly > key", () => {
    expect(s.higher(25)).toBe(30);
    expect(s.higher(30)).toBe(40); // strict, not equal
    expect(s.higher(50)).toBeUndefined();
    expect(s.higher(9)).toBe(10);
  });

  test("first and last", () => {
    expect(s.first()).toBe(10);
    expect(s.last()).toBe(50);
  });

  test("first/last on empty set", () => {
    const empty = new SortedSet<number>();
    expect(empty.first()).toBeUndefined();
    expect(empty.last()).toBeUndefined();
  });
});

describe("SortedSet — range queries", () => {
  let s: SortedSet<number>;
  beforeEach(() => {
    s = new SortedSet<number>(undefined, [10, 20, 30, 40, 50]);
  });

  test("range inclusive", () => {
    expect(s.range(15, 45)).toEqual([20, 30, 40]);
  });

  test("range exact bounds", () => {
    expect(s.range(20, 40)).toEqual([20, 30, 40]);
  });

  test("range excludeMin", () => {
    expect(s.range(20, 40, { excludeMin: true })).toEqual([30, 40]);
  });

  test("range excludeMax", () => {
    expect(s.range(20, 40, { excludeMax: true })).toEqual([20, 30]);
  });

  test("range excludeMin and excludeMax", () => {
    expect(s.range(20, 40, { excludeMin: true, excludeMax: true })).toEqual([30]);
  });

  test("range returns empty when no elements in window", () => {
    expect(s.range(21, 29)).toEqual([]);
  });

  test("range full set", () => {
    expect(s.range(10, 50)).toEqual([10, 20, 30, 40, 50]);
  });
});

describe("SortedSet — custom comparator", () => {
  test("reverse order comparator", () => {
    const s = new SortedSet<number>((a, b) => b - a, [3, 1, 4, 1, 5, 9]);
    expect([...s]).toEqual([9, 5, 4, 3, 1]);
  });

  test("case-insensitive string comparator", () => {
    const cmp = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
    const s = new SortedSet<string>(cmp, ["Banana", "apple", "Cherry"]);
    expect([...s]).toEqual(["apple", "Banana", "Cherry"]);
  });

  test("object sorted by property", () => {
    interface P { name: string; score: number }
    const cmp = (a: P, b: P) => a.score - b.score || a.name.localeCompare(b.name);
    const s = new SortedSet<P>(cmp);
    s.add({ name: "Alice", score: 90 });
    s.add({ name: "Bob", score: 85 });
    s.add({ name: "Carol", score: 90 });
    const names = [...s].map(p => p.name);
    expect(names).toEqual(["Bob", "Alice", "Carol"]);
  });
});

describe("SortedSet — stress test", () => {
  test("1000 random insertions stay sorted", () => {
    const s = new SortedSet<number>();
    const expected = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const v = Math.floor(Math.random() * 10000);
      s.add(v);
      expected.add(v);
    }
    const sorted = [...expected].sort((a, b) => a - b);
    expect([...s]).toEqual(sorted);
  });

  test("1000 insertions + 500 deletions", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i);
    const s = new SortedSet<number>(undefined, values);
    // delete every other element
    for (let i = 0; i < 1000; i += 2) s.delete(i);
    const expected = values.filter(v => v % 2 !== 0);
    expect([...s]).toEqual(expected);
    expect(s.size).toBe(500);
  });
});
