# sortedkit

Zero-dependency TypeScript sorted collections: `SortedSet<T>` and `SortedMap<K, V>` backed by a self-balancing AVL tree. Port of Python `sortedcontainers`, Java `TreeSet`/`TreeMap`, C# `SortedSet`/`SortedDictionary`.

[![npm](https://img.shields.io/npm/v/sortedkit)](https://www.npmjs.com/package/sortedkit)
[![license](https://img.shields.io/npm/l/sortedkit)](LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

## Install

```bash
npm install sortedkit
```

## Why?

JavaScript's built-in `Set` and `Map` don't maintain sorted order. When you need **ordered** data with O(log n) floor/ceiling/range queries:

| Operation | `Set`/`Map` | `SortedSet`/`SortedMap` |
|---|---|---|
| Iteration order | insertion | sorted |
| floor / ceiling | not available | O(log n) |
| range(lo, hi) | O(n) scan | O(log n + k) |
| first / last | O(n) scan | O(log n) |

Python's `sortedcontainers.SortedList` gets **19 million downloads/week** because sorted data structures are everywhere: leaderboards, time-series, scheduling, autocomplete, IP routing tables.

## SortedSet\<T\>

```typescript
import { SortedSet } from "sortedkit";

const s = new SortedSet<number>(undefined, [5, 3, 1, 4, 2]);

// Iteration in sorted order
[...s]  // [1, 2, 3, 4, 5]

// Membership O(log n)
s.has(3)    // true
s.has(99)   // false

// Insert / delete O(log n)
s.add(6)     // true (inserted)
s.add(3)     // false (already present)
s.delete(3)  // true

// Predecessor / successor queries O(log n)
s.floor(3.5)    // 3   — largest element ≤ 3.5
s.ceiling(3.5)  // 4   — smallest element ≥ 3.5
s.lower(3)      // 2   — largest element strictly < 3
s.higher(3)     // 4   — smallest element strictly > 3

// Extremes
s.first()  // 1
s.last()   // 5

// Range query — O(log n + k) where k is result count
s.range(2, 5)                    // [2, 4, 5] — inclusive
s.range(2, 5, { excludeMin: true })  // [4, 5]
s.range(2, 5, { excludeMax: true })  // [2, 4]
s.range(2, 5, { excludeMin: true, excludeMax: true })  // [4]
```

### Constructor

```typescript
new SortedSet<T>()
new SortedSet<T>(comparator)
new SortedSet<T>(comparator, initialValues)
```

Default comparator uses `<` / `>` (natural order). Provide a custom comparator for objects:

```typescript
// Sort people by age descending, then name ascending
const byAge = new SortedSet<Person>(
  (a, b) => b.age - a.age || a.name.localeCompare(b.name)
);
```

## SortedMap\<K, V\>

```typescript
import { SortedMap } from "sortedkit";

const m = new SortedMap<string, number>(undefined, [
  ["banana", 2], ["apple", 1], ["cherry", 3]
]);

// Keys always in sorted order
[...m.keys()]    // ["apple", "banana", "cherry"]
[...m.values()]  // [1, 2, 3]
[...m]           // [["apple", 1], ["banana", 2], ["cherry", 3]]

// Get / set / delete / has — O(log n)
m.get("banana")   // 2
m.set("date", 4)  // returns this (chainable)
m.has("cherry")   // true
m.delete("apple") // true

// Floor / ceiling by key
m.floorKey("b")    // "banana"
m.ceilingKey("b")  // "banana"
m.lowerKey("banana")  // "apple"
m.higherKey("banana") // "cherry"

// Floor / ceiling entries
m.floorEntry("b")    // ["banana", 2]
m.ceilingEntry("c")  // ["cherry", 3]
m.lowerEntry("cherry")   // ["banana", 2]
m.higherEntry("banana")  // ["cherry", 3]

// Extremes
m.firstKey()    // "apple"
m.lastKey()     // "date"
m.firstEntry()  // ["apple", 1]
m.lastEntry()   // ["date", 4]

// Range query
m.rangeKeys("apple", "cherry")      // ["apple", "banana", "cherry"]
m.rangeEntries("b", "c")            // [["banana", 2]]
m.rangeKeys("apple", "cherry", { excludeMin: true })  // ["banana", "cherry"]
```

### Constructor

```typescript
new SortedMap<K, V>()
new SortedMap<K, V>(comparator)
new SortedMap<K, V>(comparator, entries)
```

## Real-world examples

### Leaderboard

```typescript
const leaderboard = new SortedSet<{ name: string; score: number }>(
  (a, b) => b.score - a.score || a.name.localeCompare(b.name)
);

leaderboard.add({ name: "Alice", score: 1200 });
leaderboard.add({ name: "Bob", score: 950 });
leaderboard.add({ name: "Carol", score: 1200 });

// Top 3 in one pass
leaderboard.toArray().slice(0, 3).map(p => p.name);
// ["Alice", "Carol", "Bob"]
```

### Time-series event log

```typescript
const events = new SortedMap<number, string>(); // timestamp → message
events.set(1719000001, "server-start");
events.set(1719000003, "user-login");
events.set(1719000002, "db-connect");

// Events in chronological order
[...events.values()]  // ["server-start", "db-connect", "user-login"]

// Events between two timestamps
events.rangeEntries(1719000001, 1719000002).map(([, v]) => v);
// ["server-start", "db-connect"]

// What happened just before login?
events.lowerEntry(1719000003)  // [1719000002, "db-connect"]
```

### Scheduling: next job after now

```typescript
const schedule = new SortedMap<Date, () => void>(
  (a, b) => a.getTime() - b.getTime()
);

schedule.set(new Date("2026-07-01T09:00:00Z"), () => console.log("morning report"));
schedule.set(new Date("2026-07-01T10:30:00Z"), () => console.log("standup"));

const now = new Date();
const nextEntry = schedule.ceilingEntry(now);
if (nextEntry) {
  const [fireAt, fn] = nextEntry;
  const delay = fireAt.getTime() - now.getTime();
  setTimeout(fn, delay);
}
```

## API Reference

### SortedSet\<T\>

| Method | Returns | Description |
|---|---|---|
| `add(v)` | `boolean` | Insert; returns true if new |
| `delete(v)` | `boolean` | Remove; returns true if deleted |
| `has(v)` | `boolean` | Test membership |
| `floor(v)` | `T \| undefined` | Largest element ≤ v |
| `ceiling(v)` | `T \| undefined` | Smallest element ≥ v |
| `lower(v)` | `T \| undefined` | Largest element < v |
| `higher(v)` | `T \| undefined` | Smallest element > v |
| `first()` | `T \| undefined` | Smallest element |
| `last()` | `T \| undefined` | Largest element |
| `range(lo, hi, opts?)` | `T[]` | Elements in [lo, hi] |
| `clear()` | `void` | Remove all elements |
| `size` | `number` | Element count |
| `[Symbol.iterator]()` | `Iterator<T>` | In-order iteration |
| `toArray()` | `T[]` | Sorted array copy |
| `forEach(cb)` | `void` | Iterate with callback |

### SortedMap\<K, V\>

| Method | Returns | Description |
|---|---|---|
| `set(k, v)` | `this` | Insert/update |
| `get(k)` | `V \| undefined` | Lookup |
| `has(k)` | `boolean` | Key existence |
| `delete(k)` | `boolean` | Remove key |
| `floorKey(k)` | `K \| undefined` | Largest key ≤ k |
| `ceilingKey(k)` | `K \| undefined` | Smallest key ≥ k |
| `lowerKey(k)` | `K \| undefined` | Largest key < k |
| `higherKey(k)` | `K \| undefined` | Smallest key > k |
| `floorEntry(k)` | `[K,V] \| undefined` | Entry with largest key ≤ k |
| `ceilingEntry(k)` | `[K,V] \| undefined` | Entry with smallest key ≥ k |
| `lowerEntry(k)` | `[K,V] \| undefined` | Entry with largest key < k |
| `higherEntry(k)` | `[K,V] \| undefined` | Entry with smallest key > k |
| `firstKey()` | `K \| undefined` | Smallest key |
| `lastKey()` | `K \| undefined` | Largest key |
| `firstEntry()` | `[K,V] \| undefined` | Entry with smallest key |
| `lastEntry()` | `[K,V] \| undefined` | Entry with largest key |
| `rangeKeys(lo, hi, opts?)` | `K[]` | Keys in [lo, hi] |
| `rangeEntries(lo, hi, opts?)` | `[K,V][]` | Entries in [lo, hi] |
| `keys()` | `IterableIterator<K>` | Keys in sorted order |
| `values()` | `IterableIterator<V>` | Values in key-sorted order |
| `entries()` | `IterableIterator<[K,V]>` | Entries in sorted order |
| `[Symbol.iterator]()` | `Iterator<[K,V]>` | Same as entries() |
| `size` | `number` | Entry count |
| `clear()` | `void` | Remove all entries |
| `forEach(cb)` | `void` | Iterate with callback |

## License

MIT
