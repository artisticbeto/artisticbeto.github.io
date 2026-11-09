import { Scribble } from "@/features/hero/Scribble";


const HERO_BG_SRC = "cover2.png";
export function Hero({ tr }) {
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
          <p className="sub-html" aria-hidden="true">
            {tr("sub1")} {tr("subPre")}<b>{tr("screen")}</b>{" & "}<b>{tr("studio")}</b>.
          </p>
        </div>
      </div>
    </section>
  );
}