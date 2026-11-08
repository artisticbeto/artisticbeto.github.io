// Phones / touch devices / low-RAM devices get a lighter experience.
const mq = (q) => typeof matchMedia !== "undefined" && matchMedia(q).matches;
export const COARSE = mq("(pointer: coarse)");
export const LITE = COARSE || mq("(max-width: 720px)") || (navigator.deviceMemory || 8) <= 4;
