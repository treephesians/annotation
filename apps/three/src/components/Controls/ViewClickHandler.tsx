import { useThree } from "@react-three/fiber";
import { useCallback, useEffect } from "react";
import * as THREE from "three";
import { useAnnotations, RayState } from "../../hooks/useAnnotations";
import type { ViewType } from "@/types/view";

interface ViewClickHandlerProps {
  viewType: ViewType;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ViewClickHandler({
  viewType,
  containerRef,
}: ViewClickHandlerProps) {
  const { camera } = useThree();
  const { setRay, interactionMode, adjustDepth, confirmAnnotation, selectAnnotation } = useAnnotations();

  const createRay = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Convert to NDC
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Create raycaster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const rayState: RayState = {
        origin: raycaster.ray.origin.clone(),
        direction: raycaster.ray.direction.clone(),
        viewType,
      };

      setRay(rayState);
    },
    [camera, containerRef, setRay, viewType]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (interactionMode !== "annotation") return;
      createRay(event);
    },
    [interactionMode, createRay]
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (interactionMode === "annotation") {
        // In annotation mode, click confirms the annotation
        confirmAnnotation();
      } else {
        // In mouse mode, clicking on empty space deselects
        // Note: clicks on annotations are handled by Annotations component with stopPropagation
        selectAnnotation(null);
      }
    },
    [interactionMode, confirmAnnotation, selectAnnotation]
  );

  const handleMouseLeave = useCallback(() => {
    if (interactionMode === "annotation") {
      setRay(null);
    }
  }, [interactionMode, setRay]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (interactionMode !== "annotation") return;

      event.preventDefault();
      const delta = event.deltaY > 0 ? -1 : 1;
      adjustDepth(delta);
    },
    [interactionMode, adjustDepth]
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleMouseMove, handleClick, handleMouseLeave, handleWheel]);

  return null;
}
