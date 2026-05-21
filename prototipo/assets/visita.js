// Presença Agro — Visit chat flow controller

const chat = document.getElementById("chat");
const qa = document.getElementById("qa");
const headerSub = document.getElementById("header-sub");

const state = {
  step: "boot",
  fazenda: null,
  tipo: null,
  talhao: null,
  ocorrencia: null,
  evidencias: 0,
};

const D = window.PA_DATA;

// ---------- helpers ----------
function botSay(text, delay = 350) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const b = document.createElement("div");
      b.className = "bubble bot";
      b.innerHTML = text;
      chat.appendChild(b);
      scrollDown();
      resolve();
    }, delay);
  });
}

function userSay(text, choice = false) {
  const b = document.createElement("div");
  b.className = "bubble user" + (choice ? " choice" : "");
  b.textContent = text;
  chat.appendChild(b);
  scrollDown();
}

function evidence(label, geo) {
  const e = document.createElement("div");
  e.className = "evidence";
  e.innerHTML = `
    <div class="thumb"></div>
    <div class="details">
      <strong>${label}</strong>
      <span>📍 ${geo}</span>
      <span>${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>`;
  chat.appendChild(e);
  scrollDown();
}

function setActions(buttons) {
  qa.innerHTML = "";
  buttons.forEach((b) => {
    const el = document.createElement("button");
    el.className = "qa-btn" + (b.variant ? " " + b.variant : "");
    el.innerHTML = (b.icon ? `<span class="ic">${b.icon}</span>` : "") + b.label;
    el.onclick = b.onClick;
    qa.appendChild(el);
  });
}

function clearActions() { qa.innerHTML = ""; }
function scrollDown() { chat.scrollTop = chat.scrollHeight; }

// ---------- steps ----------
async function stepBoot() {
  headerSub.textContent = "Detectando localização…";
  await botSay(`Olá <strong>${D.consultor.nome.split(" ")[0]}</strong>! 👋`);
  await botSay("Detectei que você está perto de algumas fazendas. Qual delas você vai visitar?", 450);

  const opts = D.fazendasProximas.map((fz) => ({
    label: `${fz.nome} • ${fz.distanciaKm.toFixed(1)} km`,
    icon: fz.slaStatus === "red" ? "🔴" : fz.slaStatus === "amber" ? "🟡" : "🟢",
    onClick: () => choseFarm(fz),
  }));
  opts.push({ label: "Buscar outra fazenda", icon: "🔍", variant: "primary", onClick: () => searchFarm() });
  setActions(opts);
}

function choseFarm(fz) {
  state.fazenda = fz;
  userSay(fz.nome, true);
  headerSub.textContent = fz.nome;
  stepVisitType();
}

function searchFarm() {
  userSay("Buscar outra fazenda…", true);
  botSay("🔍 (Busca não implementada no protótipo — use uma das opções acima.)");
}

async function stepVisitType() {
  await botSay("Ótimo! Qual é o <strong>tipo de visita</strong> hoje?", 400);

  setActions(
    D.tiposVisita.map((t) => ({
      label: `${t.icon} ${t.label}`,
      onClick: () => choseType(t),
    }))
  );
}

function choseType(t) {
  state.tipo = t;
  userSay(`${t.icon} ${t.label}`, true);
  stepTalhao();
}

async function stepTalhao() {
  await botSay(`Em qual <strong>talhão</strong> da ${state.fazenda.nome}?`);
  setActions(
    state.fazenda.talhoes.map((t) => ({
      label: `${t.nome} • ${t.cultura}`,
      onClick: () => choseTalhao(t),
    }))
  );
}

function choseTalhao(t) {
  state.talhao = t;
  userSay(t.nome, true);
  stepStart();
}

async function stepStart() {
  await botSay(`✅ Visita iniciada: <strong>${state.tipo.label}</strong> no <strong>${state.talhao.nome}</strong>.`);
  await botSay("Identificou alguma <strong>ocorrência</strong>?", 500);
  setActions([
    { label: "Sim, registrar", icon: "📝", variant: "primary", onClick: () => stepOccurrence() },
    { label: "Sem ocorrências", icon: "✅", onClick: () => stepFinalizeAsk() },
  ]);
}

