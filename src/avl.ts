// AVL self-balancing BST — internal implementation for SortedSet and SortedMap.

export type Comparator<K> = (a: K, b: K) => number;

export interface AVLNode<K, V> {
  key: K;
  value: V;
  left: AVLNode<K, V> | null;
  right: AVLNode<K, V> | null;
  height: number;
  size: number;
}

function height<K, V>(n: AVLNode<K, V> | null): number {
  return n ? n.height : 0;
}

function sz<K, V>(n: AVLNode<K, V> | null): number {
  return n ? n.size : 0;
}

function update<K, V>(n: AVLNode<K, V>): void {
  n.height = 1 + Math.max(height(n.left), height(n.right));
  n.size = 1 + sz(n.left) + sz(n.right);
}

function balanceFactor<K, V>(n: AVLNode<K, V>): number {
  return height(n.left) - height(n.right);
}

function rotateRight<K, V>(y: AVLNode<K, V>): AVLNode<K, V> {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  update(y);
  update(x);
  return x;
}

function rotateLeft<K, V>(x: AVLNode<K, V>): AVLNode<K, V> {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  update(x);
  update(y);
  return y;
}

function balance<K, V>(n: AVLNode<K, V>): AVLNode<K, V> {
  update(n);
  const bf = balanceFactor(n);
  if (bf > 1) {
    if (balanceFactor(n.left!) < 0) n.left = rotateLeft(n.left!);
    return rotateRight(n);
  }
  if (bf < -1) {
    if (balanceFactor(n.right!) > 0) n.right = rotateRight(n.right!);
    return rotateLeft(n);
  }
  return n;
}

function newNode<K, V>(key: K, value: V): AVLNode<K, V> {
  return { key, value, left: null, right: null, height: 1, size: 1 };
}

export function insert<K, V>(
  node: AVLNode<K, V> | null,
  key: K,
  value: V,
  cmp: Comparator<K>,
  inserted: { v: boolean }
): AVLNode<K, V> {
  if (!node) { inserted.v = true; return newNode(key, value); }
  const c = cmp(key, node.key);
  if (c < 0) node.left = insert(node.left, key, value, cmp, inserted);
  else if (c > 0) node.right = insert(node.right, key, value, cmp, inserted);
  else { node.value = value; return node; } // update in-place
  return balance(node);
}

function minNode<K, V>(n: AVLNode<K, V>): AVLNode<K, V> {
  while (n.left) n = n.left;
  return n;
}

function deleteMin<K, V>(n: AVLNode<K, V>): AVLNode<K, V> | null {
  if (!n.left) return n.right;
  n.left = deleteMin(n.left);
  return balance(n);
}

export function remove<K, V>(
  node: AVLNode<K, V> | null,
  key: K,
  cmp: Comparator<K>,
  deleted: { v: boolean }
): AVLNode<K, V> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c < 0) node.left = remove(node.left, key, cmp, deleted);
  else if (c > 0) node.right = remove(node.right, key, cmp, deleted);
  else {
    deleted.v = true;
    if (!node.right) return node.left;
    if (!node.left) return node.right;
    const m = minNode(node.right);
    node.key = m.key;
    node.value = m.value;
    node.right = deleteMin(node.right);
  }
  return balance(node);
}

export function find<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): V | undefined {
  while (node) {
    const c = cmp(key, node.key);
    if (c < 0) node = node.left;
    else if (c > 0) node = node.right;
    else return node.value;
  }
  return undefined;
}

export function has<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): boolean {
  return find(node, key, cmp) !== undefined;
}

/** Largest key <= given key */
export function floor<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): AVLNode<K, V> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c === 0) return node;
  if (c < 0) return floor(node.left, key, cmp);
  return floor(node.right, key, cmp) ?? node;
}

/** Smallest key >= given key */
export function ceiling<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): AVLNode<K, V> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c === 0) return node;
  if (c > 0) return ceiling(node.right, key, cmp);
  return ceiling(node.left, key, cmp) ?? node;
}

/** Largest key strictly < given key */
export function lower<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): AVLNode<K, V> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c <= 0) return lower(node.left, key, cmp);
  return lower(node.right, key, cmp) ?? node;
}

/** Smallest key strictly > given key */
export function higher<K, V>(node: AVLNode<K, V> | null, key: K, cmp: Comparator<K>): AVLNode<K, V> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c >= 0) return higher(node.right, key, cmp);
  return higher(node.left, key, cmp) ?? node;
}

export function minKey<K, V>(node: AVLNode<K, V> | null): AVLNode<K, V> | null {
  if (!node) return null;
  while (node.left) node = node.left;
  return node;
}

export function maxKey<K, V>(node: AVLNode<K, V> | null): AVLNode<K, V> | null {
  if (!node) return null;
  while (node.right) node = node.right;
  return node;
}

/** In-order traversal, calling cb(key, value). Stop early by returning false from cb. */
export function inOrder<K, V>(
  node: AVLNode<K, V> | null,
  cb: (key: K, value: V) => boolean | void
): boolean {
  if (!node) return true;
  if (!inOrder(node.left, cb)) return false;
  if (cb(node.key, node.value) === false) return false;
  return inOrder(node.right, cb);
}

/** In-order traversal within [lo, hi] range (inclusive). */
export function inOrderRange<K, V>(
  node: AVLNode<K, V> | null,
  lo: K,
  hi: K,
  cmp: Comparator<K>,
  cb: (key: K, value: V) => boolean | void,
  excludeMin: boolean,
  excludeMax: boolean
): boolean {
  if (!node) return true;
  const cLo = cmp(node.key, lo);
  const cHi = cmp(node.key, hi);
  if (cLo > 0 || (cLo === 0 && !excludeMin)) {
    if (!inOrderRange(node.left, lo, hi, cmp, cb, excludeMin, excludeMax)) return false;
  }
  const inLo = excludeMin ? cLo > 0 : cLo >= 0;
  const inHi = excludeMax ? cHi < 0 : cHi <= 0;
  if (inLo && inHi) {
    if (cb(node.key, node.value) === false) return false;
  }
  if (cHi < 0 || (cHi === 0 && !excludeMax)) {
    if (!inOrderRange(node.right, lo, hi, cmp, cb, excludeMin, excludeMax)) return false;
  }
  return true;
}

export function defaultComparator<K>(a: K, b: K): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
