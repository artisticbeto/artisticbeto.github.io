import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { galleryItems, motionItems, piecesData } from "./data";
import "./styles.css";

/* ---------- translations: [en, ar] ---------- */
const T = {
  work: ["WORK ▼", "الأعمال ▼"],
  gallery: ["Gallery", "المعرض"],
  motion: ["Motion", "الحركة"],
  mesh: ["3D/Mesh", "ثلاثي الأبعاد"],
  about: ["About", "نبذة"],
  socials: ["Socials 🌐︎", "التواصل 🌐︎"],
  jobs: ["Film Maker · 3D-Designer · Editor", "صانع أفلام · مصمم ثلاثي الأبعاد · محرر"],
  sub1: ["A working archive of art, 3D and film, canvases, fragments, and the objects that outgrow", "أرشيف عمل من الفن والتصميم ثلاثي الأبعاد والأفلام، لوحات وشظايا وأشياء تكبر"],
  subPre: ["them. Scattered between the ", "عنها. متناثرة بين "],
  screen: ["SCREEN", "الشاشة"],
  studio: ["STUDIO", "الاستوديو"],
  archive: ["Archive", "الأرشيف"],
  n1: ["01 — Gallery", "المعرض — 01"],
  inMotion: ["In motion", "في حركة"],
  n2: ["02 — Process", "العملية — 02"],
  viewer: ["Object viewer", "عارض الأجسام"],
  n3: ["03 — Dimensional", "الأجسام — 03"],
  hint: ["Drag to rotate · Scroll to zoom", "اسحب للتدوير · مرّر للتكبير"],
  viewerP: [
    "Every flat piece has a body. This viewer has most if not all of my 3D-work floating in real space, rotate, inspect the grain, watch the light move across the paint.",
    "لكل قطعة مسطّحة جسد. يضم هذا العارض معظم إن لم يكن كل أعمالي ثلاثية الأبعاد وهي تطفو في فضاء حقيقي، فدوّرها وتفحّص نسيجها وراقب الضوء وهو يتحرك عبر الطلاء.",
  ],
  aboutTitle: ["About me", "نبذة عني"],
  about1: [
    "The name is Beto. I works across painting, editing and digital form, treating the canvas as one material among many. The current body of work moves between 3D-Enviroment and Compositing, built in layers and often re-thought, re-built, re-rendered until the project meet the suited quality.",
    "اسمي بيتو. أعمل بين الرسم والمونتاج والتصميم الرقمي، متعاملاً مع اللوحة كمادة واحدة من مواد عديدة. تتنقل أعمالي الحالية بين البيئات ثلاثية الأبعاد والتركيب المرئي، مبنيّة على طبقات وغالباً ما يُعاد التفكير فيها وبناؤها وعرضها حتى يصل المشروع إلى الجودة المطلوبة.",
  ],
  about2: [
    "Studio views, works-in-progress and finished pieces are documented on Instagram, where it's also going to be behind the scenes.",
    "تُوثَّق لقطات الاستوديو والأعمال قيد التنفيذ والقطع المنجزة على إنستغرام، حيث ستُنشر أيضاً كواليس العمل.",
  ],
  talk: ["Let's talk.", "لنتحدث."],
  copy: ["© 2026 Beto Studio — all works reserved", "© 2026 استوديو بيتو — جميع الأعمال محفوظة"],
};

const HERO_BG_SRC = "cover2.png";
const ABOUT_IMG = "project1.png";

