import {
  AVLNode, Comparator, defaultComparator,
  insert, remove, find as avlFind,
  floor as avlFloor, ceiling as avlCeiling,
  lower as avlLower, higher as avlHigher,
  minKey as avlMin, maxKey as avlMax,
  inOrder, inOrderRange
} from "./avl.js";
import type { RangeOptions } from "./sorted-set.js";

/**
 * SortedMap<K, V> — ordered map backed by an AVL tree.
 * Port of Python sortedcontainers.SortedDict / Java TreeMap / C# SortedDictionary.
 *
 * Keys are always iterated in sorted order. All key operations: O(log n).
 */
export class SortedMap<K, V> implements Iterable<[K, V]> {
  private _root: AVLNode<K, V> | null = null;
  private _size = 0;
  private readonly _cmp: Comparator<K>;

  constructor(comparator?: Comparator<K>, entries?: Iterable<[K, V]>) {
    this._cmp = comparator ?? defaultComparator;
    if (entries) for (const [k, v] of entries) this.set(k, v);
  }

  get size(): number { return this._size; }

  /** Set key→value. Returns this for chaining. */
  set(key: K, value: V): this {
    const f = { v: false };
    this._root = insert(this._root, key, value, this._cmp, f);
    if (f.v) this._size++;
    return this;
  }

  /** Get value for key. Returns undefined if absent. */
  get(key: K): V | undefined {
    return avlFind(this._root, key, this._cmp);
  }

  /** Test presence of key. O(log n). */
  has(key: K): boolean {
    return avlFind(this._root, key, this._cmp) !== undefined;
  }

  /** Remove a key. Returns true if deleted. */
  delete(key: K): boolean {
    const f = { v: false };
    this._root = remove(this._root, key, this._cmp, f);
    if (f.v) this._size--;
    return f.v;
  }

  // ── Floor / ceiling / lower / higher ───────────────────────────────────────

  /** Largest key ≤ given key. Returns undefined if none. */
  floorKey(key: K): K | undefined {
    return avlFloor(this._root, key, this._cmp)?.key;
  }

  /** Smallest key ≥ given key. Returns undefined if none. */
  ceilingKey(key: K): K | undefined {
    return avlCeiling(this._root, key, this._cmp)?.key;
  }

  /** Largest key strictly < given key. Returns undefined if none. */
  lowerKey(key: K): K | undefined {
    return avlLower(this._root, key, this._cmp)?.key;
  }

  /** Smallest key strictly > given key. Returns undefined if none. */
  higherKey(key: K): K | undefined {
    return avlHigher(this._root, key, this._cmp)?.key;
  }

  /** Floor entry: [key, value] where key is the largest ≤ given key. */
  floorEntry(key: K): [K, V] | undefined {
    const n = avlFloor(this._root, key, this._cmp);
    return n ? [n.key, n.value] : undefined;
  }

  /** Ceiling entry: [key, value] where key is the smallest ≥ given key. */
  ceilingEntry(key: K): [K, V] | undefined {
    const n = avlCeiling(this._root, key, this._cmp);
    return n ? [n.key, n.value] : undefined;
  }

  /** Lower entry: [key, value] where key is strictly < given key. */
  lowerEntry(key: K): [K, V] | undefined {
    const n = avlLower(this._root, key, this._cmp);
    return n ? [n.key, n.value] : undefined;
  }

  /** Higher entry: [key, value] where key is strictly > given key. */
  higherEntry(key: K): [K, V] | undefined {
    const n = avlHigher(this._root, key, this._cmp);
    return n ? [n.key, n.value] : undefined;
  }

  // ── First / last ───────────────────────────────────────────────────────────

  /** Smallest key. Returns undefined if empty. */
  firstKey(): K | undefined { return avlMin(this._root)?.key; }

  /** Largest key. Returns undefined if empty. */
  lastKey(): K | undefined { return avlMax(this._root)?.key; }

  /** Entry with smallest key. Returns undefined if empty. */
  firstEntry(): [K, V] | undefined {
    const n = avlMin(this._root);
    return n ? [n.key, n.value] : undefined;
  }

  /** Entry with largest key. Returns undefined if empty. */
  lastEntry(): [K, V] | undefined {
    const n = avlMax(this._root);
    return n ? [n.key, n.value] : undefined;
  }

  // ── Range queries ──────────────────────────────────────────────────────────

  /** All keys in [lo, hi] (inclusive by default), in sorted order. */
  rangeKeys(lo: K, hi: K, opts?: RangeOptions): K[] {
    const result: K[] = [];
    inOrderRange(this._root, lo, hi, this._cmp, (k) => { result.push(k); },
      opts?.excludeMin ?? false, opts?.excludeMax ?? false);
    return result;
  }

  /** All entries in [lo, hi], in sorted order. */
  rangeEntries(lo: K, hi: K, opts?: RangeOptions): [K, V][] {
    const result: [K, V][] = [];
    inOrderRange(this._root, lo, hi, this._cmp, (k, v) => { result.push([k, v]); },
      opts?.excludeMin ?? false, opts?.excludeMax ?? false);
    return result;
  }

  // ── Iteration ─────────────────────────────────────────────────────────────

  clear(): void { this._root = null; this._size = 0; }

  /** Iterate [key, value] pairs in sorted key order. */
  [Symbol.iterator](): Iterator<[K, V]> {
    return this.entries();
  }

  *entries(): IterableIterator<[K, V]> {
    const items: [K, V][] = [];
    inOrder(this._root, (k, v) => { items.push([k, v]); });
    yield* items;
  }

  *keys(): IterableIterator<K> {
    const ks: K[] = [];
    inOrder(this._root, (k) => { ks.push(k); });
    yield* ks;
  }

  *values(): IterableIterator<V> {
    const vs: V[] = [];
    inOrder(this._root, (_, v) => { vs.push(v); });
    yield* vs;
  }

  forEach(cb: (value: V, key: K, map: SortedMap<K, V>) => void): void {
    inOrder(this._root, (k, v) => { cb(v, k, this); });
  }

  toArray(): [K, V][] { return [...this.entries()]; }
}
