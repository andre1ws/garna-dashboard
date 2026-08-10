const stage = document.getElementById("eorMapStage");
const viewport = document.getElementById("eorMapViewport");
const tooltip = document.getElementById("eorTooltip");
const panel = document.getElementById("eorCountryPanel");
const nameEl = document.getElementById("eorCountryName");
const statusEl = document.getElementById("eorCountryStatus");
const copyEl = document.getElementById("eorCountryCopy");
const countEl = document.getElementById("eorCountryCount");
const zoomIn = document.getElementById("eorZoomIn");
const zoomOut = document.getElementById("eorZoomOut");

/** Countries where EOR hiring is available (ISO 3166-1 alpha-2). */
const AVAILABLE = new Set([
  "us", "cn",
  "gb", "ie", "pt", "es", "fr", "be", "nl", "lu", "de", "at", "ch", "it",
  "pl", "cz", "sk", "hu", "ro", "bg", "gr", "hr", "si",
  "dk", "se", "no", "fi", "ee", "lv", "lt",
]);

const BASE_VIEW = { x: 30.767, y: 241.591, w: 784.077, h: 458.627 };
const minScale = 1;
const maxScale = 3.2;

let countryNames = {};
let mapSvg = null;
let scale = 1;
let centerX = BASE_VIEW.x + BASE_VIEW.w / 2;
let centerY = BASE_VIEW.y + BASE_VIEW.h / 2;

let isPanning = false;
let didPan = false;
let panStartX = 0;
let panStartY = 0;
let originCenterX = 0;
let originCenterY = 0;
let activePointerId = null;

function currentViewSize() {
  return {
    w: BASE_VIEW.w / scale,
    h: BASE_VIEW.h / scale,
  };
}

function clampCenter() {
  const { w, h } = currentViewSize();
  const padX = w * 0.35;
  const padY = h * 0.35;
  const minX = BASE_VIEW.x - padX + w / 2;
  const maxX = BASE_VIEW.x + BASE_VIEW.w + padX - w / 2;
  const minY = BASE_VIEW.y - padY + h / 2;
  const maxY = BASE_VIEW.y + BASE_VIEW.h + padY - h / 2;
  centerX = Math.max(minX, Math.min(maxX, centerX));
  centerY = Math.max(minY, Math.min(maxY, centerY));
}

function applyView() {
  if (!mapSvg) return;
  clampCenter();
  const { w, h } = currentViewSize();
  const x = centerX - w / 2;
  const y = centerY - h / 2;
  mapSvg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

function setScale(next) {
  scale = Math.min(maxScale, Math.max(minScale, +next.toFixed(2)));
  if (scale <= minScale) {
    centerX = BASE_VIEW.x + BASE_VIEW.w / 2;
    centerY = BASE_VIEW.y + BASE_VIEW.h / 2;
  }
  applyView();
}

function screenToSvgDelta(dx, dy) {
  const rect = mapSvg.getBoundingClientRect();
  const { w, h } = currentViewSize();
  return {
    x: (dx / rect.width) * w,
    y: (dy / rect.height) * h,
  };
}

function countryLabel(code) {
  return countryNames[code] || code.toUpperCase();
}

function showCountry(el, clientX, clientY) {
  if (isPanning || didPan) return;

  const code = el.id;
  const name = countryLabel(code);
  const available = el.classList.contains("is-available");

  stage.querySelectorAll(".eor-country.is-active").forEach((c) => {
    c.classList.remove("is-active");
  });
  el.classList.add("is-active");

  if (tooltip) {
    tooltip.hidden = false;
    tooltip.textContent = name;
    const rect = stage.getBoundingClientRect();
    tooltip.style.left = `${clientX - rect.left}px`;
    tooltip.style.top = `${clientY - rect.top}px`;
  }

  if (panel) {
    panel.hidden = false;
    nameEl.textContent = name;
    statusEl.textContent = available ? "Hiring available" : "Coming soon";
    statusEl.classList.toggle("is-yes", available);
    statusEl.classList.toggle("is-no", !available);
    copyEl.textContent = available
      ? "Local contracts, payroll, and compliance handled by Garna EOR."
      : "This market is not open for EOR hiring yet. Choose an available country on the map.";
  }
}

function bindCountry(el) {
  el.classList.add("eor-country");
  if (AVAILABLE.has(el.id)) el.classList.add("is-available");

  el.addEventListener("mousemove", (e) => showCountry(el, e.clientX, e.clientY));
  el.addEventListener("mouseenter", (e) => showCountry(el, e.clientX, e.clientY));
  el.addEventListener("click", (e) => {
    if (didPan) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    showCountry(el, e.clientX, e.clientY);
  });
}

function startPan(e) {
  if (e.button !== undefined && e.button !== 0) return;
  if (e.target.closest?.(".eor-map-zoom")) return;

  isPanning = true;
  didPan = false;
  activePointerId = e.pointerId;
  panStartX = e.clientX;
  panStartY = e.clientY;
  originCenterX = centerX;
  originCenterY = centerY;
  stage.classList.add("is-panning");
  if (tooltip) tooltip.hidden = true;

  try {
    stage.setPointerCapture(e.pointerId);
  } catch (_) {
    /* ignore */
  }
}

function movePan(e) {
  if (!isPanning || e.pointerId !== activePointerId || !mapSvg) return;

  const dx = e.clientX - panStartX;
  const dy = e.clientY - panStartY;
  if (!didPan && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
    didPan = true;
  }

  const delta = screenToSvgDelta(dx, dy);
  // Dragging the map moves the view in the opposite direction
  centerX = originCenterX - delta.x;
  centerY = originCenterY - delta.y;
  applyView();
}

function endPan(e) {
  if (!isPanning || (e.pointerId !== undefined && e.pointerId !== activePointerId)) return;

  isPanning = false;
  activePointerId = null;
  stage.classList.remove("is-panning");
  applyView();

  requestAnimationFrame(() => {
    didPan = false;
  });
}

async function loadMap() {
  const [svgRes, namesRes] = await Promise.all([
    fetch("assets/world-map.svg"),
    fetch("assets/world-country-names.json"),
  ]);

  countryNames = await namesRes.json();
  const raw = await svgRes.text();
  viewport.innerHTML = raw;

  mapSvg = viewport.querySelector("svg");
  if (!mapSvg) return;

  mapSvg.removeAttribute("width");
  mapSvg.removeAttribute("height");
  mapSvg.classList.add("eor-map");
  mapSvg.setAttribute("aria-hidden", "true");
  mapSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  mapSvg.setAttribute("shape-rendering", "geometricPrecision");

  const nodes = [...mapSvg.querySelectorAll("path[id], g[id]")].filter(
    (el) => el.id && el.id !== "world-map"
  );

  nodes.forEach(bindCountry);

  if (countEl) countEl.textContent = String(AVAILABLE.size);
  applyView();
}

stage?.addEventListener("pointerdown", startPan);
stage?.addEventListener("pointermove", movePan);
stage?.addEventListener("pointerup", endPan);
stage?.addEventListener("pointercancel", endPan);

stage?.addEventListener("mouseleave", () => {
  if (!isPanning && tooltip) tooltip.hidden = true;
});

zoomIn?.addEventListener("click", () => {
  setScale(scale + 0.25);
});

zoomOut?.addEventListener("click", () => {
  setScale(scale - 0.25);
});

loadMap().catch((err) => {
  console.error("Failed to load world map", err);
  if (viewport) {
    viewport.innerHTML = `<p class="eor-map-error">Could not load the map.</p>`;
  }
});
