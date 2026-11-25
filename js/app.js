const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const ler = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

// Contador de visitas GoatCounter (sem cookies). Só liga se CONTADOR estiver preenchido em js/config.js.
if (CONTADOR) {
  const s = Object.assign(document.createElement('script'), { async: true, src: 'https://gc.zgo.at/count.js' });
  s.dataset.goatcounter = `https://${CONTADOR}.goatcounter.com/count`;
  document.head.append(s);
}
const contar = evento => { try { window.goatcounter?.count?.({ path: evento, title: evento, event: true }); } catch {} };

// Copia texto; se o navegador recusar, seleciona o elemento para Ctrl+C.
function copiar(texto, el, status) {
  const selecionar = () => {
    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    status.textContent = 'Texto selecionado. Use Ctrl+C para copiar.';
  };
  try { navigator.clipboard.writeText(texto).then(() => { status.textContent = 'Copiado.'; }, selecionar); } catch { selecionar(); }
}

// ---------- Sua aula ----------
document.querySelectorAll('.sel-serie').forEach(sel => {
  sel.innerHTML = SERIES.map(s => `<option>${esc(s)}</option>`).join('');
  sel.value = '8º ano do Ensino Fundamental';
});
const CAMPOS = ['f-materia', 'f-tema', 'f-serie', 'f-n'];
const salvo = ler('aula');
if (salvo) CAMPOS.forEach(k => { if (salvo[k] != null) $(k).value = salvo[k]; });
const aula = () => ({
  materia: $('f-materia').value.trim() || '[matéria]',
  tema: $('f-tema').value.trim() || '[tema]',
  serie: $('f-serie').value,
  n: Math.min(40, Math.max(1, parseInt($('f-n').value, 10) || 10)),
});
CAMPOS.forEach(k => $(k).addEventListener('input', () => {
  guardar('aula', Object.fromEntries(CAMPOS.map(c => [c, $(c).value])));
  if (atual) $('fi-prompt').textContent = atual.prompt(aula());
}));

// ---------- Catálogo ----------
let filtro = null, atual = null;
$('chips').innerHTML = `<button class="chip" type="button" data-o="" aria-pressed="true">Todas</button>` +
  Object.entries(OBJETIVOS).map(([o, t]) => `<button class="chip" type="button" data-o="${o}" aria-pressed="false">${esc(t)}</button>`).join('');
$('chips').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  filtro = b.dataset.o || null;
  $('chips').querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
  renderGrade();
});
$('busca').addEventListener('input', renderGrade);
$('materia').innerHTML = '<option value="">Todas as matérias</option>' + MATERIAS.map(m => `<option>${esc(m)}</option>`).join('');
$('materia').addEventListener('change', renderGrade);

const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Ferramenta sem "materias" serve para qualquer matéria.
const servePara = (t, m) => !m || !t.materias || t.materias.includes(m);
function renderGrade() {
  const q = semAcento($('busca').value.trim());
  const materia = $('materia').value;
  const lista = FERRAMENTAS.filter(t => (!filtro || t.objetivos.includes(filtro)) && servePara(t, materia) &&
    (!q || semAcento([t.nome, t.faz, t.extra || '', ...t.objetivos.map(o => OBJETIVOS[o])].join(' ')).includes(q)));
  $('contagem').textContent = `${lista.length} ${lista.length === 1 ? 'ferramenta' : 'ferramentas'}`;
  $('grade').innerHTML = lista.length ? lista.map(t => `
    <button class="card" type="button" data-id="${t.id}">
      <span class="tags">${t.objetivos.map(o => `<span class="tag">${esc(OBJETIVOS[o])}</span>`).join('')}${t.extra ? `<span class="tag bio">${esc(t.extra)}</span>` : ''}</span>
      <span class="card-nome">${esc(t.nome)}</span>
      <span class="card-faz">${esc(t.faz)}</span>
      <span class="card-pe">${t.guia ? '<span class="selo">Do mini guia</span>' : ''}<span class="abrir">▶ Ver funcionando</span></span>
    </button>`).join('') : '<p class="vazio">Nenhuma ferramenta com esse filtro. Escolha "Todas" ou tente outra palavra.</p>';
}
$('grade').addEventListener('click', e => { const b = e.target.closest('.card'); if (b) abrirFicha(FERRAMENTAS.find(t => t.id === b.dataset.id)); });

