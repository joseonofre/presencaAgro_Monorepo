// Presenca Agro — Perfil
(function () {
  const screen = document.getElementById("screen");
  const c = PA_DATA.consultor;

  // Initials from name
  const initials = c.nome
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  let html = '<div style="padding:24px 0 8px">';

  // Avatar
  html += `<div class="profile-avatar">${initials}</div>`;
  html += `<div class="profile-name">${c.nome}</div>`;
  html += `<div class="profile-role">${c.cargo} — ${c.empresa}</div>`;

  html += "</div>";

  // Dados
  html += '<div class="section-hdr"><h3>Dados</h3></div>';
  html += '<div class="profile-section">';
  html += `<div class="profile-row"><span class="label">Empresa atual</span><span class="value">${c.empresa}</span></div>`;
  html += `<div class="profile-row"><span class="label">Cargo</span><span class="value">${c.cargo}</span></div>`;
  html += "</div>";

  // Empresas Vinculadas
  html += '<div class="section-hdr"><h3>Empresas Vinculadas</h3></div>';
  html += '<div class="profile-section">';
  for (const emp of c.empresas) {
    const isActive = emp.id === c.empresaId;
    html += `<div class="profile-row">
      <div>
        <div style="font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px">
          ${isActive ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--pa-green);display:inline-block"></span>' : ""}
          ${emp.nome}
        </div>
        <div style="font-size:12px;color:var(--pa-muted)">${emp.cnpj}</div>
      </div>
      ${isActive ? '<span style="font-size:11px;color:var(--pa-green);font-weight:700">ATIVA</span>' : ""}
    </div>`;
  }
  html += "</div>";

  // App
  html += '<div class="section-hdr"><h3>App</h3></div>';
  html += '<div class="profile-section">';
  html += '<div class="profile-row"><span class="label">Versao</span><span class="value">1.0.0-proto</span></div>';
  html += '<div class="profile-row"><span class="label">Modo</span><span class="value">Prototipo</span></div>';
  html += "</div>";

  screen.innerHTML = html;
})();