/* ---------- animated background + mouse glow ---------- */
function Background() {
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
    const interval = 1000 / 30;

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

/* ---------- hand-drawn jitter letters ---------- */
function Scribble({ text }) {
  const letters = useMemo(
    () =>
      [...text].map((ch) => ({
        ch,
        sd: (-Math.random() * 5.85).toFixed(2) + "s",
        sdur: (4.7 + Math.random() * 0.35).toFixed(2) + "s",
      })),
    [text]
  );
  return letters.map((l, i) =>
    l.ch === " " ? (
      " "
    ) : (
      <span key={i} className="scribble-letter" style={{ "--sd": l.sd, "--sdur": l.sdur }}>
        {l.ch}
      </span>
    )
  );
}

/* ---------- nav ---------- */
function Nav({ lang, setLang, tr }) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const pick = (e, l) => {
    e.preventDefault();
    setLang(l);
    setLangOpen(false);
  };

  return (
    <svg className="nav-svg" xmlns="http://www.w3.org/2000/svg">
      <foreignObject className="fobject">
        <div className="nav-container">
          <div>
            <a
              href="#"
              className="logo display"
              aria-label="Back to top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }}
            >
              Beto*
            </a>
            <div className={"lang-links" + (langOpen ? " is-open" : "")} ref={langRef}>
              <button
                className="lang-select"
                aria-haspopup="true"
                aria-expanded={langOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setLangOpen((o) => !o);
                }}
              >
                {lang === "ar" ? "AR ▼" : "EN ▼"}
              </button>
              <div className="lang-dropcontent" role="menu">
                <a href="#" role="menuitem" aria-current={lang === "en"} onClick={(e) => pick(e, "en")}>English</a>
                <a href="#" role="menuitem" aria-current={lang === "ar"} onClick={(e) => pick(e, "ar")}>Arabic</a>
              </div>
            </div>
          </div>
          <div className="links mono">
            <div className="work-links">
              <button className="work-select" aria-haspopup="true">{tr("work")}</button>
              <div className="work-dropcontent" role="menu">
                <a href="#work" role="menuitem">{tr("gallery")}</a>
                <a href="#motion" role="menuitem">{tr("motion")}</a>
                <a href="#viewer" role="menuitem">{tr("mesh")}</a>
              </div>
            </div>
            <a href="#about">{tr("about")}</a>
            <a href="#socials">{tr("socials")}</a>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}

/* ---------- hero ---------- */
function Hero({ tr }) {
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${HERO_BG_SRC}')` }} />
      <div className="hero-bg-overlay" />
      <div className="hero-all">
        <div className="jobsytrans">
          <svg className="jobsy" viewBox="0 0 600 30" width="100%" height="30" aria-label="Film Maker · 3D-Designer · Editor">
            <text x="50%" y="50%" className="jobsy-text glowy">{tr("jobs")}</text>
          </svg>
        </div>
        <div className="displaytrans">
          <h1 className="display">
            <em className="pablosso glowy"><Scribble text="Pablo " /></em>
            <em className="betosso">Beto</em>
            <em className="pablosso glowy"><Scribble text="sso" /></em>
          </h1>
        </div>
        <div className="subtrans">
          <svg className="sub-all" viewBox="0 0 900 60" width="100%" height="60" aria-label="A working archive of art, 3D and film — canvases, fragments, and the objects that outgrow them. Scattered between the SCREEN & STUDIO.">
            <text className="sub-text1">{tr("sub1")}</text>
            <text className="sub-text2">
              <tspan>{tr("subPre")}</tspan>
              <tspan className="glow-screen glowy">{tr("screen")}</tspan>
              <tspan>{" & "}</tspan>
              <tspan className="glow-screen glowy">{tr("studio")}</tspan>
              <tspan>.</tspan>
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ---------- gallery ---------- */
const Placeholder = ({ video }) => (
  <div className={"swatch placeholder-swatch" + (video ? " placeholder-video" : "")}>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {video ? (
        <>
          <rect x="2" y="5" width="14" height="14" rx="2" />
          <path d="M16 9.2 21 6v12l-5-3.2" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </>
      )}
    </svg>
    <span className="placeholder-label">{video ? "Video placeholder" : "Media placeholder"}</span>
  </div>
);

function LazyIframe({ src, title }) {
  const ref = useRef(null);
  const [url, setUrl] = useState(undefined);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const origin = window.location.origin !== "null" ? window.location.origin : "*";
          setUrl(src + "&origin=" + encodeURIComponent(origin));
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [src]);
  return (
    <iframe
      ref={ref}
      src={url}
      title={title}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function GalleryItem({ item, onOpen }) {
  const { title, meta, src, video, iframe } = item;
  const [failed, setFailed] = useState(false);
  const zoomable = !iframe && !video && !!src && src.trim() !== "";
  return (
    <div
      className={"g-item" + (zoomable ? " has-lightbox" : "")}
      onClick={zoomable ? () => onOpen(src, title, meta) : undefined}
    >
      {iframe ? (
        <LazyIframe src={iframe} title={title} />
      ) : video ? (
        <video src={video} autoPlay loop muted playsInline />
      ) : src ? (
        <img
          className="swatch"
          src={src}
          alt={`${title} — ${meta}`}
          loading="lazy"
          data-failed={failed ? "true" : undefined}
          onError={() => setFailed(true)}
        />
      ) : (
        <Placeholder />
      )}
      <div className="g-caption">
        <span>{title}</span>
        <span>{meta}</span>
      </div>
    </div>
  );
}

const COLLAPSED_HEIGHT = 460;

function Gallery({ onOpen, tr }) {
  const [collapsed, setCollapsed] = useState(true);
  const [height, setHeight] = useState(COLLAPSED_HEIGHT);
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  const toggle = () => {
    if (collapsed) {
      setHeight(galleryRef.current.scrollHeight);
      setCollapsed(false);
    } else {
      setHeight(containerRef.current.scrollHeight);
      setCollapsed(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(COLLAPSED_HEIGHT)));
    }
  };

  return (
    <section id="work">
      <div className="section-head">
        <h2 className="display reveal-left">{tr("archive")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n1")}</div>
      </div>
      <div
        ref={containerRef}
        className={"gallery-container" + (collapsed ? " is-collapsed" : "")}
        style={{ height }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "height" && !collapsed) setHeight("auto");
        }}
      >
        <div className="gallery" ref={galleryRef}>
          {galleryItems.map((item, i) => (
            <GalleryItem key={i} item={item} onOpen={onOpen} />
          ))}
        </div>
        <div className="fade-veil" />
      </div>
      <div className="show-more-wrapper">
        <button className="show-more-btn mono" onClick={toggle}>
          {collapsed ? "Show more" : "Show less"}
        </button>
      </div>
    </section>
  );
}

