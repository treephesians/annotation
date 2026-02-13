/**
 * Estimate surface normals for a point cloud using PCA of local neighborhoods.
 */

import { type KDTree, findKNearest } from "./kdTree";
import { eigenDecomposition3x3 } from "./eigenDecomposition";

/**
 * Compute normal vectors for every point in the cloud.
 * Returns a Float32Array with stride 3 (same length as positions).
 *
 * @param positions stride-3 Float32Array [x0,y0,z0, x1,y1,z1, ...]
 * @param tree      pre-built KD-tree over the same positions
 * @param k         number of neighbors to use (default 15)
 */
export function computeNormals(
  positions: Float32Array,
  tree: KDTree,
  k: number = 15
): Float32Array {
  const pointCount = positions.length / 3;
  const normals = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const px = positions[i * 3]!;
    const py = positions[i * 3 + 1]!;
    const pz = positions[i * 3 + 2]!;

    const neighborIndices = findKNearest(tree, px, py, pz, k);

    if (neighborIndices.length < 3) {
      // Not enough neighbors — default to up vector
      normals[i * 3] = 0;
      normals[i * 3 + 1] = 0;
      normals[i * 3 + 2] = 1;
      continue;
    }

    // Compute centroid of neighbors
    let cx = 0, cy = 0, cz = 0;
    for (const ni of neighborIndices) {
      cx += positions[ni * 3]!;
      cy += positions[ni * 3 + 1]!;
      cz += positions[ni * 3 + 2]!;
    }
    const n = neighborIndices.length;
    cx /= n;
    cy /= n;
    cz /= n;

    // Compute 3x3 covariance matrix (symmetric)
    let c00 = 0, c01 = 0, c02 = 0;
    let c11 = 0, c12 = 0;
    let c22 = 0;

    for (const ni of neighborIndices) {
      const dx = positions[ni * 3]! - cx;
      const dy = positions[ni * 3 + 1]! - cy;
      const dz = positions[ni * 3 + 2]! - cz;
      c00 += dx * dx;
      c01 += dx * dy;
      c02 += dx * dz;
      c11 += dy * dy;
      c12 += dy * dz;
      c22 += dz * dz;
    }

    // Row-major 3x3: [c00 c01 c02 | c01 c11 c12 | c02 c12 c22]
    const cov = [c00, c01, c02, c01, c11, c12, c02, c12, c22];
    const { vectors } = eigenDecomposition3x3(cov);

    // The eigenvector with the smallest eigenvalue is the normal.
    // eigenDecomposition3x3 returns descending order, so index 2 is smallest.
    const normal = vectors[2];

    // Normalize (should already be ~unit, but ensure)
    const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    if (len > 1e-8) {
      normals[i * 3] = normal[0] / len;
      normals[i * 3 + 1] = normal[1] / len;
      normals[i * 3 + 2] = normal[2] / len;
    } else {
      normals[i * 3] = 0;
      normals[i * 3 + 1] = 0;
      normals[i * 3 + 2] = 1;
    }
  }

  return normals;
}
