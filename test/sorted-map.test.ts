import { SortedMap } from "../src/index.js";

describe("SortedMap — basic operations", () => {
  test("set and get", () => {
    const m = new SortedMap<string, number>();
    m.set("banana", 2).set("apple", 1).set("cherry", 3);
    expect(m.get("apple")).toBe(1);
    expect(m.get("banana")).toBe(2);
    expect(m.get("cherry")).toBe(3);
    expect(m.get("date")).toBeUndefined();
  });

  test("size tracks insertions", () => {
    const m = new SortedMap<string, number>();
    expect(m.size).toBe(0);
    m.set("a", 1);
    expect(m.size).toBe(1);
    m.set("b", 2);
    expect(m.size).toBe(2);
    m.set("a", 99); // update existing
    expect(m.size).toBe(2); // no size change
  });

  test("update existing key", () => {
    const m = new SortedMap<string, number>();
    m.set("a", 1);
    m.set("a", 99);
    expect(m.get("a")).toBe(99);
    expect(m.size).toBe(1);
  });

  test("has", () => {
    const m = new SortedMap<string, number>(undefined, [["x", 10], ["y", 20]]);
    expect(m.has("x")).toBe(true);
    expect(m.has("z")).toBe(false);
  });

  test("delete", () => {
    const m = new SortedMap<string, number>(undefined, [["a", 1], ["b", 2], ["c", 3]]);
    expect(m.delete("b")).toBe(true);
    expect(m.has("b")).toBe(false);
    expect(m.size).toBe(2);
    expect(m.delete("z")).toBe(false);
  });

  test("keys() in sorted order", () => {
    const m = new SortedMap<string, number>(undefined, [
      ["banana", 2], ["apple", 1], ["cherry", 3]
    ]);
    expect([...m.keys()]).toEqual(["apple", "banana", "cherry"]);
  });

  test("values() in key-sorted order", () => {
    const m = new SortedMap<string, number>(undefined, [
      ["banana", 2], ["apple", 1], ["cherry", 3]
    ]);
    expect([...m.values()]).toEqual([1, 2, 3]);
  });

  test("entries() / iteration in sorted order", () => {
    const m = new SortedMap<string, number>(undefined, [
      ["c", 3], ["a", 1], ["b", 2]
    ]);
    expect([...m]).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });

  test("clear", () => {
    const m = new SortedMap<string, number>(undefined, [["a", 1]]);
    m.clear();
    expect(m.size).toBe(0);
    expect(m.has("a")).toBe(false);
  });

  test("forEach iterates in key order", () => {
    const m = new SortedMap<string, number>(undefined, [
      ["c", 3], ["a", 1], ["b", 2]
    ]);
    const result: [string, number][] = [];
    m.forEach((v, k) => result.push([k, v]));
    expect(result).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });
});

