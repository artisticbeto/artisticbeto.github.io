import { useEffect, useRef, useState } from "react";

export function Nav({ lang, setLang, tr }) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const workRef = useRef(null);
  const [workOpen, setWorkOpen] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
      if (!workRef.current?.contains(e.target)) setWorkOpen(false);
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
            <div className={"work-links" + (workOpen ? " is-open" : "")} ref={workRef}>
              <button className="work-select" aria-haspopup="true" aria-expanded={workOpen} onClick={() => setWorkOpen((o) => !o)}>{tr("work")}</button>
              <div className="work-dropcontent" role="menu">
                <a href="#work" role="menuitem" onClick={() => setWorkOpen(false)}>{tr("gallery")}</a>
                <a href="#motion" role="menuitem" onClick={() => setWorkOpen(false)}>{tr("motion")}</a>
                <a href="#viewer" role="menuitem" onClick={() => setWorkOpen(false)}>{tr("mesh")}</a>
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
