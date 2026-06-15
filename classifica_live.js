// ══════════════════════════════════════════════════════════════════
//  ARCIERE LEGGENDARIO — Classifica Live
//  Sostituisce il blocco JS statico nella sezione #classifica
//
//  Posiziona classifica.json nella stessa cartella dell'HTML
//  (o aggiusta JSON_URL sotto).
// ══════════════════════════════════════════════════════════════════

const JSON_URL = "classifica.json";   // <-- percorso del JSON esportato

// Premi mensili (da Maggio 2026)
const PREMI = [500, 300, 150];

// Mesi con top-8 (pre-Maggio 2026, classifiche manuali)
const MESI_TOP8 = {
  "202601": true,
  "202602": true,
  "202603": true,
  "202604": false,
};

// Dati statici per i mesi storici NON ancora coperti dal bot
// (i mesi già nel DB sovrascriveranno automaticamente questi)
const STORICO_STATICO = {
  "202602": {
    label: "Febbraio 2026", top8: true,
    giocatori: [
      { pos:1, nick:"astenic4_aspis", pts:1986, titolo:"🌟 Campione", streak:5 },
      { pos:2, nick:"Zanshine",       pts:1973, titolo:"🌟 Campione", streak:3 },
      { pos:3, nick:"Icarus",         pts:1753, titolo:"🌟 Campione" },
      { pos:4, nick:"Mr`LoVe",        pts:1747, titolo:"🌟 Campione", streak:7 },
      { pos:5, nick:"Patty",          pts:1487, titolo:"🛡️ Veterano" },
      { pos:6, nick:"chiara26_",      pts:1081, titolo:"🛡️ Veterano" },
      { pos:7, nick:"Asia",           pts:989,  titolo:"⚔️ Guerriero" },
      { pos:8, nick:"Stregone^",      pts:518,  titolo:"🎯 Tiratore" },
    ]
  },
  "202603": {
    label: "Marzo 2026", top8: true,
    giocatori: [
      { pos:1, nick:"Zanshine",       pts:6177, titolo:"💀 Predatore" },
      { pos:2, nick:"Icarus",         pts:5921, titolo:"💀 Predatore" },
      { pos:3, nick:"Patty",          pts:5457, titolo:"⚡ Mito" },
      { pos:4, nick:"Mr`LoVe",        pts:5356, titolo:"⚡ Mito" },
      { pos:5, nick:"Asia",           pts:4173, titolo:"⚡ Mito" },
      { pos:6, nick:"astenic4_aspis", pts:2036, titolo:"🌟 Campione" },
      { pos:7, nick:"micio_di_casa",  pts:1572, titolo:"🌟 Campione" },
      { pos:8, nick:"Chiara26_",      pts:1352, titolo:"🛡️ Veterano" },
    ]
  },
  "202604": {
    label: "Aprile 2026", top8: false,
    giocatori: [
      { pos:1, nick:"Icarus",   pts:13096, titolo:"☄️ Cosmico" },
      { pos:2, nick:"Zanshine", pts:11651, titolo:"🌙 Astrale" },
      { pos:3, nick:"Delirio",  pts:11386, titolo:"🌙 Astrale" },
    ]
  },
};

// ── Helpers UI ─────────────────────────────────────────────────────────────────

function fmt(n) {
  return Number(n).toLocaleString("it-IT");
}

function medalPos(i) {
  return ["🥇","🥈","🥉"][i] ?? "🏹";
}

function posClass(i) {
  return ["pos-1","pos-2","pos-3"][i] ?? "pos-other";
}

function buildRow(g, i, showPrize) {
  const streakBadge = (g.streak && g.streak >= 3) ? ` 🔥${g.streak}gg` : "";
  const prizeHtml = showPrize && i < 3
    ? `<div class="lb-prize">+${fmt(PREMI[i])} pts</div>`
    : "";
  return `
    <div class="lb-row ${posClass(i)}">
      <div class="lb-pos">${medalPos(i)}</div>
      <div class="lb-info">
        <div class="lb-nick">${g.nick}${streakBadge}</div>
        <div class="lb-title-text">${g.titolo || ""}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.3rem">
        <div class="lb-pts">${fmt(g.pts)}<span>punti</span></div>
        ${prizeHtml}
      </div>
    </div>`;
}

function buildPrizeBanner() {
  return `
    <div class="prize-banner">
      <div class="prize-item"><div class="prize-medal">🥇</div><div class="prize-pts">+500 pts</div><div class="prize-label">1° Posto</div></div>
      <div class="prize-item"><div class="prize-medal">🥈</div><div class="prize-pts">+300 pts</div><div class="prize-label">2° Posto</div></div>
      <div class="prize-item"><div class="prize-medal">🥉</div><div class="prize-pts">+150 pts</div><div class="prize-label">3° Posto</div></div>
    </div>`;
}

