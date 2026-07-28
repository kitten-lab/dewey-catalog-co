/* cat-o-roms · drawer face */

(function () {
  const kicker = document.getElementById("kicker");
  const romList = document.getElementById("romList");
  const makerList = document.getElementById("makerList");
  const romCount = document.getElementById("romCount");
  const romPanel = document.getElementById("romPanel");
  const makersPanel = document.getElementById("makersPanel");
  const foot = document.getElementById("foot");

  let data = null;
  let filter = "all";
  let view = "roms";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function makerName(id) {
    const m = (data.makers || []).find((x) => x.id === id);
    return m ? m.name : id;
  }

  function renderMakers() {
    makerList.innerHTML = (data.makers || [])
      .map((m) => {
        const n = (data.roms || []).filter((r) => r.maker === m.id).length;
        return (
          `<li class="cat-card">` +
          `<div class="cat-card-top">` +
          `<span class="cat-name">${esc(m.name)}</span>` +
          `<span class="cat-sku">${esc(m.stem)}</span>` +
          `<span class="cat-status" data-s="desk">${n} ROM${n === 1 ? "" : "S"}</span>` +
          `</div>` +
          `<p class="cat-line">${esc(m.line || "")}</p>` +
          (m.path ? `<p class="cat-path">${esc(m.path)}</p>` : "") +
          `</li>`
        );
      })
      .join("");
  }

  function renderRoms() {
    let roms = data.roms || [];
    if (filter !== "all") {
      roms = roms.filter((r) => (r.status || "") === filter);
    }
    romCount.textContent = `(${roms.length})`;
    romList.innerHTML = roms
      .map((r) => {
        const self = r.id === "cat-o-roms" || r.sku === "DCC-001";
        return (
          `<li class="cat-card${self ? " is-self" : ""}">` +
          `<div class="cat-card-top">` +
          `<span class="cat-name">${esc(r.name)}</span>` +
          `<span class="cat-sku">${esc(r.sku || "—")}</span>` +
          `<span class="cat-status" data-s="${esc(r.status || "idea")}">${esc(
            (r.status || "idea").toUpperCase()
          )}</span>` +
          `</div>` +
          `<p class="cat-maker">${esc(makerName(r.maker))}${
            self ? " · you are here" : ""
          }</p>` +
          `<p class="cat-line">${esc(r.line || "")}</p>` +
          (r.path ? `<p class="cat-path">${esc(r.path)}</p>` : "") +
          `</li>`
        );
      })
      .join("");
  }

  function paint() {
    if (!data) return;
    const showMakers = view === "makers";
    makersPanel.hidden = !showMakers;
    romPanel.hidden = showMakers;
    if (showMakers) renderMakers();
    else renderRoms();
  }

  document.querySelectorAll(".cat-f").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-f").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      if (btn.dataset.view === "makers") {
        view = "makers";
      } else {
        view = "roms";
        filter = btn.dataset.filter || "all";
      }
      paint();
    });
  });

  fetch("/data/catalog.json?_=" + Date.now())
    .then((r) => {
      if (!r.ok) throw new Error("drawer stuck " + r.status);
      return r.json();
    })
    .then((j) => {
      data = j;
      kicker.textContent =
        (j.whisper || "drawer open") +
        " · " +
        (j.makers || []).length +
        " makers · " +
        (j.roms || []).length +
        " rom cards";
      const hasSelf = (j.roms || []).some(
        (r) => r.id === "cat-o-roms" || r.sku === "DCC-001"
      );
      foot.textContent = hasSelf
        ? "DCC · braid intact · this ROM is in the drawer"
        : "DCC · WARNING · self-entry missing · braid broken";
      paint();
    })
    .catch((e) => {
      kicker.textContent = "drawer refused: " + e.message;
    });
})();
