import { useAnnotations } from "../../hooks/useAnnotations";

export function Annotations() {
  const annotations = useAnnotations((state) => state.annotations);

  return (
    <>
      {annotations.map((annotation) => (
        <mesh key={annotation.id} position={annotation.position}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </>
  );
}
