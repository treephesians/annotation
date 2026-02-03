import { OrthographicCamera } from "@react-three/drei";
import { CameraController } from "../Controls/CameraController";

export function TopDownView() {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 10, 0]}
        zoom={50}
        near={0.1}
        far={1000}
      />
      <CameraController viewType="topDown" />
      <color attach="background" args={["#352530"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
