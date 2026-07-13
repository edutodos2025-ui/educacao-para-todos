/* ===========================================================
   ler-conteudo.js
   Netlify Function que lê um arquivo do repositório GitHub
   (a versão mais recente, mesmo que ainda não publicada pelo
   Netlify) para o painel /admin exibir dados sempre atuais.
   =========================================================== */

const { Octokit } = require('@octokit/rest');

exports.handler = async function (event, context) {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ erro: 'Não autenticado.' }) };
  }

  const caminho = event.queryStringParameters && event.queryStringParameters.caminho;
  if (!caminho) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Parâmetro "caminho" é obrigatório.' }) };
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  const octokit = new Octokit({ auth: token });

  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: caminho, ref: branch });
    const conteudo = Buffer.from(data.content, 'base64').toString('utf-8');
    return { statusCode: 200, body: JSON.stringify({ conteudo, sha: data.sha }) };
  } catch (err) {
    if (err.status === 404) {
      return { statusCode: 404, body: JSON.stringify({ erro: 'Arquivo não encontrado.' }) };
    }
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ erro: 'Erro ao ler do GitHub: ' + err.message }) };
  }
};