async function stepOccurrence() {
  userSay("Sim, vou registrar uma ocorrência.", true);
  await botSay("Qual a ocorrência? Toque em uma sugestão ou use o microfone para ditar.");
  setActions(
    D.ocorrenciasComuns.slice(0, 4).map((o) => ({
      label: o,
      onClick: () => choseOccurrence(o),
    })).concat([
      { label: "🎙️ Ditar", variant: "primary", onClick: () => simulateVoice() },
    ])
  );
}

async function simulateVoice() {
  userSay("🎙️ Gravando…");
  await new Promise((r) => setTimeout(r, 1200));
  const txt = "Ferrugem asiática em estágio inicial nas plantas da borda do talhão.";
  userSay(`🗣️ "${txt}"`, true);
  await botSay("Transcrito on-device ✓");
  choseOccurrence("Ferrugem asiática", txt);
}

async function choseOccurrence(nome, descricao) {
  state.ocorrencia = nome;
  if (!descricao) userSay(nome, true);
  await botSay(`Anexar evidências fotográficas para <strong>${nome}</strong>?`);
  setActions([
    { label: "📷 Tirar foto", variant: "primary", onClick: () => takePhoto() },
    { label: "Pular", onClick: () => stepNextOccurrenceOrFinish() },
  ]);
}

async function takePhoto() {
  userSay("📷 Foto capturada", true);
  state.evidencias++;
  const geo = `-15.78${Math.floor(Math.random() * 90 + 10)}, -47.92${Math.floor(Math.random() * 90 + 10)}`;
  evidence(`Foto ${state.evidencias} — ${state.ocorrencia}`, geo);
  await botSay("Foto salva com geolocalização ✓");
  setActions([
    { label: "📷 Outra foto", onClick: () => takePhoto() },
    { label: "Concluir ocorrência", variant: "primary", onClick: () => stepNextOccurrenceOrFinish() },
  ]);
}

async function stepNextOccurrenceOrFinish() {
  await botSay("Mais alguma ocorrência?");
  setActions([
    { label: "📝 Nova ocorrência", onClick: () => stepOccurrence() },
    { label: "Finalizar visita", variant: "primary", icon: "✅", onClick: () => stepFinalizeAsk() },
  ]);
}

async function stepFinalizeAsk() {
  userSay("Finalizar visita", true);
  await botSay("Deseja gerar o <strong>relatório PDF</strong> agora?");
  setActions([
    { label: "📄 Gerar e compartilhar", variant: "primary", onClick: () => stepPdf() },
    { label: "Mais tarde", onClick: () => stepDone() },
  ]);
}

async function stepPdf() {
  userSay("Gerar PDF", true);
  await botSay("⏳ Gerando relatório…");
  await new Promise((r) => setTimeout(r, 900));
  await botSay(`<strong>📄 Relatório — ${state.fazenda.nome}.pdf</strong> pronto.<br/>Toque abaixo para compartilhar via WhatsApp, e-mail ou Drive.`);
  setActions([
    { label: "📤 Compartilhar (share sheet)", variant: "primary", onClick: () => simulateShare() },
    { label: "Finalizar", onClick: () => stepDone() },
  ]);
}

async function simulateShare() {
  await botSay("📤 Abrindo opções de compartilhamento do sistema…");
  await new Promise((r) => setTimeout(r, 800));
  alert("📤 Share Sheet (simulado)\n\n• WhatsApp — João Pedro Almeida\n• E-mail\n• Google Drive\n• Mais…");
  stepDone();
}

async function stepDone() {
  await botSay("✅ Visita registrada com sucesso. Bom trabalho!");
  await botSay(`<small>Resumo: ${state.tipo.label} • ${state.fazenda.nome} • ${state.talhao.nome} • ${state.evidencias} foto(s)</small>`);
  setActions([
    { label: "Nova visita", variant: "primary", onClick: () => location.reload() },
    { label: "Ir para agenda", onClick: () => (location.href = "./calendario.html") },
  ]);
}

// ---------- mic shortcut ----------
document.getElementById("micBtn").addEventListener("click", () => {
  if (state.step === "boot" || state.tipo === null) {
    alert("🎙️ O microfone está disponível dentro do registro de ocorrência.");
    return;
  }
  simulateVoice();
});

// Kickoff
stepBoot();
