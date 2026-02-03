export function KeyGuide() {
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
        fontSize: 12,
        fontFamily: "monospace",
        zIndex: 100,
        lineHeight: 1.8,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Camera Controls</div>
      <div>
        <kbd>Q</kbd> / <kbd>E</kbd> : Zoom Out / In
      </div>
      <div>
        <kbd>W</kbd> / <kbd>S</kbd> : Up / Down
      </div>
      <div>
        <kbd>A</kbd> / <kbd>D</kbd> : Left / Right
      </div>
      <div>
        <kbd>R</kbd> : Reset
      </div>
    </div>
  );
}