/* ---------- lightbox (wheel zoom + drag pan) ---------- */
function Lightbox({ data, onClose }) {
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

  const down = (e) => {
    if (e.button !== 0 || st.current.scale <= 1) return;
    Object.assign(st.current, { dragging: true, sx: e.clientX, sy: e.clientY });
    e.currentTarget.classList.add("is-dragging");
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    const s = st.current;
    if (!s.dragging || s.scale <= 1) return;
    s.x += e.clientX - s.sx;
    s.y += e.clientY - s.sy;
    s.sx = e.clientX;
    s.sy = e.clientY;
    clamp();
    apply(false);
  };
  const up = (e) => {
    if (!st.current.dragging) return;
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
      <div className="lightbox-caption">
        <span>{data.title}</span>
        <span>{data.meta}</span>
      </div>
    </div>
  );
}

/* ---------- motion strip ---------- */
function Motion({ tr }) {
  return (
    <section id="motion">
      <div className="section-head">
        <h2 className="display reveal-left">{tr("inMotion")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n2")}</div>
      </div>
      <div className="motion-strip">
        {motionItems.map(({ label, src, video }, i) => (
          <div className="motion-item" key={i}>
            {video ? (
              <video src={video} muted loop playsInline autoPlay />
            ) : src ? (
              <img src={src} alt={label} loading="lazy" />
            ) : (
              <Placeholder video />
            )}
            <div className="motion-label">{label}</div>
            <div className="play-dot" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 3D piece carousel ---------- */
function Carousel({ active, onSelect }) {
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

/* ---------- 3D viewer (three.js) ---------- */
function makePlaceholderTexture(label) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 640), h = (canvas.height = 800);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#221d18";
  ctx.lineWidth = 26;
  for (let x = -h; x < w; x += 46) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke();
  }
  ctx.strokeStyle = "#2c2822";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  const iw = 170, ih = 170, ix = w / 2 - iw / 2, iy = h / 2 - ih / 2 - 46;
  ctx.strokeStyle = "#8a8175";
  ctx.lineWidth = 6;
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.beginPath(); ctx.arc(ix + iw * 0.28, iy + ih * 0.3, iw * 0.09, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ix + iw, iy + ih * 0.66);
  ctx.lineTo(ix + iw * 0.6, iy + ih * 0.3);
  ctx.lineTo(ix, iy + ih);
  ctx.stroke();
  ctx.fillStyle = "#8a8175";
  ctx.textAlign = "center";
  ctx.font = "600 26px 'Courier New', monospace";
  ctx.fillText("MODEL PLACEHOLDER", w / 2, iy + ih + 66);
  if (label) {
    ctx.font = "400 20px 'Courier New', monospace";
    ctx.globalAlpha = 0.7;
    ctx.fillText(label, w / 2, iy + ih + 100);
    ctx.globalAlpha = 1;
  }
  return new THREE.CanvasTexture(canvas);
}

function disposeMesh(obj) {
  obj?.traverse((c) => {
    if (!c.isMesh) return;
    c.geometry?.dispose();
    [].concat(c.material || []).forEach((m) => { m.map?.dispose(); m.dispose(); });
  });
}

function Viewer({ tr }) {
  const holderRef = useRef(null);
  const apiRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const holder = holderRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, holder.clientWidth / holder.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(holder.clientWidth, holder.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    holder.insertBefore(renderer.domElement, holder.firstChild);

    scene.add(new THREE.HemisphereLight(0xffefe0, 0x1a1520, 0.9));
    const light = (color, intensity, x, y, z, shadow) => {
      const l = new THREE.DirectionalLight(color, intensity);
      l.position.set(x, y, z);
      if (shadow) {
        l.castShadow = true;
        l.shadow.mapSize.set(1024, 1024);
        l.shadow.bias = -0.0001;
      }
      scene.add(l);
    };
    light(0xfff3e0, 2.2, 4, 6, 4, true);
    light(0x768ca3, 2, -4, 0, 3);
    light(0xb971da, 1.8, -3, 4, -4);
    light(0xd1a374, 1.3, 0, -5, 2);

    const frameGroup = new THREE.Group();
    scene.add(frameGroup);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 4, 1, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide })
    );
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 4.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0d0b09, roughness: 0.8 })
    );
    edge.position.z = -0.04;
    frameGroup.add(plane, edge);

    const pos = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9622d, size: 0.02, transparent: true, opacity: 0.5 })));
    camera.position.set(0, 0, 6);

    const loader = new GLTFLoader();
    let current = null, loadId = 0;

    const showPlaceholder = (name) => {
      plane.visible = edge.visible = true;
      plane.material.map?.dispose();
      plane.material.map = makePlaceholderTexture(name);
      plane.material.needsUpdate = true;
    };

    apiRef.current = {
      loadPiece(piece) {
        const id = ++loadId;
        if (current) {
          frameGroup.remove(current);
          disposeMesh(current);
          current = null;
        }
        if (!piece.modelSrc) return showPlaceholder(piece.name);
        plane.visible = edge.visible = false;
        loader.load(
          piece.modelSrc,
          (gltf) => {
            if (id !== loadId) return disposeMesh(gltf.scene);
            current = gltf.scene;
            const box = new THREE.Box3().setFromObject(current);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            current.position.sub(center);
            const max = Math.max(size.x, size.y, size.z);
            if (max > 0) current.scale.setScalar(3.2 / max);
            frameGroup.add(current);
          },
          undefined,
          (err) => {
            if (id !== loadId) return;
            console.error("Failed to load 3D model:", err);
            showPlaceholder(piece.name);
          }
        );
      },
    };

    // interaction
    let dragging = false, prevX = 0, prevY = 0;
    let rotY = 0.3, rotX = -0.15, targetY = 0.3, targetX = -0.15, zoom = 6;
    const el = renderer.domElement;
    const onDown = (e) => { dragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = (e) => {
      if (!dragging) return;
      targetY += (e.clientX - prevX) * 0.006;
      targetX = Math.max(-1, Math.min(1, targetX + (e.clientY - prevY) * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onWheel = (e) => {
      e.preventDefault();
      zoom = Math.max(3, Math.min(10, zoom + e.deltaY * 0.003));
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    el.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const w = holder.clientWidth, h = holder.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(holder);

    // render loop only while visible
    let inView = true, running = false, raf = 0;
    const loop = () => {
      if (!inView || document.hidden) { running = false; return; }
      raf = requestAnimationFrame(loop);
      rotY += (targetY - rotY) * 0.08;
      rotX += (targetX - rotX) * 0.08;
      if (!dragging) targetY += 0.0025;
      frameGroup.rotation.y = rotY;
      frameGroup.rotation.x = rotX;
      camera.position.z += (zoom - camera.position.z) * 0.1;
      renderer.render(scene, camera);
    };
    const kick = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (inView = en.isIntersecting));
      kick();
    }, { threshold: 0.01 });
    io.observe(holder);
    document.addEventListener("visibilitychange", kick);
    kick();

    return () => {
      inView = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      disposeMesh(current);
      renderer.dispose();
      el.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.loadPiece(piecesData[active]);
  }, [active]);

  return (
    <section id="viewer" className="viewer-section">
      <div className="section-head">
        <h2 className="display reveal-right">{tr("viewer")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n3")}</div>
      </div>
      <div className="viewer-wrap">
        <div id="viewer-canvas-holder" ref={holderRef}>
          <div className="viewer-hint mono">{tr("hint")}</div>
        </div>
        <div className="viewer-controls">
          <p className="reveal-up">{tr("viewerP")}</p>
          <div className="piece-list">
            <Carousel active={active} onSelect={setActive} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- about + footer ---------- */
const SOCIALS = [
  {
    label: "Instagram", href: "https://www.instagram.com/artistic.beto/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok", href: "https://www.tiktok.com/@artistic.beto",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 2h-3v13.1a2.6 2.6 0 1 1-2.1-2.55V9.5A5.6 5.6 0 1 0 16.5 15V8.9a6.6 6.6 0 0 0 3.9 1.27V7.14A3.85 3.85 0 0 1 16.5 3.3V2Z" />
      </svg>
    ),
  },
  {
    label: "X", href: "https://x.com/artisticbeto",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.62-6.04L5.94 21H2.92l7.06-8.07L2.25 3h6.05l4.18 5.53L17.53 3Zm-1.06 16.2h1.67L7.6 4.71H5.81l10.66 14.49Z" />
      </svg>
    ),
  },
  {
    label: "Email", href: "mailto:aurtisticbeto@gmail.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" />
      </svg>
    ),
  },
  {
    label: "Linktree", href: "https://linktr.ee/artisticbeto",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 10.5 6.8 5.3M12 10.5l5.2-5.2M12 10.5V21M4.5 12.4h15" />
      </svg>
    ),
  },
];

