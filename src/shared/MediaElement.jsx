import { useState } from "react";
import { isVideoSrc, videoSources } from "@/shared/media";
import "@/shared/media.css";

// Renders an <img> or a <video> depending on the file type.
// Shows a shimmer skeleton on the element until its first frame is ready.
export function Media({ src, alt, className = "", onError, loading, decoding, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const cls = (className + (loaded ? "" : " media-loading")).trim();
  const done = () => setLoaded(true);
  const failed = (e) => {
    setLoaded(true);
    onError?.(e);
  };

  if (isVideoSrc(src)) {
    const sources = videoSources(src);
    return (
      <video className={cls} aria-label={alt} autoPlay loop muted playsInline onLoadedData={done} {...rest}>
        {sources.map((s, i) => (
          // With <source> children the video itself never fires "error";
          // the last source does once every source has failed.
          <source key={s.type} src={s.src} type={s.type} onError={i === sources.length - 1 ? failed : undefined} />
        ))}
      </video>
    );
  }
  return (
    <img className={cls} src={src} alt={alt} loading={loading} decoding={decoding} onLoad={done} onError={failed} {...rest} />
  );
}
