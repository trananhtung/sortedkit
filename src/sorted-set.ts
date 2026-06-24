import {
  AVLNode, Comparator, defaultComparator,
  insert, remove, has as avlHas,
  floor as avlFloor, ceiling as avlCeiling,
  lower as avlLower, higher as avlHigher,
  minKey as avlMin, maxKey as avlMax,
  inOrder, inOrderRange
} from "./avl.js";

export interface RangeOptions {
  excludeMin?: boolean;
  excludeMax?: boolean;
}

/**
 * SortedSet<T> — ordered set backed by an AVL tree.
 * Port of Python sortedcontainers.SortedList / Java TreeSet / C# SortedSet.
 *
 * All operations: O(log n) except iteration which is O(n).
 */
export class SortedSet<T> implements Iterable<T> {
  private _root: AVLNode<T, true> | null = null;
  private _size = 0;
  private readonly _cmp: Comparator<T>;

  constructor(comparator?: Comparator<T>, values?: Iterable<T>) {
    this._cmp = comparator ?? defaultComparator;
    if (values) for (const v of values) this.add(v);
  }

  get size(): number { return this._size; }

  /** Add an element. Returns true if inserted (false if already present). */
  add(value: T): boolean {
    const f = { v: false };
    this._root = insert(this._root, value, true as true, this._cmp, f);
    if (f.v) this._size++;
    return f.v;
  }

  /** Remove an element. Returns true if deleted. */
  delete(value: T): boolean {
    const f = { v: false };
    this._root = remove(this._root, value, this._cmp, f);
    if (f.v) this._size--;
    return f.v;
  }

  /** Test membership. O(log n). */
  has(value: T): boolean {
    return avlHas(this._root, value, this._cmp);
  }

  /** Largest element ≤ value. Returns undefined if none. */
  floor(value: T): T | undefined {
    return avlFloor(this._root, value, this._cmp)?.key;
  }

  /** Smallest element ≥ value. Returns undefined if none. */
  ceiling(value: T): T | undefined {
    return avlCeiling(this._root, value, this._cmp)?.key;
  }

  /** Largest element strictly < value. Returns undefined if none. */
  lower(value: T): T | undefined {
    return avlLower(this._root, value, this._cmp)?.key;
  }

  /** Smallest element strictly > value. Returns undefined if none. */
  higher(value: T): T | undefined {
    return avlHigher(this._root, value, this._cmp)?.key;
  }

  /** Smallest element. Returns undefined if empty. */
  first(): T | undefined { return avlMin(this._root)?.key; }

  /** Largest element. Returns undefined if empty. */
  last(): T | undefined { return avlMax(this._root)?.key; }

  /** Returns all elements in [lo, hi] (inclusive by default). In sorted order. */
  range(lo: T, hi: T, opts?: RangeOptions): T[] {
    const result: T[] = [];
    inOrderRange(this._root, lo, hi, this._cmp, (k) => { result.push(k); },
      opts?.excludeMin ?? false, opts?.excludeMax ?? false);
    return result;
  }

  /** Remove all elements. */
  clear(): void { this._root = null; this._size = 0; }

  /** Iterate elements in sorted order. */
  [Symbol.iterator](): Iterator<T> {
    const items: T[] = [];
    inOrder(this._root, (k) => { items.push(k); });
    return items[Symbol.iterator]();
  }

  /** Convert to sorted array. */
  toArray(): T[] { return [...this]; }

  forEach(cb: (value: T, set: SortedSet<T>) => void): void {
    for (const v of this) cb(v, this);
  }
}
