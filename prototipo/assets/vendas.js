// Presenca Agro — Oportunidades (sales pipeline)
(function () {
  const screen = document.getElementById("screen");
  const sub = document.getElementById("sub");
  const opps = PA_DATA.oportunidades;

  const fmt = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const totalVal = opps.reduce((s, o) => s + o.valorTotal, 0);
  const abertas = opps.filter((o) => o.status === "aberta");
  const fechadas = opps.filter((o) => o.status === "fechada");

  sub.textContent = "Pipeline: " + fmt(totalVal);

  let filter = "todas";

  function fmtDate(d) {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  function render() {
    const filtered =
      filter === "todas"
        ? opps
        : filter === "abertas"
        ? abertas
        : fechadas;

    let html = "";

    // Stats
    html += '<div class="stat-row">';
    html += `<div class="stat-box"><div class="num">${opps.length}</div><div class="lbl">Total</div></div>`;
    html += `<div class="stat-box"><div class="num">${abertas.length}</div><div class="lbl">Abertas</div></div>`;
    html += `<div class="stat-box"><div class="num">${fechadas.length}</div><div class="lbl">Fechadas</div></div>`;
    html += `<div class="stat-box"><div class="num" style="font-size:16px">${fmt(totalVal)}</div><div class="lbl">Valor</div></div>`;
    html += "</div>";

    // Pill tabs
    html += '<div class="pill-tabs">';
    ["todas", "abertas", "fechadas"].forEach((f) => {
      const label = f.charAt(0).toUpperCase() + f.slice(1);
      html += `<button class="pill-tab${filter === f ? " active" : ""}" data-filter="${f}">${label}</button>`;
    });
    html += "</div>";

    // Cards
    if (filtered.length === 0) {
      html += '<div class="empty-state"><div class="emoji">📋</div><p>Nenhuma oportunidade encontrada</p></div>';
    } else {
      for (const o of filtered) {
        const cliente = PA_FIND.cliente(o.clienteId);
        html += `<div class="opp-card">
          <div class="opp-top">
            <div class="opp-title">${o.titulo}</div>
            <div class="opp-valor">${fmt(o.valorTotal)}</div>
          </div>
          <div class="opp-meta">${cliente ? cliente.nome : "—"} &middot; ${fmtDate(o.data)}</div>
          <span class="opp-status ${o.status}">${o.status === "aberta" ? "Aberta" : "Fechada"}</span>
          <div style="margin-top:10px;font-size:12.5px;color:var(--pa-muted)">
            <strong>Produtos:</strong>
            <ul style="margin:4px 0 0;padding-left:18px">
              ${o.produtos.map((p) => `<li>${p.nome} — ${p.qtd} (${fmt(p.total)})</li>`).join("")}
            </ul>
          </div>
          ${o.visitaOrigemId ? `<div style="margin-top:8px"><a href="./relatorio-visita.html?v=${o.visitaOrigemId}" style="font-size:12.5px;color:var(--pa-green);font-weight:600">Originada da visita →</a></div>` : ""}
        </div>`;
      }
    }

    screen.innerHTML = html;

    // Bind pill tabs
    document.querySelectorAll(".pill-tab").forEach((el) => {
      el.addEventListener("click", () => {
        filter = el.dataset.filter;
        render();
      });
    });
  }

  render();
})();
