// IA do site, com dois modos:
// - "gratis": o mini servidor do projeto na Cloudflare (pasta servidor/), sem chave e sem cadastro para o professor.
//   Só aceita texto, então o PDF é convertido em texto aqui no navegador, com o pdf.js.
// - "gemini": Google Gemini com a chave do próprio professor (fica só no localStorage). Lê o PDF direto.

// O endereço do mini servidor fica em js/config.js (SERVIDOR_IA).

const API_GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const MAX_PDF = 20 * 1024 * 1024;
const MAX_TEXTO_GRATIS = 15000; // shortcut: corta textos longos na IA grátis; para livros inteiros, usar o modo Gemini

const ESQ_QUIZ = {
  type: 'OBJECT', required: ['titulo', 'questoes'],
  properties: {
    titulo: { type: 'STRING' },
    questoes: { type: 'ARRAY', items: { type: 'OBJECT', required: ['pergunta', 'alternativas', 'correta', 'explicacao'],
      properties: { pergunta: { type: 'STRING' }, alternativas: { type: 'ARRAY', items: { type: 'STRING' } }, correta: { type: 'INTEGER' }, explicacao: { type: 'STRING' } } } },
  },
};
const ESQ_PARES = {
  type: 'OBJECT', required: ['titulo', 'pares'],
  properties: {
    titulo: { type: 'STRING' },
    pares: { type: 'ARRAY', items: { type: 'OBJECT', required: ['termo', 'definicao'], properties: { termo: { type: 'STRING' }, definicao: { type: 'STRING' } } } },
  },
};
const FORMATO_JSON = {
  quiz: '{"titulo": "...", "questoes": [{"pergunta": "...", "alternativas": ["...", "...", "...", "..."], "correta": 0, "explicacao": "..."}]}',
  pares: '{"titulo": "...", "pares": [{"termo": "...", "definicao": "..."}]}',
};
const TEXTO_SIMPLES = 'Escreva em texto simples, sem markdown (nada de **, # ou tabelas com |). Use numeração, letras e linhas em branco para organizar.';

const TIPOS = [
  { id: 'quiz', nome: 'Quiz jogável', desc: 'Múltipla escolha com explicação', esquema: ESQ_QUIZ, json: 'quiz',
    pedido: n => `Crie um quiz com ${n} questões de múltipla escolha, cada uma com 4 alternativas, o índice da correta (0 a 3) e uma explicação de 1 a 2 frases. Varie a posição da alternativa correta.` },
  { id: 'vf', nome: 'Verdadeiro ou falso', desc: 'Jogável aqui', esquema: ESQ_QUIZ, json: 'quiz',
    pedido: n => `Crie ${n} afirmações de verdadeiro ou falso. Em cada questão, "pergunta" é a afirmação, "alternativas" é exatamente ["Verdadeiro", "Falso"], "correta" é 0 ou 1, e "explicacao" corrige ou confirma a afirmação. Equilibre verdadeiras e falsas.` },
  { id: 'pares', nome: 'Ligar pares', desc: 'Conceito e definição', esquema: ESQ_PARES, json: 'pares',
    pedido: n => `Crie ${n} pares de termo e definição. Termo com até 4 palavras; definição com até 15 palavras, sem repetir o termo.` },
  { id: 'prova', nome: 'Prova com gabarito', desc: 'Pronta para imprimir',
    pedido: n => `Crie uma prova com ${n} questões: misture múltipla escolha (A a D), verdadeiro ou falso, completar lacunas e 2 questões dissertativas curtas. Comece com um cabeçalho (Escola, Nome, Turma, Data). Indique a pontuação de cada questão (total 10). No final, depois de uma linha "GABARITO", dê as respostas e os critérios de correção das dissertativas. ${TEXTO_SIMPLES}` },
  { id: 'trabalho', nome: 'Trabalho em grupo', desc: 'Com etapas e rubrica',
    pedido: () => `Crie um trabalho interativo em grupo baseado no conteúdo: título criativo, pergunta-problema, produto final (ex.: maquete, podcast, infográfico, júri simulado), etapas com tempo, papéis para cada integrante, materiais e uma rubrica de avaliação com 4 critérios e 3 níveis. ${TEXTO_SIMPLES}` },
  { id: 'resumo', nome: 'Resumo e mapa mental', desc: 'Para revisão',
    pedido: n => `Faça: 1) um resumo de até 1 página; 2) um mapa mental em tópicos indentados (tema central, ramos e sub-ramos); 3) um glossário com ${n} termos; 4) 3 pontos em que os alunos costumam se confundir. ${TEXTO_SIMPLES}` },
  { id: 'kahoot', nome: 'Questões para Kahoot', desc: 'Formato pronto para copiar',
    pedido: n => `Crie ${n} questões para um quiz competitivo: pergunta com até 120 caracteres, 4 alternativas com até 75 caracteres, a correta e o tempo (20 ou 30 s). Escreva uma questão por bloco, assim:
Pergunta: ...
1) ...
2) ...
3) ...
4) ...
Correta: n
Tempo: 20
${TEXTO_SIMPLES}` },
];

