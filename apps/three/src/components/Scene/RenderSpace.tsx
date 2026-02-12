import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import { SCENE } from "@/constants/scene";

export function RenderSpace() {
  const { renderSpace, createPhase, createAnchorPosition, createRadius } =
    useRenderSpaces();

  const { WIREFRAME_COLOR, WIREFRAME_OPACITY, WIREFRAME_SEGMENTS } =
    SCENE.RENDER_SPACE;

  // Placing preview
  if (createPhase === "placing" && createAnchorPosition) {
    return (
      <mesh position={createAnchorPosition}>
        <sphereGeometry args={[createRadius, WIREFRAME_SEGMENTS, WIREFRAME_SEGMENTS]} />
        <meshBasicMaterial color={WIREFRAME_COLOR} wireframe transparent opacity={WIREFRAME_OPACITY} />
      </mesh>
    );
  }

  // Confirmed render space (visible = editing)
  if (renderSpace && renderSpace.visible) {
    return (
      <mesh position={renderSpace.center}>
        <sphereGeometry args={[renderSpace.radius, WIREFRAME_SEGMENTS, WIREFRAME_SEGMENTS]} />
        <meshBasicMaterial color={WIREFRAME_COLOR} wireframe transparent opacity={WIREFRAME_OPACITY} />
      </mesh>
    );
  }

  return null;
}
