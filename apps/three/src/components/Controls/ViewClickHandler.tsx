import { useThree } from "@react-three/fiber";
import { useCallback, useEffect } from "react";
import * as THREE from "three";
import { useAnnotations, RayState } from "../../hooks/useAnnotations";
import { useRenderSpaces } from "../../hooks/useRenderSpaces";
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
  const {
    createPhase,
    adjustCreateRadius,
    confirmCreate,
    editingId,
    adjustRadius,
  } = useRenderSpaces();

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
    (_event: MouseEvent) => {
      // Placing mode: click confirms render space
      if (createPhase === "placing") {
        confirmCreate();
        return;
      }

      if (interactionMode === "annotation") {
        confirmAnnotation();
      } else {
        selectAnnotation(null);
      }
    },
    [interactionMode, createPhase, confirmAnnotation, confirmCreate, selectAnnotation]
  );

  const handleMouseLeave = useCallback(() => {
    if (interactionMode === "annotation") {
      setRay(null);
    }
  }, [interactionMode, setRay]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const delta = event.deltaY > 0 ? -1 : 1;

      // Placing mode: scroll adjusts create radius
      if (createPhase === "placing") {
        event.preventDefault();
        adjustCreateRadius(delta);
        return;
      }

      // Editing mode: scroll adjusts existing render space radius
      if (editingId) {
        event.preventDefault();
        adjustRadius(delta);
        return;
      }

      // Annotation mode: scroll adjusts depth
      if (interactionMode === "annotation") {
        event.preventDefault();
        adjustDepth(delta);
        return;
      }
    },
    [interactionMode, createPhase, editingId, adjustDepth, adjustCreateRadius, adjustRadius]
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
