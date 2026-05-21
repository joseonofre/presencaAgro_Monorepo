// Presenca Agro — Relatorio de Visita
(function () {
  const screen = document.getElementById("screen");
  const sub = document.getElementById("sub");
  const params = new URLSearchParams(location.search);
  const visitaId = params.get("v");

  const visita = PA_DATA.visitasHistorico.find((v) => v.id === visitaId);

  if (!visita) {
    screen.innerHTML =
      '<div class="empty-state"><div class="emoji">📋</div><p>Visita nao encontrada</p></div>';
    return;
  }

  const cliente = PA_FIND.cliente(visita.clienteId);
  const fazenda = PA_FIND.fazenda(visita.fazendaId);
  const talhao = PA_FIND.talhao(visita.talhaoId);

  function fmtDate(d) {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  sub.textContent = fmtDate(visita.data);

  let html = "";

  // Report card
  html += '<div class="report-card">';

  // Header
  html += `<div class="report-header">
    <h2>${visita.tipoIcon} ${visita.tipoLabel}</h2>
    <div class="meta">${fmtDate(visita.data)} as ${visita.hora} &middot; ${PA_DATA.consultor.nome}</div>
  </div>`;

  // Local
  html += `<div class="report-section">
    <h4>Local</h4>
    <p><strong>Fazenda:</strong> ${fazenda ? fazenda.nome : "—"}</p>
    <p><strong>Talhao:</strong> ${talhao ? talhao.nome : "—"}</p>
    <p><strong>Cliente:</strong> ${cliente ? cliente.nome : "—"}</p>
  </div>`;

  // Resumo
  html += `<div class="report-section">
    <h4>Resumo</h4>
    <p>${visita.resumo}</p>
  </div>`;

  // Ocorrencias
  if (visita.ocorrencias && visita.ocorrencias.length > 0) {
    html += '<div class="report-section"><h4>Ocorrencias</h4>';
    for (const oc of visita.ocorrencias) {
      html += `<div style="margin-bottom:12px">
        <p><strong>${oc.nome}</strong></p>
        <p style="font-size:13px;color:var(--pa-muted)">Nivel: ${oc.nivel}</p>
        <p style="font-size:13px;color:var(--pa-amber)">Recomendacao: ${oc.recomendacao}</p>
      </div>`;
    }
    html += "</div>";

    // Fotos
    const allPhotos = visita.ocorrencias.flatMap((oc) => oc.fotos || []);
    if (allPhotos.length > 0) {
      html += '<div class="report-section"><h4>Evidencias Fotograficas</h4>';
      html += '<div class="report-photos">';
      for (const foto of allPhotos) {
        html += `<div class="report-photo" title="Geo: ${foto.geo}">
          <div style="position:absolute;bottom:4px;left:4px;right:4px;font-size:9px;color:white;text-shadow:0 1px 2px rgba(0,0,0,.6);z-index:1">
            ${foto.geo}<br>${foto.hora}
          </div>
        </div>`;
      }
      html += "</div></div>";
    }
  }

  // Aplicacao
  if (visita.aplicacao) {
    const ap = visita.aplicacao;
    html += `<div class="report-section">
      <h4>Aplicacao</h4>
      <p><strong>Produto:</strong> ${ap.produto}</p>
      <p><strong>Dose:</strong> ${ap.dose}</p>
      <p><strong>Area aplicada:</strong> ${ap.areaAplicada} ha</p>
      <p><strong>Estagio fenologico:</strong> ${ap.estagioFenologico}</p>
      <p><strong>Tipo:</strong> ${ap.tipoAplicacao}</p>
    </div>`;
  }

  html += "</div>"; // end report-card

  // Action buttons
  html += `<div style="display:flex;gap:8px;padding:0 16px 20px">
    <button class="qa-btn" id="btn-share" style="flex:1">📤 Compartilhar</button>
    <button class="qa-btn" id="btn-pdf" style="flex:1">📄 Gerar PDF</button>
  </div>`;

  screen.innerHTML = html;

  document.getElementById("btn-share").addEventListener("click", () => {
    alert("📤 Share Sheet (simulado)");
  });
  document.getElementById("btn-pdf").addEventListener("click", () => {
    alert("📄 PDF gerado (simulado)");
  });
})();
