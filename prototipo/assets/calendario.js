// Presença Agro — Calendar screen controller

const D = window.PA_DATA;

// Week base: 20 May 2026 (Wed)
const weekDays = [
  { dow: "DOM", num: 17, date: "2026-05-17" },
  { dow: "SEG", num: 18, date: "2026-05-18" },
  { dow: "TER", num: 19, date: "2026-05-19" },
  { dow: "QUA", num: 20, date: "2026-05-20", today: true },
  { dow: "QUI", num: 21, date: "2026-05-21" },
  { dow: "SEX", num: 22, date: "2026-05-22" },
  { dow: "SÁB", num: 23, date: "2026-05-23" },
];

let activeDate = "2026-05-20";

const weekEl = document.getElementById("cal-week");
const dayListEl = document.getElementById("day-list");
const subEl = document.getElementById("cal-sub");

function renderWeek() {
  weekEl.innerHTML = "";
  weekDays.forEach((d) => {
    const has = D.agenda.find((a) => a.data === d.date && a.itens.length > 0);
    const cls = [
      "cal-day",
      d.date === activeDate ? "active" : "",
      d.today ? "today" : "",
    ].join(" ");
    const el = document.createElement("div");
    el.className = cls;
    el.innerHTML = `
      <div class="dow">${d.dow}</div>
      <div class="num">${d.num}</div>
      <div class="dot ${has ? "has" : ""}"></div>`;
    el.onclick = () => {
      activeDate = d.date;
      renderWeek();
      renderDayList();
    };
    weekEl.appendChild(el);
  });
}

function renderDayList() {
  const day = D.agenda.find((a) => a.data === activeDate);
  const human = formatDate(activeDate);
  subEl.textContent = human;

  if (!day || day.itens.length === 0) {
    dayListEl.innerHTML = `
      <h3>Nenhum compromisso</h3>
      <div class="visit-card" style="justify-content:center; color:var(--pa-muted); padding:24px;">
        Dia livre — bom momento para visitar fazendas com SLA chegando ao prazo.
      </div>`;
    return;
  }

  let html = `<h3>${day.itens.length} compromisso${day.itens.length > 1 ? "s" : ""}</h3>`;
  day.itens.forEach((i) => {
    const badge = badgeFor(i.tipo);
    html += `
      <a class="visit-card" href="./visita.html" style="text-decoration:none; color:inherit;">
        <div class="time">
          ${i.hora}
          ${i.durMin ? `<small>${i.durMin} min</small>` : ""}
        </div>
        <div class="info">
          <div class="farm">${i.titulo}</div>
          <div class="meta">${i.sub}</div>
        </div>
        <span class="badge ${badge.cls}">${badge.label}</span>
      </a>`;
  });
  dayListEl.innerHTML = html;
}

function badgeFor(t) {
  switch (t) {
    case "scheduled": return { cls: "scheduled", label: "Agendada" };
    case "done": return { cls: "done", label: "Concluída" };
    case "overdue": return { cls: "overdue", label: "Atrasada" };
    case "harvest": return { cls: "harvest", label: "Colheita" };
    default: return { cls: "scheduled", label: "—" };
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${String(d).padStart(2, "0")} de ${meses[m - 1]} de ${y}`;
}

renderWeek();
renderDayList();
