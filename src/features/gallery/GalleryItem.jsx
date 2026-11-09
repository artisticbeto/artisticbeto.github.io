import { useState } from "react";
import { LazyIframe } from "@/features/gallery/LazyIframe";
import { Placeholder } from "@/shared/Placeholder";
import { Media } from "@/shared/MediaElement";


export function GalleryItem({ item, onOpen }) {
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
        <Media src={video} alt={`${title} — ${meta}`} />
      ) : src ? (
        <Media
          className="swatch"
          src={src}
          alt={`${title} — ${meta}`}
          loading="lazy"
          decoding="async"
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
