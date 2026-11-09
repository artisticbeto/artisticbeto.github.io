import { useEffect, useRef } from "react";
import { isVideoSrc, videoSources } from "@/shared/media";

export function Lightbox({ data, onClose }) {
  const boxRef = useRef(null);
  const imgRef = useRef(null);
  const st = useRef({ scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0 });

  const apply = (animate = true) => {
    const img = imgRef.current;
    if (!img) return;
    const { x, y, scale } = st.current;
    img.style.transition = animate ? "transform 0.1s ease-out" : "none";
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    img.classList.toggle("is-zoomed", scale > 1);
  };
  const clamp = () => {
    const r = imgRef.current.getBoundingClientRect();
    const mx = Math.max(0, (r.width - window.innerWidth) / 2 + 40);
    const my = Math.max(0, (r.height - window.innerHeight) / 2 + 40);
    st.current.x = Math.min(mx, Math.max(-mx, st.current.x));
    st.current.y = Math.min(my, Math.max(-my, st.current.y));
  };
  const reset = () => {
    Object.assign(st.current, { scale: 1, x: 0, y: 0 });
    apply(false);
  };

  useEffect(() => {
    document.body.style.overflow = data.open ? "hidden" : "";
    if (!data.open) reset();
  }, [data.open]);

  useEffect(() => {
    const onKey = (e) => (e.key === "Escape" || e.key === "Esc") && onClose();
    const onWheel = (e) => {
      if (!data.open) return;
      e.preventDefault();
      const s = st.current;
      const r = imgRef.current.getBoundingClientRect();
      const px = e.clientX - (r.left + r.width / 2);
      const py = e.clientY - (r.top + r.height / 2);
      const next = Math.min(4, Math.max(1, s.scale * (e.deltaY < 0 ? 1.25 : 0.8)));
      if (next === s.scale) return;
      const ratio = next / s.scale;
      s.x -= px * (ratio - 1);
      s.y -= py * (ratio - 1);
      s.scale = next;
      if (next === 1) { s.x = 0; s.y = 0; } else clamp();
      apply(true);
    };
    const box = boxRef.current;
    window.addEventListener("keydown", onKey);
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      box.removeEventListener("wheel", onWheel);
    };
  }, [data.open, onClose]);

  const ptrs = useRef(new Map());
  const pinch = useRef(0);
  const spread = () => {
    const [p, q] = [...ptrs.current.values()];
    return Math.hypot(p.x - q.x, p.y - q.y);
  };
  const down = (e) => {
    const s = st.current;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ptrs.current.size === 2) pinch.current = spread();
    else if (e.button === 0 && s.scale > 1) {
      Object.assign(s, { dragging: true, sx: e.clientX, sy: e.clientY });
      e.currentTarget.classList.add("is-dragging");
    }
  };
  const move = (e) => {
    const s = st.current;
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2) {
      const d = spread();
      s.scale = Math.min(4, Math.max(1, s.scale * (d / pinch.current)));
      pinch.current = d;
      if (s.scale === 1) { s.x = 0; s.y = 0; } else clamp();
      apply(false);
      return;
    }
    if (!s.dragging || s.scale <= 1) return;
    s.x += e.clientX - s.sx;
    s.y += e.clientY - s.sy;
    s.sx = e.clientX;
    s.sy = e.clientY;
    clamp();
    apply(false);
  };
  const up = (e) => {
    ptrs.current.delete(e.pointerId);
    st.current.dragging = false;
    e.currentTarget.classList.remove("is-dragging");
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={boxRef}
      className={"lightbox" + (data.open ? " is-open" : "")}
      onClick={(e) => {
        if (!e.target.closest(".lightbox-img") && !e.target.closest(".lightbox-caption")) onClose();
      }}
    >
      <button
        className="lightbox-close"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        &times;
      </button>
      {isVideoSrc(data.src) ? (
        // Only mount the video while open, so a closed lightbox doesn't keep decoding it
        data.open ? (
          <video
            ref={imgRef}
            className="lightbox-img"
            aria-label={data.title}
            autoPlay
            loop
            muted
            playsInline
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            {videoSources(data.src).map((s) => (
              <source key={s.type} src={s.src} type={s.type} />
            ))}
          </video>
        ) : null
      ) : (
        <img
          ref={imgRef}
          className="lightbox-img"
          src={data.src || undefined}
          alt={data.title}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      )}
      <div className="lightbox-caption">
        <span>{data.title}</span>
        <span>{data.meta}</span>
      </div>
    </div>
  );
}

