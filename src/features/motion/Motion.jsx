import { motionItems } from "@/shared/data";
import { Placeholder } from "@/shared/Placeholder";
import { Media } from "@/shared/MediaElement";

export function Motion({ tr }) {
  return (
    <section>
      <div className="section-head">
        <h2 className="display reveal-left">{tr("inMotion")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n2")}</div>
      </div>
      <div className="motion-strip">
        {motionItems.map(({ label, src, video }, i) => (
          <div className="motion-item" key={i}>
            {video ? (
              <Media src={video} alt={label} />
            ) : src ? (
              <Media src={src} alt={label} loading="lazy" decoding="async" />
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