// ── Render classifica mensile ──────────────────────────────────────────────────

function renderMensile(tabsEl, lbEl, mesi) {
  // mesi = array di { mese_key (number), label, top8, giocatori[] }
  // Ordina crescente per mese
  mesi.sort((a,b) => a.mese_key - b.mese_key);

  tabsEl.innerHTML = "";
  lbEl.innerHTML   = "";

  // Tab "Live" aggiunta all'inizio (opzionale — qui la inseriamo come prima tab)
  const defaultKey = mesi.length > 0 ? mesi[mesi.length - 1].mese_key : null;

  mesi.forEach((m, idx) => {
    const tabId = "lb-m-" + idx;

    // Tab
    const tab = document.createElement("button");
    tab.className = "month-tab" + (m.mese_key === defaultKey ? " active" : "");
    tab.textContent = m.label;
    tab.onclick = () => {
      document.querySelectorAll(".month-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".leaderboard").forEach(l => l.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    };
    tabsEl.appendChild(tab);

    // Board
    const isTop8    = m.top8;
    const showPrize = !isTop8;
    const titleHtml = isTop8
      ? `<div class="lb-title">🏆 Top 8 Arcieri</div>`
      : `<div class="lb-title">🏆 Top 3 Arcieri — Podio Mensile</div>`;
    const bannerHtml = showPrize ? buildPrizeBanner() : "";

    const rowsHtml = m.giocatori.length === 0
      ? `<div class="lb-empty">📋 Classifica non ancora disponibile.<br><em>Torna a fine mese!</em></div>`
      : m.giocatori.map((g, i) => buildRow(g, i, showPrize)).join("");

    const lb = document.createElement("div");
    lb.className = "leaderboard" + (m.mese_key === defaultKey ? " active" : "");
    lb.id = tabId;
    lb.innerHTML = titleHtml + bannerHtml + rowsHtml;
    lbEl.appendChild(lb);
  });
}

// ── Sezione "Live" ─────────────────────────────────────────────────────────────

function injectLiveSection(data) {
  // Cerca se esiste già il blocco live, altrimenti lo crea prima della classifica mensile
  let liveBox = document.getElementById("live-classifica-box");
  if (!liveBox) {
    liveBox = document.createElement("div");
    liveBox.id = "live-classifica-box";
    liveBox.style.cssText = "margin-bottom:2.5rem;";
    const section = document.querySelector(".classifica-section section");
    const monthTabs = document.getElementById("monthTabs");
    section.insertBefore(liveBox, monthTabs);
  }

  const live = data.classifica_live;
  const sett = data.classifica_settimanale;
  const stats = data.statistiche;

  // Badge aggiornamento
  const aggiornato = data.aggiornato || "—";

  const liveRows = live.length === 0
    ? `<div class="lb-empty">📋 Nessun dato disponibile.</div>`
    : live.map((g, i) => buildRow(g, i, false)).join("");

  const settRows = sett && sett.giocatori && sett.giocatori.length > 0
    ? sett.giocatori.map((g, i) => buildRow(g, i, false)).join("")
    : `<div class="lb-empty">📋 Nessun punto questa settimana.</div>`;

  liveBox.innerHTML = `
    <!-- Badge aggiornamento -->
    <div style="text-align:center;margin-bottom:1.5rem;">
      <span style="
        font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:.2em;
        text-transform:uppercase;color:var(--text-dim);
        background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.15);
        padding:.35rem 1rem;display:inline-block;
      ">
        🔴 Live — aggiornato: ${aggiornato}
        &nbsp;|&nbsp;
        👥 ${fmt(stats.giocatori)} arcieri
        &nbsp;·&nbsp;
        🏹 ${fmt(stats.tiri_totali)} tiri
        &nbsp;·&nbsp;
        ⚔️ ${fmt(stats.sfide_totali)} sfide
      </span>
    </div>

    <!-- Griglia 2 colonne live + settimanale -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2.5rem;">

      <div>
        <div class="lb-title" style="font-size:.95rem;">🏹 Classifica Attuale (punti totali)</div>
        ${liveRows}
      </div>

      <div>
        <div class="lb-title" style="font-size:.95rem;">📅 Settimana ${sett ? sett.settimana + "/" + sett.anno : "—"}</div>
        ${settRows}
      </div>

    </div>

    <div style="text-align:center;margin-bottom:1rem;">
      <span style="
        font-family:'Cinzel',serif;font-size:0.75rem;letter-spacing:.3em;
        text-transform:uppercase;color:var(--text-dim);
      ">— Storico Mensile —</span>
    </div>
  `;

  // Animazione scroll-in per le nuove righe
  liveBox.querySelectorAll(".lb-row").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = "opacity .4s ease, transform .4s ease";
    setTimeout(() => { el.style.opacity="1"; el.style.transform="translateY(0)"; }, 50);
  });
}

