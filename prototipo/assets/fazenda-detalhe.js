// Presenca Agro — Fazenda Detalhe
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var faz = PA_FIND.fazenda(id);
  if (!faz) {
    document.getElementById("screen").innerHTML =
      '<div class="empty-state"><div class="emoji">😕</div><p>Fazenda nao encontrada.</p></div>';
    return;
  }

  var cliente = faz.cliente;

  // Header
  document.getElementById("header-title").textContent = faz.nome;
  document.getElementById("header-sub").textContent = cliente.nome;
  document.getElementById("back-btn").href = "./cliente-detalhe.html?id=" + cliente.id;

  function fmtDate(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function slaColor(status) {
    if (status === "green") return "var(--pa-green)";
    if (status === "amber") return "var(--pa-amber)";
    return "var(--pa-red)";
  }

  function slaBgColor(status) {
    if (status === "green") return "var(--pa-green-light)";
    if (status === "amber") return "var(--pa-amber-light)";
    return "var(--pa-red-light)";
  }

  function slaTextColor(status) {
    if (status === "green") return "var(--pa-green-dark)";
    if (status === "amber") return "#92400e";
    return "var(--pa-red)";
  }

  var visitas = PA_FIND.visitasPorFazenda(id).sort(function (a, b) {
    return b.data.localeCompare(a.data);
  });

  var html = "";

  // Detail hero
  html += '<div class="detail-hero">';
  html += "<h2>" + faz.nome + "</h2>";
  html += '<div class="meta-row">';
  html += '<span class="meta-tag">👤 ' + cliente.nome + "</span>";
  html += '<span class="meta-tag">📍 ' + faz.municipio + "</span>";
  html += '<span class="meta-tag">📐 ' + faz.areaTotal.toLocaleString("pt-BR") + " ha</span>";
  html += "</div></div>";

  // SLA banner
  html +=
    '<div class="banner" style="background:' +
    slaBgColor(faz.slaStatus) +
    ";border-left-color:" +
    slaColor(faz.slaStatus) +
    ";color:" +
    slaTextColor(faz.slaStatus) +
    '">';
  html += "⏱️ " + faz.diasSemVisita + " dias sem visita · SLA: " + faz.slaFrequencia;
  html += "</div>";

  // Talhoes
  html += '<div class="section-hdr"><h3>Talhoes (' + faz.talhoes.length + ")</h3></div>";
  faz.talhoes.forEach(function (t) {
    var latestSafra = t.safras[0];
    html += '<a class="talhao-card" href="./talhao-prontuario.html?id=' + t.id + '">';
    html += '<div class="tc-header">';
    html += '<span class="tc-name">' + t.nome + "</span>";
    html += '<span class="tc-area">' + t.areaHa + " ha</span>";
    html += "</div>";
    if (latestSafra) {
      html += '<div class="tc-safra">' + latestSafra.safra + " · " + latestSafra.cultura + " · " + latestSafra.semente + "</div>";
      html += '<span class="tc-status ' + latestSafra.status + '">' + latestSafra.status + "</span>";
    }
    html += "</a>";
  });

  // Visitas recentes
  html += '<div class="section-hdr"><h3>Visitas Recentes</h3></div>';
  if (visitas.length === 0) {
    html += '<div class="empty-state"><p>Nenhuma visita registrada.</p></div>';
  } else {
    html += '<div class="timeline">';
    visitas.forEach(function (v) {
      var talhao = PA_FIND.talhao(v.talhaoId);
      var talhaoNome = talhao ? talhao.nome : "";
      html += '<div class="tl-item">';
      html += '<div class="tl-dot"></div>';
      html += '<div class="tl-content">';
      html += '<div class="tl-date">' + fmtDate(v.data) + " - " + v.hora + "</div>";
      html += '<div class="tl-title">' + v.tipoIcon + " " + v.tipoLabel + "</div>";
      html += '<div class="tl-desc">' + talhaoNome + " — " + v.resumo + "</div>";
      html += "</div></div>";
    });
    html += "</div>";
  }

  document.getElementById("screen").innerHTML = html;
})();
