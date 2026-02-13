/**
 * Simple 3D KD-tree built directly on a stride-3 Float32Array.
 * Point indices reference into the original array: point i = positions[i*3], positions[i*3+1], positions[i*3+2].
 */

const LEAF_SIZE = 32;

interface KDLeaf {
  type: "leaf";
  indices: number[];
}

interface KDBranch {
  type: "branch";
  axis: 0 | 1 | 2;
  splitValue: number;
  left: KDNode;
  right: KDNode;
}

export type KDNode = KDLeaf | KDBranch;

export interface KDTree {
  root: KDNode;
  positions: Float32Array;
}

/**
 * Build a KD-tree from a stride-3 Float32Array of positions.
 */
export function buildKDTree(positions: Float32Array): KDTree {
  const pointCount = positions.length / 3;
  const indices: number[] = [];
  for (let i = 0; i < pointCount; i++) indices.push(i);

  const root = buildNode(positions, indices, 0);
  return { root, positions };
}

function buildNode(positions: Float32Array, indices: number[], depth: number): KDNode {
  if (indices.length <= LEAF_SIZE) {
    return { type: "leaf", indices: [...indices] };
  }

  const axis = (depth % 3) as 0 | 1 | 2;

  // Find median by partial sort
  indices.sort((a, b) => positions[a * 3 + axis]! - positions[b * 3 + axis]!);
  const mid = Math.floor(indices.length / 2);
  const splitValue = positions[indices[mid]! * 3 + axis]!;

  return {
    type: "branch",
    axis,
    splitValue,
    left: buildNode(positions, indices.slice(0, mid), depth + 1),
    right: buildNode(positions, indices.slice(mid), depth + 1),
  };
}

/**
 * Find the index of the nearest point to the given query position.
 */
export function findNearestPoint(tree: KDTree, qx: number, qy: number, qz: number): number {
  const q = [qx, qy, qz];
  let bestIdx = -1;
  let bestDist = Infinity;

  function search(node: KDNode) {
    if (node.type === "leaf") {
      for (const idx of node.indices) {
        const dx = tree.positions[idx * 3]! - q[0]!;
        const dy = tree.positions[idx * 3 + 1]! - q[1]!;
        const dz = tree.positions[idx * 3 + 2]! - q[2]!;
        const dist = dx * dx + dy * dy + dz * dz;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }
      return;
    }

    const val = q[node.axis]!;
    const diff = val - node.splitValue;
    const first = diff < 0 ? node.left : node.right;
    const second = diff < 0 ? node.right : node.left;

    search(first);
    if (diff * diff < bestDist) {
      search(second);
    }
  }

  search(tree.root);
  return bestIdx;
}

/**
 * Find all point indices within the given radius of the query position.
 */
export function findNeighborsInRadius(
  tree: KDTree,
  qx: number,
  qy: number,
  qz: number,
  radius: number
): number[] {
  const q = [qx, qy, qz];
  const r2 = radius * radius;
  const result: number[] = [];

  function search(node: KDNode) {
    if (node.type === "leaf") {
      for (const idx of node.indices) {
        const dx = tree.positions[idx * 3]! - q[0]!;
        const dy = tree.positions[idx * 3 + 1]! - q[1]!;
        const dz = tree.positions[idx * 3 + 2]! - q[2]!;
        if (dx * dx + dy * dy + dz * dz <= r2) {
          result.push(idx);
        }
      }
      return;
    }

    const val = q[node.axis]!;
    const diff = val - node.splitValue;

    // Always search the closer side
    const first = diff < 0 ? node.left : node.right;
    const second = diff < 0 ? node.right : node.left;

    search(first);
    if (diff * diff <= r2) {
      search(second);
    }
  }

  search(tree.root);
  return result;
}

/**
 * Find the k nearest neighbor indices to the query position.
 */
export function findKNearest(
  tree: KDTree,
  qx: number,
  qy: number,
  qz: number,
  k: number
): number[] {
  const q = [qx, qy, qz];

  // Max-heap of (distance, index) — we keep at most k entries
  const heap: { dist: number; idx: number }[] = [];

  function heapMax(): number {
    return heap.length > 0 ? heap[0]!.dist : Infinity;
  }

  function heapInsert(dist: number, idx: number) {
    if (heap.length < k) {
      heap.push({ dist, idx });
      // Bubble up
      let i = heap.length - 1;
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (heap[i]!.dist > heap[parent]!.dist) {
          [heap[i], heap[parent]] = [heap[parent]!, heap[i]!];
          i = parent;
        } else break;
      }
    } else if (dist < heap[0]!.dist) {
      heap[0] = { dist, idx };
      // Bubble down
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;
        if (l < heap.length && heap[l]!.dist > heap[largest]!.dist) largest = l;
        if (r < heap.length && heap[r]!.dist > heap[largest]!.dist) largest = r;
        if (largest === i) break;
        [heap[i], heap[largest]] = [heap[largest]!, heap[i]!];
        i = largest;
      }
    }
  }

  function search(node: KDNode) {
    if (node.type === "leaf") {
      for (const idx of node.indices) {
        const dx = tree.positions[idx * 3]! - q[0]!;
        const dy = tree.positions[idx * 3 + 1]! - q[1]!;
        const dz = tree.positions[idx * 3 + 2]! - q[2]!;
        const dist = dx * dx + dy * dy + dz * dz;
        heapInsert(dist, idx);
      }
      return;
    }

    const val = q[node.axis]!;
    const diff = val - node.splitValue;
    const first = diff < 0 ? node.left : node.right;
    const second = diff < 0 ? node.right : node.left;

    search(first);
    if (diff * diff < heapMax()) {
      search(second);
    }
  }

  search(tree.root);
  return heap.map((h) => h.idx);
}
