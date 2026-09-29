(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const progressFill = document.getElementById("progress-fill");
  const counter = document.getElementById("counter");
  const sectionLabel = document.getElementById("section-label");
  const overview = document.getElementById("overview");
  const overviewGrid = document.getElementById("overview-grid");
  const overviewClose = document.getElementById("overview-close");

  let index = 0;

  function clamp(n) {
    return Math.max(0, Math.min(slides.length - 1, n));
  }

  function parseHash() {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return null;
    return clamp(n - 1);
  }

  function titleFor(slide) {
    const h = slide.querySelector("h1, h2");
    return h ? h.textContent.trim() : "Slide";
  }

  function buildOverview() {
    overviewGrid.innerHTML = "";
    slides.forEach((slide, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "overview-item";
      btn.dataset.index = String(i);
      btn.innerHTML =
        '<span class="oi-num">' +
        String(i + 1).padStart(2, "0") +
        '</span><span class="oi-title"></span>';
      btn.querySelector(".oi-title").textContent = titleFor(slide);
      btn.addEventListener("click", () => {
        closeOverview();
        go(i);
      });
      overviewGrid.appendChild(btn);
    });
  }

  function updateOverviewCurrent() {
    overviewGrid.querySelectorAll(".overview-item").forEach((el, i) => {
      el.classList.toggle("current", i === index);
    });
  }

  function openOverview() {
    overview.classList.add("open");
    updateOverviewCurrent();
  }

  function closeOverview() {
    overview.classList.remove("open");
  }

  function isOverviewOpen() {
    return overview.classList.contains("open");
  }

  function go(next) {
    index = clamp(next);
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    const pct = ((index + 1) / slides.length) * 100;
    progressFill.style.width = pct + "%";
    counter.textContent = index + 1 + " / " + slides.length;
    sectionLabel.textContent = slides[index].dataset.section || "";
    const hash = "#" + (index + 1);
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    updateOverviewCurrent();
  }

  function next() {
    go(index + 1);
  }

  function prev() {
    go(index - 1);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "o" || e.key === "O") {
      if (isOverviewOpen()) closeOverview();
      else openOverview();
      e.preventDefault();
      return;
    }
    if (isOverviewOpen()) return;

    if (
      e.key === "ArrowRight" ||
      e.key === " " ||
      e.key === "PageDown" ||
      e.key === "Enter"
    ) {
      next();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "Backspace") {
      prev();
      e.preventDefault();
    } else if (e.key === "Home") {
      go(0);
      e.preventDefault();
    } else if (e.key === "End") {
      go(slides.length - 1);
      e.preventDefault();
    }
  });

  document.querySelector(".deck").addEventListener("click", (e) => {
    if (isOverviewOpen()) return;
    if (e.target.closest("a, button, .chrome")) return;
    const mid = window.innerWidth / 2;
    if (e.clientX >= mid) next();
    else prev();
  });

  overviewClose.addEventListener("click", closeOverview);

  window.addEventListener("hashchange", () => {
    const fromHash = parseHash();
    if (fromHash !== null && fromHash !== index) go(fromHash);
  });

  buildOverview();
  const start = parseHash();
  go(start === null ? 0 : start);
})();