let tipo = 'quiz', arquivo = null, textoResultado = '';
// Sem servidor configurado, a IA grátis nem aparece: o site usa o Gemini.
let modo = !SERVIDOR_IA || ler('ia-modo') === 'gemini' ? 'gemini' : 'gratis';
if (!SERVIDOR_IA) { $('modos').hidden = true; document.querySelector('#etapa-chave h3').lastChild.textContent = ' Sua chave grátis do Gemini'; }

$('tipos').innerHTML = TIPOS.map(t => `<button type="button" role="radio" class="tipo" data-t="${t.id}" aria-checked="${t.id === tipo}"><b>${esc(t.nome)}</b><span>${esc(t.desc)}</span></button>`).join('');
$('tipos').addEventListener('click', e => {
  const b = e.target.closest('.tipo'); if (!b) return;
  tipo = b.dataset.t;
  $('tipos').querySelectorAll('.tipo').forEach(x => x.setAttribute('aria-checked', String(x === b)));
});

// ---------- Modo ----------
function mostrarModo() {
  $('modos').querySelectorAll('.tipo').forEach(x => x.setAttribute('aria-checked', String(x.dataset.m === modo)));
  $('bloco-chave').hidden = modo !== 'gemini';
  $('nota-gratis').hidden = modo !== 'gratis';
  $('pdf-nome').textContent = arquivo ? `${arquivo.name} · ${(arquivo.size / 1048576).toFixed(1)} MB` : `Arraste o PDF aqui ou clique para escolher (até 20 MB)`;
}
$('modos').addEventListener('click', e => { const b = e.target.closest('.tipo'); if (!b) return; modo = b.dataset.m; guardar('ia-modo', modo); mostrarModo(); });
mostrarModo();

// ---------- Chave do Gemini ----------
const statusChave = (txt, cls = '') => { $('chave-status').textContent = txt; $('chave-status').className = 'status ' + cls; };
if (ler('gemini-chave')) { $('chave').value = ler('gemini-chave'); statusChave(`Chave salva neste navegador${ler('gemini-modelo') ? ' · modelo ' + ler('gemini-modelo') : ''}.`, 'ok'); }

