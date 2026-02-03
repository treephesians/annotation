import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useRef } from "react";
import { PerspectiveView } from "./PerspectiveView";
import { SideView } from "./SideView";
import { TopDownView } from "./TopDownView";
import { SceneObjects } from "../Scene/SceneObjects";
import { CenterPoint } from "../Scene/CenterPoint";
import { CameraInfo } from "../UI/CameraInfo";
import { KeyGuide } from "../UI/KeyGuide";
import { useKeyboard } from "@/hooks/useKeyboard";

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
        fontSize: 12,
        fontFamily: "monospace",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

export function MainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const perspectiveRef = useRef<HTMLDivElement>(null!);
  const sideRef = useRef<HTMLDivElement>(null!);
  const topDownRef = useRef<HTMLDivElement>(null!);

  // Enable keyboard controls
  useKeyboard();

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: "#1a1a1a",
      }}
    >
      {/* UI Overlays */}
      <CameraInfo />
      <KeyGuide />

      {/* View 1: Perspective (70%) */}
      <div
        ref={perspectiveRef}
        style={{
          width: "70%",
          height: "100%",
          borderRight: "1px solid #333",
          position: "relative",
        }}
      >
        <ViewLabel>Main</ViewLabel>
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
          ref={sideRef}
          style={{
            width: "100%",
            height: "50%",
            borderBottom: "1px solid #333",
            position: "relative",
          }}
        >
          <ViewLabel>Side</ViewLabel>
        </div>

        {/* View 3: Top-Down View (bottom half) */}
        <div
          ref={topDownRef}
          style={{
            width: "100%",
            height: "50%",
            position: "relative",
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
        {/* Perspective View */}
        <View track={perspectiveRef}>
          <PerspectiveView />
          <SceneObjects />
          <CenterPoint />
        </View>

        {/* Side View */}
        <View track={sideRef}>
          <SideView />
          <SceneObjects />
          <CenterPoint />
        </View>

        {/* Top-Down View */}
        <View track={topDownRef}>
          <TopDownView />
          <SceneObjects />
          <CenterPoint />
        </View>
      </Canvas>
    </div>
  );
}
