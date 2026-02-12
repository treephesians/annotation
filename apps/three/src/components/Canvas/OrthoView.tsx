import { OrthographicCamera } from "@react-three/drei";
import { CameraController } from "../Controls/CameraController";
import { SCENE } from "@/constants/scene";
import type { ViewType } from "@/types/view";

interface OrthoViewProps {
  viewType: Exclude<ViewType, "perspective">;
}

export function OrthoView({ viewType }: OrthoViewProps) {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[5, 5, 5]}
        zoom={50}
        near={0.1}
        far={1000}
      />
      <CameraController viewType={viewType} />
      <color attach="background" args={[SCENE.BACKGROUND[viewType]]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
