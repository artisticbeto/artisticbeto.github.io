import { useState } from "react";
import { EagerFrame } from "@/features/gallery/EagerFrame";
import { LITE, COARSE } from "@/shared/lite";


export function LazyIframe({ src, title }) {
  const [armed, setArmed] = useState(!LITE);
  const id = /embed\/([\w-]+)/.exec(src)?.[1];
  if (armed || !id) return <EagerFrame src={LITE ? src.replace("autoplay=0", "autoplay=1") : src} title={title} />;
  return (
    <button
      className="yt-facade"
      aria-label={`Play ${title}`}
      style={{ backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }}
      onClick={() => setArmed(true)}
    >
      <span className="yt-play" />
    </button>
  );
}