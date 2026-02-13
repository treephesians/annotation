import { useMemo } from "react";
import * as THREE from "three";
import { useAutoCuboid } from "../../hooks/useAutoCuboid";
import { usePointCloudData } from "../../hooks/usePointCloudData";
import { SCENE } from "@/constants/scene";

export function AutoCuboidVisualization() {
  const phase = useAutoCuboid((s) => s.phase);
  const selectedIndices = useAutoCuboid((s) => s.selectedIndices);
  const positions = usePointCloudData((s) => s.positions);

  const highlightGeometry = useMemo(() => {
    if (!selectedIndices || !positions || selectedIndices.length === 0)
      return null;

    const posArray = new Float32Array(selectedIndices.length * 3);
    for (let i = 0; i < selectedIndices.length; i++) {
      const idx = selectedIndices[i]!;
      posArray[i * 3] = positions[idx * 3]!;
      posArray[i * 3 + 1] = positions[idx * 3 + 1]!;
      posArray[i * 3 + 2] = positions[idx * 3 + 2]!;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    return geo;
  }, [selectedIndices, positions]);

  if (phase === "idle" || !highlightGeometry) return null;

  // Apply same rotation as PointCloud (-90° around X)
  return (
    <points geometry={highlightGeometry} rotation={[-Math.PI / 2, 0, 0]}>
      <pointsMaterial
        color={SCENE.AUTO_CUBOID.HIGHLIGHT_COLOR}
        size={SCENE.AUTO_CUBOID.HIGHLIGHT_POINT_SIZE}
        sizeAttenuation
        depthTest={false}
        transparent
        opacity={0.9}
      />
    </points>
  );
}
