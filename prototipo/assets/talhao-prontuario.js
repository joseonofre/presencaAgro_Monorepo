// Presenca Agro — Talhao Prontuario
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var talhao = PA_FIND.talhao(id);
  if (!talhao) {
    document.getElementById("screen").innerHTML =
      '<div class="empty-state"><div class="emoji">😕</div><p>Talhao nao encontrado.</p></div>';
    return;
  }

  var fazenda = talhao.fazenda;
  var cliente = talhao.cliente;

  // Header
  document.getElementById("header-title").textContent = "Prontuario: " + talhao.nome;
  document.getElementById("header-sub").textContent = fazenda.nome + " · " + cliente.nome;
  document.getElementById("back-btn").href = "./fazenda-detalhe.html?id=" + fazenda.id;

  function fmtDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  // Collect unique safra names
  var safraNames = [];
  talhao.safras.forEach(function (s) {
    if (safraNames.indexOf(s.safra) === -1) safraNames.push(s.safra);
  });

  // All visits for this talhao
  var allVisitas = PA_FIND.visitasPorTalhao(id).sort(function (a, b) {
    return b.data.localeCompare(a.data);
  });

  // State
  var activeFilter = "Todas";

  function render() {
    var html = "";

    // Detail hero
    html += '<div class="detail-hero">';
    html += "<h2>" + talhao.nome + "</h2>";
    html += '<div class="meta-row">';
    html += '<span class="meta-tag">🏡 ' + fazenda.nome + "</span>";
    html += '<span class="meta-tag">👤 ' + cliente.nome + "</span>";
    html += '<span class="meta-tag">📐 ' + talhao.areaHa + " ha</span>";
    html += "</div></div>";

    // Pill tabs
    html += '<div class="pill-tabs" id="pill-tabs">';
    html += '<button class="pill-tab' + (activeFilter === "Todas" ? " active" : "") + '" data-safra="Todas">Todas</button>';
    safraNames.forEach(function (name) {
      html += '<button class="pill-tab' + (activeFilter === name ? " active" : "") + '" data-safra="' + name + '">' + name + "</button>";
    });
    html += "</div>";

    // Filtered safras
    var safrasToShow = talhao.safras;
    if (activeFilter !== "Todas") {
      safrasToShow = talhao.safras.filter(function (s) {
        return s.safra === activeFilter;
      });
    }

    safrasToShow.forEach(function (s) {
      html += '<div style="margin:0 16px 16px;background:var(--pa-surface);border:1px solid var(--pa-border);border-radius:14px;overflow:hidden">';

      // Safra header
      html += '<div style="padding:14px 16px;border-bottom:1px solid var(--pa-border)">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<strong style="font-size:15px">' + s.safra + " — " + s.cultura + "</strong>";
      html += '<span class="tc-status ' + s.status + '">' + s.status + "</span>";
      html += "</div>";
      html += '<div style="font-size:13px;color:var(--pa-muted);margin-top:4px">';
      html += "🌱 " + s.semente + " · Plantio: " + fmtDate(s.dataPlantio);
      html += "</div>";
      html += "</div>";

      // Safra details
      html += '<div style="padding:14px 16px;font-size:13px">';
      html += '<div style="margin-bottom:6px">🧪 <strong>Adubacao de base:</strong> ' + s.adubacaoBase + "</div>";

      if (s.status === "fechada") {
        html += '<div style="margin-bottom:6px">📊 <strong>Produtividade:</strong> ' + s.produtividadeReal + " sc/ha</div>";
        html += '<div style="margin-bottom:6px">💧 <strong>Umidade:</strong> ' + s.umidade + "%</div>";
        html += "<div>🌾 <strong>Colheita:</strong> " + fmtDate(s.dataColheira) + "</div>";
      } else {
        html += "<div>📅 <strong>Previsao colheita:</strong> " + fmtDate(s.previsaoColheita);
        if (s.margemDias) {
          html += " (+/- " + s.margemDias + " dias)";
        }
        html += "</div>";
      }
      html += "</div>";

      // Visits within this safra's date range
      var safraVisitas = allVisitas.filter(function (v) {
        // Show visits after planting date
        return v.data >= s.dataPlantio && (!s.dataColheira || v.data <= s.dataColheira);
      });

      if (safraVisitas.length > 0) {
        html += '<div style="border-top:1px solid var(--pa-border);padding:12px 16px">';
        html += '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--pa-muted);font-weight:700;margin-bottom:8px">Visitas nesta safra</div>';
        html += '<div class="timeline" style="padding:0">';
        safraVisitas.forEach(function (v) {
          html += '<div class="tl-item">';
          html += '<div class="tl-dot"></div>';
          html += '<div class="tl-content">';
          html += '<div class="tl-date">' + fmtDate(v.data) + " - " + v.hora + "</div>";
          html += '<div class="tl-title">' + v.tipoIcon + " " + v.tipoLabel + "</div>";
          html += '<div class="tl-desc">' + v.resumo + "</div>";
          html += "</div></div>";
        });
        html += "</div></div>";
      }

      html += "</div>";
    });

    // Compare link
    html += '<div style="padding:16px;text-align:center">';
    html += '<a href="./comparativo.html?t=' + talhao.id + '" class="qa-btn primary" style="display:inline-block;text-decoration:none">📊 Comparar este talhao</a>';
    html += "</div>";

    document.getElementById("screen").innerHTML = html;

    // Bind pill tab clicks
    document.getElementById("pill-tabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".pill-tab");
      if (!btn) return;
      activeFilter = btn.getAttribute("data-safra");
      render();
    });
  }

  render();
})();
