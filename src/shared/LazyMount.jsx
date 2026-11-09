import { useEffect, useRef, useState } from "react";
import { observeReveals } from "@/shared/reveal";


export function LazyMount({ children, minHeight = 400, id }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" } 
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

   useEffect(() => {
    if (!visible) return;
    return observeReveals(ref.current);
  }, [visible]);

  return (
    <div id={id} ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  );
}