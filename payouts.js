const balances = {
  USD: { value: "72.99", symbol: "", suffix: "USD" },
  EUR: { value: "67.40", symbol: "€", suffix: "EUR" },
  RUB: { value: "6,820.00", symbol: "₽", suffix: "RUB" },
};

function renderBalance(code) {
  const data = balances[code] || balances.USD;
  const el = document.getElementById("balanceAmount");
  if (!el) return;
  const prefix = code === "USD" ? "" : data.symbol;
  el.innerHTML = `${prefix}${data.value} <small>${data.suffix}</small>`;
  const tag = document.querySelector(".currency-tag");
  if (tag) tag.textContent = code;
}

document.querySelectorAll(".currency-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".currency-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderBalance(btn.textContent.trim());
  });
});

document.querySelectorAll(".account-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".account-tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
  });
});

document.querySelectorAll(".history-tabs .seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".history-tabs .seg-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const set = btn.dataset.history;
    document.querySelectorAll(".history-item").forEach((item) => {
      item.hidden = item.dataset.set !== set;
    });
  });
});

document.querySelector(".copy-btn")?.addEventListener("click", async () => {
  const code = document.querySelector(".account-number code")?.textContent?.trim();
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code.replace(/\s+/g, ""));
  } catch {
    /* ignore */
  }
});
