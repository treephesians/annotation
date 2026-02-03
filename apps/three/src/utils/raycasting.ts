import * as THREE from "three";

/**
 * Convert mouse event coordinates to NDC (Normalized Device Coordinates)
 * NDC range: x: [-1, 1], y: [-1, 1]
 */
export function mouseToNDC(
  event: React.MouseEvent,
  element: HTMLElement
): THREE.Vector2 {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return new THREE.Vector2(x, y);
}

/**
 * Create a ray from camera through the clicked point
 */
export function createRayFromCamera(
  ndc: THREE.Vector2,
  camera: THREE.Camera
): THREE.Ray {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);
  return raycaster.ray;
}

/**
 * Get a point along the ray at a given distance
 */
export function getPointOnRay(
  ray: THREE.Ray,
  distance: number
): THREE.Vector3 {
  return ray.origin.clone().add(ray.direction.clone().multiplyScalar(distance));
}
