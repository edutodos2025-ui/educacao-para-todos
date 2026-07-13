/* ===========================================================
   templates-pagina.js
   Gera o HTML de uma página institucional simples (aquelas
   criadas pelo painel para o menu, ex: "Apoio Aluno"), a
   partir de uma lista de blocos de texto/imagem/título.
   Essas páginas vivem na raiz do site (1 nível de profundidade).
   =========================================================== */

if (typeof escapeHtml === "undefined" && typeof require !== "undefined") {
  var escapeHtml = require("./templates.js").escapeHtml;
}

function gerarPaginaInstitucional(pagina) {
  const blocosHtml = (pagina.blocos || []).map(bloco => {
    if (bloco.tipo === 'texto') {
      return `      <div class="block-text">${escapeHtml(bloco.conteudo || '')}</div>\n`;
    }
    if (bloco.tipo === 'imagem') {
      return `      <figure class="block-image">
        <img src="${bloco.url}" alt="${escapeHtml(bloco.legenda || pagina.titulo)}">
        ${bloco.legenda ? `<figcaption>${escapeHtml(bloco.legenda)}</figcaption>` : ''}
      </figure>\n`;
    }
    if (bloco.tipo === 'titulo') {
      return `      <h2 class="block-heading">${escapeHtml(bloco.conteudo)}</h2>\n`;
    }
    return '';
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pagina.titulo)} — Aventuras na Ciência</title>
<link rel="stylesheet" href="/css/style.css">
</head>
<body>

<div id="site-header"></div>

<div class="container experiment-header">
  <h1>${escapeHtml(pagina.titulo)}</h1>
</div>

<div class="container content-blocks">
${blocosHtml || '      <p style="color:#9ca3af;">Esta página ainda não tem conteúdo publicado.</p>\n'}
</div>

<div id="site-footer"></div>

<script src="/js/layout.js"></script>
</body>
</html>
`;
}

if (typeof module !== 'undefined') {
  module.exports = { gerarPaginaInstitucional };
}
