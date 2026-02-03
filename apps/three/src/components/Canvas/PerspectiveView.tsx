import { PerspectiveCamera } from "@react-three/drei";

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
      <color attach="background" args={["#252530"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
