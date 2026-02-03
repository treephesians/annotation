import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useRef } from "react";
import { PerspectiveView } from "./PerspectiveView";
import { SceneObjects } from "../Scene/SceneObjects";
import { CenterPoint } from "../Scene/CenterPoint";
import { OrthographicView } from "./OrthographicView";

export function MainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const view1Ref = useRef<HTMLDivElement>(null!);
  const view2Ref = useRef<HTMLDivElement>(null!);

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
