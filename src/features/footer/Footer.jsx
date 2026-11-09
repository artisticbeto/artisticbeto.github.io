import { SOCIALS } from "@/features/footer/Socials";

export function Footer({ tr }) {
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