import { useEffect, useCallback, useMemo } from "react";
import { useCameraControl } from "./useCameraControl";
import { useAnnotations } from "./useAnnotations";

interface KeyBinding {
  action: () => void;
  preventDefault?: boolean;
}

type KeyMap = Record<string, KeyBinding>;

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
    selectedAnnotationId,
    selectAnnotation,
    deleteAnnotation,
  } = useAnnotations();

  const handleEscape = useCallback(() => {
    if (interactionMode === "annotation") {
      cancelAnnotation();
      toggleMode();
    } else if (selectedAnnotationId) {
      selectAnnotation(null);
    }
  }, [interactionMode, cancelAnnotation, toggleMode, selectedAnnotationId, selectAnnotation]);

  const handleDelete = useCallback(() => {
    if (interactionMode === "mouse" && selectedAnnotationId) {
      deleteAnnotation(selectedAnnotationId);
    }
  }, [interactionMode, selectedAnnotationId, deleteAnnotation]);

  const keyMap = useMemo<KeyMap>(() => {
    const map: KeyMap = {
      // Global
      Tab: { action: toggleMode, preventDefault: true },
      Escape: { action: handleEscape },
      // Camera
      e: { action: zoomIn },
      q: { action: zoomOut },
      a: { action: rotateLeft },
      d: { action: rotateRight },
      w: { action: rotateUp },
      s: { action: rotateDown },
      r: { action: reset },
    };

    if (interactionMode === "annotation") {
      Object.assign(map, {
        f: { action: toggleRayFixed },
        "+": { action: () => adjustDepth(1) },
        "=": { action: () => adjustDepth(1) },
        "]": { action: () => adjustDepth(1) },
        "-": { action: () => adjustDepth(-1) },
        "[": { action: () => adjustDepth(-1) },
      });
    } else {
      Object.assign(map, {
        Delete: { action: handleDelete },
        Backspace: { action: handleDelete },
      });
    }

    return map;
  }, [
    interactionMode,
    toggleMode,
    handleEscape,
    handleDelete,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    rotateUp,
    rotateDown,
    reset,
    toggleRayFixed,
    adjustDepth,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const binding = keyMap[event.key] ?? keyMap[event.key.toLowerCase()];
      if (!binding) return;

      if (binding.preventDefault) event.preventDefault();
      binding.action();
    },
    [keyMap]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
