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
 */
function listarFuncionarios() {
  try {
    const sheet = getSheetByName('Usuarios');
    if (!sheet) return [];
    
    const dados = sheet.getDataRange().getValues();
    const lista = [];
    
    // Opcional: Adiciona uma opção global para o administrador ver tudo
    lista.push({ nome: "Todos os Técnicos", login: "todos" });
    
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
 * 4. BUSCAR DADOS FILTRADOS PARA TABELA ANALÍTICA E FECHAMENTO
 * Coleta os registros estruturados e calcula os somatórios essenciais
 */
function buscarDadosDashboard(loginTarget, dataInicio, dataFim) {
  try {
    const sheet = getSheetByName('Produtividade');
    if (!sheet) return { sucesso: true, registros: [], metricas: { totalElementos: 0, faturamentoTotal: 0 } };
    
    const dados = sheet.getDataRange().getValues();
    const registrosFiltrados = [];
    
    let totalElementosPeriodo = 0;
    let faturamentoTotalPeriodo = 0;
    
    const dInicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
    const dFim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
    
    const loginProcurado = loginTarget ? loginTarget.toString().trim().toLowerCase() : "";

    // Varre de baixo para cima para trazer os registros mais recentes primeiro
    for (let i = dados.length - 1; i >= 1; i--) {
      const usuarioLinha = dados[i][1].toString().trim().toLowerCase();
      const dataLinha = new Date(dados[i][6]); // Coluna G: DATATIME
      
      // Filtro dinâmico por usuário (se for "todos", ignora a checagem de login e traz tudo do período)
      if (loginProcurado === "todos" || usuarioLinha === loginProcurado) {
        
        // Filtro por intervalo de datas baseado na Coluna G
        if (dInicio && dataLinha < dInicio) continue;
        if (dFim && dataLinha > dFim) continue;
        
        const qtd = Number(dados[i][5]);   // Coluna F: QUANTIDADE
        const valor = Number(dados[i][7]); // Coluna H: VALOR
        const subtotal = qtd * valor;

        totalElementosPeriodo += qtd;
        faturamentoTotalPeriodo += subtotal;

        registrosFiltrados.push({
          id: dados[i][0],            // Coluna A
          usuario: dados[i][1],       // Coluna B
          dentista: dados[i][2],      // Coluna C
          paciente: dados[i][3],      // Coluna D
          producao: dados[i][4],      // Coluna E
          quantidade: qtd,            // Coluna F
          data: Utilities.formatDate(dataLinha, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"), 
          valor: valor,               // Coluna H
          subtotal: subtotal          // Calculado para renderização do Front
        });
      }
    }

    return {
      sucesso: true,
      registros: registrosFiltrados,
      metricas: { 
        totalElementos: totalElementosPeriodo, 
        faturamentoTotal: faturamentoTotalPeriodo 
      }
    };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao processar busca de dados: ' + erro.message };
  }
}
