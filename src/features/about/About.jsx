const ABOUT_IMG = "project1.png";

export function About({ tr }) {
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
