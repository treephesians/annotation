/**
 * Debug visualization: renders normal vectors as short lines for a subset of points.
 * Toggle with the `visible` prop or remove from SceneContent when not needed.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { usePointCloudData } from "@/hooks/usePointCloudData";

interface NormalVisualizationProps {
  /** Show every Nth point's normal (default: 100) */
  sampleRate?: number;
  /** Length of normal line (default: 0.15) */
  lineLength?: number;
  /** Color of normal lines */
  color?: string;
}

export function NormalVisualization({
  sampleRate = 100,
  lineLength = 0.15,
  color = "#ff00ff",
}: NormalVisualizationProps) {
  const positions = usePointCloudData((s) => s.positions);
  const normals = usePointCloudData((s) => s.normals);

  const geometry = useMemo(() => {
    if (!positions || !normals) return null;

    const pointCount = positions.length / 3;
    const points: THREE.Vector3[] = [];

    for (let i = 0; i < pointCount; i += sampleRate) {
      const px = positions[i * 3]!;
      const py = positions[i * 3 + 1]!;
      const pz = positions[i * 3 + 2]!;

      const nx = normals[i * 3]!;
      const ny = normals[i * 3 + 1]!;
      const nz = normals[i * 3 + 2]!;

      // Line from point to point + normal * length
      points.push(new THREE.Vector3(px, py, pz));
      points.push(
        new THREE.Vector3(
          px + nx * lineLength,
          py + ny * lineLength,
          pz + nz * lineLength
        )
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setFromPoints(points);
    return geo;
  }, [positions, normals, sampleRate, lineLength]);

  if (!geometry) return null;

  // Apply same rotation as PointCloud (-90° around X)
  return (
    <lineSegments geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <lineBasicMaterial color={color} transparent opacity={0.6} />
    </lineSegments>
  );
}
