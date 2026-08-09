const searchInput = document.getElementById("contractorSearch");
const list = document.getElementById("contractorList");

function visibleCards() {
  return [...list.querySelectorAll(".contractor-card")].filter((c) => !c.hidden);
}

function selectCard(card) {
  list.querySelectorAll(".contractor-card").forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");
}

list.addEventListener("click", (e) => {
  const card = e.target.closest(".contractor-card");
  if (!card || card.hidden) return;
  selectCard(card);
});

searchInput?.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const activeList = document.querySelector(".list-tabs .seg-btn.is-active")?.dataset.list || "contractors";

  list.querySelectorAll(".contractor-card").forEach((card) => {
    const inSet = card.dataset.set === activeList;
    const hay = `${card.dataset.name} ${card.dataset.email} ${card.dataset.dept} ${card.dataset.role}`.toLowerCase();
    card.hidden = !(inSet && (!q || hay.includes(q)));
  });
});

document.querySelectorAll(".list-tabs .seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".list-tabs .seg-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const set = btn.dataset.list;
    if (searchInput) searchInput.value = "";

    list.querySelectorAll(".contractor-card").forEach((card) => {
      card.hidden = card.dataset.set !== set;
    });

    const first = visibleCards()[0];
    if (first) selectCard(first);
  });
});
