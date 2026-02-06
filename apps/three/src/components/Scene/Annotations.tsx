import { ThreeEvent } from "@react-three/fiber";
import { useAnnotations, Annotation } from "../../hooks/useAnnotations";
import { AnnotatedPointMenu } from "../UI/AnnotatedPointMenu";

interface AnnotationMeshProps {
  annotation: Annotation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  interactionMode: "mouse" | "annotation";
  viewType: "perspective" | "side" | "topDown";
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

  // Selected: yellow and slightly larger, Normal: white
  const color = isSelected ? "#ffff00" : "#ffffff";
  const scale = isSelected ? 1.3 : 1;

  return (
    <group>
      <mesh
        position={annotation.position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={scale}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 3 : 2}
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

export function Annotations({viewType}: {viewType: "perspective" | "side" | "topDown"}) {
  const annotations = useAnnotations((state) => state.annotations);
  const selectedAnnotationId = useAnnotations(
    (state) => state.selectedAnnotationId
  );
  const interactionMode = useAnnotations((state) => state.interactionMode);
  const selectAnnotation = useAnnotations((state) => state.selectAnnotation);

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
