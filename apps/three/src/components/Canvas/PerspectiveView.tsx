import { PerspectiveCamera } from "@react-three/drei";
import { CameraController } from "../Controls/CameraController";
import { SCENE } from "@/constants/scene";

export function PerspectiveView() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[5, 5, 5]}
        fov={60}
        near={0.1}
        far={1000}
      />
      <CameraController viewType="perspective" />
      <color attach="background" args={[SCENE.BACKGROUND.perspective]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
