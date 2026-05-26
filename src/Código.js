/**
 * Configurações Iniciais e Renderização do Web App
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SaaS Odonto - Produtividade')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * FUNÇÃO UTILIÁRIA: Permite incluir arquivos HTML externos (CSS/JS) dentro do Index.html
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
    
    // Varre a planilha pulando o cabeçalho para gerar a lista do select
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
 * 3. SALVAR REGISTRO DE PRODUTIVIDADE
 */
function salvarProdutividade(dados) {
  try {
    const sheet = getSheetByName('Produtividade');
    const id = 'PROD' + Math.floor(Math.random() * 1000000);
    const dataRegistro = new Date();
    
    sheet.appendRow([
      id,
      dados.usuario_login, // Padronizado para salvar o identificador/login do usuário
      dados.data,
      dados.dentista,
      dados.procedimento,
      dados.descricao,
      dataRegistro
    ]);
    
    return { sucesso: true, mensagem: 'Produtividade registrada com sucesso!' };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao salvar: ' + erro.message };
  }
}

/**
 * 4. BUSCAR DADOS FILTRADOS POR DATA E LOGIN SELECIONADO
 */
function buscarDadosDashboard(loginTarget, dataInicio, dataFim) {
  try {
    const sheet = getSheetByName('Produtividade');
    if (!sheet) return { sucesso: true, registros: [], metricas: { totalPeriodo: 0 } };
    
    const dados = sheet.getDataRange().getValues();
    const registrosUsuario = [];
    let totalPeriodo = 0;
    
    const dInicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
    const dFim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
    
    const loginProcurado = loginTarget.toString().trim().toLowerCase();

    for (let i = dados.length - 1; i >= 1; i--) {
      // Filtra dinamicamente pelo login passado pelo frontend (seja o do próprio usuário ou o escolhido pelo Admin)
      if (dados[i][1].toString().trim().toLowerCase() === loginProcurado) {
        const dataProc = new Date(dados[i][2]);
        
        if (dInicio && dataProc < dInicio) continue;
        if (dFim && dataProc > dFim) continue;
        
        totalPeriodo++;

        registrosUsuario.push({
          id: dados[i][0],
          data: Utilities.formatDate(dataProc, Session.getScriptTimeZone(), "dd/MM/yyyy"),
          dentista: dados[i][3],
          procedimento: dados[i][4],
          descricao: dados[i][5]
        });
      }
    }

    return {
      sucesso: true,
      registros: registrosUsuario,
      metricas: { totalPeriodo: totalPeriodo }
    };
  } catch (erro) {
    return { sucesso: false, mensagem: 'Erro ao buscar dados: ' + erro.message };
  }
}