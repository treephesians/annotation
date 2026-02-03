import { useAnnotations } from "../../hooks/useAnnotations";

export function ModeIndicator() {
  const { interactionMode, rayFixed } = useAnnotations();

  const isAnnotation = interactionMode === "annotation";

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(0, 0, 0, 0.7)",
        padding: "8px 16px",
        borderRadius: 20,
        fontSize: 13,
        fontFamily: "monospace",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isAnnotation ? (rayFixed ? "#00ff00" : "#ffff00") : "#888",
        }}
      />
      <span style={{ color: isAnnotation ? (rayFixed ? "#00ff00" : "#ffff00") : "#888" }}>
        {isAnnotation 
          ? (rayFixed ? "Ray Fixed [F]" : "Annotation Mode") 
          : "Mouse Mode"}
      </span>
      <span style={{ color: "#666", fontSize: 11 }}>[Tab]</span>
    </div>
  );
}
