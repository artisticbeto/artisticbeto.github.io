import { useEffect, useState } from "react";
import "@/styles.css";
import "@/mobile.css";
import { T } from "@/shared/i18n";
import { Background } from "@/layout/Background";
import { Nav } from "@/features/nav/Nav";
import { Hero } from "@/features/hero/Hero";
import { Gallery } from "@/features/gallery/Gallery";
import { Motion } from "@/features/motion/Motion";
import { Viewer } from "@/features/viewer/Viewer";
import { About } from "@/features/about/About";
import { Footer } from "@/features/footer/Footer";
import { Lightbox } from "@/features/lightbox/Lightbox";
import { LazyMount } from "@/shared/LazyMount";
import { observeReveals } from "@/shared/reveal";

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

    return observeReveals();
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
      <LazyMount id="work" minHeight={900}>
        <Gallery onOpen={openLightbox} tr={tr} />
      </LazyMount>
      <LazyMount id="motion" minHeight={600}>
        <Motion tr={tr} />
      </LazyMount>
      <LazyMount id="viewer" minHeight={600}>
        <Viewer tr={tr} />
       </LazyMount>

        <About tr={tr} />
        <Footer tr={tr} />
        <div className="copyright display mono">{tr("copy")}</div>
        <Lightbox data={lb} onClose={closeLightbox} />
      </div>
    </>
  );
}
