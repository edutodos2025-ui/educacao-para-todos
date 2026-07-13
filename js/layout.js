/* ===========================================================
   layout.js
   Monta o cabeçalho e rodapé em todas as páginas do site,
   lendo os itens de menu a partir de data/site.json.
   Assim, quando o painel /admin adicionar uma página nova,
   ela aparece automaticamente no menu de todo o site.
   =========================================================== */

async function carregarSiteData() {
  const resp = await fetch('/data/site.json');
  if (!resp.ok) throw new Error('Não foi possível carregar site.json');
  return resp.json();
}

function caminhoRaiz() {
  // Permite que o layout funcione tanto em /pagina.html quanto em /kits/slug/experimento.html
  const profundidade = window.location.pathname.split('/').filter(Boolean).length;
  const emSubpasta = window.location.pathname.includes('/kits/');
  return emSubpasta ? '../../' : '/';
}

function montarLogoSVG() {
  return `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="10" fill="#93c5fd"/>
      <path d="M32 6 C10 6 4 20 4 32 C4 44 10 58 32 58" stroke="#1e3a8a" stroke-width="3" fill="none"/>
      <ellipse cx="32" cy="32" rx="26" ry="11" stroke="#1e3a8a" stroke-width="3" fill="none" transform="rotate(-25 32 32)"/>
      <ellipse cx="32" cy="32" rx="26" ry="11" stroke="#1e3a8a" stroke-width="3" fill="none" transform="rotate(25 32 32)"/>
      <path d="M20 22 C24 26 24 38 20 42" fill="#86efac"/>
      <path d="M42 20 C40 26 44 36 40 44" fill="#86efac"/>
    </svg>
  `;
}

function montarNavLinks(menu, raiz) {
  const principais = menu.filter(m => m.fixo).sort((a, b) => a.ordem - b.ordem);
  const secundarios = menu.filter(m => !m.fixo).sort((a, b) => a.ordem - b.ordem);

  const linksPrincipais = principais.map(item => {
    const href = item.href === '/' ? raiz : raiz + item.href.replace(/^\//, '');
    return `<li><a href="${href}">${item.label}</a></li>`;
  }).join('');

  const linksSecundarios = secundarios.map(item => {
    const href = raiz + item.href.replace(/^\//, '');
    return `<li><a href="${href}">${item.label}</a></li>`;
  }).join('');

  return linksPrincipais + linksSecundarios;
}

async function montarHeader() {
  const placeholder = document.getElementById('site-header');
  if (!placeholder) return;

  try {
    const data = await carregarSiteData();
    const raiz = caminhoRaiz();

    placeholder.innerHTML = `
      <header class="site-header">
        <nav class="nav-wrap">
          <a class="brand" href="${raiz}index.html">
            ${montarLogoSVG()}
            ${data.nomeSite}
          </a>
          <ul class="nav-links">
            ${montarNavLinks(data.menu, raiz)}
          </ul>
          <div class="nav-actions">
            <a class="btn btn-login" href="${raiz}admin/login.html">↪ Login</a>
          </div>
        </nav>
      </header>
    `;
  } catch (err) {
    console.error(err);
    placeholder.innerHTML = '<header class="site-header"><div class="nav-wrap"><span class="brand">Aventuras na Ciência</span></div></header>';
  }
}

function montarFooter() {
  const placeholder = document.getElementById('site-footer');
  if (!placeholder) return;
  const raiz = caminhoRaiz();

  placeholder.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} Aventuras na Ciência. Todos os direitos reservados.</p>
        <div class="footer-bottom">
          Feito para levar ciência prática a todas as escolas.
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  montarHeader();
  montarFooter();
});
