import { useEffect, useCallback } from "react";
import { useCameraControl } from "./useCameraControl";
import { useAnnotations } from "./useAnnotations";

export function useKeyboard() {
  const {
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    rotateUp,
    rotateDown,
    reset,
  } = useCameraControl();

  const {
    interactionMode,
    toggleMode,
    adjustDepth,
    toggleRayFixed,
    cancelAnnotation,
  } = useAnnotations();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Tab to toggle mode
      if (event.key === "Tab") {
        event.preventDefault();
        toggleMode();
        return;
      }

      // Escape to exit annotation mode
      if (event.key === "Escape" && interactionMode === "annotation") {
        cancelAnnotation();
        toggleMode();
        return;
      }

      // Annotation mode controls
      if (interactionMode === "annotation") {
        switch (event.key) {
          case "f":
          case "F":
            toggleRayFixed();
            return;
          case "+":
          case "=":
          case "]":
            adjustDepth(1);
            return;
          case "-":
          case "[":
            adjustDepth(-1);
            return;
        }
      }

      const key = event.key.toLowerCase();

      // Camera controls
      switch (key) {
        case "e":
          zoomIn();
          break;
        case "q":
          zoomOut();
          break;
        case "a":
          rotateLeft();
          break;
        case "d":
          rotateRight();
          break;
        case "w":
          rotateUp();
          break;
        case "s":
          rotateDown();
          break;
        case "r":
          reset();
          break;
      }
    },
    [
      zoomIn,
      zoomOut,
      rotateLeft,
      rotateRight,
      rotateUp,
      rotateDown,
      reset,
      interactionMode,
      toggleMode,
      adjustDepth,
      toggleRayFixed,
      cancelAnnotation,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