// ---------- Ficha ----------
const ABAS = [['aba-demo', 'pn-demo'], ['aba-tutorial', 'pn-tutorial'], ['aba-sim', 'pn-sim'], ['aba-prompt', 'pn-prompt']];
function mostrarAba(id) {
  ABAS.forEach(([a, p]) => { const on = a === id; $(a).setAttribute('aria-selected', String(on)); $(a).tabIndex = on ? 0 : -1; $(p).hidden = !on; });
  if (id === 'aba-demo') tocarDemo($('pn-demo'), atual); else pararDemo();
  if (id === 'aba-sim') simular(atual);
}
ABAS.forEach(([a], i) => {
  $(a).addEventListener('click', () => mostrarAba(a));
  $(a).addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
    const prox = ABAS[(i + d + ABAS.length) % ABAS.length][0]; $(prox).focus(); $(prox).click();
  });
});

function abrirFicha(t) {
  atual = t;
  $('fi-nome').textContent = t.nome;
  $('fi-tags').textContent = t.objetivos.map(o => OBJETIVOS[o]).concat(t.extra || []).join(' · ');
  $('fi-faz').textContent = t.faz;
  $('fi-custo').textContent = [t.custo, `Serve para: ${t.materias ? t.materias.join(', ') : 'todas as matérias'}.`].filter(Boolean).join(' ');
  contar('ferramenta-' + t.id);
  $('fi-passos').innerHTML = t.passos.map(p => `<li>${esc(p)}</li>`).join('');
  $('fi-dica').textContent = t.dica;
  $('fi-links').innerHTML = t.links.map(([txt, url], i) => `<a class="btn ${i ? 'contorno' : 'primario'}" href="${esc(url)}" target="_blank" rel="noopener">${esc(txt)}</a>`).join('');
  $('fi-prompt').textContent = t.prompt(aula());
  $('fi-copiado').textContent = '';
  $('ficha').showModal();
  mostrarAba('aba-demo');
}
$('fi-fechar').addEventListener('click', () => $('ficha').close());
$('ficha').addEventListener('click', e => { if (e.target === $('ficha')) $('ficha').close(); });
$('ficha').addEventListener('close', () => { atual = null; pararDemo(); });
$('fi-copiar').addEventListener('click', () => copiar($('fi-prompt').textContent, $('fi-prompt'), $('fi-copiado')));

// ---------- Simulador ----------
// Treino com telas genéricas: o professor segue as missões clicando na opção certa ou digitando.
function simular(t) {
  const pn = $('pn-sim');
  let i = 0;
  const passo = () => {
    if (i >= t.sim.length) {
      pn.innerHTML = `<div class="sim-fim">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44V22" stroke="currentColor" stroke-width="3"/><path class="f1" d="M24 24C10 24 6 10 6 6c12 0 18 7 18 18z"/><path class="f2" d="M24 20c0-10 7-16 18-16 0 6-4 16-18 16z"/></svg>
        <h3>Treino concluído!</h3>
        <p>Você passou por ${t.sim.length} etapas de ${esc(t.nome)}. Agora é só repetir no site real.</p>
        <div class="linha"><a class="btn primario" href="${esc(t.links[0][1])}" target="_blank" rel="noopener">${esc(t.links[0][0])}</a>
        <button class="btn contorno" type="button" id="sim-de-novo">Treinar de novo</button></div></div>`;
      $('sim-de-novo').onclick = () => simular(t);
      return;
    }
    const [tela, missao, ops] = t.sim[i];
    const campo = ops.startsWith('campo:');
    const opcoes = campo ? [] : ops.split('|').map(o => ({ txt: o.replace(/^\*/, ''), certa: o.startsWith('*') }));
    pn.innerHTML = `<div class="sim">
      <div class="sim-prog" aria-label="Etapa ${i + 1} de ${t.sim.length}">${t.sim.map((_, k) => `<span class="${k < i ? 'feito' : k === i ? 'agora' : ''}"></span>`).join('')}</div>
      <div class="sim-tela">
        <div class="sim-barra"><span class="bolinhas" aria-hidden="true"><i></i><i></i><i></i></span><span>Treino · ${esc(t.nome)}</span><b>${esc(tela)}</b></div>
        <div class="sim-corpo">
          <p class="sim-missao"><span>Missão ${i + 1}</span>${esc(missao)}</p>
          ${campo
            ? `<form class="sim-campo" id="sim-form"><label class="vis-oculto" for="sim-in">Sua resposta</label><input id="sim-in" placeholder="${esc(ops.slice(6))}" autocomplete="off"><button class="btn primario" type="submit">Continuar</button></form>`
            : `<div class="sim-ops">${opcoes.map((o, k) => `<button type="button" class="sim-op" data-k="${k}">${esc(o.txt)}</button>`).join('')}</div>`}
        </div>
      </div>
      <p class="sim-retorno" id="sim-ret" role="status"></p>
    </div>`;
    const ret = $('sim-ret');
    if (campo) {
      $('sim-form').onsubmit = e => {
        e.preventDefault();
        if (!$('sim-in').value.trim()) { ret.textContent = 'Digite alguma coisa para continuar (pode usar o exemplo do campo).'; ret.className = 'sim-retorno erro'; return; }
        i++; passo();
      };
      $('sim-in').focus();
    } else {
      pn.querySelector('.sim-ops').onclick = e => {
        const b = e.target.closest('.sim-op'); if (!b) return;
        if (opcoes[b.dataset.k].certa) {
          b.classList.add('certa'); ret.textContent = 'Isso!'; ret.className = 'sim-retorno ok';
          pn.querySelectorAll('.sim-op').forEach(x => { x.disabled = true; });
          setTimeout(() => { i++; passo(); }, 650);
        } else {
          b.classList.add('errada'); b.disabled = true;
          ret.textContent = 'Ainda não. Leia a missão de novo e tente outra opção.'; ret.className = 'sim-retorno erro';
        }
      };
    }
  };
  passo();
}

