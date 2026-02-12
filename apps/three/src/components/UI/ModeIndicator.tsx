import { useAnnotations } from "../../hooks/useAnnotations";
import { CreateModeToolbar } from "./CreateModeToolbar";

export function ModeIndicator() {
  const { interactionMode, rayFixed } = useAnnotations();

  const isAnnotation = interactionMode === "annotation";
  const isCreate = interactionMode === "create";

  let dotColor = "#888";
  let labelColor = "#888";
  let label = "Mouse Mode";

  if (isAnnotation) {
    dotColor = rayFixed ? "#00ff00" : "#ffff00";
    labelColor = dotColor;
    label = rayFixed ? "Ray Fixed [F]" : "Annotation Mode";
  } else if (isCreate) {
    dotColor = "#00ffff";
    labelColor = "#00ffff";
    label = "Create Mode";
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 10,
        pointerEvents: isCreate ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0, 0, 0, 0.7)",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: 13,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dotColor,
          }}
        />
        <span style={{ color: labelColor }}>{label}</span>
        <span style={{ color: "#666", fontSize: 11 }}>[Tab]</span>
      </div>

      {isCreate && <CreateModeToolbar />}
    </div>
  );
}
