import { OrthographicCamera } from "@react-three/drei";
import { CameraController } from "../Controls/CameraController";

export function SideView() {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[5, 5, 5]}
        zoom={50}
        near={0.1}
        far={1000}
      />
      <CameraController viewType="side" />
      <color attach="background" args={["#303035"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