describe("SortedMap — floor/ceiling/lower/higher", () => {
  let m: SortedMap<number, string>;
  beforeEach(() => {
    m = new SortedMap<number, string>(undefined, [
      [10, "ten"], [20, "twenty"], [30, "thirty"], [40, "forty"], [50, "fifty"]
    ]);
  });

  test("floorKey", () => {
    expect(m.floorKey(25)).toBe(20);
    expect(m.floorKey(20)).toBe(20);
    expect(m.floorKey(9)).toBeUndefined();
    expect(m.floorKey(51)).toBe(50);
  });

  test("ceilingKey", () => {
    expect(m.ceilingKey(25)).toBe(30);
    expect(m.ceilingKey(30)).toBe(30);
    expect(m.ceilingKey(51)).toBeUndefined();
    expect(m.ceilingKey(5)).toBe(10);
  });

  test("lowerKey", () => {
    expect(m.lowerKey(30)).toBe(20);
    expect(m.lowerKey(10)).toBeUndefined();
    expect(m.lowerKey(11)).toBe(10);
  });

  test("higherKey", () => {
    expect(m.higherKey(30)).toBe(40);
    expect(m.higherKey(50)).toBeUndefined();
    expect(m.higherKey(49)).toBe(50);
  });

  test("floorEntry", () => {
    expect(m.floorEntry(25)).toEqual([20, "twenty"]);
    expect(m.floorEntry(9)).toBeUndefined();
  });

  test("ceilingEntry", () => {
    expect(m.ceilingEntry(25)).toEqual([30, "thirty"]);
    expect(m.ceilingEntry(51)).toBeUndefined();
  });

  test("lowerEntry", () => {
    expect(m.lowerEntry(30)).toEqual([20, "twenty"]);
    expect(m.lowerEntry(10)).toBeUndefined();
  });

  test("higherEntry", () => {
    expect(m.higherEntry(30)).toEqual([40, "forty"]);
    expect(m.higherEntry(50)).toBeUndefined();
  });

  test("firstKey and lastKey", () => {
    expect(m.firstKey()).toBe(10);
    expect(m.lastKey()).toBe(50);
  });

  test("firstEntry and lastEntry", () => {
    expect(m.firstEntry()).toEqual([10, "ten"]);
    expect(m.lastEntry()).toEqual([50, "fifty"]);
  });

  test("firstKey/lastKey on empty map", () => {
    const empty = new SortedMap<number, string>();
    expect(empty.firstKey()).toBeUndefined();
    expect(empty.lastKey()).toBeUndefined();
    expect(empty.firstEntry()).toBeUndefined();
    expect(empty.lastEntry()).toBeUndefined();
  });
});

describe("SortedMap — range queries", () => {
  let m: SortedMap<number, string>;
  beforeEach(() => {
    m = new SortedMap<number, string>(undefined, [
      [10, "ten"], [20, "twenty"], [30, "thirty"], [40, "forty"], [50, "fifty"]
    ]);
  });

  test("rangeKeys inclusive", () => {
    expect(m.rangeKeys(15, 45)).toEqual([20, 30, 40]);
  });

  test("rangeKeys exact bounds", () => {
    expect(m.rangeKeys(20, 40)).toEqual([20, 30, 40]);
  });

  test("rangeKeys excludeMin", () => {
    expect(m.rangeKeys(20, 40, { excludeMin: true })).toEqual([30, 40]);
  });

  test("rangeKeys excludeMax", () => {
    expect(m.rangeKeys(20, 40, { excludeMax: true })).toEqual([20, 30]);
  });

  test("rangeKeys excludeMin + excludeMax", () => {
    expect(m.rangeKeys(20, 40, { excludeMin: true, excludeMax: true })).toEqual([30]);
  });

  test("rangeEntries", () => {
    expect(m.rangeEntries(20, 30)).toEqual([[20, "twenty"], [30, "thirty"]]);
  });

  test("rangeEntries empty window", () => {
    expect(m.rangeEntries(21, 29)).toEqual([]);
  });
});

describe("SortedMap — custom comparator", () => {
  test("reverse numeric order", () => {
    const m = new SortedMap<number, string>((a, b) => b - a);
    m.set(1, "one"); m.set(3, "three"); m.set(2, "two");
    expect([...m.keys()]).toEqual([3, 2, 1]);
  });

  test("real-world: event log sorted by timestamp", () => {
    interface Event { ts: number; msg: string }
    const m = new SortedMap<number, string>();
    m.set(1719000003, "login");
    m.set(1719000001, "boot");
    m.set(1719000002, "connect");
    expect([...m.values()]).toEqual(["boot", "connect", "login"]);

    // Next event after a given timestamp
    expect(m.higherKey(1719000001)).toBe(1719000002);
    expect(m.floorEntry(1719000002)).toEqual([1719000002, "connect"]);
  });
});

describe("SortedMap — stress", () => {
  test("1000 numeric key-value pairs stay sorted", () => {
    const m = new SortedMap<number, string>();
    const pairs: [number, number][] = [];
    for (let i = 0; i < 1000; i++) {
      const k = Math.floor(Math.random() * 10000);
      pairs.push([k, i]);
      m.set(k, String(i));
    }
    const expectedKeys = [...new Set(pairs.map(p => p[0]))].sort((a, b) => a - b);
    expect([...m.keys()]).toEqual(expectedKeys);
  });
});
