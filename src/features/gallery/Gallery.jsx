import { useState, useRef } from "react";
import { GalleryItem } from "@/features/gallery/GalleryItem";
import {galleryItems} from "@/shared/data";

const COLLAPSED_HEIGHT = 460;


export function Gallery({ onOpen, tr }) {
  const [collapsed, setCollapsed] = useState(true);
  const [height, setHeight] = useState(COLLAPSED_HEIGHT);
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  const toggle = () => {
    if (collapsed) {
      setHeight(galleryRef.current.scrollHeight);
      setCollapsed(false);
    } else {
      setHeight(containerRef.current.scrollHeight);
      setCollapsed(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight(COLLAPSED_HEIGHT)));
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2 className="display reveal-left">{tr("archive")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n1")}</div>
      </div>
      <div
        ref={containerRef}
        className={"gallery-container" + (collapsed ? " is-collapsed" : "")}
        style={{ height }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "height" && !collapsed) setHeight("auto");
        }}
      >
        <div className="gallery" ref={galleryRef}>
          {galleryItems.map((item, i) => (
            <GalleryItem key={i} item={item} onOpen={onOpen} />
          ))}
        </div>
        <div className="fade-veil" />
      </div>
      <div className="show-more-wrapper">
        <button className="show-more-btn mono" onClick={toggle}>
          {collapsed ? "Show more" : "Show less"}
        </button>
      </div>
    </section>
  );
}
