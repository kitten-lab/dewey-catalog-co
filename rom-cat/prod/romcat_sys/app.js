/* ROM Cat · yellow pages of producers → ROMs */

(function () {
  const kicker = document.getElementById("kicker");
  const foot = document.getElementById("foot");
  const viewProducers = document.getElementById("viewProducers");
  const viewProducer = document.getElementById("viewProducer");
  const producerShelf = document.getElementById("producerShelf");
  const producerCard = document.getElementById("producerCard");
  const romBins = document.getElementById("romBins");

  const dlgP = document.getElementById("dlgProducer");
  const dlgR = document.getElementById("dlgRom");
  const formP = document.getElementById("formProducer");
  const formR = document.getElementById("formRom");

  let data = null;
  let openProducerId = null;

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function romsFor(pid) {
    return (data.roms || []).filter((r) => r.producer_id === pid);
  }

  function producerById(pid) {
    return (data.producers || []).find((p) => p.id === pid) || null;
  }

  function setKicker() {
    const nP = (data.producers || []).length;
    const nR = (data.roms || []).length;
    kicker.textContent =
      (data.whisper || "catalog open") +
      " · " +
      nP +
      " producer" +
      (nP === 1 ? "" : "s") +
      " · " +
      nR +
      " ROM card" +
      (nR === 1 ? "" : "s");
    const self = (data.roms || []).some(
      (r) => r.chip_code === "CO.DCC-001-ROMCAT" || r.id === "romcat"
    );
    foot.textContent = self
      ? "Dewey Catalog Co. · braid intact · ROM Cat is filed under CO.DCC"
      : "Dewey Catalog Co. · WARNING · file ROM Cat on its own shelf or the braid frays";
  }

  function showProducers() {
    openProducerId = null;
    viewProducers.hidden = false;
    viewProducer.hidden = true;
    const list = data.producers || [];
    if (!list.length) {
      producerShelf.innerHTML =
        '<li class="rc-empty">No producers on file. Add one when a maker exists.</li>';
      return;
    }
    producerShelf.innerHTML = list
      .map((p) => {
        const n = romsFor(p.id).length;
        return (
          `<li>` +
          `<button type="button" class="rc-shelf-item" data-open="${esc(p.id)}">` +
          `<span class="rc-shelf-name">${esc(p.name)}</span>` +
          `<span class="rc-shelf-chip">${esc(p.chip_code || "—")}</span>` +
          `<p class="rc-shelf-meta">${esc(
            (p.mission || "").slice(0, 120) || "no mission on the card yet"
          )}${p.mission && p.mission.length > 120 ? "…" : ""}</p>` +
          `<span class="rc-shelf-count">${n} ROM${n === 1 ? "" : "s"}</span>` +
          `</button></li>`
        );
      })
      .join("");

    producerShelf.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openProducer(btn.getAttribute("data-open")));
    });
  }

  function openProducer(pid) {
    const p = producerById(pid);
    if (!p) return;
    openProducerId = pid;
    viewProducers.hidden = true;
    viewProducer.hidden = false;

    producerCard.innerHTML =
      `<div class="rc-index-top">` +
      `<span class="rc-index-name">${esc(p.name)}</span>` +
      `<span class="rc-index-chip">${esc(p.chip_code || "—")}</span>` +
      `</div>` +
      `<div class="rc-field"><strong>MISSION</strong>${esc(p.mission || "—")}</div>` +
      `<div class="rc-field"><strong>HANDS OPERATOR (VEN)</strong>${esc(
        p.hands_ven || "—"
      )}</div>` +
      `<div class="rc-field"><strong>ADDRESS</strong>${esc(p.address || "—")}</div>` +
      `<div class="rc-field"><strong>NOTES</strong>${esc(p.notes || "—")}</div>` +
      `<button type="button" class="rc-btn rc-edit-link" id="btnEditProducer">edit producer card</button>`;

    document.getElementById("btnEditProducer").onclick = () => openProducerForm(p);

    const roms = romsFor(pid);
    if (!roms.length) {
      romBins.innerHTML =
        '<li class="rc-empty">No ROMs on this shelf yet. Incomplete is allowed. File a card.</li>';
      return;
    }
    romBins.innerHTML = roms
      .map((r) => {
        return (
          `<li class="rc-bin">` +
          `<span class="rc-bin-name">${esc(r.name)}</span>` +
          `<span class="rc-status" data-s="${esc(r.status || "idea")}">${esc(
            r.status || "idea"
          )}</span>` +
          `<span class="rc-bin-chip">${esc(r.chip_code || "—")}</span>` +
          `<p class="rc-bin-desc">${esc(r.description || "")}</p>` +
          (r.address
            ? `<div class="rc-bin-addr">${esc(r.address)}</div>`
            : "") +
          (r.notes
            ? `<div class="rc-bin-addr">notes: ${esc(r.notes)}</div>`
            : "") +
          `<div class="rc-bin-addr">launcher: ${
            r.launcher_show === false ? "hidden" : "shown"
          }</div>` +
          `<div class="rc-bin-actions">` +
          `<button type="button" data-edit-rom="${esc(r.id)}">edit card</button>` +
          `<button type="button" data-toggle-launch="${esc(r.id)}">${
            r.launcher_show === false ? "show on launcher" : "hide from launcher"
          }</button>` +
          `</div></li>`
        );
      })
      .join("");

    romBins.querySelectorAll("[data-edit-rom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = (data.roms || []).find(
          (x) => x.id === btn.getAttribute("data-edit-rom")
        );
        if (r) openRomForm(r);
      });
    });
    romBins.querySelectorAll("[data-toggle-launch]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-toggle-launch");
        const r = (data.roms || []).find((x) => x.id === id);
        if (!r) return;
        const next = r.launcher_show === false;
        try {
          await post("/api/rom", {
            action: "upsert",
            id: r.id,
            producer_id: r.producer_id,
            name: r.name,
            chip_code: r.chip_code,
            description: r.description,
            status: r.status,
            address: r.address,
            notes: r.notes,
            launcher_show: next,
          });
          if (openProducerId) openProducer(openProducerId);
        } catch (ex) {
          alert(ex.message);
        }
      });
    });
  }

  function openProducerForm(p) {
    document.getElementById("dlgProducerTitle").textContent = p
      ? "Edit producer"
      : "New producer";
    document.getElementById("p_id").value = p ? p.id : "";
    document.getElementById("p_name").value = p ? p.name || "" : "";
    document.getElementById("p_chip").value = p ? p.chip_code || "" : "";
    document.getElementById("p_mission").value = p ? p.mission || "" : "";
    document.getElementById("p_hands").value = p ? p.hands_ven || "" : "";
    document.getElementById("p_address").value = p ? p.address || "" : "";
    document.getElementById("p_notes").value = p ? p.notes || "" : "";
    document.getElementById("p_delete").hidden = !p;
    document.getElementById("p_err").hidden = true;
    dlgP.showModal();
  }

  function openRomForm(r) {
    document.getElementById("dlgRomTitle").textContent = r ? "Edit ROM" : "New ROM";
    document.getElementById("r_id").value = r ? r.id : "";
    document.getElementById("r_producer").value = r
      ? r.producer_id
      : openProducerId || "";
    document.getElementById("r_name").value = r ? r.name || "" : "";
    document.getElementById("r_chip").value = r ? r.chip_code || "" : "";
    document.getElementById("r_desc").value = r ? r.description || "" : "";
    document.getElementById("r_status").value = r ? r.status || "idea" : "idea";
    document.getElementById("r_address").value = r ? r.address || "" : "";
    document.getElementById("r_launcher").checked = r
      ? r.launcher_show !== false &&
        (r.launcher_show === true ||
          (r.status === "desk" || r.status === "shipped") && !!r.address)
      : true;
    if (r && r.launcher_show === false) {
      document.getElementById("r_launcher").checked = false;
    }
    document.getElementById("r_notes").value = r ? r.notes || "" : "";
    document.getElementById("r_delete").hidden = !r;
    document.getElementById("r_err").hidden = true;
    dlgR.showModal();
  }

  async function post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || "drawer refused");
    data = j.catalog;
    setKicker();
    return j;
  }

  formP.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("p_err");
    err.hidden = true;
    try {
      await post("/api/producer", {
        action: "upsert",
        id: document.getElementById("p_id").value,
        name: document.getElementById("p_name").value,
        chip_code: document.getElementById("p_chip").value,
        mission: document.getElementById("p_mission").value,
        hands_ven: document.getElementById("p_hands").value,
        address: document.getElementById("p_address").value,
        notes: document.getElementById("p_notes").value,
      });
      dlgP.close();
      if (openProducerId) openProducer(openProducerId);
      else showProducers();
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });

  formR.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("r_err");
    err.hidden = true;
    try {
      await post("/api/rom", {
        action: "upsert",
        id: document.getElementById("r_id").value,
        producer_id: document.getElementById("r_producer").value,
        name: document.getElementById("r_name").value,
        chip_code: document.getElementById("r_chip").value,
        description: document.getElementById("r_desc").value,
        status: document.getElementById("r_status").value,
        address: document.getElementById("r_address").value,
        launcher_show: document.getElementById("r_launcher").checked,
        notes: document.getElementById("r_notes").value,
      });
      dlgR.close();
      if (openProducerId) openProducer(openProducerId);
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });

  document.getElementById("p_cancel").onclick = () => dlgP.close();
  document.getElementById("r_cancel").onclick = () => dlgR.close();
  document.getElementById("btnBack").onclick = () => showProducers();
  document.getElementById("btnNewProducer").onclick = () => openProducerForm(null);
  document.getElementById("btnNewRom").onclick = () => {
    if (!openProducerId) return;
    openRomForm(null);
  };

  document.getElementById("p_delete").onclick = async () => {
    const id = document.getElementById("p_id").value;
    if (!id || !confirm("Remove this producer and their ROM cards from the catalog?"))
      return;
    try {
      await post("/api/producer", { action: "delete", id });
      dlgP.close();
      showProducers();
    } catch (ex) {
      alert(ex.message);
    }
  };

  document.getElementById("r_delete").onclick = async () => {
    const id = document.getElementById("r_id").value;
    if (!id || !confirm("Remove this ROM card from the shelf?")) return;
    try {
      await post("/api/rom", { action: "delete", id });
      dlgR.close();
      if (openProducerId) openProducer(openProducerId);
    } catch (ex) {
      alert(ex.message);
    }
  };

  fetch("/api/catalog?_=" + Date.now())
    .then((r) => r.json())
    .then((j) => {
      data = j;
      setKicker();
      showProducers();
    })
    .catch((e) => {
      kicker.textContent = "catalog locked: " + e.message;
    });
})();
