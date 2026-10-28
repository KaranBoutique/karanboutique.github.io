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
  const copyLabel = copyEl.textContent;

  // The message lines come from the page, in its language, with {name}-style blanks to fill.
  const t = form.dataset;
  const fill = (line, values) => line.replace(/\{(\w+)\}/g, (blank, key) => values[key] ?? blank);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const service = String(data.get("service") || "").trim();
    const note = String(data.get("note") || "").trim();
    const date = String(data.get("date") || "");

    const lines = [fill(t.hello, { shop: t.shop, name }), fill(t.want, { service })];
    if (date) {
      const d = new Date(`${date}T00:00`);
      const day = `${t.weekdays.split(",")[d.getDay()]}, ${d.getDate()} ${t.months.split(",")[d.getMonth()]}`;
      lines.push(fill(t.visit, { day }));
    }
    if (note) lines.push(note);
    const text = lines.join("\n");

    const number = (form.dataset.wa || "").replace(/\D/g, "");
    msgEl.textContent = text;
    sendEl.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    copyEl.textContent = copyLabel;
    result.hidden = false;
    sendEl.focus();
  });

  copyEl.addEventListener("click", () => {
    const done = () => { copyEl.textContent = t.copied; };
    const fallback = () => {
      const range = document.createRange();
      range.selectNodeContents(msgEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyEl.textContent = t.selected;
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(msgEl.textContent).then(done, fallback);
    } else {
      fallback();
    }
  });
})();
