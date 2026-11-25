# Raízes Digitais

Site para professores: catálogo de 25 ferramentas digitais para a sala de aula. Cada ferramenta tem uma **demonstração animada e interativa** (estilo videoaula), tutorial, treino e prompt pronto. O **laboratório de IA** transforma o PDF ou o tema da aula em quiz jogável, ligar pares, prova, trabalho em grupo ou resumo.

Feito a partir do *Mini Guia: Criando Atividades Didáticas com Inteligência Artificial*, de Raquel da Silva Henrique e Renata Lopes Casara (Licenciatura em Ciências Biológicas, UFRGS).

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | A página |
| `js/config.js` | **Configuração**: endereço da IA grátis e código do contador de visitas |
| `img/capa.png` | Imagem que aparece quando o link é compartilhado no WhatsApp |
| `REVISAO.md` | Lista para a Raquel e a Renata conferirem o conteúdo |
| `css/style.css` | Visual geral (cores, fontes, layout) |
| `css/demos.css` | Visual das demonstrações |
| `js/ferramentas.js` | **O catálogo**: ferramentas, tutoriais, treinos e prompts. Para adicionar ou corrigir uma ferramenta, mexa aqui |
| `js/demos.js` | As demonstrações animadas e o player |
| `js/app.js` | Catálogo, ficha com abas e treino |
| `js/ia.js` | IA grátis, Gemini, leitura de PDF e jogos gerados |
| `servidor/` | Mini servidor da IA grátis (Cloudflare). **Não vai para o GitHub Pages** |

Não precisa instalar nada nem compilar: é HTML, CSS e JavaScript puros.

## Como a IA funciona

O professor escolhe entre dois modos:

1. **IA grátis, sem cadastro** (padrão). Usa o mini servidor da pasta `servidor/`, publicado na Cloudflare com a conta do projeto. O PDF vira texto no navegador e só o texto é enviado. A Cloudflare dá uma cota diária grátis; quando ela acaba, a IA para até 21h (horário de Brasília) e **nunca gera cobrança** no plano grátis.
2. **Gemini com a chave do professor.** Cada um cria uma chave grátis em https://aistudio.google.com/apikey (o site ensina). É mais precisa e lê PDF escaneado. A chave fica só no navegador do professor.

## Ativar a IA grátis (uma vez só, uns 10 minutos)

Você precisa do [Node.js](https://nodejs.org/) instalado.

1. Crie uma conta grátis em https://dash.cloudflare.com/sign-up (não pede cartão).
2. Abra `servidor/wrangler.toml` e troque `SEU-USUARIO` pelo seu usuário do GitHub. Só os sites listados ali podem usar a IA.
3. No terminal, dentro da pasta `servidor`, rode:

   ```
   npx wrangler login
   ```

   O navegador abre: faça login na Cloudflare e autorize.

4. Ainda na pasta `servidor`, rode:

   ```
   npx wrangler deploy
   ```

   No fim aparece um endereço parecido com `https://raizes-digitais-ia.SEU-NOME.workers.dev`.

5. Cole esse endereço em `js/config.js`, na linha `const SERVIDOR_IA = '';`, entre as aspas.
6. Publique o site de novo (veja abaixo).

Enquanto isso não for feito, o site esconde a opção "IA grátis" e usa só o Gemini com a chave do professor.

## Contador de visitas (opcional)

Mostra quantas pessoas entram, quais ferramentas mais abrem e quantas atividades a IA gera. Usa o GoatCounter, que é grátis, não usa cookies e não identifica ninguém.

1. Crie uma conta em https://www.goatcounter.com/signup e escolha um código (ex.: `raizes-digitais`).
2. Coloque o código em `js/config.js`, na linha `const CONTADOR = '';`.
3. Os números ficam em `https://SEU-CODIGO.goatcounter.com`.

## Antes da primeira publicação

Troque `SEU-USUARIO` pelo seu usuário do GitHub em dois arquivos:

- `index.html`: nas linhas `og:url` e `og:image`, para a prévia do link no WhatsApp mostrar a imagem.
- `servidor/wrangler.toml`: só quando for ativar a IA grátis.

Se o repositório não se chamar `raizes-digitais`, troque também esse nome nas linhas `og:url` e `og:image`.

Para testar o servidor sem a Cloudflare: `node servidor/teste.mjs`.

## Ver no computador

Na pasta do projeto, rode:

```
python -m http.server 8765
```

e abra http://localhost:8765

## Publicar no GitHub Pages (grátis)

1. Crie uma conta em https://github.com e clique em **New repository**. Dê um nome (ex.: `raizes-digitais`), deixe **Public** e crie.
2. Na página do repositório, clique em **uploading an existing file** e arraste `index.html`, `README.md` e as pastas `css`, `js` e `img`. Clique em **Commit changes**.
3. Vá em **Settings > Pages**. Em **Branch**, escolha `main` e a pasta `/ (root)` e clique em **Save**.
4. Em 1 ou 2 minutos o site fica no ar em `https://SEU-USUARIO.github.io/raizes-digitais/`. Esse é o link para compartilhar.

Para atualizar depois, envie de novo os arquivos alterados pelo mesmo botão de upload. **Antes de enviar, aumente o número de versão** no `index.html`: todos os `?v=6` viram `?v=7`, e assim por diante. Isso obriga o navegador de quem já visitou o site a baixar os arquivos novos.