// ---------- Ramos do topo (decorativo) ----------
function desenharRamos() {
  const cv = $('ramos'); if (!cv || !cv.getContext) return;
  const css = getComputedStyle(document.documentElement);
  const cor = n => css.getPropertyValue(n).trim();
  const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio || 1;
  if (!w || !h) return;
  cv.width = w * dpr; cv.height = h * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const folhas = [cor('--folha'), cor('--musgo'), cor('--broto')];
  const flores = [cor('--ipe'), cor('--flor')];
  const s = Math.min(w, h) / 420;
  const folha = (x, y, ang, tam) => {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = folhas[Math.floor(rnd() * folhas.length)];
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(tam * .5, -tam * .35, tam, 0); c.quadraticCurveTo(tam * .5, tam * .35, 0, 0); c.fill();
    c.strokeStyle = cor('--papel'); c.globalAlpha = .35; c.lineWidth = 1; c.beginPath(); c.moveTo(tam * .1, 0); c.lineTo(tam * .9, 0); c.stroke();
    c.restore();
  };
  const flor = (x, y, r) => {
    c.fillStyle = flores[Math.floor(rnd() * flores.length)];
    for (let p = 0; p < 5; p++) { const a = p * Math.PI * 2 / 5 + rnd(); c.beginPath(); c.ellipse(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .55, r * .32, a, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = cor('--mata'); c.beginPath(); c.arc(x, y, r * .22, 0, Math.PI * 2); c.fill();
  };
  const galho = (x, y, ang, len, prof) => {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    const cx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * len * .15, cy = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * len * .15;
    c.strokeStyle = cor('--caule'); c.lineWidth = Math.max(1, prof * 1.6 * s); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(cx, cy, x2, y2); c.stroke();
    const nf = 2 + Math.floor(rnd() * 3);
    for (let k = 1; k <= nf; k++) {
      const t = k / (nf + 1), px = (1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t * t * x2, py = (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t * t * y2;
      folha(px, py, ang + (k % 2 ? -1 : 1) * (0.7 + rnd() * .5), (14 + rnd() * 16) * s);
    }
    if (prof <= 1) { if (rnd() < .55) flor(x2, y2, (8 + rnd() * 7) * s); else folha(x2, y2, ang, 22 * s); return; }
    galho(x2, y2, ang - .35 - rnd() * .3, len * (.68 + rnd() * .12), prof - 1);
    galho(x2, y2, ang + .3 + rnd() * .3, len * (.62 + rnd() * .12), prof - 1);
    if (rnd() < .3) galho(x2, y2, ang + (rnd() - .5) * .3, len * .5, prof - 2);
  };
  galho(w * .55, h, -Math.PI / 2 - .12, h * .3, 5);
  galho(w * .95, h * .85, -Math.PI / 2 - .7, h * .22, 4);
}
desenharRamos();
addEventListener('resize', () => { clearTimeout(desenharRamos.t); desenharRamos.t = setTimeout(desenharRamos, 150); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', desenharRamos);
document.fonts && document.fonts.ready.then(desenharRamos);

renderGrade();

// Autoverificação do catálogo: toda missão de escolha tem exatamente uma opção certa.
FERRAMENTAS.forEach(t => t.sim.forEach(([, m, o]) => {
  if (!o.startsWith('campo:')) console.assert(o.split('|').filter(x => x.startsWith('*')).length === 1, `Simulador de ${t.id}: "${m}" precisa de exatamente uma opção certa`);
}));
console.assert(FERRAMENTAS.every(t => t.prompt(aula()).includes(aula().tema)), 'Prompt sem o tema da aula');
