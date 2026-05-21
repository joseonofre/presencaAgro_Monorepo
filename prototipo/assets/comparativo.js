// Presenca Agro — Comparativo (side-by-side talhao comparison)
(function () {
  const screen = document.getElementById("screen");
  const params = new URLSearchParams(location.search);
  const preSelect = params.get("t"); // ?t=t-1 pre-selects that talhao

  // Gather all talhao+safra combos
  function getAllItems() {
    const items = [];
    for (const c of PA_DATA.clientes) {
      for (const f of c.fazendas) {
        for (const t of f.talhoes) {
          for (const s of t.safras) {
            items.push({
              key: t.id + "|" + s.id,
              talhaoId: t.id,
              safraId: s.id,
              talhaoNome: t.nome,
              fazendaNome: f.nome,
              clienteNome: c.nome,
              areaHa: t.areaHa,
              safra: s.safra,
              cultura: s.cultura,
              semente: s.semente,
              dataPlantio: s.dataPlantio,
              dataColheita: s.dataColheira,
              adubacaoBase: s.adubacaoBase,
              produtividadeReal: s.produtividadeReal,
              status: s.status,
            });
          }
        }
      }
    }
    return items;
  }

  const allItems = getAllItems();
  const selected = new Set();

  // Pre-select from URL param
  if (preSelect) {
    const match = allItems.find((i) => i.talhaoId === preSelect);
    if (match) selected.add(match.key);
  }

  function renderSelector() {
    let html = '<div class="comp-selector" id="selector">';
    html += '<div class="section-hdr"><h3>Selecione os talhoes para comparar</h3></div>';

    for (const item of allItems) {
      const sel = selected.has(item.key);
      html += `
        <div class="comp-item${sel ? " selected" : ""}" data-key="${item.key}">
          <div class="check">${sel ? "✓" : ""}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">${item.talhaoNome}</div>
            <div style="font-size:12.5px;color:var(--pa-muted)">${item.fazendaNome} — ${item.clienteNome}</div>
            <div style="font-size:12px;color:var(--pa-muted);margin-top:2px">
              ${item.safra} &middot; ${item.cultura}
              <span class="tc-status ${item.status}" style="margin-left:6px">${item.status === "aberta" ? "Aberta" : "Fechada"}</span>
            </div>
          </div>
        </div>`;
    }

    html += "</div>";
    html += `<div style="padding:12px 16px;position:sticky;bottom:0;background:var(--pa-surface);border-top:1px solid var(--pa-border)">
      <button class="qa-btn primary" id="btn-compare" style="width:100%" ${selected.size < 2 ? "disabled" : ""}>
        Comparar Selecionados (${selected.size})
      </button>
    </div>`;

    screen.innerHTML = html;

    // Bind clicks
    document.querySelectorAll(".comp-item").forEach((el) => {
      el.addEventListener("click", () => {
        const key = el.dataset.key;
        if (selected.has(key)) {
          selected.delete(key);
        } else {
          selected.add(key);
        }
        renderSelector();
      });
    });

    const btn = document.getElementById("btn-compare");
    btn.addEventListener("click", () => {
      if (selected.size >= 2) renderResults();
    });
  }

  function fmtDate(d) {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  function renderResults() {
    const items = allItems.filter((i) => selected.has(i.key));

    // Find max produtividade for highlighting
    const prods = items.map((i) => i.produtividadeReal || 0);
    const maxProd = Math.max(...prods);

    const rows = [
      { label: "Talhao", fn: (i) => i.talhaoNome },
      { label: "Fazenda", fn: (i) => i.fazendaNome },
      { label: "Safra", fn: (i) => i.safra },
      { label: "Cultura", fn: (i) => i.cultura },
      { label: "Semente", fn: (i) => i.semente },
      { label: "Area (ha)", fn: (i) => i.areaHa + " ha" },
      { label: "Adubacao Base", fn: (i) => i.adubacaoBase || "—" },
      {
        label: "Produtividade (sc/ha)",
        fn: (i) =>
          i.status === "fechada" ? (i.produtividadeReal || "—") : "Em andamento",
        highlight: (i) =>
          i.status === "fechada" && i.produtividadeReal === maxProd && maxProd > 0,
      },
      { label: "Data Plantio", fn: (i) => fmtDate(i.dataPlantio) },
      { label: "Data Colheita", fn: (i) => fmtDate(i.dataColheita) },
      { label: "Status", fn: (i) => i.status === "aberta" ? "Aberta" : "Fechada" },
    ];

    let html = '<div class="comp-result">';
    html += '<div style="overflow-x:auto">';
    html += '<table class="comp-table"><thead><tr><th></th>';
    for (const item of items) {
      html += `<th>${item.talhaoNome}<br><span style="font-weight:400">${item.safra}</span></th>`;
    }
    html += "</tr></thead><tbody>";

    for (const row of rows) {
      html += `<tr><td style="font-weight:600;white-space:nowrap">${row.label}</td>`;
      for (const item of items) {
        const isHighlight = row.highlight && row.highlight(item);
        html += `<td class="${isHighlight ? "highlight" : ""}">${row.fn(item)}</td>`;
      }
      html += "</tr>";
    }

    html += "</tbody></table></div>";
    html += `<div style="padding:16px 0">
      <button class="qa-btn primary" id="btn-back" style="width:100%">Nova comparacao</button>
    </div>`;
    html += "</div>";

    screen.innerHTML = html;
    document.getElementById("sub").textContent = items.length + " talhoes comparados";

    document.getElementById("btn-back").addEventListener("click", () => {
      document.getElementById("sub").textContent = "Lado a lado";
      renderSelector();
    });
  }

  renderSelector();
})();
