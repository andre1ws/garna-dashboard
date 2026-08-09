const searchInput = document.getElementById("perksSearch");
const filters = document.querySelectorAll(".perk-filter");
const cards = document.querySelectorAll(".perk-card");
const empty = document.getElementById("perksEmpty");

let activeFilter = "all";

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  let visible = 0;

  cards.forEach((card) => {
    const name = card.dataset.name || "";
    const cats = (card.dataset.cats || "").split(/\s+/);
    const matchesSearch = !query || name.includes(query);
    const matchesFilter =
      activeFilter === "all" || cats.includes(activeFilter);

    const show = matchesSearch && matchesFilter;
    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });

  if (empty) empty.hidden = visible > 0;
}

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter || "all";
    applyFilters();
  });
});

searchInput?.addEventListener("input", applyFilters);
