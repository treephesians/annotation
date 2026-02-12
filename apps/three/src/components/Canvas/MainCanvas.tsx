import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useRef } from "react";
import { PerspectiveView } from "./PerspectiveView";
import { OrthoView } from "./OrthoView";
import { SceneContent } from "./SceneContent";
import { CameraInfo } from "../UI/CameraInfo";
import { KeyGuide } from "../UI/KeyGuide";
import { ModeIndicator } from "../UI/ModeIndicator";
import { RenderSpaceBar } from "../UI/RenderSpaceBar";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useAnnotations } from "@/hooks/useAnnotations";
import type { ViewType } from "@/types/view";

function ViewLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontFamily: "monospace",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

const VIEW_TYPES: ViewType[] = ["perspective", "side", "topDown"];

export function MainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const viewRefs = {
    perspective: useRef<HTMLDivElement>(null!),
    side: useRef<HTMLDivElement>(null!),
    topDown: useRef<HTMLDivElement>(null!),
  };

  const { interactionMode } = useAnnotations();
  useKeyboard();

  const cursorStyle = interactionMode === "annotation" ? "none" : "default";

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "#1a1a1a",
        cursor: cursorStyle,
      }}
    >
      {/* UI Overlays */}
      <CameraInfo />
      <KeyGuide />

      {/* View 1: Perspective (70%) */}
      <div
        ref={viewRefs.perspective}
        style={{
          width: "70%",
          height: "100%",
          borderRight: "1px solid #333",
          position: "relative",
          cursor: cursorStyle,
        }}
      >
        <ViewLabel>Main</ViewLabel>
        <ModeIndicator />
        <RenderSpaceBar />
      </div>

      {/* Right Panel (30%) - Split into Side and TopDown */}
      <div
        style={{
          width: "30%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* View 2: Side View (top half) */}
        <div
          ref={viewRefs.side}
          style={{
            width: "100%",
            height: "50%",
            borderBottom: "1px solid #333",
            position: "relative",
            cursor: cursorStyle,
          }}
        >
          <ViewLabel>Side</ViewLabel>
        </div>

        {/* View 3: Top-Down View (bottom half) */}
        <div
          ref={viewRefs.topDown}
          style={{
            width: "100%",
            height: "50%",
            position: "relative",
            cursor: cursorStyle,
          }}
        >
          <ViewLabel>Top-Down</ViewLabel>
        </div>
      </div>

      {/* Single Canvas with multiple Views */}
      <Canvas
        eventSource={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      >
        {VIEW_TYPES.map((type) => (
          <View key={type} track={viewRefs[type]}>
            {type === "perspective" ? (
              <PerspectiveView />
            ) : (
              <OrthoView viewType={type} />
            )}
            <SceneContent viewType={type} containerRef={viewRefs[type]} />
          </View>
        ))}
      </Canvas>
    </div>
  );
}
