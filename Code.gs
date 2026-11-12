var PLANILHA_ID = '1ztpntOisx0drmA45CqNxPylAucOawTcbn3DVJe3kHxs';
var GID_CAMISETA = 0;
var GID_CHURRASCO = 888161989;
var TAMANHOS = ['P', 'M', 'G', 'GG', 'XG', 'XGG', 'EXG'];

// Acha a aba pelo gid (não quebra se o nome tiver espaço sobrando)
function aba(gid) {
  var sheets = SpreadsheetApp.openById(PLANILHA_ID).getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  return null;
}

// Limpa o texto e evita que vire fórmula na planilha
function limpa(v) {
  v = String(v || '').trim().slice(0, 100);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function gravar(p) {
  var nome = limpa(p.nome);
  var tel = String(p.telefone || '').trim().slice(0, 30);
  var pag = limpa(p.pagamento);
  if (!nome || !tel || !pag) return { ok: false, erro: 'campos obrigatorios' };

  var lock = LockService.getScriptLock();
  lock.waitLock(15000); // evita perder linhas quando duas pessoas enviam juntas
  try {
    if (p.aba === 'Camiseta') {
      if (TAMANHOS.indexOf(p.tamanho) < 0) return { ok: false, erro: 'tamanho invalido' };
      aba(GID_CAMISETA).appendRow([nome, p.tamanho, "'" + tel, pag]);
    } else if (p.aba === 'Churrasco') {
      aba(GID_CHURRASCO).appendRow([nome, "'" + tel, pag]);
    } else {
      return { ok: false, erro: 'aba invalida' };
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function resposta(obj, cb) {
  if (cb && /^[A-Za-z0-9_]{1,40}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(obj.ok ? 'ok' : 'erro: ' + obj.erro);
}

// O site envia por aqui (GET). Sem parâmetros, só mostra que está ativo.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.aba) return ContentService.createTextOutput('Script ativo');
  return resposta(gravar(p), p.callback);
}

// Aceita POST também (curl, outros testes)
function doPost(e) {
  var p = (e && e.parameter) || {};
  return resposta(gravar(p), p.callback);
}

// Teste dentro do editor: selecione testeGravar e clique em Executar
function testeGravar() {
  var r = gravar({ aba: 'Churrasco', nome: 'Teste', telefone: '21999999999', pagamento: 'Ja paguei' });
  Logger.log(JSON.stringify(r)); // deve mostrar {"ok":true}
}
