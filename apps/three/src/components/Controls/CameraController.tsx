import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraControl } from "../../hooks/useCameraControl";
import { sphericalToCartesian } from "../../utils/sphericalCoordinates";
import { SCENE } from "@/constants/scene";
import type { ViewType } from "@/types/view";

interface CameraControllerProps {
  viewType?: ViewType;
}

export function CameraController({ viewType = "perspective" }: CameraControllerProps) {
  const { camera } = useThree();
  const { target, distance, azimuth, elevation } = useCameraControl();

  const prevValues = useRef({ distance: 0, azimuth: 0, elevation: 0 });

  useFrame(() => {
    const changed =
      prevValues.current.distance !== distance ||
      prevValues.current.azimuth !== azimuth ||
      prevValues.current.elevation !== elevation;

    if (!changed) return;

    prevValues.current = { distance, azimuth, elevation };

    // 현재 방향 벡터 계산
    const currentPos = sphericalToCartesian(target, distance, elevation, azimuth);
    const forward = new THREE.Vector3()
      .subVectors(target, currentPos)
      .normalize();

    const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
    const up = new THREE.Vector3().crossVectors(forward, right).normalize();

    let position: THREE.Vector3;

    switch (viewType) {
      case "side":
        position = new THREE.Vector3()
          .copy(target)
          .addScaledVector(right, -distance);
        camera.up.set(0, 1, 0);
        break;

      case "topDown":
        position = new THREE.Vector3()
          .copy(target)
          .addScaledVector(up, -distance);
        camera.up.copy(forward).negate();

        break;

      case "perspective":
      default:
        position = currentPos;
        camera.up.set(0, 1, 0);
        break;
    }

    camera.position.copy(position);
    camera.lookAt(target);

    if (viewType !== "perspective" && camera instanceof THREE.OrthographicCamera) {
      camera.zoom = SCENE.CAMERA.ORTHO_ZOOM_FACTOR / distance;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
