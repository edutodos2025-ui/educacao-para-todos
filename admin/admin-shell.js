/* ===========================================================
   admin-shell.js
   Monta a barra lateral do painel e garante que só usuários
   autenticados (Netlify Identity) acessem qualquer tela do
   /admin, exceto a própria login.html.
   =========================================================== */

const AdminShell = (() => {

  const ITENS_MENU = [
    { id: 'inicio', label: 'Painel', icone: '🏠', href: './editor.html' },
    { id: 'kits', label: 'Kits Educativos', icone: '🧪', href: './kits-lista.html' },
    { id: 'paginas', label: 'Páginas do Menu', icone: '📄', href: './paginas-lista.html' },
    { id: 'home', label: 'Conteúdo da Home', icone: '🎯', href: './home-editar.html' }
  ];

  function montarSidebar(idAtivo) {
    const root = document.getElementById('admin-sidebar-root');
    if (!root) return;

    const links = ITENS_MENU.map(item => `
      <a href="${item.href}" class="${item.id === idAtivo ? 'active' : ''}">
        <span>${item.icone}</span> ${item.label}
      </a>
    `).join('');

    root.innerHTML = `
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="10" fill="#93c5fd"/><ellipse cx="32" cy="32" rx="26" ry="11" stroke="#fff" stroke-width="3" fill="none" transform="rotate(-25 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="11" stroke="#fff" stroke-width="3" fill="none" transform="rotate(25 32 32)"/></svg>
          Painel de Edição
        </div>
        <nav class="admin-nav">
          ${links}
          <a href="/index.html" target="_blank">🔗 Ver site publicado</a>
        </nav>
        <div class="admin-user-box" id="admin-user-box">Carregando usuário...</div>
      </aside>
    `;
  }

  function mostrarToast(mensagem, tipo = 'info') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className = `toast show ${tipo}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4200);
  }

  function exigirLogin(idAtivo) {
    document.body.style.visibility = 'hidden';

    function aoIniciar(user) {
      if (!user) {
        window.location.href = './login.html';
        return;
      }
      document.body.style.visibility = 'visible';
      montarSidebar(idAtivo);
      const box = document.getElementById('admin-user-box');
      if (box) {
        box.innerHTML = `Conectado como<br><strong style="color:#e2e8f0;">${user.email}</strong><button id="btn-logout">Sair</button>`;
        document.getElementById('btn-logout').addEventListener('click', () => {
          netlifyIdentity.logout();
        });
      }
    }

    if (window.netlifyIdentity) {
      netlifyIdentity.on('init', aoIniciar);
      netlifyIdentity.on('logout', () => { window.location.href = './login.html'; });
      // caso o widget já tenha inicializado antes deste script rodar
      const atual = netlifyIdentity.currentUser();
      if (atual) aoIniciar(atual);
    } else {
      window.location.href = './login.html';
    }
  }

  return { exigirLogin, mostrarToast };
})();
