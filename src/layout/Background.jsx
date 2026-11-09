import { useEffect, useRef } from "react";
import { LITE } from "@/shared/lite";

export function Background() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let mouseX = w / 2, mouseY = h / 2, targetX = w / 2, targetY = h / 2;

    const cssVar = (name, fallback = "#b971da") =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

    const makeParticle = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.5 + 0.5,
      main: Math.random() > 0.4,
    });

    let count = parseInt(cssVar("--particle-count", "45"), 10) || 45;
    const particles = Array.from({ length: count }, makeParticle);
    let cMain = cssVar("--particle-main"), cSub = cssVar("--particle-sub");
    let cLines = cssVar("--animlines-main");
    let cGlow = parseFloat(cssVar("--particle-glow-radius", "12px")) || 0;
    let cBright = parseFloat(cssVar("--particle-brightness", "1.2")) || 1;

    const syncFromCss = () => {
      const next = parseInt(cssVar("--particle-count", String(count)), 10);
      if (Number.isFinite(next) && next >= 0 && next !== count) {
        if (next > count) for (let i = count; i < next; i++) particles.push(makeParticle());
        else particles.length = next;
        count = next;
      }
      cMain = cssVar("--particle-main");
      cSub = cssVar("--particle-sub");
      cLines = cssVar("--animlines-main");
      cGlow = parseFloat(cssVar("--particle-glow-radius", "12px")) || 0;
      cBright = parseFloat(cssVar("--particle-brightness", "1.2")) || 1;
    };

    let time = 0, frame = 0, last = 0, raf = 0, visible = true;
    const interval = 1000 / (LITE ? 24 : 30);

    const render = (ts) => {
      if (!visible) return;
      raf = requestAnimationFrame(render);
      if (ts - last < interval) return;
      last = ts;
      time += 0.01;
      mouseX += (targetX - mouseX) * 0.15;
      mouseY += (targetY - mouseY) * 0.15;
      if (++frame % 30 === 0) syncFromCss();

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = cLines;
      ctx.lineWidth = 2.5;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        for (let y = 0; y < h; y += 20) {
          const shift = Math.sin(y * 0.01 + time + x * 0.005) * 6;
          if (y === 0) ctx.moveTo(x + shift, y);
          else ctx.lineTo(x + shift, y);
        }
        ctx.stroke();
      }
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0) {
          p.x += (dx / dist) * 0.2;
          p.y += (dy / dist) * 0.2;
        }
        const color = p.main ? cMain : cSub;
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.min(1, p.baseAlpha * cBright);
        ctx.shadowBlur = cGlow > 0 ? cGlow : 0;
        if (cGlow > 0) ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onPointer = (e) => { targetX = e.clientX; targetY = e.clientY; };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) raf = requestAnimationFrame(render);
    };

    // mouse glow (rAF-throttled)
    const glow = glowRef.current;
    let glowPending = false, gx = 0, gy = 0;
    const onMouse = (e) => {
      gx = e.clientX; gy = e.clientY;
      if (glowPending) return;
      glowPending = true;
      requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        glowPending = false;
      });
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("mousemove", onMouse);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(render);
    return () => {
      visible = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas id="studio-bg-canvas" ref={canvasRef} />
      <div className="global-mouse-glow" ref={glowRef} aria-hidden="true" />
    </>
  );
}

