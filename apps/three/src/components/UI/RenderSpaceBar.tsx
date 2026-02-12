import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import "./css/RenderSpaceBar.css";

export function RenderSpaceBar() {
  const {
    renderSpace,
    editingId,
    startEditing,
    stopEditing,
    toggleEnabled,
    deleteRenderSpace,
  } = useRenderSpaces();

  if (!renderSpace) return null;

  const isEditing = editingId === renderSpace.id;
  const isEnabled = renderSpace.enabled;

  return (
    <div className="render-space-bar">
      <span className="render-space-bar__label">
        r={renderSpace.radius.toFixed(1)}
      </span>

      {/* Show / Hide wireframe */}
      <button
        className={`render-space-bar__btn ${isEditing ? "render-space-bar__btn--active" : ""}`}
        onClick={() => (isEditing ? stopEditing() : startEditing())}
        title={isEditing ? "Hide wireframe" : "Show wireframe"}
      >
        {isEditing ? "\u25C9" : "\u25CE"}
      </button>

      {/* On / Off clipping */}
      <button
        className={`render-space-bar__btn ${isEnabled ? "render-space-bar__btn--active" : "render-space-bar__btn--off"}`}
        onClick={toggleEnabled}
        title={isEnabled ? "Disable clipping" : "Enable clipping"}
      >
        {"\u23FB"}
      </button>

      {/* Delete */}
      <button
        className="render-space-bar__btn render-space-bar__btn--danger"
        onClick={deleteRenderSpace}
        title="Delete render space"
      >
        {"\u2715"}
      </button>
    </div>
  );
}
