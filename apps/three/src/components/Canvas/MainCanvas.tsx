import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useRef } from "react";
import { PerspectiveView } from "./PerspectiveView";
import { OrthographicView } from "./OrthographicView";
import { SceneObjects } from "../Scene/SceneObjects";
import { CenterPoint } from "../Scene/CenterPoint";
import { CameraInfo } from "../UI/CameraInfo";
import { KeyGuide } from "../UI/KeyGuide";
import { useKeyboard } from "@/hooks/useKeyboard";

export function MainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const view1Ref = useRef<HTMLDivElement>(null!);
  const view2Ref = useRef<HTMLDivElement>(null!);

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
        ref={view1Ref}
        style={{
          width: "70%",
          height: "100%",
          borderRight: "1px solid #333",
        }}
      />

      {/* View 2: Orthographic (30%) */}
      <div
        ref={view2Ref}
        style={{
          width: "30%",
          height: "100%",
        }}
      />

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
        <View track={view1Ref}>
          <PerspectiveView />
          <SceneObjects />
          <CenterPoint />
        </View>

        {/* Orthographic View */}
        <View track={view2Ref}>
          <OrthographicView />
          <SceneObjects />
          <CenterPoint />
        </View>
      </Canvas>
    </div>
  );
}
