import { useRef } from "react";
import { piecesData } from "@/shared/data";

export function Carousel({ active, onSelect }) {
  const N = piecesData.length;
  const ITEM_H = 36;
  const cur = useRef(active);
  cur.current = active;
  const drag = useRef({ on: false, startY: 0, moved: false, idx: -1 });

  const go = (i) => {
    const next = ((i % N) + N) % N;
    cur.current = next;
    onSelect(next);
  };

  return (
    <div className="piece-carousel">
      <button className="carousel-arrow" aria-label="Previous piece" onClick={() => go(cur.current - 1)}>&#9650;</button>
      <div
        className="carousel-viewport"
        onPointerDown={(e) => {
          const item = e.target.closest(".carousel-item");
          drag.current = { on: true, startY: e.clientY, moved: false, idx: item ? Number(item.dataset.i) : -1 };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.style.cursor = "grabbing";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.on) return;
          const dy = d.startY - e.clientY;
          if (Math.abs(dy) >= 25) {
            d.moved = true;
            go(cur.current + (dy > 0 ? 1 : -1));
            d.startY = e.clientY;
          }
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d.on) return;
          d.on = false;
          e.currentTarget.style.cursor = "pointer";
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          if (!d.moved && d.idx !== -1) go(d.idx);
        }}
        onPointerCancel={() => (drag.current.on = false)}
      >
        <div className="carousel-track">
          {piecesData.map((p, i) => {
            let diff = i - active;
            if (diff > N / 2) diff -= N;
            if (diff < -N / 2) diff += N;
            const a = Math.abs(diff);
            return (
              <button
                key={i}
                data-i={i}
                className={"carousel-item" + (diff === 0 ? " active" : "")}
                style={{
                  transform: `translate3d(0, ${diff * ITEM_H}px, 0) scale(${Math.max(0.7, 1 - a * 0.15)})`,
                  opacity: Math.max(0.2, 1 - a * 0.3),
                }}
              >
                {p.name} <span>{String(i + 1).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button className="carousel-arrow" aria-label="Next piece" onClick={() => go(cur.current + 1)}>&#9660;</button>
    </div>
  );
}

