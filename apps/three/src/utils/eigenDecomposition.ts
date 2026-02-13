/**
 * Jacobi eigenvalue decomposition for 3x3 symmetric matrices.
 *
 * Input:  matrix as flat 9-element array [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 * Output: eigenvalues (descending) and corresponding eigenvectors (column vectors)
 */

const MAX_ITERATIONS = 50;
const EPSILON = 1e-10;

// Access helpers for row-major 3x3
const idx = (r: number, c: number) => r * 3 + c;

export interface EigenResult {
  values: [number, number, number];
  /** vectors[i] is the eigenvector for values[i] — each is [x, y, z] */
  vectors: [[number, number, number], [number, number, number], [number, number, number]];
}

/**
 * Jacobi eigenvalue algorithm for a 3x3 symmetric matrix.
 * Returns eigenvalues sorted descending with their eigenvectors.
 */
export function eigenDecomposition3x3(matrix: number[]): EigenResult {
  // Work on a copy
  const a = [...matrix];

  // Eigenvector accumulator — starts as identity
  const v = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // Find largest off-diagonal element
    let maxVal = 0;
    let p = 0;
    let q = 1;
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        const absVal = Math.abs(a[idx(i, j)]!);
        if (absVal > maxVal) {
          maxVal = absVal;
          p = i;
          q = j;
        }
      }
    }

    if (maxVal < EPSILON) break;

    // Compute rotation angle
    const app = a[idx(p, p)]!;
    const aqq = a[idx(q, q)]!;
    const apq = a[idx(p, q)]!;

    let cos: number, sin: number;

    if (Math.abs(app - aqq) < EPSILON) {
      // theta = pi/4
      const angle = Math.PI / 4;
      cos = Math.cos(angle);
      sin = Math.sign(apq) * Math.sin(angle);
    } else {
      const tau = (aqq - app) / (2 * apq);
      const t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
      cos = 1 / Math.sqrt(1 + t * t);
      sin = t * cos;
    }

    // Apply Givens rotation: A' = G^T A G
    // Update matrix A
    const newA = [...a];

    newA[idx(p, p)] = cos * cos * app - 2 * sin * cos * apq + sin * sin * aqq;
    newA[idx(q, q)] = sin * sin * app + 2 * sin * cos * apq + cos * cos * aqq;
    newA[idx(p, q)] = 0;
    newA[idx(q, p)] = 0;

    for (let r = 0; r < 3; r++) {
      if (r === p || r === q) continue;
      const arp = a[idx(r, p)]!;
      const arq = a[idx(r, q)]!;
      newA[idx(r, p)] = cos * arp - sin * arq;
      newA[idx(p, r)] = newA[idx(r, p)]!;
      newA[idx(r, q)] = sin * arp + cos * arq;
      newA[idx(q, r)] = newA[idx(r, q)]!;
    }

    for (let i = 0; i < 9; i++) a[i] = newA[i]!;

    // Accumulate eigenvectors: V' = V * G
    for (let r = 0; r < 3; r++) {
      const vrp = v[idx(r, p)]!;
      const vrq = v[idx(r, q)]!;
      v[idx(r, p)] = cos * vrp - sin * vrq;
      v[idx(r, q)] = sin * vrp + cos * vrq;
    }
  }

  // Extract eigenvalues and eigenvectors
  const eigenvalues: [number, number, number] = [a[idx(0, 0)]!, a[idx(1, 1)]!, a[idx(2, 2)]!];
  const eigenvectors: [[number, number, number], [number, number, number], [number, number, number]] = [
    [v[idx(0, 0)]!, v[idx(1, 0)]!, v[idx(2, 0)]!],
    [v[idx(0, 1)]!, v[idx(1, 1)]!, v[idx(2, 1)]!],
    [v[idx(0, 2)]!, v[idx(1, 2)]!, v[idx(2, 2)]!],
  ];

  // Sort by eigenvalue descending
  const order = [0, 1, 2].sort((a, b) => eigenvalues[b]! - eigenvalues[a]!) as [number, number, number];

  return {
    values: [eigenvalues[order[0]]!, eigenvalues[order[1]]!, eigenvalues[order[2]]!],
    vectors: [eigenvectors[order[0]]!, eigenvectors[order[1]]!, eigenvectors[order[2]]!],
  };
}
