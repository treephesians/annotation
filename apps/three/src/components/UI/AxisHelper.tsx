import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport, PerspectiveCamera } from "@react-three/drei";
import { useShallow } from "zustand/react/shallow";
import { useCameraControl } from "../../hooks/useCameraControl";
import { sphericalToCartesian } from "../../utils/sphericalCoordinates";

function SyncedCamera() {
  const { camera } = useThree();
  const { azimuth, elevation } = useCameraControl(
    useShallow((state) => ({
      azimuth: state.azimuth,
      elevation: state.elevation,
    })),
  );
  const prevRef = useRef({ azimuth: 0, elevation: 0 });

  useFrame(() => {
    // Only update if changed
    if (
      prevRef.current.azimuth !== azimuth ||
      prevRef.current.elevation !== elevation
    ) {
      prevRef.current = { azimuth, elevation };

      const position = sphericalToCartesian(
        new THREE.Vector3(0, 0, 0),
        10,
        elevation,
        azimuth
      );
      camera.position.set(position.x, position.y, position.z);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export function AxisGizmo() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        width: 100,
        height: 100,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <SyncedCamera />
        <GizmoHelper alignment="center-center" margin={[0, 0]}>
          <GizmoViewport
            axisColors={["#ff4444", "#44ff44", "#4444ff"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