async function chamarGemini(caminho, chave, corpo) {
  const r = await fetch(`${API_GEMINI}/${caminho}`, {
    method: corpo ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = dados.error?.message || `erro ${r.status}`;
    if (r.status === 400 && /API key/i.test(msg)) throw new Error('A chave não foi aceita. Confira se copiou a chave inteira do Google AI Studio.');
    if (r.status === 403) throw new Error('A chave não tem permissão para usar o Gemini. Crie uma nova no Google AI Studio.');
    if (r.status === 429) throw new Error('Limite grátis do Gemini atingido por agora. Espere um minuto e tente de novo.');
    throw new Error(msg);
  }
  return dados;
}

// O nome do modelo grátis muda com o tempo: escolhe o melhor "Flash" que a chave enxerga.
async function escolherModelo(chave) {
  const { models = [] } = await chamarGemini('models?pageSize=200', chave);
  const nomes = models.filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, ''));
  const melhor = melhorFlash(nomes);
  if (!melhor) throw new Error('Nenhum modelo Gemini Flash disponível para esta chave.');
  return melhor;
}
function melhorFlash(nomes) {
  if (nomes.includes('gemini-flash-latest')) return 'gemini-flash-latest';
  const versao = n => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  return nomes.filter(n => /^gemini-[\d.]+-flash/.test(n) && !/lite|image|tts|live|audio|thinking|exp/.test(n))
    .sort((a, b) => (/preview/.test(a) - /preview/.test(b)) || versao(b) - versao(a))[0];
}

$('salvar-chave').addEventListener('click', async () => {
  const chave = $('chave').value.trim();
  if (!chave) return statusChave('Cole a chave no campo antes de salvar.', 'erro');
  statusChave('Testando a chave...');
  try {
    const modelo = await escolherModelo(chave);
    guardar('gemini-chave', chave); guardar('gemini-modelo', modelo);
    statusChave(`Chave funcionando. Modelo: ${modelo}.`, 'ok');
  } catch (e) { statusChave(e.message === 'Failed to fetch' ? 'Sem conexão com o Google. Confira a internet.' : e.message, 'erro'); }
});
$('apagar-chave').addEventListener('click', () => {
  try { localStorage.removeItem('gemini-chave'); localStorage.removeItem('gemini-modelo'); } catch {}
  $('chave').value = ''; statusChave('Chave apagada deste navegador.');
});

// ---------- PDF ----------
function escolherPdf(f) {
  if (!f) return;
  if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { arquivo = null; $('pdf-nome').textContent = 'Esse arquivo não é PDF. Escolha um arquivo .pdf.'; return; }
  if (f.size > MAX_PDF) { arquivo = null; $('pdf-nome').textContent = `O PDF tem ${(f.size / 1048576).toFixed(1)} MB. O limite é 20 MB: divida o arquivo ou envie só os capítulos da aula.`; return; }
  arquivo = f;
  $('soltar').classList.add('tem'); $('tirar-pdf').hidden = false;
  mostrarModo();
}
$('pdf').addEventListener('change', e => escolherPdf(e.target.files[0]));
['dragover', 'dragenter'].forEach(ev => $('soltar').addEventListener(ev, e => { e.preventDefault(); $('soltar').classList.add('sobre'); }));
['dragleave', 'drop'].forEach(ev => $('soltar').addEventListener(ev, e => { e.preventDefault(); $('soltar').classList.remove('sobre'); }));
$('soltar').addEventListener('drop', e => escolherPdf(e.dataTransfer.files[0]));
$('tirar-pdf').addEventListener('click', () => { arquivo = null; $('pdf').value = ''; $('soltar').classList.remove('tem'); $('tirar-pdf').hidden = true; mostrarModo(); });

