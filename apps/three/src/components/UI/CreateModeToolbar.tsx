import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import "./css/CreateModeToolbar.css";

export function CreateModeToolbar() {
  const { createPhase } = useRenderSpaces();
  

  return (
    <div className="create-toolbar">
      <button
        className="create-toolbar__btn"
      >
        Render Space
      </button>
      <button
        className="create-toolbar__btn"
      >
        Auto Cuboid
      </button>
      <button className="create-toolbar__btn" disabled>
        Sphere
      </button>
    </div>
  );
}
