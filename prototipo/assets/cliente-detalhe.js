// Presenca Agro — Cliente Detalhe
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const cliente = PA_FIND.cliente(id);
  if (!cliente) {
    document.getElementById("screen").innerHTML =
      '<div class="empty-state"><div class="emoji">😕</div><p>Cliente nao encontrado.</p></div>';
    return;
  }

  // Header
  document.getElementById("header-title").textContent = cliente.nome;
  document.getElementById("header-sub").textContent = cliente.telefone;

  // Totals
  const fazendas = cliente.fazendas;
  const totalTalhoes = fazendas.reduce((s, f) => s + f.talhoes.length, 0);
  const totalHa = fazendas.reduce((s, f) => s + f.areaTotal, 0);

  // Recent visits for this client (top 3)
  const visitas = PA_DATA.visitasHistorico
    .filter((v) => v.clienteId === id)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3);

  function fmtDate(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function slaColor(status) {
    if (status === "green") return "var(--pa-green)";
    if (status === "amber") return "var(--pa-amber)";
    return "var(--pa-red)";
  }

  var html = "";

  // Detail hero
  html += '<div class="detail-hero">';
  html += "<h2>" + cliente.nome + "</h2>";
  html += '<div class="meta-row">';
  html += '<span class="meta-tag">📞 ' + cliente.telefone + "</span>";
  html += '<span class="meta-tag">✉️ ' + cliente.email + "</span>";
  html += "</div></div>";

  // Stats
  html += '<div class="stat-row" style="padding-top:12px">';
  html += '<div class="stat-box"><div class="num">' + fazendas.length + '</div><div class="lbl">Fazendas</div></div>';
  html += '<div class="stat-box"><div class="num">' + totalTalhoes + '</div><div class="lbl">Talhoes</div></div>';
  html += '<div class="stat-box"><div class="num">' + totalHa.toLocaleString("pt-BR") + '</div><div class="lbl">ha total</div></div>';
  html += "</div>";

  // Fazendas section
  html += '<div class="section-hdr"><h3>Fazendas</h3></div>';
  fazendas.forEach(function (f) {
    html += '<a class="client-card" href="./fazenda-detalhe.html?id=' + f.id + '">';
    html += '<div class="avatar">🏡</div>';
    html += '<div class="info">';
    html += '<div class="name">' + f.nome + "</div>";
    html += '<div class="sub">' + f.municipio + " · " + f.areaTotal.toLocaleString("pt-BR") + " ha</div>";
    html += '<div class="sub">' + f.diasSemVisita + " dias sem visita · " + f.slaFrequencia + "</div>";
    html += "</div>";
    html += '<div class="sla-dot" style="background:' + slaColor(f.slaStatus) + '"></div>';
    html += "</a>";
  });

  // Ultimas visitas
  html += '<div class="section-hdr"><h3>Ultimas Visitas</h3></div>';
  if (visitas.length === 0) {
    html += '<div class="empty-state"><p>Nenhuma visita registrada.</p></div>';
  } else {
    html += '<div class="timeline">';
    visitas.forEach(function (v) {
      html += '<div class="tl-item">';
      html += '<div class="tl-dot"></div>';
      html += '<div class="tl-content">';
      html += '<div class="tl-date">' + fmtDate(v.data) + " - " + v.hora + "</div>";
      html += '<div class="tl-title">' + v.tipoIcon + " " + v.tipoLabel + "</div>";
      html += '<div class="tl-desc">' + v.resumo + "</div>";
      html += "</div></div>";
    });
    html += "</div>";
  }

  document.getElementById("screen").innerHTML = html;
})();
