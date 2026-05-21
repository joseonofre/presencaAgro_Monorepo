const D = window.PA_DATA;
const listEl = document.getElementById("client-list");
const searchEl = document.getElementById("search");

function worstSla(fazendas) {
  if (fazendas.some(f => f.slaStatus === "red")) return "red";
  if (fazendas.some(f => f.slaStatus === "amber")) return "amber";
  return "green";
}

function render(filter) {
  const q = (filter || "").toLowerCase();
  const filtered = D.clientes.filter(c =>
    !q || c.nome.toLowerCase().includes(q) || c.fazendas.some(f => f.nome.toLowerCase().includes(q))
  );

  const stats = { total: D.clientes.length, green: 0, amber: 0, red: 0 };
  D.clientes.forEach(c => { stats[worstSla(c.fazendas)]++; });
  document.getElementById("st-total").textContent = stats.total;
  document.getElementById("st-ok").textContent = stats.green;
  document.getElementById("st-warn").textContent = stats.amber;
  document.getElementById("st-over").textContent = stats.red;
  document.getElementById("count-sub").textContent = filtered.length + " clientes";

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><div class="emoji">🔍</div><p>Nenhum cliente encontrado</p></div>';
    return;
  }

  listEl.innerHTML = filtered.map(c => {
    const sla = worstSla(c.fazendas);
    const initials = c.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const fazCount = c.fazendas.length;
    const worstDias = Math.max(...c.fazendas.map(f => f.diasSemVisita));
    return `<a class="client-card" href="./cliente-detalhe.html?id=${c.id}">
      <div class="avatar">${initials}</div>
      <div class="info">
        <div class="name">${c.nome}</div>
        <div class="sub">${fazCount} fazenda${fazCount > 1 ? "s" : ""} · ultima visita ha ${worstDias} dias</div>
      </div>
      <div class="sla-dot" style="background:var(--pa-${sla})"></div>
    </a>`;
  }).join("");
}

searchEl.addEventListener("input", (e) => render(e.target.value));
render();
