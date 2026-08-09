const list = document.getElementById("notifsList");
const tabs = document.querySelectorAll(".notifs-tab");
const newCountEl = document.getElementById("newCount");
const empty = document.getElementById("notifsEmpty");
const markAll = document.getElementById("markAllRead");

let filter = "new";

function cards() {
  return [...list.querySelectorAll(".notif-card")];
}

function updateCount() {
  const n = cards().filter((c) => c.dataset.state === "new").length;
  if (newCountEl) newCountEl.textContent = String(n);
}

function applyFilter() {
  let visible = 0;
  cards().forEach((card) => {
    const show = card.dataset.state === filter;
    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });
  if (empty) empty.hidden = visible > 0;
}

function markRead(card) {
  card.dataset.state = "read";
  updateCount();
  applyFilter();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    filter = tab.dataset.filter || "new";
    applyFilter();
  });
});

list?.addEventListener("click", (e) => {
  const btn = e.target.closest(".notif-mark");
  if (!btn) return;
  const card = btn.closest(".notif-card");
  if (card) markRead(card);
});

markAll?.addEventListener("click", () => {
  cards().forEach((card) => {
    card.dataset.state = "read";
  });
  updateCount();
  applyFilter();
});

updateCount();
applyFilter();
