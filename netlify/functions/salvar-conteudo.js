/* ===========================================================
   salvar-conteudo.js
   Netlify Function chamada pelo painel /admin para persistir
   alterações. Fluxo:
   1. Verifica se a requisição tem um usuário autenticado via
      Netlify Identity (context.clientContext.user).
   2. Se autenticado, usa um token do GitHub (guardado como
      variável de ambiente secreta no Netlify — nunca no
      código do site) para ler/escrever arquivos no repositório.
   3. Recebe uma lista de arquivos a criar/atualizar e faz um
      commit único com todos eles.

   Variáveis de ambiente necessárias (configuradas no painel
   do Netlify, em Site settings > Environment variables):
     GITHUB_TOKEN      -> token de acesso pessoal do GitHub
                          com permissão de escrita no repo
     GITHUB_OWNER      -> usuário/organização dono do repo
     GITHUB_REPO       -> nome do repositório
     GITHUB_BRANCH     -> branch publicada (ex: "main")
   =========================================================== */

const { Octokit } = require('@octokit/rest');

exports.handler = async function (event, context) {
  // 1. Exige login válido (Netlify Identity injeta isso automaticamente
  //    quando o pedido inclui o header Authorization com o JWT do usuário)
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ erro: 'Não autenticado. Faça login para editar o conteúdo.' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ erro: 'Método não permitido.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'JSON inválido no corpo da requisição.' }) };
  }

  const { arquivos, mensagemCommit } = payload;
  // arquivos: [{ caminho: 'data/kits.json', conteudo: '...texto ou base64...', binario: false }, ...]

  if (!Array.isArray(arquivos) || arquivos.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Nenhum arquivo informado para salvar.' }) };
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Configuração do servidor incompleta. Verifique as variáveis de ambiente GITHUB_OWNER, GITHUB_REPO e GITHUB_TOKEN no Netlify.' })
    };
  }

  const octokit = new Octokit({ auth: token });

  try {
    // Pega o commit mais recente da branch para montar a árvore de arquivos
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const commitSha = refData.object.sha;

    const { data: commitData } = await octokit.git.getCommit({ owner, repo, commit_sha: commitSha });
    const baseTreeSha = commitData.tree.sha;

    // Cria um "blob" para cada arquivo (texto ou binário/base64)
    const treeItens = [];
    for (const arquivo of arquivos) {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: arquivo.conteudo,
        encoding: arquivo.binario ? 'base64' : 'utf-8'
      });
      treeItens.push({
        path: arquivo.caminho,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    }

    const { data: novaTree } = await octokit.git.createTree({
      owner, repo,
      base_tree: baseTreeSha,
      tree: treeItens
    });

    const { data: novoCommit } = await octokit.git.createCommit({
      owner, repo,
      message: mensagemCommit || `Atualização de conteúdo por ${user.email}`,
      tree: novaTree.sha,
      parents: [commitSha]
    });

    await octokit.git.updateRef({
      owner, repo,
      ref: `heads/${branch}`,
      sha: novoCommit.sha
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sucesso: true, commit: novoCommit.sha })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Erro ao salvar no GitHub: ' + err.message })
    };
  }
};
