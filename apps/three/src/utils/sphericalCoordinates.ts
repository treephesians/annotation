import * as THREE from "three";

export interface SphericalState {
  target: THREE.Vector3;
  distance: number;
  azimuth: number; // φ (0 ~ 2π)
  elevation: number; // θ (0 ~ π)
}

export const DEFAULT_CAMERA_STATE: SphericalState = {
  target: new THREE.Vector3(0, 0, 0),
  distance: 10,
  azimuth: Math.PI / 4, // 45°
  elevation: Math.PI / 3, // 60°
};

// Limits
export const LIMITS = {
  distance: { min: 2, max: 50 },
  elevation: { min: 0.1, max: Math.PI - 0.1 },
};

// Speed constants
export const SPEED = {
  distance: 0.05, // 5% per key press
  azimuth: 0.05, // radians
  elevation: 0.05, // radians
};

/**
 * Convert spherical coordinates to Cartesian coordinates
 */
export function sphericalToCartesian(
  target: THREE.Vector3,
  distance: number,
  elevation: number,
  azimuth: number
): THREE.Vector3 {
  const x = target.x + distance * Math.sin(elevation) * Math.cos(azimuth);
  const y = target.y + distance * Math.cos(elevation);
  const z = target.z + distance * Math.sin(elevation) * Math.sin(azimuth);

  return new THREE.Vector3(x, y, z);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp elevation to valid range
 */
export function clampElevation(elevation: number): number {
  return clamp(elevation, LIMITS.elevation.min, LIMITS.elevation.max);
}

/**
 * Clamp distance to valid range
 */
export function clampDistance(distance: number): number {
  return clamp(distance, LIMITS.distance.min, LIMITS.distance.max);
}

/**
 * Normalize azimuth to [0, 2π]
 */
export function normalizeAzimuth(azimuth: number): number {
  const twoPi = Math.PI * 2;
  return ((azimuth % twoPi) + twoPi) % twoPi;
}
