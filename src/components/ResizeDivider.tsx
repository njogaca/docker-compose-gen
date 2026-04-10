"use client";

import { useCallback, useRef } from "react";

interface Props {
  onResize: (delta: number) => void;
}

export default function ResizeDivider({ onResize }: Props) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onResize(delta);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1.5 shrink-0 bg-dark-400 hover:bg-green-500/40 active:bg-green-500/60 cursor-col-resize transition-colors group flex items-center justify-center"
      title="Drag to resize"
    >
      <div className="w-px h-8 bg-dark-200 group-hover:bg-green-400/60 transition-colors rounded-full" />
    </div>
  );
}
