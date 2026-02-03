import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useAnnotations } from "../../hooks/useAnnotations";

const RAY_LENGTH = 50;

export function RayVisualization() {
  const { currentRay, currentDepth } = useAnnotations();

  const points = useMemo(() => {
    if (!currentRay) return null;

    const start = currentRay.origin.clone();
    const end = currentRay.origin
      .clone()
      .add(currentRay.direction.clone().multiplyScalar(RAY_LENGTH));

    return [start, end];
  }, [currentRay]);

  const markerPosition = useMemo(() => {
    if (!currentRay) return null;

    return currentRay.origin
      .clone()
      .add(currentRay.direction.clone().multiplyScalar(currentDepth));
  }, [currentRay, currentDepth]);

  if (!currentRay || !points) return null;

  return (
    <>
      {/* Ray line */}
      <Line
        points={points}
        color="#ffff00"
        lineWidth={2}
        transparent
        opacity={0.6}
      />

      {/* Current depth marker (temporary annotation point) */}
      {markerPosition && (
        <group position={markerPosition}>
          {/* Outer yellow sphere - rendered first */}
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
          {/* Inner White dot (center)*/}
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </>
  );
}
