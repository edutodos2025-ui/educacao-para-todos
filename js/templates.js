/* ===========================================================
   templates.js
   Funções que geram o HTML final das páginas de Kit e de
   Experimento a partir dos dados (objeto kit / experimento).
   Usado pelo painel /admin para gravar arquivos no GitHub,
   e também disponível para regenerar tudo localmente.
   Nota: caminhos usam ../../ pois essas páginas vivem em
   /kits/{slug-kit}/arquivo.html (2 níveis de profundidade).
   =========================================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CHIP_INFO = {
  materiais:    { label: 'Materiais',    classe: 'chip-materiais' },
  experimentos: { label: 'Experimentos', classe: 'chip-experimentos' },
  video:        { label: 'Vídeo',        classe: 'chip-video' },
  manual:       { label: 'Manual PDF',   classe: 'chip-manual' }
};

function gerarPaginaKit(kit) {
  const listaExperimentosHtml = (kit.experimentos || [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map(exp => `
          <li>
            <a href="./${exp.slug}.html">
              <span class="bullet">+</span> ${escapeHtml(exp.titulo)}
            </a>
          </li>`).join('');

  const listaMateriaisHtml = (kit.materiais || []).map(m => `
        <div class="material-item">
          <span>✦ ${escapeHtml(m.nome)}</span>
          <div class="material-actions">
            ${m.temFoto ? '<button class="pill-btn">📷 Foto</button>' : ''}
          </div>
        </div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(kit.titulo)} — Aventuras na Ciência</title>
<link rel="stylesheet" href="../../css/style.css">
</head>
<body>

<div id="site-header"></div>

<section class="kit-hero">
  <div class="container kit-hero-grid">
    <div>
      <h1>${escapeHtml(kit.titulo)}</h1>
      <p>${escapeHtml(kit.resumoCurto)}</p>
    </div>
    <img src="${kit.imagemCapa || ''}" alt="${escapeHtml(kit.titulo)}" onerror="this.src='https://placehold.co/380x260/7c3aed/ffffff?text=Kit'">
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid-2" style="align-items:start;">
      <div>
        <div class="info-panel" style="margin-bottom:28px;">
          <h3>ℹ️ Sobre este Kit</h3>
          <p>${escapeHtml(kit.sobre)}</p>
        </div>

        <div class="info-panel">
          <h3>🔬 O que você pode explorar com o kit:</h3>
          <ul class="experiment-list">${listaExperimentosHtml}</ul>
        </div>
      </div>

      <div class="info-panel">
        <h3>ℹ️ Informações do Kit</h3>
        <p style="font-size:.9rem;color:#6b7280;margin-bottom:2px;"><strong>👥 Faixa Etária:</strong></p>
        <p style="margin-bottom:16px;">${escapeHtml(kit.faixaEtaria)}</p>

        <p style="font-size:.9rem;color:#6b7280;margin-bottom:2px;"><strong>🕒 Duração:</strong></p>
        <p style="margin-bottom:16px;">${kit.numeroExperimentos || (kit.experimentos || []).length} experimentos</p>

        <p style="font-size:.9rem;color:#6b7280;margin-bottom:10px;"><strong>📦 Materiais Inclusos:</strong></p>
        <div>${listaMateriaisHtml}</div>
      </div>
    </div>
  </div>
</section>

<div id="site-footer"></div>

<script src="../../js/layout.js"></script>
</body>
</html>
`;
}

function gerarPaginaExperimento(kit, experimento) {
  const blocosHtml = (experimento.blocos || []).map(bloco => {
    if (bloco.tipo === 'texto') {
      return `      <div class="block-text">${bloco.conteudoHtml || escapeHtml(bloco.conteudo || '')}</div>\n`;
    }
    if (bloco.tipo === 'imagem') {
      return `      <figure class="block-image">
        <img src="${bloco.url}" alt="${escapeHtml(bloco.legenda || experimento.titulo)}">
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
<title>${escapeHtml(experimento.titulo)} — ${escapeHtml(kit.titulo)}</title>
<link rel="stylesheet" href="../../css/style.css">
</head>
<body>

<div id="site-header"></div>

<div class="container experiment-header">
  <p class="breadcrumb">
    <a href="/kits.html">Kits Educativos</a> ›
    <a href="./index.html">${escapeHtml(kit.titulo)}</a> ›
    ${escapeHtml(experimento.titulo)}
  </p>
  <h1>${escapeHtml(experimento.titulo)}</h1>
</div>

<div class="container content-blocks">
${blocosHtml || '      <p style="color:#9ca3af;">Este experimento ainda não tem conteúdo publicado.</p>\n'}
</div>

<div id="site-footer"></div>

<script src="../../js/layout.js"></script>
</body>
</html>
`;
}

if (typeof module !== 'undefined') {
  module.exports = { gerarPaginaKit, gerarPaginaExperimento, escapeHtml };
}
