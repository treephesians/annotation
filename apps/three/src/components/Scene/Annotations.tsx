import { ThreeEvent } from "@react-three/fiber";
import { useShallow } from "zustand/react/shallow";
import { useAnnotations, Annotation } from "../../hooks/useAnnotations";
import { AnnotatedPointMenu } from "../UI/AnnotatedPointMenu";
import { SCENE } from "@/constants/scene";
import type { ViewType, InteractionMode } from "@/types/view";

interface AnnotationMeshProps {
  annotation: Annotation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  interactionMode: InteractionMode;
  viewType: ViewType;
}

function AnnotationMesh({
  annotation,
  isSelected,
  onSelect,
  interactionMode,
  viewType,
}: AnnotationMeshProps) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Only allow selection in mouse mode
    if (interactionMode !== "mouse") return;

    event.stopPropagation();
    onSelect(annotation.id);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (interactionMode !== "mouse") return;
    event.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    if (interactionMode !== "mouse") return;
    document.body.style.cursor = "default";
  };

  const color = isSelected
    ? SCENE.ANNOTATION.SELECTED_COLOR
    : SCENE.ANNOTATION.COLOR;
  const scale = isSelected ? SCENE.ANNOTATION.SELECTED_SCALE : 1;
  const emissiveIntensity = isSelected
    ? SCENE.ANNOTATION.SELECTED_EMISSIVE_INTENSITY
    : SCENE.ANNOTATION.EMISSIVE_INTENSITY;

  return (
    <group>
      <mesh
        position={annotation.position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={scale}
      >
        <sphereGeometry
          args={[SCENE.ANNOTATION.POINT_RADIUS, SCENE.ANNOTATION.SEGMENTS, SCENE.ANNOTATION.SEGMENTS]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Show context menu when selected */}
      {isSelected && viewType === "perspective" && (
        <AnnotatedPointMenu
          annotation={annotation}
          position={annotation.position}
        />
      )}
    </group>
  );
}

export function Annotations({ viewType }: { viewType: ViewType }) {
  const { annotations, selectedAnnotationId, interactionMode, selectAnnotation } =
    useAnnotations(
      useShallow((state) => ({
        annotations: state.annotations,
        selectedAnnotationId: state.selectedAnnotationId,
        interactionMode: state.interactionMode,
        selectAnnotation: state.selectAnnotation,
      }))
    );

  return (
    <>
      {annotations.map((annotation) => (
        <AnnotationMesh
          key={annotation.id}
          annotation={annotation}
          isSelected={selectedAnnotationId === annotation.id}
          onSelect={selectAnnotation}
          interactionMode={interactionMode}
          viewType={viewType}
        />
      ))}
    </>
  );
}
