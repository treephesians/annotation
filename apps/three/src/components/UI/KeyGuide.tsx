import { useAnnotations } from "../../hooks/useAnnotations";

export function KeyGuide() {
  const { interactionMode, currentDepth, rayFixed, selectedAnnotationId } =
    useAnnotations();

  const isAnnotation = interactionMode === "annotation";
  const isMouse = interactionMode === "mouse";
  const isCreate = interactionMode === "create";
  const hasSelection = selectedAnnotationId !== null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 10,
        fontFamily: "monospace",
        zIndex: 100,
        lineHeight: 1.8,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Mode</div>
      <div>
        <kbd>[Tab]</kbd> : {isCreate ? "Cancel Create" : "Toggle Mode"}
      </div>

      <div style={{ fontWeight: "bold", marginTop: 12, marginBottom: 8 }}>
        Camera
      </div>
      <div>
        <kbd>[E]</kbd> / <kbd>[Q]</kbd> : Zoom In / Out
      </div>
      <div>
        <kbd>[W]</kbd> / <kbd>[S]</kbd> : Up / Down
      </div>
      <div>
        <kbd>[A]</kbd> / <kbd>[D]</kbd> : Left / Right
      </div>
      <div>
        <kbd>[R]</kbd> : Reset
      </div>

      {isMouse && (
        <>
          <div
            style={{
              fontWeight: "bold",
              marginTop: 12,
              marginBottom: 8,
              color: "#88ccff",
            }}
          >
            Selection {hasSelection && "(Active)"}
          </div>
          <div>
            <kbd>(Click)</kbd> : Select Pt
          </div>
          {
            hasSelection && (
              <>
                <div>
                  <kbd>[Delete]</kbd> : Delete Pt
                </div>
                <div>
                  <kbd>[Esc]</kbd> : Deselect Pt
                </div>
              </>
            )
          }
        </>
      )}

      {isCreate && (
        <>
          <div
            style={{
              fontWeight: "bold",
              marginTop: 12,
              marginBottom: 8,
              color: "#00ffff",
            }}
          >
            Create
          </div>
          <div>
            <kbd>(Wheel)</kbd> : Resize
          </div>
          <div>
            <kbd>(Click)</kbd> : Confirm
          </div>
          <div>
            <kbd>[Tab]</kbd> / <kbd>[Esc]</kbd> : Cancel
          </div>
        </>
      )}

      {isAnnotation && (
        <>
          <div
            style={{
              fontWeight: "bold",
              marginTop: 12,
              marginBottom: 8,
              color: "#ffff00",
            }}
          >
            Annotation {rayFixed && "(Fixed)"}
          </div>
          <div>
            <kbd>(Move)</kbd> : Aim Ray
          </div>
          <div>
            <kbd>(Wheel)</kbd> / <kbd>+</kbd> <kbd>-</kbd> : Depth
          </div>
          <div>
            <kbd>(Click)</kbd> : Place Point
          </div>
          <div>
            <kbd>[F]</kbd> : Fix / Unfix Ray
          </div>
          <div>
            <kbd>[Esc]</kbd> : Exit Mode
          </div>
          <div style={{ marginTop: 8, color: rayFixed ? "#00ff00" : "#ffff00" }}>
            Depth: {currentDepth.toFixed(1)} {rayFixed && "🔒"}
          </div>
        </>
      )}
    </div>
  );
}
