import { useCameraControl } from "../../hooks/useCameraControl";

export function CameraInfo() {
  const { distance, azimuth, elevation } = useCameraControl();

  const toDegrees = (rad: number) => ((rad * 180) / Math.PI).toFixed(1);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 8,
        fontSize: 10,
        fontFamily: "monospace",
        zIndex: 100,
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Camera</div>
      <div>Distance: {distance.toFixed(2)}</div>
      <div>Azimuth: {toDegrees(azimuth)}°</div>
      <div>Elevation: {toDegrees(elevation)}°</div>
    </div>
  );
}
