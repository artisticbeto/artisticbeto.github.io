import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import "@/features/viewer/viewer.css";
import { piecesData } from "@/shared/data";
import { LITE, COARSE } from "@/shared/lite";
import { Carousel } from "@/features/viewer/Carousel";

// Lower pixel ratio on phones: fewer pixels to fill each frame
const pixelRatio = () => Math.min(window.devicePixelRatio, COARSE ? 1 : LITE ? 1.25 : 1.5);

function makePlaceholderTexture(label) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 640), h = (canvas.height = 800);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#221d18";
  ctx.lineWidth = 26;
  for (let x = -h; x < w; x += 46) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke();
  }
  ctx.strokeStyle = "#2c2822";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  const iw = 170, ih = 170, ix = w / 2 - iw / 2, iy = h / 2 - ih / 2 - 46;
  ctx.strokeStyle = "#8a8175";
  ctx.lineWidth = 6;
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.beginPath(); ctx.arc(ix + iw * 0.28, iy + ih * 0.3, iw * 0.09, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ix + iw, iy + ih * 0.66);
  ctx.lineTo(ix + iw * 0.6, iy + ih * 0.3);
  ctx.lineTo(ix, iy + ih);
  ctx.stroke();
  ctx.fillStyle = "#8a8175";
  ctx.textAlign = "center";
  ctx.font = "600 26px 'Courier New', monospace";
  ctx.fillText("MODEL PLACEHOLDER", w / 2, iy + ih + 66);
  if (label) {
    ctx.font = "400 20px 'Courier New', monospace";
    ctx.globalAlpha = 0.7;
    ctx.fillText(label, w / 2, iy + ih + 100);
    ctx.globalAlpha = 1;
  }
  return new THREE.CanvasTexture(canvas);
}

function disposeMesh(obj) {
  obj?.traverse((c) => {
    if (!c.isMesh) return;
    c.geometry?.dispose();
    [].concat(c.material || []).forEach((m) => { m.map?.dispose(); m.dispose(); });
  });
}

