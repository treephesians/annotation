import { useEffect, useCallback, useMemo } from "react";
import { useCameraControl } from "./useCameraControl";
import { useAnnotations } from "./useAnnotations";
import { useRenderSpaces } from "./useRenderSpaces";
import { useAutoCuboid } from "./useAutoCuboid";

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
    setAnnotationTool,
    adjustDepth,
    toggleRayFixed,
    cancelAnnotation,
    selectedAnnotationId,
    selectAnnotation,
    deleteAnnotation,
  } = useAnnotations();

  const { cancelCreate } = useRenderSpaces();
  const autoCuboidPhase = useAutoCuboid((s) => s.phase);

  const handleEscape = useCallback(() => {
    // Auto cuboid takes priority
    if (autoCuboidPhase !== "idle") {
      useAutoCuboid.getState().cancelCreate();
      return;
    }
    if (interactionMode === "create") {
      cancelCreate();
    } else if (interactionMode === "annotation") {
      cancelAnnotation();
      toggleMode();
    } else if (selectedAnnotationId) {
      selectAnnotation(null);
    }
  }, [autoCuboidPhase, interactionMode, cancelCreate, cancelAnnotation, toggleMode, selectedAnnotationId, selectAnnotation]);

  const handleDelete = useCallback(() => {
    if (interactionMode === "mouse" && selectedAnnotationId) {
      deleteAnnotation(selectedAnnotationId);
    }
  }, [interactionMode, selectedAnnotationId, deleteAnnotation]);

  const handleTab = useCallback(() => {
    if (autoCuboidPhase !== "idle") {
      // Tab during auto cuboid acts like ESC — cancel
      useAutoCuboid.getState().cancelCreate();
    } else if (interactionMode === "create") {
      // Tab in create mode acts like ESC — cancel and go to mouse
      cancelCreate();
    } else {
      toggleMode();
    }
  }, [autoCuboidPhase, interactionMode, toggleMode, cancelCreate]);

  const keyMap = useMemo<KeyMap>(() => {
    const map: KeyMap = {
      // Global
      Tab: { action: handleTab, preventDefault: true },
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
        "1": { action: () => setAnnotationTool("point") },
        "2": { action: () => setAnnotationTool("render-space") },
        "3": { action: () => setAnnotationTool("auto-cuboid") },
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
    handleTab,
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
    setAnnotationTool,
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
