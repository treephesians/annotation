import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraControl } from "../../hooks/useCameraControl";
import { sphericalToCartesian } from "../../utils/sphericalCoordinates";

interface CameraControllerProps {
  isOrtho?: boolean;
}

export function CameraController({ isOrtho = false }: CameraControllerProps) {
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

    // Calculate new camera position
    const position = sphericalToCartesian(target, distance, elevation, azimuth);

    // Update camera
    camera.position.copy(position);
    camera.lookAt(target);

    // Update orthographic zoom based on distance
    if (isOrtho && camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 100 / distance;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