const paraBase64 = f => new Promise((ok, erro) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = () => erro(new Error('Não foi possível ler o PDF.'));
  r.readAsDataURL(f);
});
const carregarScript = src => new Promise((ok, erro) => {
  const s = Object.assign(document.createElement('script'), { src, onload: ok, onerror: () => erro(new Error('Não foi possível carregar o leitor de PDF. Confira a internet.')) });
  document.head.append(s);
});
async function textoDoPdf(f) {
  if (!window.pdfjsLib) await carregarScript(PDFJS + 'pdf.min.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
  const doc = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
  let txt = '';
  for (let p = 1; p <= doc.numPages && txt.length < MAX_TEXTO_GRATIS; p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    txt += c.items.map(i => i.str).join(' ').replace(/\s+/g, ' ') + '\n';
  }
  if (txt.trim().length < 80) throw new Error('Não achei texto neste PDF (parece ser escaneado, feito de imagens). Use o modo "Gemini com sua chave", que lê PDF escaneado, ou cole o texto no campo.');
  return txt.slice(0, MAX_TEXTO_GRATIS);
}

// ---------- Chamada única para os dois modos ----------
async function perguntarIA({ instrucao, conteudo = '', pdf = null, esquema = null, json = null }) {
  if (modo === 'gemini') {
    const chave = ler('gemini-chave');
    if (!chave) throw new Error('Salve a sua chave do Gemini no passo 1, ou escolha a IA grátis.');
    const modelo = ler('gemini-modelo') || await escolherModelo(chave);
    const parts = [];
    if (pdf) parts.push({ inlineData: { mimeType: 'application/pdf', data: await paraBase64(pdf) } });
    parts.push({ text: instrucao + (conteudo ? `\n\nCONTEÚDO DA AULA:\n${conteudo}` : '') });
    const dados = await chamarGemini(`models/${modelo}:generateContent`, chave, {
      contents: [{ role: 'user', parts }],
      generationConfig: esquema ? { responseMimeType: 'application/json', responseSchema: esquema, temperature: 0.6 } : { temperature: 0.7 },
    });
    const texto = (dados.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!texto) throw new Error(dados.promptFeedback?.blockReason ? 'O Google bloqueou a resposta para este conteúdo. Tente outro.' : 'A IA não devolveu conteúdo. Tente de novo.');
    return texto;
  }
  if (!SERVIDOR_IA) throw new Error('A IA grátis ainda não foi ativada neste site. Por enquanto, use o modo "Gemini com sua chave".');
  if (pdf) conteudo = (await textoDoPdf(pdf)) + (conteudo ? '\n' + conteudo : '');
  const pedidoJson = json ? `\n\nResponda APENAS com um JSON válido, sem nenhum texto antes ou depois, neste formato:\n${FORMATO_JSON[json]}` : '';
  const r = await fetch(SERVIDOR_IA, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sistema: instrucao + pedidoJson, conteudo }),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(dados.erro || 'A IA grátis não respondeu agora. Tente de novo em instantes ou use o modo Gemini.');
  const texto = (dados.texto || '').trim();
  if (!texto) throw new Error('A IA não devolveu conteúdo. Tente de novo.');
  return json ? (texto.match(/\{[\s\S]*\}/) || [texto])[0] : texto.replace(/\*\*/g, '').replace(/^#+\s*/gm, '');
}

// ---------- Gerar atividade ----------
const statusGerar = (txt, cls = '') => { $('gerar-status').textContent = txt; $('gerar-status').className = 'status ' + cls; };
const msgErro = e => e.message === 'Failed to fetch' ? 'Sem conexão com a IA. Confira a internet e tente de novo.' : e.message;

$('gerar').addEventListener('click', async () => {
  const texto = $('ia-texto').value.trim();
  if (!arquivo && !texto) { statusGerar('Envie um PDF ou escreva o tema da aula (passo 2).', 'erro'); $('ia-texto').focus(); return; }
  const t = TIPOS.find(x => x.id === tipo);
  const n = Math.min(30, Math.max(3, parseInt($('ia-n').value, 10) || 8));
  const extra = $('ia-obs').value.trim();
  const instrucao = `Você é um professor experiente preparando material para uma turma de ${$('ia-serie').value}.
${arquivo ? 'Use SOMENTE o conteúdo da aula enviado; não invente fatos que não estejam nele.' : 'Use conhecimento correto e atualizado sobre o tema informado.'} Adapte a linguagem à turma. Escreva em português do Brasil.
${t.pedido(n)}${extra ? `\nPedido extra do professor: ${extra}` : ''}`;

  $('gerar').disabled = true;
  statusGerar(arquivo ? 'Lendo o PDF e criando a atividade. Pode levar até 1 minuto...' : 'Criando a atividade. Pode levar até 1 minuto...');
  try {
    const resp = await perguntarIA({ instrucao, conteudo: texto, pdf: arquivo, esquema: t.esquema, json: t.json });
    mostrarResultado(t, resp);
    contar('ia-gerou-' + t.id);
    statusGerar('Pronto!', 'ok');
  } catch (e) { statusGerar(msgErro(e), 'erro'); }
  finally { $('gerar').disabled = false; }
});

// Valida o que vem da IA ou de um link: só passa o que o jogo sabe mostrar, com tamanho limitado.
const corta = (s, n = 400) => String(s ?? '').slice(0, n);
function validarJogo(tipoJogo, d) {
  const titulo = corta(d.titulo, 120);
  if (tipoJogo === 'pares') {
    const itens = (Array.isArray(d.pares) ? d.pares : []).filter(p => p && p.termo && p.definicao).slice(0, 40).map(p => ({ termo: corta(p.termo, 80), definicao: corta(p.definicao, 300) }));
    if (itens.length < 2) throw new Error('A IA gerou poucos pares. Tente de novo.');
    return { tipo: 'pares', titulo, itens };
  }
  const itens = (Array.isArray(d.questoes) ? d.questoes : []).filter(q => q && q.pergunta && Array.isArray(q.alternativas) && q.alternativas.length >= 2 && q.alternativas.length <= 6 && Number.isInteger(q.correta) && q.correta >= 0 && q.correta < q.alternativas.length)
    .slice(0, 50).map(q => ({ pergunta: corta(q.pergunta), alternativas: q.alternativas.map(a => corta(a, 200)), correta: q.correta, explicacao: corta(q.explicacao) }));
  if (!itens.length) throw new Error('A IA não gerou questões válidas. Tente de novo.');
  return { tipo: 'quiz', titulo, itens };
}
const textoDoJogo = j => j.tipo === 'pares'
  ? `${j.titulo}\n\n` + j.itens.map((p, i) => `${i + 1}. ${p.termo}: ${p.definicao}`).join('\n')
  : `${j.titulo}\n\n` + j.itens.map((q, i) => `${i + 1}. ${q.pergunta}\n` + q.alternativas.map((a, k) => `   ${'ABCDEF'[k]}) ${a}`).join('\n')).join('\n\n') +
    '\n\nGABARITO\n' + j.itens.map((q, i) => `${i + 1}. ${'ABCDEF'[q.correta]} – ${q.explicacao}`).join('\n');
const jogar = (el, j) => j.tipo === 'pares' ? jogarPares(el, j.itens) : jogarQuiz(el, j.itens);

let ultimoJogo = null;
function mostrarResultado(t, texto) {
  const corpo = $('res-corpo');
  ultimoJogo = null;
  if (!t.esquema) {
    textoResultado = texto;
    $('res-titulo').textContent = t.nome;
    corpo.innerHTML = '<pre class="res-texto"></pre>';
    corpo.firstChild.textContent = texto;
  } else {
    let d;
    try { d = JSON.parse(texto); } catch { throw new Error('A resposta veio num formato inesperado. Tente gerar de novo.'); }
    ultimoJogo = validarJogo(t.id === 'pares' ? 'pares' : 'quiz', d);
    ultimoJogo.titulo = ultimoJogo.titulo || t.nome;
    textoResultado = textoDoJogo(ultimoJogo);
    $('res-titulo').textContent = ultimoJogo.titulo;
    jogar(corpo, ultimoJogo);
  }
  $('link-alunos').hidden = $('projetar').hidden = !ultimoJogo;
  $('compartilhar').hidden = true;
  $('resultado').hidden = false;
  $('resultado').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

$('copiar-res').addEventListener('click', () => copiar(textoResultado, $('res-corpo'), $('gerar-status')));
$('baixar-res').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([textoResultado], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `atividade-${tipo}.txt` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ---------- Link para os alunos ----------
// O jogo vai comprimido dentro do próprio link (#jogar=...), então não precisa de servidor.
const paraB64 = bytes => { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const deB64 = str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function empacotar(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  if (!window.CompressionStream) return 'j' + paraB64(bytes);
  const z = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  return 'z' + paraB64(z);
}
async function desempacotar(str) {
  const bytes = deB64(str.slice(1));
  const json = str[0] === 'z' ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text() : new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

$('link-alunos').addEventListener('click', async () => {
  if (!ultimoJogo) return;
  const link = location.origin + location.pathname + '#jogar=' + await empacotar(ultimoJogo);
  $('link-txt').value = link;
  $('whats').href = 'https://wa.me/?text=' + encodeURIComponent(`${ultimoJogo.titulo}: jogue aqui ${link}`);
  $('compartilhar').hidden = false;
  $('link-status').textContent = '';
  contar('ia-link-alunos');
});
$('copiar-link').addEventListener('click', () => copiar($('link-txt').value, null, $('link-status')));

async function abrirJogoDoLink() {
  const m = location.hash.match(/^#jogar=([jz][\w-]+)$/);
  if (!m) return;
  document.body.classList.add('modo-aluno');
  $('aluno').hidden = false;
  try {
    const d = await desempacotar(m[1]);
    const j = validarJogo(d.tipo === 'pares' ? 'pares' : 'quiz', { titulo: d.titulo, pares: d.itens, questoes: d.itens });
    $('aluno-t').textContent = j.titulo || 'Atividade';
    document.title = `${j.titulo} · Raízes Digitais`;
    jogar($('aluno-jogo'), j);
    contar('aluno-abriu-jogo');
  } catch {
    $('aluno-t').textContent = 'Link incompleto';
    $('aluno-jogo').innerHTML = '<p>Este link de atividade está incompleto ou foi cortado. Peça ao professor para enviar de novo.</p>';
  }
}
abrirJogoDoLink();

// ---------- Projetor ----------
$('projetar').addEventListener('click', async () => {
  $('resultado').classList.add('projetor');
  try { await $('resultado').requestFullscreen(); } catch { /* sem tela cheia: a classe já aumenta tudo */ }
});
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) $('resultado').classList.remove('projetor'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('resultado').classList.remove('projetor'); });

// ---------- Impressão ----------
$('imprimir').addEventListener('click', () => {
  const [corpo, gabarito] = textoResultado.split(/\n\s*GABARITO\s*\n/);
  const el = $('impressao');
  el.innerHTML = `<p class="imp-marca">Raízes Digitais</p><h1></h1><pre class="imp-texto"></pre>${gabarito ? '<section class="imp-gabarito"><h2>Gabarito</h2><pre class="imp-texto"></pre></section>' : ''}`;
  el.querySelector('h1').textContent = $('res-titulo').textContent;
  const pres = el.querySelectorAll('pre');
  // A primeira linha do quiz repete o título: tira para não aparecer duas vezes.
  pres[0].textContent = corpo.replace($('res-titulo').textContent, '').trim();
  if (gabarito) pres[1].textContent = gabarito.trim();
  print();
});

// ---------- Pergunta rápida ----------
$('chat-f').addEventListener('submit', async e => {
  e.preventDefault();
  const pergunta = $('chat-in').value.trim();
  const st = (txt, cls = '') => { $('chat-status').textContent = txt; $('chat-status').className = 'status ' + cls; };
  if (!pergunta) return st('Escreva sua pergunta.', 'erro');
  $('chat-bt').disabled = true; st('Pensando...');
  try {
    const resp = await perguntarIA({ instrucao: `Você é um assistente para professores brasileiros. Responda em português do Brasil, de forma clara, prática e curta (até 250 palavras). ${TEXTO_SIMPLES}`, conteudo: pergunta });
    $('chat-resp').hidden = false; $('chat-resp').textContent = resp; st('');
  } catch (err) { st(msgErro(err), 'erro'); }
  finally { $('chat-bt').disabled = false; }
});

// ---------- Jogos gerados ----------
function jogarQuiz(el, qs) {
  let i = 0, pontos = 0;
  const tela = () => {
    if (i >= qs.length) {
      el.innerHTML = `<div class="jogo-fim"><p class="placar">${pontos} de ${qs.length}</p><p>acertos no quiz</p><button class="btn primario" type="button" id="q-de-novo">Jogar de novo</button></div>`;
      $('q-de-novo').onclick = () => jogarQuiz(el, qs);
      return;
    }
    const q = qs[i];
    el.innerHTML = `<div class="jogo">
      <p class="jogo-info">Questão ${i + 1} de ${qs.length} · ${pontos} ${pontos === 1 ? 'acerto' : 'acertos'}</p>
      <p class="jogo-perg">${esc(q.pergunta)}</p>
      <div class="jogo-alts">${q.alternativas.map((a, k) => `<button type="button" class="alt" data-k="${k}"><span>${'ABCDEF'[k]}</span>${esc(a)}</button>`).join('')}</div>
      <div class="jogo-exp" id="q-exp" hidden></div>
    </div>`;
    el.querySelector('.jogo-alts').onclick = e => {
      const b = e.target.closest('.alt'); if (!b) return;
      const certo = +b.dataset.k === q.correta;
      if (certo) pontos++;
      el.querySelectorAll('.alt').forEach(x => { x.disabled = true; if (+x.dataset.k === q.correta) x.classList.add('certa'); });
      if (!certo) b.classList.add('errada');
      const exp = $('q-exp'); exp.hidden = false;
      exp.innerHTML = `<p><b>${certo ? 'Certo!' : 'Não foi dessa vez.'}</b> ${esc(q.explicacao || '')}</p><button class="btn primario" type="button" id="q-prox">${i + 1 < qs.length ? 'Próxima' : 'Ver resultado'}</button>`;
      $('q-prox').onclick = () => { i++; tela(); };
      $('q-prox').focus();
    };
  };
  tela();
}

function jogarPares(el, pares) {
  const embaralhar = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  const idx = pares.map((_, i) => i);
  const esq = embaralhar(idx), dir = embaralhar(idx);
  let sel = null, feitos = 0, tentativas = 0;
  el.innerHTML = `<div class="pares">
    <p class="jogo-info" id="p-info">Clique num termo e depois na definição que combina.</p>
    <div class="pares-cols">
      <div class="col" id="p-esq">${esq.map(i => `<button type="button" class="par termo" data-i="${i}">${esc(pares[i].termo)}</button>`).join('')}</div>
      <div class="col" id="p-dir">${dir.map(i => `<button type="button" class="par def" data-i="${i}">${esc(pares[i].definicao)}</button>`).join('')}</div>
    </div></div>`;
  $('p-esq').onclick = e => {
    const b = e.target.closest('.termo'); if (!b || b.disabled) return;
    el.querySelectorAll('.termo').forEach(x => x.classList.remove('sel'));
    sel = b; b.classList.add('sel');
  };
  $('p-dir').onclick = e => {
    const b = e.target.closest('.def'); if (!b || b.disabled) return;
    if (!sel) { $('p-info').textContent = 'Primeiro escolha um termo na coluna da esquerda.'; return; }
    tentativas++;
    if (b.dataset.i === sel.dataset.i) {
      [b, sel].forEach(x => { x.disabled = true; x.classList.remove('sel'); x.classList.add('certa'); });
      sel = null; feitos++;
      $('p-info').textContent = feitos === pares.length ? `Completo! ${pares.length} pares em ${tentativas} tentativas.` : `${feitos} de ${pares.length} pares.`;
    } else {
      b.classList.add('errada'); setTimeout(() => b.classList.remove('errada'), 600);
      $('p-info').textContent = 'Não combina. Tente outra definição.';
    }
  };
}

console.assert(melhorFlash(['gemini-2.5-flash', 'gemini-3.8-flash-preview', 'gemini-3.5-flash', 'gemini-3.8-flash-lite']) === 'gemini-3.5-flash', 'escolha de modelo');
console.assert(melhorFlash(['gemini-3.5-flash', 'gemini-flash-latest']) === 'gemini-flash-latest', 'alias de modelo');
