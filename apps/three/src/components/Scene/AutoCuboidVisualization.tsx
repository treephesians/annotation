import { useMemo } from "react";
import * as THREE from "three";
import { useAutoCuboid } from "../../hooks/useAutoCuboid";
import { usePointCloudData } from "../../hooks/usePointCloudData";
import { SCENE } from "@/constants/scene";
import type { OBB } from "../../utils/computeOBB";

function OBBWireframe({ obb, color, opacity = 0.6 }: { obb: OBB; color: string; opacity?: number }) {
  const matrix = useMemo(() => {
    const [ax0, ax1, ax2] = obb.axes;
    const [hx, hy, hz] = obb.halfExtents;

    // Build rotation matrix from OBB axes (columns = axes)
    const rotMatrix = new THREE.Matrix4().set(
      ax0[0], ax1[0], ax2[0], 0,
      ax0[1], ax1[1], ax2[1], 0,
      ax0[2], ax1[2], ax2[2], 0,
      0, 0, 0, 1,
    );

    // Scale by full extents (2 * halfExtents)
    const scaleMatrix = new THREE.Matrix4().makeScale(hx * 2, hy * 2, hz * 2);

    // Point cloud rotation: -90° around X
    const pcRotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

    const translate = new THREE.Matrix4().makeTranslation(
      obb.center[0],
      obb.center[1],
      obb.center[2],
    );

    // Full transform: pcRotation * translate * rotation * scale
    return new THREE.Matrix4()
      .multiply(pcRotation)
      .multiply(translate)
      .multiply(rotMatrix)
      .multiply(scaleMatrix);
  }, [obb]);

  return (
    <mesh matrixAutoUpdate={false} matrix={matrix}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

export function AutoCuboidVisualization() {
  const phase = useAutoCuboid((s) => s.phase);
  const selectedIndices = useAutoCuboid((s) => s.selectedIndices);
  const previewOBB = useAutoCuboid((s) => s.previewOBB);
  const cuboids = useAutoCuboid((s) => s.cuboids);
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

  return (
    <>
      {/* Highlight selected points during preview */}
      {phase !== "idle" && highlightGeometry && (
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
      )}

      {/* Preview OBB wireframe */}
      {previewOBB && (
        <OBBWireframe obb={previewOBB} color={SCENE.AUTO_CUBOID.HIGHLIGHT_COLOR} opacity={0.8} />
      )}

      {/* Confirmed cuboids */}
      {cuboids.map((cuboid) => (
        <OBBWireframe
          key={cuboid.id}
          obb={cuboid.obb}
          color={SCENE.AUTO_CUBOID.CUBOID_COLOR}
        />
      ))}
    </>
  );
}
