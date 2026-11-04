/**
 * Maps over `items`, returning the very same array when `fn` changed no item.
 * Keeping the reference lets TanStack Query skip re-rendering the components of untouched queries.
 */
export function mapPreservingIdentity<A extends readonly unknown[]>(
  items: A,
  fn: (item: A[number]) => A[number],
): A {
  let changed = false;
  const mapped = items.map((item) => {
    const next = fn(item);
    if (next !== item) changed = true;
    return next;
  });
  return changed ? (mapped as unknown as A) : items;
}