// ── Carica JSON + merge con storico statico ────────────────────────────────────

async function caricaClassifica() {
  const tabsEl = document.getElementById("monthTabs");
  const lbEl   = document.getElementById("leaderboards");

  // Placeholder caricamento
  lbEl.innerHTML = `<div class="lb-empty" id="lb-loading">⏳ Caricamento classifica in corso...</div>`;

  let data = null;
  try {
    const resp = await fetch(JSON_URL + "?t=" + Date.now());
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    data = await resp.json();
  } catch (err) {
    console.warn("[Arciere] Impossibile caricare classifica.json:", err);
    // Fallback: mostra solo lo storico statico
    renderFallback(tabsEl, lbEl);
    return;
  }

  // ── Inietta sezione live (top attuale + settimanale + stats) ──
  injectLiveSection(data);

  // ── Merge HOF dal DB con storico statico ──────────────────────
  // Costruiamo un dizionario {mese_key_string → entry}
  const tuttiMesi = {};

  // 1. Storico statico (base)
  for (const [k, v] of Object.entries(STORICO_STATICO)) {
    tuttiMesi[k] = { mese_key: parseInt(k), ...v };
  }

  // 2. HOF dal DB (sovrascrive/aggiunge)
  for (const m of (data.hof_mensile || [])) {
    const k = String(m.mese_key);
    tuttiMesi[k] = {
      mese_key: m.mese_key,
      label:    m.label,
      top8:     MESI_TOP8[k] ?? false,
      giocatori: m.giocatori,
    };
  }

  // 3. Aggiungi i mesi futuri vuoti (mese corrente + prossimi 6)
  const oggi = new Date();
  for (let delta = 0; delta <= 6; delta++) {
    const d = new Date(oggi.getFullYear(), oggi.getMonth() + delta, 1);
    const k = String(d.getFullYear() * 100 + (d.getMonth() + 1));
    if (!tuttiMesi[k]) {
      const MESI_NOMI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                         "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
      tuttiMesi[k] = {
        mese_key: parseInt(k),
        label:    MESI_NOMI[d.getMonth()] + " " + d.getFullYear(),
        top8:     false,
        giocatori: [],
      };
    }
  }

  renderMensile(tabsEl, lbEl, Object.values(tuttiMesi));

  // Ri-attiva animazioni scroll observer
  attachScrollObserver();
}

// ── Fallback senza JSON ────────────────────────────────────────────────────────

function renderFallback(tabsEl, lbEl) {
  const mesi = Object.entries(STORICO_STATICO).map(([k,v]) => ({
    mese_key: parseInt(k), ...v
  }));
  // Aggiungi mese corrente vuoto
  const oggi = new Date();
  const MESI_NOMI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                     "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const kCorrente = oggi.getFullYear() * 100 + (oggi.getMonth() + 1);
  if (!mesi.find(m => m.mese_key === kCorrente)) {
    mesi.push({
      mese_key: kCorrente,
      label: MESI_NOMI[oggi.getMonth()] + " " + oggi.getFullYear(),
      top8: false, giocatori: []
    });
  }
  renderMensile(tabsEl, lbEl, mesi);
  // Mostra avviso
  const warn = document.createElement("p");
  warn.style.cssText = "text-align:center;color:var(--text-dim);font-style:italic;margin-bottom:1rem;font-size:.85rem;";
  warn.textContent = "⚠️ Dati live non disponibili — visualizzazione storico offline.";
  const section = document.querySelector(".classifica-section section");
  section.insertBefore(warn, document.getElementById("monthTabs"));
}

// ── Scroll observer ────────────────────────────────────────────────────────────

function attachScrollObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".lb-row").forEach(el => {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(20px)";
    el.style.transition = "opacity .5s ease, transform .5s ease";
    obs.observe(el);
  });
}

// ── Auto-refresh ogni 5 minuti ─────────────────────────────────────────────────

caricaClassifica();
setInterval(caricaClassifica, 5 * 60 * 1000);

// ── Responsive: collassa le 2 colonne live su mobile ──────────────────────────
(function() {
  function fixGrid() {
    const g = document.querySelector("#live-classifica-box > div[style*='grid-template-columns']");
    if (!g) return;
    g.style.gridTemplateColumns = window.innerWidth < 700 ? "1fr" : "1fr 1fr";
  }
  window.addEventListener("resize", fixGrid);
  // Primo run dopo che il DOM è pronto
  setTimeout(fixGrid, 500);
})();
