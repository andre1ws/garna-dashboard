const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const datasets = {
  income: [5200, 6100, 4800, 7200, 6900, 7800, 6400, 8689.2, 7100, 8300, 7600, 9100],
  expense: [4100, 3900, 4500, 5200, 4800, 5600, 5100, 6200, 5400, 5800, 5000, 6100],
  savings: [1800, 2200, 1500, 2600, 2400, 2800, 2100, 3100, 2500, 2900, 2700, 3300],
};

const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const canvas = document.getElementById("cashFlowChart");
const tooltip = document.getElementById("chartTooltip");
const labelsEl = document.getElementById("chartLabels");
const ctx = canvas.getContext("2d");

let activeTab = "income";
let activeIndex = 7;
let barRects = [];

labelsEl.innerHTML = months.map((m, i) => `<span data-i="${i}">${m}</span>`).join("");

function resizeCanvas() {
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawChart();
}

function cssToken(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function drawChart() {
  const values = datasets[activeTab];
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const padX = 8;
  const padTop = 36;
  const padBottom = 8;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...values) * 1.15;
  const gap = 10;
  const barW = (width - padX * 2 - gap * (values.length - 1)) / values.length;
  const lime = cssToken("--lime", "#cbf300");
  const limeDeep = cssToken("--lime-deep", "#9ae62a");

  ctx.clearRect(0, 0, width, height);
  barRects = [];

  values.forEach((value, i) => {
    const x = padX + i * (barW + gap);
    const h = (value / max) * chartH;
    const y = padTop + (chartH - h);
    const r = Math.min(12, barW / 2);

    ctx.beginPath();
    roundRect(ctx, x, y, barW, h, r);
    if (i === activeIndex) {
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, lime);
      grad.addColorStop(1, limeDeep);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = "#eceee9";
    }
    ctx.fill();

    barRects.push({ x, y, w: barW, h, value, i });
  });

  updateTooltip();
  updateLabels();
}

function roundRect(context, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function updateTooltip() {
  const rect = barRects[activeIndex];
  if (!rect) return;
  tooltip.textContent = money(rect.value);
  tooltip.style.left = `${rect.x + rect.w / 2}px`;
  tooltip.style.top = `${Math.max(4, rect.y - 36)}px`;
  tooltip.classList.add("is-visible");
}

function updateLabels() {
  labelsEl.querySelectorAll("span").forEach((el, i) => {
    el.classList.toggle("is-active", i === activeIndex);
  });
}

canvas.addEventListener("mousemove", (e) => {
  const bounds = canvas.getBoundingClientRect();
  const x = e.clientX - bounds.left;
  const hit = barRects.find((b) => x >= b.x && x <= b.x + b.w);
  if (hit && hit.i !== activeIndex) {
    activeIndex = hit.i;
    drawChart();
  }
});

labelsEl.addEventListener("click", (e) => {
  const span = e.target.closest("span");
  if (!span) return;
  activeIndex = Number(span.dataset.i);
  drawChart();
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeTab = btn.dataset.tab;
    drawChart();
  });
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
