# Aventuras na Ciência

Site institucional e educativo, com painel de edição próprio (login + editor de blocos) para criar e manter kits educativos, experimentos e páginas do menu — sem precisar mexer em código.

## Como o site funciona

- **Site público**: HTML/CSS/JS puro. Nenhuma parte dele depende de PHP ou MySQL.
- **Dados**: guardados em dois arquivos JSON dentro do próprio repositório:
  - `data/site.json` — menu, textos da home, páginas institucionais
  - `data/kits.json` — todos os kits e seus experimentos
- **Painel `/admin`**: você entra com login e senha (via Netlify Identity) e edita tudo por formulários. Ao salvar, o painel gera automaticamente os arquivos HTML das páginas e faz um commit no GitHub. O Netlify detecta o commit e republica o site sozinho, em cerca de 1 minuto.

Nenhuma senha ou token fica exposto no código do site — a autenticação e o acesso ao GitHub acontecem dentro de uma Netlify Function, que roda no servidor da Netlify, não no navegador.

## Configuração necessária (fazer uma única vez)

### 1. Ativar o Netlify Identity (login)

No painel do Netlify, dentro do seu site:
1. Vá em **Site configuration → Identity → Enable Identity**
2. Em **Registration**, selecione **Invite only** (assim só você consegue criar sua conta de admin)
3. Em **Identity → Invite users**, convide seu próprio e-mail
4. Você vai receber um e-mail para definir sua senha — pronto, esse é o login do painel

### 2. Criar um token de acesso do GitHub

1. No GitHub, vá em **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Crie um token com permissão de **leitura e escrita (Contents)** apenas para o repositório deste site
3. Copie o token gerado (você só verá ele uma vez)

### 3. Configurar variáveis de ambiente no Netlify

Em **Site configuration → Environment variables**, adicione:

| Nome | Valor |
|---|---|
| `GITHUB_TOKEN` | o token criado no passo anterior |
| `GITHUB_OWNER` | seu usuário ou organização do GitHub |
| `GITHUB_REPO` | o nome do repositório |
| `GITHUB_BRANCH` | geralmente `main` |

Depois de salvar, faça um novo deploy (Trigger deploy → Deploy site) para as variáveis passarem a valer.

### 4. Acessar o painel

Publique o site e acesse `SEU-SITE.netlify.app/admin/login.html`, clique em Entrar e use o e-mail/senha configurados no passo 1.

## Estrutura de pastas

```
/                       → páginas fixas (home, o-projeto, kits.html, páginas do menu)
/css/style.css          → estilo visual de todo o site público
/js/layout.js           → monta o menu e rodapé em todas as páginas
/js/templates.js        → gera o HTML de kits e experimentos
/js/templates-pagina.js → gera o HTML de páginas institucionais do menu
/data/kits.json         → todos os kits e experimentos (editável pelo painel)
/data/site.json         → menu e textos institucionais (editável pelo painel)
/kits/{slug}/            → uma pasta por kit, com index.html + um .html por experimento
/admin/                  → painel de login e edição
/netlify/functions/      → funções que autenticam e gravam no GitHub
```

## Adicionando conteúdo pelo painel

- **Novo kit**: Painel → Kits Educativos → Novo Kit
- **Novo experimento dentro de um kit**: Painel → Kits Educativos → (ícone 🔬 Experimentos) → Novo Experimento
- **Nova página no menu**: Painel → Páginas do Menu → Nova Página

Todas as páginas de experimento e de página institucional são montadas em blocos: título de seção, texto e imagem, na ordem que você quiser, podendo reordenar com as setas ↑ ↓.