function About({ tr }) {
  return (
    <section id="about">
      <div className="about-grid">
        <div className="about-figure">
          <img src={ABOUT_IMG} alt="Beto Studio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="about-text">
          <div className="display reveal-right">{tr("aboutTitle")}</div>
          <p className="reveal-up">{tr("about1")}</p>
          <p className="reveal-up" style={{ "--rd": ".12s" }}>{tr("about2")}</p>
        </div>
      </div>
    </section>
  );
}

function Footer({ tr }) {
  return (
    <footer id="socials">
      <div className="display reveal-left">{tr("talk")}</div>
      <div className="foot-links reveal-up">
        {SOCIALS.map(({ label, href, icon }) => {
          const external = href.startsWith("http");
          return (
            <a key={label} href={href} aria-label={label} title={label} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
              <span className="social-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </footer>
  );
}

/* ---------- app ---------- */
export default function App() {
  const [lang, setLang] = useState("en");
  const [lb, setLb] = useState({ open: false, src: "", title: "", meta: "" });
  const tr = (k) => T[k][lang === "ar" ? 1 : 0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) history.replaceState(null, document.title, window.location.pathname + window.location.search);
    window.scrollTo(0, 0);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.target.classList.toggle("in-view", en.isIntersecting)),
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".hero, .reveal-left, .reveal-right, .reveal-up").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const openLightbox = (src, title, meta) => setLb({ open: true, src, title, meta });
  const closeLightbox = () => setLb((s) => (s.open ? { ...s, open: false } : s));

  return (
    <>
      <Background />
      <div className="studio">
        <div className="edge-fade edge-fade-top" aria-hidden="true" />
        <div className="edge-fade edge-fade-bottom" aria-hidden="true" />
        <Nav lang={lang} setLang={setLang} tr={tr} />
        <Hero tr={tr} />
        <Gallery onOpen={openLightbox} tr={tr} />
        <Motion tr={tr} />
        <Viewer tr={tr} />
        <About tr={tr} />
        <Footer tr={tr} />
        <div className="copyright display mono">{tr("copy")}</div>
        <Lightbox data={lb} onClose={closeLightbox} />
      </div>
    </>
  );
}
