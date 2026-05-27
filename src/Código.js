/**
 * Configurações Iniciais e Renderização do Web App
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('flowLAB - Produtividade Protética')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * FUNÇÃO UTILITÁRIA: Permite incluir arquivos HTML externos (CSS/JS) dentro do Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetByName(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

/**
 * 1. AUTENTICAÇÃO DE USUÁRIO (LOGIN POR USUÁRIO E SENHA)
 */
function autenticarUsuario(usuario, senha) {
  try {
    const sheet = getSheetByName('Usuarios');
    if (!sheet) return { sucesso: false, mensagem: 'Aba de usuários não encontrada.' };
    
    const dados = sheet.getDataRange().getValues();
    
    const loginProcurado = usuario.trim().toLowerCase();
    const senhaProcurada = senha.trim().toString();
    
    for (let i = 1; i < dados.length; i++) {
      const usuarioPlanilha = dados[i][2].toString().trim().toLowerCase();
      const senhaPlanilha = dados[i][3].toString().trim();
      
      if (usuarioPlanilha === loginProcurado && senhaPlanilha === senhaProcurada) {
        return {
          sucesso: true,
          usuario: { 
            nome: dados[i][1], 
            login: dados[i][2], 
            cargo: dados[i][4] 
          }
        };
      }
    }
    return { sucesso: false, mensagem: 'Usuário ou senha incorretos.' };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro no servidor: ' + erro.message };
  }
}

/**
 * 2. LISTAR FUNCIONÁRIOS (EXCLUSIVO PARA O SELECT DO ADMIN NO FRONTEND)
 * Mapeia os usuários ativos e adiciona o token global para cálculos de BI
 */
function listarFuncionarios() {
  try {
    const sheet = getSheetByName('Usuarios');
    if (!sheet) return [];
    
    const dados = sheet.getDataRange().getValues();
    const lista = [];
  
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][2]) { 
        lista.push({
          nome: dados[i][1],
          login: dados[i][2]
        });
      }
    }
    return lista;
  } catch (erro) {
    return [];
  }
}

/**
 * 3. SALVAR REGISTRO DE PRODUTIVIDADE PROTÉTICA
 * Mapeia os dados seguindo a exata ordem do modelo de colunas (A até H)
 */
function salvarProdutividade(dados) {
  try {
    const sheet = getSheetByName('Produtividade');
    if (!sheet) return { sucesso: false, mensagem: 'Aba de produtividade não encontrada.' };

    const id = 'PROD' + Math.floor(Math.random() * 1000000);
    const dataHoraRegistro = new Date();
    
    // Alinhado com as Colunas A até H da planilha:
    // A:ID | B:USUARIO | C:DENTISTA | D:PACIENTE | E:PRODUÇÃO | F:QUANTIDADE | G:DATATIME | H:VALOR
    sheet.appendRow([
      id,
      dados.usuario_login,
      dados.dentista,
      dados.paciente,
      dados.producao,      
      Number(dados.quantidade),
      dataHoraRegistro,     
      Number(dados.valor)   
    ]);
    
    return { sucesso: true, mensagem: 'Trabalho de laboratório registrado com sucesso!' };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao salvar na planilha: ' + erro.message };
  }
}

/**
 * 4. BUSCAR DADOS FILTRADOS PARA TABELA ANALÍTICA, PAINEL DE BI E FECHAMENTO
 * Coleta os registros estruturados, executa cruzamento de dados e gera indicadores operacionais
 */
function buscarDadosDashboard(loginTarget, dataInicio, dataFim) {
  try {
    const sheetProd = getSheetByName('Produtividade');
    if (!sheetProd) return { sucesso: true, registros: [], metricas: {} };
    
    const dados = sheetProd.getDataRange().getValues();
    const registrosFiltrados = [];
    
    let totalElementosPeriodo = 0;
    let faturamentoTotalPeriodo = 0;
    
    // Dicionários para consolidação de dados e inteligência de BI
    const trackingTecnicos = {};
    const trackingItens = {};
    
    // Dicionário auxiliar para converter login de tabela em Nome Real
    const mapeamentoNomes = {};
    const sheetUser = getSheetByName('Usuarios');
    if (sheetUser) {
      const dadosUser = sheetUser.getDataRange().getValues();
      for (let u = 1; u < dadosUser.length; u++) {
        if (dadosUser[u][2]) {
          mapeamentoNomes[dadosUser[u][2].toString().trim().toLowerCase()] = dadosUser[u][1].toString().trim();
        }
      }
    }
    
    const dInicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
    const dFim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
    const loginProcurado = loginTarget ? loginTarget.toString().trim().toLowerCase() : "";

    for (let i = dados.length - 1; i >= 1; i--) {
      const usuarioLinha = dados[i][1].toString().trim().toLowerCase();
      
      // Validação defensiva de data para ignorar células em branco ou corrompidas
      if (!dados[i][6]) continue;
      const dataLinha = new Date(dados[i][6]); 
      
      if (loginProcurado === "todos" || usuarioLinha === loginProcurado) {
        if (dInicio && dataLinha < dInicio) continue;
        if (dFim && dataLinha > dFim) continue;
        
        const qtd = Number(dados[i][5]) || 0;   
        const valor = Number(dados[i][7]) || 0; 
        const subtotal = qtd * valor;
        const tipoTrabalho = dados[i][4].toString().trim();

        totalElementosPeriodo += qtd;
        faturamentoTotalPeriodo += subtotal;

        // --- Algoritmo de BI: Acumulação Estatística ---
        trackingTecnicos[usuarioLinha] = (trackingTecnicos[usuarioLinha] || 0) + qtd;
        trackingItens[tipoTrabalho] = (trackingItens[tipoTrabalho] || 0) + qtd;

        registrosFiltrados.push({
          id: dados[i][0],            
          usuario: mapeamentoNomes[usuarioLinha] || dados[i][1], // Mostra o Nome Real na tabela corporativa
          dentista: dados[i][2],      
          paciente: dados[i][3],      
          producao: tipoTrabalho,      
          quantidade: qtd,            
          data: Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"), 
          valor: valor,               
          subtotal: subtotal          
        });
      }
    }

    // Processamento do Ranking 1: Identificar Maior Produtor Comercial
    let topTecnico = "-";
    let topTecnicoQtd = 0;
    for (let tec in trackingTecnicos) {
      if (trackingTecnicos[tec] > topTecnicoQtd) {
        topTecnicoQtd = trackingTecnicos[tec];
        // Exibe o Nome Real do técnico no Card de BI em caixa alta
        topTecnico = (mapeamentoNomes[tec] || tec).toUpperCase();
      }
    }

    // Processamento do Ranking 2: Identificar Elemento de Maior Giro
    let topItem = "-";
    let topItemQtd = 0;
    for (let item in trackingItens) {
      if (trackingItens[item] > topItemQtd) {
        topItemQtd = trackingItens[item];
        topItem = item;
      }
    }

    return {
      sucesso: true,
      registros: registrosFiltrados,
      metricas: { 
        totalElementos: totalElementosPeriodo, 
        faturamentoTotal: faturamentoTotalPeriodo,
        ticketMedio: totalElementosPeriodo > 0 ? (faturamentoTotalPeriodo / totalElementosPeriodo) : 0,
        topTecnico: topTecnico,
        topTecnicoQtd: topTecnicoQtd,
        topItem: topItem,
        topItemQtd: topItemQtd
      }
    };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao processar busca de dados: ' + erro.message };
  }
}
