import { useEffect, useCallback } from "react";
import { useCameraControl } from "./useCameraControl";

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

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
    [zoomIn, zoomOut, rotateLeft, rotateRight, rotateUp, rotateDown, reset]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
