// Presenca Agro — Mock data for prototype

window.PA_DATA = {
  consultor: {
    nome: "Onofre Silva",
    empresa: "Revenda AgroPlus",
    empresaId: "emp-001",
    cargo: "Consultor de Campo",
    foto: null,
    empresas: [
      { id: "emp-001", nome: "Revenda AgroPlus", cnpj: "12.345.678/0001-90" },
      { id: "emp-002", nome: "Agro Insumos Ltda", cnpj: "98.765.432/0001-10" },
    ],
  },

  clientes: [
    {
      id: "cl-001",
      nome: "Joao Pedro Almeida",
      telefone: "(64) 99912-3456",
      email: "joao.almeida@fazsjp.com.br",
      fazendas: [
        {
          id: "fz-001",
          nome: "Fazenda Sao Joao",
          municipio: "Rio Verde - GO",
          areaTotal: 1200,
          slaStatus: "amber",
          diasSemVisita: 12,
          slaFrequencia: "Quinzenal",
          coordenadas: { lat: -17.7927, lng: -50.9192 },
          talhoes: [
            {
              id: "t-1",
              nome: "Pivo 01",
              areaHa: 120,
              safras: [
                {
                  id: "s-1",
                  safra: "2025/26",
                  cultura: "Soja",
                  semente: "TMG 2381 RR",
                  dataPlantio: "2025-10-15",
                  cicloDias: 120,
                  cenarioColheita: "base",
                  margemDias: 5,
                  previsaoColheita: "2026-02-12",
                  adubacaoBase: "08-28-16 (350 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 68.2,
                  umidade: 13.5,
                  dataColheira: "2026-02-15",
                },
                {
                  id: "s-2",
                  safra: "2024/25",
                  cultura: "Soja",
                  semente: "NS 7901 RR",
                  dataPlantio: "2024-10-10",
                  cicloDias: 115,
                  cenarioColheita: "base",
                  margemDias: 5,
                  previsaoColheita: "2025-02-02",
                  adubacaoBase: "04-14-08 (400 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 62.0,
                  umidade: 14.1,
                  dataColheira: "2025-02-05",
                },
              ],
            },
            {
              id: "t-2",
              nome: "Pivo 02",
              areaHa: 95,
              safras: [
                {
                  id: "s-3",
                  safra: "2025/26",
                  cultura: "Soja",
                  semente: "TMG 2381 RR",
                  dataPlantio: "2025-10-18",
                  cicloDias: 120,
                  cenarioColheita: "base",
                  margemDias: 5,
                  previsaoColheita: "2026-02-15",
                  adubacaoBase: "08-28-16 (350 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 65.8,
                  umidade: 13.8,
                  dataColheira: "2026-02-18",
                },
              ],
            },
            {
              id: "t-3",
              nome: "Talhao Norte",
              areaHa: 200,
              safras: [
                {
                  id: "s-4",
                  safra: "2025/26",
                  cultura: "Milho safrinha",
                  semente: "AG 9045 PRO3",
                  dataPlantio: "2026-02-20",
                  cicloDias: 150,
                  cenarioColheita: "base",
                  margemDias: 7,
                  previsaoColheita: "2026-07-20",
                  adubacaoBase: "08-28-16 (300 kg/ha)",
                  status: "aberta",
                  produtividadeReal: null,
                  umidade: null,
                  dataColheira: null,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cl-002",
      nome: "Maria Santos",
      telefone: "(64) 99945-6789",
      email: "maria@boavista.agr.br",
      fazendas: [
        {
          id: "fz-002",
          nome: "Fazenda Boa Vista",
          municipio: "Jatai - GO",
          areaTotal: 800,
          slaStatus: "green",
          diasSemVisita: 4,
          slaFrequencia: "Semanal",
          coordenadas: { lat: -17.8819, lng: -51.7148 },
          talhoes: [
            {
              id: "t-4",
              nome: "Pivo 01",
              areaHa: 130,
              safras: [
                {
                  id: "s-5",
                  safra: "2025/26",
                  cultura: "Algodao",
                  semente: "TMG 47 B2RF",
                  dataPlantio: "2026-01-10",
                  cicloDias: 180,
                  cenarioColheita: "base",
                  margemDias: 10,
                  previsaoColheita: "2026-07-09",
                  adubacaoBase: "10-30-10 (400 kg/ha)",
                  status: "aberta",
                  produtividadeReal: null,
                  umidade: null,
                  dataColheira: null,
                },
              ],
            },
            {
              id: "t-5",
              nome: "Talhao Sul",
              areaHa: 180,
              safras: [
                {
                  id: "s-6",
                  safra: "2025/26",
                  cultura: "Soja",
                  semente: "M 8210 IPRO",
                  dataPlantio: "2025-10-20",
                  cicloDias: 125,
                  cenarioColheita: "otimista",
                  margemDias: 5,
                  previsaoColheita: "2026-02-22",
                  adubacaoBase: "02-20-20 (350 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 71.5,
                  umidade: 12.9,
                  dataColheira: "2026-02-20",
                },
                {
                  id: "s-7",
                  safra: "2024/25",
                  cultura: "Soja",
                  semente: "NS 7901 RR",
                  dataPlantio: "2024-10-12",
                  cicloDias: 120,
                  cenarioColheita: "base",
                  margemDias: 5,
                  previsaoColheita: "2025-02-09",
                  adubacaoBase: "04-14-08 (350 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 64.3,
                  umidade: 13.6,
                  dataColheira: "2025-02-12",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cl-003",
      nome: "Pedro Oliveira",
      telefone: "(64) 99978-1234",
      email: "pedro@sitiotresirmaos.com",
      fazendas: [
        {
          id: "fz-003",
          nome: "Sitio Tres Irmaos",
          municipio: "Mineiros - GO",
          areaTotal: 150,
          slaStatus: "red",
          diasSemVisita: 41,
          slaFrequencia: "Mensal",
          coordenadas: { lat: -17.5685, lng: -52.5507 },
          talhoes: [
            {
              id: "t-6",
              nome: "Talhao Unico",
              areaHa: 150,
              safras: [
                {
                  id: "s-8",
                  safra: "2025/26",
                  cultura: "Cafe",
                  semente: "Catuai Vermelho",
                  dataPlantio: "2023-11-01",
                  cicloDias: null,
                  cenarioColheita: null,
                  margemDias: null,
                  previsaoColheita: "2026-06-01",
                  adubacaoBase: "20-05-20 (500 kg/ha)",
                  status: "aberta",
                  produtividadeReal: null,
                  umidade: null,
                  dataColheira: null,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cl-004",
      nome: "Carlos Ribeiro",
      telefone: "(64) 99901-5678",
      email: "carlos@aurora.agr.br",
      fazendas: [
        {
          id: "fz-004",
          nome: "Fazenda Aurora",
          municipio: "Montividiu - GO",
          areaTotal: 2400,
          slaStatus: "green",
          diasSemVisita: 7,
          slaFrequencia: "Quinzenal",
          coordenadas: { lat: -17.4423, lng: -51.1735 },
          talhoes: [
            {
              id: "t-7",
              nome: "Talhao Leste",
              areaHa: 300,
              safras: [
                {
                  id: "s-9",
                  safra: "2025/26",
                  cultura: "Milho safrinha",
                  semente: "DKB 390 PRO3",
                  dataPlantio: "2026-02-15",
                  cicloDias: 145,
                  cenarioColheita: "base",
                  margemDias: 7,
                  previsaoColheita: "2026-07-10",
                  adubacaoBase: "08-28-16 (320 kg/ha)",
                  status: "aberta",
                  produtividadeReal: null,
                  umidade: null,
                  dataColheira: null,
                },
              ],
            },
            {
              id: "t-8",
              nome: "Pivo Central",
              areaHa: 150,
              safras: [
                {
                  id: "s-10",
                  safra: "2025/26",
                  cultura: "Soja",
                  semente: "TMG 2381 RR",
                  dataPlantio: "2025-10-12",
                  cicloDias: 120,
                  cenarioColheita: "conservador",
                  margemDias: 5,
                  previsaoColheita: "2026-02-14",
                  adubacaoBase: "08-28-16 (380 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 70.1,
                  umidade: 13.2,
                  dataColheira: "2026-02-17",
                },
                {
                  id: "s-11",
                  safra: "2024/25",
                  cultura: "Soja",
                  semente: "TMG 2381 RR",
                  dataPlantio: "2024-10-08",
                  cicloDias: 120,
                  cenarioColheita: "base",
                  margemDias: 5,
                  previsaoColheita: "2025-02-05",
                  adubacaoBase: "04-14-08 (350 kg/ha)",
                  status: "fechada",
                  produtividadeReal: 66.4,
                  umidade: 13.9,
                  dataColheira: "2025-02-08",
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // Historico de visitas registradas
  visitasHistorico: [
    {
      id: "v-001",
      data: "2026-05-16",
      hora: "08:30",
      clienteId: "cl-002",
      fazendaId: "fz-002",
      talhaoId: "t-5",
      tipo: "avaliacao",
      tipoLabel: "Avaliacao de Plantio",
      tipoIcon: "🔍",
      resumo: "Soja em estagio R5.3, bom enchimento de graos.",
      ocorrencias: [
        {
          nome: "Percevejo marrom",
          nivel: "Moderado (2/pano de batida)",
          recomendacao: "Monitorar proxima semana, ponto de controle nao atingido",
          fotos: [
            { id: "f-1", geo: "-17.8821, -51.7150", hora: "08:45" },
          ],
        },
      ],
      vendaGerada: null,
    },
    {
      id: "v-002",
      data: "2026-05-14",
      hora: "07:30",
      clienteId: "cl-001",
      fazendaId: "fz-001",
      talhaoId: "t-1",
      tipo: "aplicacao",
      tipoLabel: "Aplicacao / Manejo",
      tipoIcon: "💧",
      resumo: "Aplicacao de fungicida preventivo para ferrugem asiatica.",
      ocorrencias: [],
      aplicacao: {
        produto: "Fox Xpro (Bayer)",
        dose: "0.4 L/ha",
        areaAplicada: 120,
        estagioFenologico: "R1",
        tipoAplicacao: "Fungicida preventivo",
      },
      vendaGerada: "op-001",
    },
    {
      id: "v-003",
      data: "2026-05-10",
      hora: "09:00",
      clienteId: "cl-001",
      fazendaId: "fz-001",
      talhaoId: "t-3",
      tipo: "plantio",
      tipoLabel: "Registro de Plantio",
      tipoIcon: "🌱",
      resumo: "Registro de plantio de milho safrinha apos colheita da soja.",
      ocorrencias: [],
      vendaGerada: null,
    },
    {
      id: "v-004",
      data: "2026-05-08",
      hora: "14:00",
      clienteId: "cl-001",
      fazendaId: "fz-001",
      talhaoId: "t-1",
      tipo: "vistoria",
      tipoLabel: "Vistoria de Praga",
      tipoIcon: "🐛",
      resumo: "Ferrugem asiatica detectada em estagio inicial nas bordas.",
      ocorrencias: [
        {
          nome: "Ferrugem asiatica",
          nivel: "Baixo (pustulas iniciais na borda)",
          recomendacao: "Aplicar fungicida preventivo nos proximos 3 dias",
          fotos: [
            { id: "f-2", geo: "-17.7930, -50.9195", hora: "14:15" },
            { id: "f-3", geo: "-17.7928, -50.9190", hora: "14:22" },
          ],
        },
      ],
      vendaGerada: "op-001",
    },
    {
      id: "v-005",
      data: "2026-04-09",
      hora: "10:00",
      clienteId: "cl-003",
      fazendaId: "fz-003",
      talhaoId: "t-6",
      tipo: "avaliacao",
      tipoLabel: "Avaliacao de Plantio",
      tipoIcon: "🔍",
      resumo: "Cafe com bom desenvolvimento vegetativo, sem pragas aparentes.",
      ocorrencias: [],
      vendaGerada: null,
    },
    {
      id: "v-006",
      data: "2026-05-18",
      hora: "07:00",
      clienteId: "cl-004",
      fazendaId: "fz-004",
      talhaoId: "t-7",
      tipo: "avaliacao",
      tipoLabel: "Avaliacao de Plantio",
      tipoIcon: "🔍",
      resumo: "Milho safrinha em V6, stand regular, sem problemas.",
      ocorrencias: [],
      vendaGerada: null,
    },
  ],

  // Oportunidades comerciais
  oportunidades: [
    {
      id: "op-001",
      data: "2026-05-08",
      clienteId: "cl-001",
      fazendaId: "fz-001",
      visitaOrigemId: "v-004",
      status: "fechada",
      titulo: "Fungicida Fox Xpro - Pivo 01",
      produtos: [
        { nome: "Fox Xpro (Bayer)", qtd: "48 L", valorUnit: 185.0, total: 8880.0 },
        { nome: "Oleo mineral Nimbus", qtd: "24 L", valorUnit: 28.0, total: 672.0 },
      ],
      valorTotal: 9552.0,
      dataFechamento: "2026-05-10",
    },
    {
      id: "op-002",
      data: "2026-05-16",
      clienteId: "cl-002",
      fazendaId: "fz-002",
      visitaOrigemId: "v-001",
      status: "aberta",
      titulo: "Inseticida para percevejo - Talhao Sul",
      produtos: [
        { nome: "Connect (Bayer)", qtd: "36 L", valorUnit: 95.0, total: 3420.0 },
      ],
      valorTotal: 3420.0,
      dataFechamento: null,
    },
    {
      id: "op-003",
      data: "2026-05-18",
      clienteId: "cl-004",
      fazendaId: "fz-004",
      visitaOrigemId: "v-006",
      status: "aberta",
      titulo: "Adubacao de cobertura - Talhao Leste",
      produtos: [
        { nome: "Ureia (46-00-00)", qtd: "6.000 kg", valorUnit: 2.8, total: 16800.0 },
      ],
      valorTotal: 16800.0,
      dataFechamento: null,
    },
  ],

  // Backward-compat shortcuts
  get fazendasProximas() {
    return this.clientes.flatMap((c) =>
      c.fazendas.map((f) => ({
        ...f,
        cliente: c.nome,
        clienteId: c.id,
        distanciaKm: +(Math.random() * 8 + 0.3).toFixed(1),
      }))
    ).sort((a, b) => a.distanciaKm - b.distanciaKm);
  },

  tiposVisita: [
    { id: "plantio", label: "Registro de Plantio", icon: "🌱" },
    { id: "avaliacao", label: "Avaliacao de Plantio", icon: "🔍" },
    { id: "aplicacao", label: "Aplicacao / Manejo", icon: "💧" },
    { id: "vistoria", label: "Vistoria de Praga", icon: "🐛" },
    { id: "colheita", label: "Colheita", icon: "🌾" },
  ],

  ocorrenciasComuns: [
    "Ferrugem asiatica",
    "Lagarta da soja",
    "Mofo branco",
    "Percevejo marrom",
    "Mancha alvo",
    "Deficiencia de potassio",
  ],

  agenda: [
    {
      data: "2026-05-20",
      itens: [
        { hora: "08:00", durMin: 90, tipo: "scheduled", titulo: "Fazenda Sao Joao", sub: "Avaliacao de Plantio - Pivo 01 e 02", fazendaId: "fz-001" },
        { hora: "10:30", durMin: 60, tipo: "scheduled", titulo: "Fazenda Boa Vista", sub: "Vistoria de Praga - Pivo 01", fazendaId: "fz-002" },
        { hora: "14:00", durMin: 120, tipo: "overdue", titulo: "Sitio Tres Irmaos", sub: "SLA vencido ha 11 dias", fazendaId: "fz-003" },
      ],
    },
    {
      data: "2026-05-21",
      itens: [
        { hora: "07:30", durMin: 90, tipo: "scheduled", titulo: "Fazenda Aurora", sub: "Aplicacao / Manejo - Talhao Leste", fazendaId: "fz-004" },
        { hora: "---", durMin: 0, tipo: "harvest", titulo: "Janela de colheita: Pivo 03 (Sao Joao)", sub: "Soja 25/26 - cenario base" },
      ],
    },
    {
      data: "2026-05-22",
      itens: [
        { hora: "09:00", durMin: 90, tipo: "scheduled", titulo: "Fazenda Alvorada", sub: "Avaliacao de Plantio" },
      ],
    },
    {
      data: "2026-05-23",
      itens: [],
    },
    {
      data: "2026-05-24",
      itens: [
        { hora: "---", durMin: 0, tipo: "harvest", titulo: "Janela de colheita: Talhao Norte", sub: "Milho safrinha - +/- 4 dias" },
      ],
    },
  ],

  diasSemana: ["D", "S", "T", "Q", "Q", "S", "S"],
};

// Helper: find entities
window.PA_FIND = {
  cliente(id) { return PA_DATA.clientes.find((c) => c.id === id); },
  fazenda(id) {
    for (const c of PA_DATA.clientes)
      for (const f of c.fazendas)
        if (f.id === id) return { ...f, cliente: c };
    return null;
  },
  talhao(id) {
    for (const c of PA_DATA.clientes)
      for (const f of c.fazendas)
        for (const t of f.talhoes)
          if (t.id === id) return { ...t, fazenda: f, cliente: c };
    return null;
  },
  visitasPorTalhao(talhaoId) {
    return PA_DATA.visitasHistorico.filter((v) => v.talhaoId === talhaoId);
  },
  visitasPorFazenda(fazendaId) {
    return PA_DATA.visitasHistorico.filter((v) => v.fazendaId === fazendaId);
  },
  oportunidadesPorCliente(clienteId) {
    return PA_DATA.oportunidades.filter((o) => o.clienteId === clienteId);
  },
};
