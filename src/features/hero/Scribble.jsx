import { useMemo } from "react";
export function Scribble({ text }) {
  const letters = useMemo(
    () =>
      [...text].map((ch) => ({
        ch,
        sd: (-Math.random() * 5.85).toFixed(2) + "s",
        sdur: (4.7 + Math.random() * 0.35).toFixed(2) + "s",
      })),
    [text]
  );
  return letters.map((l, i) =>
    l.ch === " " ? (
      " "
    ) : (
      <span key={i} className="scribble-letter" style={{ "--sd": l.sd, "--sdur": l.sdur }}>
        {l.ch}
      </span>
    )
  );
}
