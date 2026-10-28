(() => {
  // Gallery: show one type of work at a time.
  const chips = document.querySelectorAll("[data-filter]");
  const tiles = document.querySelectorAll(".gallery [data-cat]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      tiles.forEach((tile) => {
        tile.hidden = cat !== "all" && tile.dataset.cat !== cat;
      });
    });
  });

  // The floating WhatsApp button stays out of the way while the hero's own button is on screen.
  const fab = document.querySelector(".fab");
  const heroCta = document.querySelector("[data-hero-cta]");
  if (fab && heroCta && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      fab.classList.toggle("is-tucked", entry.isIntersecting);
    }).observe(heroCta);
  }

  // Booking form: turn the answers into a WhatsApp message to the shop.
  const form = document.getElementById("book");
  const result = document.getElementById("book-result");
  if (!form || !result) return;

  const dateInput = form.querySelector("#book-date");
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const msgEl = result.querySelector("[data-msg]");
  const sendEl = result.querySelector("[data-send]");
  const copyEl = result.querySelector("[data-copy]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const service = String(data.get("service") || "").trim();
    const note = String(data.get("note") || "").trim();
    const date = String(data.get("date") || "");

    const lines = [`Hi ${form.dataset.shop}, my name is ${name}.`, `I would like to get this stitched: ${service}.`];
    if (date) {
      const day = new Date(`${date}T00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      lines.push(`I would like to visit on ${day}.`);
    }
    if (note) lines.push(note);
    const text = lines.join("\n");

    const number = (form.dataset.wa || "").replace(/\D/g, "");
    msgEl.textContent = text;
    sendEl.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    copyEl.textContent = "Copy message";
    result.hidden = false;
    sendEl.focus();
  });

  copyEl.addEventListener("click", () => {
    const done = () => { copyEl.textContent = "Copied"; };
    const fallback = () => {
      const range = document.createRange();
      range.selectNodeContents(msgEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyEl.textContent = "Selected, now copy it";
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(msgEl.textContent).then(done, fallback);
    } else {
      fallback();
    }
  });
})();
