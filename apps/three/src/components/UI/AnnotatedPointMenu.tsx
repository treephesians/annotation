import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useAnnotations, Annotation } from "../../hooks/useAnnotations";
import { useRenderSpaces } from "../../hooks/useRenderSpaces";
import { useCallback } from "react";
import "./css/AnnotatedPointMenu.css";

interface AnnotatedPointMenuProps {
  annotation: Annotation;
  position: THREE.Vector3;
}

interface MenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function MenuItem({ icon, label, onClick, variant = "default" }: MenuItemProps) {
  const className = `menu-item ${variant === "danger" ? "menu-item--danger" : ""}`;

  return (
    <div className={className} onClick={onClick}>
      <span className="menu-item__icon">{icon}</span>
      <span className="menu-item__label">{label}</span>
    </div>
  );
}

export function AnnotatedPointMenu({
  annotation,
  position,
}: AnnotatedPointMenuProps) {
  const deleteAnnotation = useAnnotations((state) => state.deleteAnnotation);
  const selectAnnotation = useAnnotations((state) => state.selectAnnotation);
  const enterCreateMode = useRenderSpaces((state) => state.enterCreateMode);

  const handleDelete = useCallback(() => {
    deleteAnnotation(annotation.id);
  }, [deleteAnnotation, annotation.id]);

  const handleCreate = useCallback(() => {
    enterCreateMode(annotation.position);
    selectAnnotation(null);
  }, [enterCreateMode, annotation.position, selectAnnotation]);

  const handleClose = useCallback(() => {
    selectAnnotation(null);
  }, [selectAnnotation]);

  return (
    <Html
      position={[position.x + 0.15, position.y + 0.1, position.z]}
      style={{ pointerEvents: "auto" }}
      zIndexRange={[100, 0]}
    >
      <div className="context-menu">
        <button className="context-menu__close" onClick={handleClose}>
          ×
        </button>

        <div className="context-menu__header">
          <p className="context-menu__label">{annotation.label}</p>
          <div className="context-menu__coords">
            ({annotation.position.x.toFixed(2)},{" "}
            {annotation.position.y.toFixed(2)},{" "}
            {annotation.position.z.toFixed(2)})
          </div>
        </div>

        <div className="context-menu__body">
          <MenuItem
            icon="📦"
            label="Create"
            onClick={handleCreate}
          />
          <MenuItem
            icon="🗑️"
            label="Delete"
            onClick={handleDelete}
            variant="danger"
          />
        </div>
      </div>
    </Html>
  );
}
