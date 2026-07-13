/* ===========================================================
   admin-data.js
   Camada de acesso a dados do painel: lê e grava arquivos
   (JSON e HTML) através das Netlify Functions autenticadas,
   usando o token do usuário logado via Netlify Identity.
   =========================================================== */

const AdminData = (() => {

  function getUsuarioAtual() {
    return window.netlifyIdentity && netlifyIdentity.currentUser();
  }

  async function getToken() {
    const user = getUsuarioAtual();
    if (!user) throw new Error('Usuário não autenticado.');
    await user.jwt(); // renova o token se necessário
    return user.token.access_token;
  }

  async function lerArquivo(caminho) {
    const token = await getToken();
    const resp = await fetch(`/.netlify/functions/ler-conteudo?caminho=${encodeURIComponent(caminho)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.erro || 'Erro ao ler arquivo.');
    }
    const data = await resp.json();
    return data.conteudo;
  }

  async function lerJSON(caminho) {
    const conteudo = await lerArquivo(caminho);
    return conteudo ? JSON.parse(conteudo) : null;
  }

  async function salvarArquivos(arquivos, mensagemCommit) {
    const token = await getToken();
    const resp = await fetch('/.netlify/functions/salvar-conteudo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ arquivos, mensagemCommit })
    });
    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.erro || 'Erro ao salvar.');
    }
    return resp.json();
  }

  function paraBase64(arrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function arquivoParaBase64(file) {
    const buffer = await file.arrayBuffer();
    return paraBase64(buffer);
  }

  return { lerArquivo, lerJSON, salvarArquivos, arquivoParaBase64, getUsuarioAtual };
})();
