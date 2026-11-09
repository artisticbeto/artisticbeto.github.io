export function observeReveals(root = document) {
    root ??= document;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle("in-view", en.isIntersecting)),
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );
  root.querySelectorAll(".hero, .reveal-left, .reveal-right, .reveal-up").forEach((el) => io.observe(el));
  return () => io.disconnect();
}