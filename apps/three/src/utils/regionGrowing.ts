/**
 * Region Growing: BFS expansion from a seed point using normal similarity.
 */

import { type KDTree, findNeighborsInRadius } from "./kdTree";

interface RegionGrowParams {
  /** Normal angle threshold in degrees */
  normalThreshold: number;
  /** Max distance for neighbor search in meters */
  maxDistance: number;
  /** Maximum number of points in the region */
  maxRegionSize: number;
}

/**
 * Grow a region from the seed point by expanding to neighbors
 * whose normals are similar (within normalThreshold degrees).
 *
 * @returns Array of point indices belonging to the region.
 */
export function regionGrow(
  seedIndex: number,
  positions: Float32Array,
  normals: Float32Array,
  tree: KDTree,
  params: RegionGrowParams
): number[] {
  const { normalThreshold, maxDistance, maxRegionSize } = params;
  const cosThreshold = Math.cos((normalThreshold * Math.PI) / 180);

  const visited = new Set<number>();
  const region: number[] = [];
  const queue: number[] = [seedIndex];
  visited.add(seedIndex);

  while (queue.length > 0 && region.length < maxRegionSize) {
    const idx = queue.shift()!;
    region.push(idx);

    const px = positions[idx * 3]!;
    const py = positions[idx * 3 + 1]!;
    const pz = positions[idx * 3 + 2]!;

    const neighbors = findNeighborsInRadius(tree, px, py, pz, maxDistance);

    const snx = normals[idx * 3]!;
    const sny = normals[idx * 3 + 1]!;
    const snz = normals[idx * 3 + 2]!;

    for (const ni of neighbors) {
      if (visited.has(ni)) continue;
      visited.add(ni);

      const nnx = normals[ni * 3]!;
      const nny = normals[ni * 3 + 1]!;
      const nnz = normals[ni * 3 + 2]!;

      // Dot product — use abs since normals can point either direction
      const dot = snx * nnx + sny * nny + snz * nnz;
      if (Math.abs(dot) >= cosThreshold) {
        queue.push(ni);
      }
    }
  }

  return region;
}
