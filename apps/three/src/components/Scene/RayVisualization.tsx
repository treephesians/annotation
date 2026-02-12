import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useShallow } from "zustand/react/shallow";
import { useAnnotations } from "../../hooks/useAnnotations";
import { SCENE } from "@/constants/scene";

export function RayVisualization() {
  const { currentRay, currentDepth } = useAnnotations(
    useShallow((state) => ({
      currentRay: state.currentRay,
      currentDepth: state.currentDepth,
    }))
  );

  const points = useMemo(() => {
    if (!currentRay) return null;

    const start = currentRay.origin.clone();
    const end = currentRay.origin
      .clone()
      .add(currentRay.direction.clone().multiplyScalar(SCENE.RAY.LENGTH));

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
        color={SCENE.RAY.COLOR}
        lineWidth={SCENE.RAY.LINE_WIDTH}
        transparent
        opacity={SCENE.RAY.OPACITY}
      />

      {/* Current depth marker (temporary annotation point) */}
      {markerPosition && (
        <group position={markerPosition}>
          {/* Outer yellow sphere - rendered first */}
          <mesh>
            <sphereGeometry
              args={[SCENE.MARKER.OUTER_RADIUS, SCENE.MARKER.OUTER_SEGMENTS, SCENE.MARKER.OUTER_SEGMENTS]}
            />
            <meshStandardMaterial
              color={SCENE.MARKER.OUTER_COLOR}
              emissive={SCENE.MARKER.OUTER_COLOR}
              emissiveIntensity={SCENE.MARKER.OUTER_EMISSIVE_INTENSITY}
              transparent
              opacity={SCENE.MARKER.OUTER_OPACITY}
              depthWrite={false}
            />
          </mesh>
          {/* Inner White dot (center) */}
          <mesh>
            <sphereGeometry
              args={[SCENE.MARKER.INNER_RADIUS, SCENE.MARKER.INNER_SEGMENTS, SCENE.MARKER.INNER_SEGMENTS]}
            />
            <meshBasicMaterial color={SCENE.MARKER.INNER_COLOR} />
          </mesh>
        </group>
      )}
    </>
  );
}
