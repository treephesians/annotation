import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import "./css/CreateModeToolbar.css";

export function CreateModeToolbar() {
  const { createPhase, selectShape } = useRenderSpaces();

  // Only show shape buttons during selecting-shape phase
  if (createPhase !== "selecting-shape") return null;

  return (
    <div className="create-toolbar">
      <button
        className="create-toolbar__btn"
        onClick={() => selectShape("render-space")}
      >
        Render Space
      </button>
      <button className="create-toolbar__btn" disabled>
        Cuboid
      </button>
      <button className="create-toolbar__btn" disabled>
        Sphere
      </button>
    </div>
  );
}
