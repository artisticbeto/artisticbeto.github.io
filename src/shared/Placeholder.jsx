export const Placeholder = ({ video }) => (
  <div className={"swatch placeholder-swatch" + (video ? " placeholder-video" : "")}>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {video ? (
        <>
          <rect x="2" y="5" width="14" height="14" rx="2" />
          <path d="M16 9.2 21 6v12l-5-3.2" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </>
      )}
    </svg>
    <span className="placeholder-label">{video ? "Video placeholder" : "Media placeholder"}</span>
  </div>
);
