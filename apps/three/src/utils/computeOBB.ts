import { eigenDecomposition3x3 } from "./eigenDecomposition";

export interface OBB {
  /** Center of the bounding box (raw point cloud coordinates) */
  center: [number, number, number];
  /** Half-extents along each axis */
  halfExtents: [number, number, number];
  /** 3 orthonormal axes (rows = axes, each is [x,y,z]) */
  axes: [[number, number, number], [number, number, number], [number, number, number]];
}

/**
 * Compute an Oriented Bounding Box for a set of points using PCA.
 *
 * @param indices  - indices into the positions array
 * @param positions - flat Float32Array [x0,y0,z0, x1,y1,z1, ...]
 */
export function computeOBB(
  indices: number[],
  positions: Float32Array
): OBB {
  const n = indices.length;
  if (n === 0) {
    return {
      center: [0, 0, 0],
      halfExtents: [0, 0, 0],
      axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    };
  }

  // 1. Compute centroid
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < n; i++) {
    const idx = indices[i]! * 3;
    cx += positions[idx]!;
    cy += positions[idx + 1]!;
    cz += positions[idx + 2]!;
  }
  cx /= n;
  cy /= n;
  cz /= n;

  // 2. Build 3x3 covariance matrix
  let cov00 = 0, cov01 = 0, cov02 = 0;
  let cov11 = 0, cov12 = 0, cov22 = 0;

  for (let i = 0; i < n; i++) {
    const idx = indices[i]! * 3;
    const dx = positions[idx]! - cx;
    const dy = positions[idx + 1]! - cy;
    const dz = positions[idx + 2]! - cz;

    cov00 += dx * dx;
    cov01 += dx * dy;
    cov02 += dx * dz;
    cov11 += dy * dy;
    cov12 += dy * dz;
    cov22 += dz * dz;
  }

  const inv = 1 / n;
  const covMatrix = [
    cov00 * inv, cov01 * inv, cov02 * inv,
    cov01 * inv, cov11 * inv, cov12 * inv,
    cov02 * inv, cov12 * inv, cov22 * inv,
  ];

  // 3. Eigen decomposition → principal axes
  const { vectors } = eigenDecomposition3x3(covMatrix);

  // Ensure right-handed coordinate system
  // axis2 = axis0 × axis1
  const a0 = vectors[0];
  const a1 = vectors[1];
  const cross: [number, number, number] = [
    a0[1] * a1[2] - a0[2] * a1[1],
    a0[2] * a1[0] - a0[0] * a1[2],
    a0[0] * a1[1] - a0[1] * a1[0],
  ];
  // Check if cross aligns with vectors[2], flip if not
  const dot = cross[0] * vectors[2][0] + cross[1] * vectors[2][1] + cross[2] * vectors[2][2];
  const axis2: [number, number, number] = dot >= 0 ? vectors[2] : [-vectors[2][0], -vectors[2][1], -vectors[2][2]];
  const axes: OBB["axes"] = [vectors[0], vectors[1], axis2];

  // 4. Project all points onto axes, find min/max
  let min0 = Infinity, max0 = -Infinity;
  let min1 = Infinity, max1 = -Infinity;
  let min2 = Infinity, max2 = -Infinity;

  for (let i = 0; i < n; i++) {
    const idx = indices[i]! * 3;
    const dx = positions[idx]! - cx;
    const dy = positions[idx + 1]! - cy;
    const dz = positions[idx + 2]! - cz;

    const p0 = dx * axes[0][0] + dy * axes[0][1] + dz * axes[0][2];
    const p1 = dx * axes[1][0] + dy * axes[1][1] + dz * axes[1][2];
    const p2 = dx * axes[2][0] + dy * axes[2][1] + dz * axes[2][2];

    if (p0 < min0) min0 = p0; if (p0 > max0) max0 = p0;
    if (p1 < min1) min1 = p1; if (p1 > max1) max1 = p1;
    if (p2 < min2) min2 = p2; if (p2 > max2) max2 = p2;
  }

  // 5. Compute true center (shift centroid to box center)
  const mid0 = (min0 + max0) / 2;
  const mid1 = (min1 + max1) / 2;
  const mid2 = (min2 + max2) / 2;

  const center: [number, number, number] = [
    cx + mid0 * axes[0][0] + mid1 * axes[1][0] + mid2 * axes[2][0],
    cy + mid0 * axes[0][1] + mid1 * axes[1][1] + mid2 * axes[2][1],
    cz + mid0 * axes[0][2] + mid1 * axes[1][2] + mid2 * axes[2][2],
  ];

  const halfExtents: [number, number, number] = [
    (max0 - min0) / 2,
    (max1 - min1) / 2,
    (max2 - min2) / 2,
  ];

  return { center, halfExtents, axes };
}
