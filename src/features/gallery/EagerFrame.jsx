import { useRef, useState, useEffect } from "react";

export function EagerFrame({ src, title }) {
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