function doPost(e) {
  var p = e.parameter;
  var ss = SpreadsheetApp.openById('1ztpntOisx0drmA45CqNxPylAucOawTcbn3DVJe3kHxs');
  var sh = ss.getSheetByName(p.aba);
  if (!sh) return ContentService.createTextOutput('aba invalida');
  if (p.aba === 'Camiseta') {
    sh.appendRow([p.nome, p.tamanho, "'" + p.telefone, p.pagamento]);
  } else {
    sh.appendRow([p.nome, "'" + p.telefone, p.pagamento]);
  }
  return ContentService.createTextOutput('ok');
}