export function Viewer({ tr }) {
  const holderRef = useRef(null);
  const apiRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const holder = holderRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, holder.clientWidth / holder.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: !LITE, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(holder.clientWidth, holder.clientHeight, false);
    renderer.shadowMap.enabled = !LITE;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    holder.insertBefore(renderer.domElement, holder.firstChild);

    scene.add(new THREE.HemisphereLight(0xffefe0, 0x1a1520, 0.9));
    const light = (color, intensity, x, y, z, shadow) => {
      const l = new THREE.DirectionalLight(color, intensity);
      l.position.set(x, y, z);
      if (shadow && !LITE) {
        l.castShadow = true;
        l.shadow.mapSize.set(512, 512);
        l.shadow.bias = -0.0001;
      }
      scene.add(l);
    };
    light(0xfff3e0, 2.2, 4, 6, 4, true);
    light(0x768ca3, 2, -4, 0, 3);
    light(0xb971da, 1.8, -3, 4, -4);
    light(0xd1a374, 1.3, 0, -5, 2);

    const frameGroup = new THREE.Group();
    scene.add(frameGroup);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 4, 1, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide })
    );
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 4.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0d0b09, roughness: 0.8 })
    );
    edge.position.z = -0.04;
    frameGroup.add(plane, edge);

    const pos = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9622d, size: 0.02, transparent: true, opacity: 0.5 })));
    camera.position.set(0, 0, 6);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    let current = null, loadId = 0;

    const loadingEl = document.createElement("div");
    loadingEl.className = "viewer-loading mono";
    loadingEl.style.display = "none";
    holder.appendChild(loadingEl);

    const showPlaceholder = (name) => {
      plane.visible = edge.visible = true;
      plane.material.map?.dispose();
      plane.material.map = makePlaceholderTexture(name);
      plane.material.needsUpdate = true;
    };

    apiRef.current = {
      loadPiece(piece) {
        const id = ++loadId;
        if (current) {
          frameGroup.remove(current);
          disposeMesh(current);
          current = null;
        }
        if (!piece.modelSrc) {
          loadingEl.style.display = "none";
          return showPlaceholder(piece.name);
        }
        plane.visible = edge.visible = false;
        loadingEl.style.display = "block";
        loadingEl.textContent = "Loading 0%";
        loader.load(
          piece.modelSrc,
          (gltf) => {
            if (id !== loadId) return disposeMesh(gltf.scene);
            loadingEl.style.display = "none";
            current = gltf.scene;
            const box = new THREE.Box3().setFromObject(current);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            current.position.sub(center);
            const max = Math.max(size.x, size.y, size.z);
            if (max > 0) current.scale.setScalar(3.2 / max);
            frameGroup.add(current);
          },
          (e) => {
            if (id !== loadId) return;
            // Without a Content-Length the total is 0, so show megabytes instead of a stuck 0%
            loadingEl.textContent = e.total
              ? `Loading ${Math.round((e.loaded / e.total) * 100)}%`
              : `Loading ${(e.loaded / 1048576).toFixed(1)} MB`;
          },
          (err) => {
            if (id !== loadId) return;
            loadingEl.style.display = "none";
            console.error("Failed to load 3D model:", err);
            showPlaceholder(piece.name);
          }
        );
      },
    };

    // interaction
    let dragging = false, prevX = 0, prevY = 0;
    let rotY = 0.3, rotX = -0.15, targetY = 0.3, targetX = -0.15, zoom = 6;
    const el = renderer.domElement;
    const ptrs = new Map();
    let pinchD = 0;
    const spread = () => {
      const [p, q] = [...ptrs.values()];
      return Math.hypot(p.x - q.x, p.y - q.y);
    };
    const onDown = (e) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragging = ptrs.size === 1;
      prevX = e.clientX;
      prevY = e.clientY;
      if (ptrs.size === 2) pinchD = spread();
    };
    const onUp = (e) => { ptrs.delete(e.pointerId); dragging = false; };
    const onMove = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) {
        const d = spread();
        zoom = Math.max(3, Math.min(10, zoom - (d - pinchD) * 0.02));
        pinchD = d;
        return;
      }
      if (!dragging) return;
      targetY += (e.clientX - prevX) * 0.006;
      targetX = Math.max(-1, Math.min(1, targetX + (e.clientY - prevY) * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onWheel = (e) => {
      e.preventDefault();
      zoom = Math.max(3, Math.min(10, zoom + e.deltaY * 0.003));
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("pointermove", onMove);
    el.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const w = holder.clientWidth, h = holder.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(holder);

    // render loop only while visible
    let inView = true, running = false, raf = 0;
    const loop = () => {
      if (!inView || document.hidden) { running = false; return; }
      raf = requestAnimationFrame(loop);
      rotY += (targetY - rotY) * 0.08;
      rotX += (targetX - rotX) * 0.08;
      if (!dragging) targetY += 0.0025;
      frameGroup.rotation.y = rotY;
      frameGroup.rotation.x = rotX;
      camera.position.z += (zoom - camera.position.z) * 0.1;
      renderer.render(scene, camera);
    };
    const kick = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (inView = en.isIntersecting));
      kick();
    }, { threshold: 0.01 });
    io.observe(holder);
    document.addEventListener("visibilitychange", kick);
    kick();

    return () => {
      inView = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      disposeMesh(current);
      renderer.dispose();
      loadingEl.remove();
      el.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.loadPiece(piecesData[active]);
  }, [active]);

  return (
    <section className="viewer-section">
      <div className="section-head">
        <h2 className="display reveal-right">{tr("viewer")}</h2>
        <div className="num mono reveal-up" style={{ "--rd": ".15s" }}>{tr("n3")}</div>
      </div>
      <div className="viewer-wrap">
        <div id="viewer-canvas-holder" ref={holderRef}>
          <div className="viewer-hint mono">{tr(COARSE ? "hintTouch" : "hint")}</div>
        </div>
        <div className="viewer-controls">
          <p className="reveal-up">{tr("viewerP")}</p>
          <div className="piece-list">
            <Carousel active={active} onSelect={setActive} />
          </div>
        </div>
      </div>
    </section>
  );
}

