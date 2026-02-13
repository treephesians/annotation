import { useAnnotations } from "../../hooks/useAnnotations";
import { useAutoCuboid } from "../../hooks/useAutoCuboid";
import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import type { AnnotationTool } from "@/types/view";

const TOOL_LABELS: Record<AnnotationTool, string> = {
  point: "Point",
  "render-space": "Render Space",
  "auto-cuboid": "Auto Cuboid",
};

const TOOL_KEYS: Record<AnnotationTool, string> = {
  point: "1",
  "render-space": "2",
  "auto-cuboid": "3",
};

const TOOL_COLORS: Record<AnnotationTool, string> = {
  point: "#ffff00",
  "render-space": "#00ffff",
  "auto-cuboid": "#00ff88",
};

export function ModeIndicator() {
  const { interactionMode, annotationTool, rayFixed } = useAnnotations();
  const autoCuboidPhase = useAutoCuboid((s) => s.phase);
  const createPhase = useRenderSpaces((s) => s.createPhase);

  const isAnnotation = interactionMode === "annotation";
  const isCreate = interactionMode === "create";

  let dotColor = "#888";
  let labelColor = "#888";
  let label = "Mouse Mode";
  let subLabel = "";

  if (isCreate && createPhase === "placing") {
    dotColor = "#00ffff";
    labelColor = "#00ffff";
    label = "Render Space: Placing";
    subLabel = "Scroll to resize, Click to confirm";
  } else if (isAnnotation) {
    const toolColor = TOOL_COLORS[annotationTool];
    dotColor = rayFixed ? "#00ff00" : toolColor;
    labelColor = dotColor;
    label = `Annotation — ${TOOL_LABELS[annotationTool]} [${TOOL_KEYS[annotationTool]}]`;

    if (rayFixed) {
      subLabel = "Ray Fixed [F]";
    } else if (autoCuboidPhase === "preview") {
      subLabel = "Click to confirm, Esc to cancel";
    }
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
        gap: 4,
        zIndex: 10,
        pointerEvents: "none",
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

      {subLabel && (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            padding: "4px 12px",
            borderRadius: 12,
            fontSize: 11,
            fontFamily: "monospace",
            color: "#aaa",
          }}
        >
          {subLabel}
        </div>
      )}

      {isAnnotation && (
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 2,
          }}
        >
          {(Object.keys(TOOL_LABELS) as AnnotationTool[]).map((tool) => (
            <div
              key={tool}
              style={{
                background:
                  annotationTool === tool
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.4)",
                border:
                  annotationTool === tool
                    ? `1px solid ${TOOL_COLORS[tool]}`
                    : "1px solid rgba(255,255,255,0.1)",
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 11,
                fontFamily: "monospace",
                color: annotationTool === tool ? TOOL_COLORS[tool] : "#666",
              }}
            >
              {TOOL_KEYS[tool]} {TOOL_LABELS[tool]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
