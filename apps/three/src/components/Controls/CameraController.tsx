import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraControl } from "../../hooks/useCameraControl";
import { sphericalToCartesian } from "../../utils/sphericalCoordinates";

type ViewType = "perspective" | "side" | "topDown";

interface CameraControllerProps {
  viewType?: ViewType;
}

export function CameraController({ viewType = "perspective" }: CameraControllerProps) {
  const { camera } = useThree();
  const { target, distance, azimuth, elevation } = useCameraControl();

  // Store previous values to avoid unnecessary updates
  const prevValues = useRef({ distance: 0, azimuth: 0, elevation: 0 });

  useFrame(() => {
    // Check if values changed
    const changed =
      prevValues.current.distance !== distance ||
      prevValues.current.azimuth !== azimuth ||
      prevValues.current.elevation !== elevation;

    if (!changed) return;

    // Update previous values
    prevValues.current = { distance, azimuth, elevation };

    let position: THREE.Vector3;

    switch (viewType) {
      case "side":
        // Side view: same elevation, azimuth + 90°
        position = sphericalToCartesian(
          target,
          distance,
          elevation,
          azimuth + Math.PI / 2
        );
        break;

      case "topDown":
        // Top-down view: looking from above
        position = new THREE.Vector3(target.x, target.y + distance, target.z);
        break;

      case "perspective":
      default:
        // Normal perspective view
        position = sphericalToCartesian(target, distance, elevation, azimuth);
        break;
    }

    // Update camera position
    camera.position.copy(position);

    // For top-down view, rotate camera to match perspective's azimuth
    if (viewType === "topDown") {
      camera.up.set(-Math.cos(azimuth), 0, -Math.sin(azimuth));
    }

    camera.lookAt(target);

    // Update orthographic zoom for non-perspective views
    if (viewType !== "perspective" && camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 300 / distance;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
