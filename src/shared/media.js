// True for video clips (rendered as <video>), false for still images (rendered as <img>).
export const isVideoSrc = (src) => /\.(webm|mp4)$/i.test(src || "");

// WebM clips ship with an MP4 fallback for browsers without WebM support,
// such as Safari on iOS 17.3 and older. MP4 clips are used as-is.
export const videoSources = (src) =>
  /\.webm$/i.test(src)
    ? [
        { src, type: "video/webm" },
        { src: src.replace(/\.webm$/i, ".mp4"), type: "video/mp4" },
      ]
    : [{ src, type: "video/mp4" }];
