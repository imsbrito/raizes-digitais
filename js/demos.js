// Demonstrações visuais no estilo videoaula: cenas animadas com legenda, que avançam sozinhas,
// e cenas "Sua vez" que esperam o professor interagir. Telas genéricas, sem marca das empresas.
// Cada demo é uma lista de cenas: { leg, dur, sua, cena(palco, ctl, t) }.

const FORMAS = ['▲', '◆', '●', '■'];
const ALUNOS = ['Ana', 'Bruno', 'Caio', 'Duda', 'Enzo', 'Gabi', 'Heitor', 'Iara', 'João', 'Lia', 'Maya', 'Nico'];
const tela = (html, rot = 'Telão da sala') => `<div class="d-tela"><span class="d-rot">${rot}</span>${html}</div>`;
const cel = (html, rot = 'Celular do aluno') => `<div class="d-cel"><span class="d-rot">${rot}</span><div class="d-cel-in">${html}</div></div>`;
const q = (p, s) => p.querySelector(s);

function digitar(el, texto, ctl, vel = 40, fim) {
  let k = 0;
  const id = ctl.iv(vel, () => { el.textContent = texto.slice(0, ++k); if (k >= texto.length) { clearInterval(id); fim && fim(); } });
}
function surgir(p, sel, ctl, passo = 350) { p.querySelectorAll(sel).forEach((e, i) => ctl.t(i * passo, () => e.classList.add('vis'))); }

// ---------- Quiz ao vivo (Kahoot, Wayground) ----------
const quizAoVivo = t => {
  const ritmo = t.id === 'wayground';
  let acertou = false;
  const perg = 'Qual organela produz energia para a célula?';
  const alts = ['Ribossomo', 'Mitocôndria', 'Lisossomo', 'Núcleo'];
  return [
    { leg: `No ${t.nome}, o professor escreve a pergunta, as alternativas e marca qual é a certa.`, dur: 7000,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-editor"><p class="d-lbl">Pergunta 1</p><p class="d-digita" id="d-q"></p>
          <div class="d-alts">${alts.map((a, i) => `<div class="d-alt r${i} surge">${FORMAS[i]} ${a}${i === 1 ? ' <b class="d-check">✓</b>' : ''}</div>`).join('')}</div></div>`, 'Editor do professor');
        digitar(q(p, '#d-q'), perg, c, 35, () => surgir(p, '.surge', c, 400));
      } },
    { leg: ritmo ? 'O professor inicia a atividade. Os alunos entram pelo link ou pelo código e cada um responde no próprio ritmo.'
                 : 'Na sala, o telão mostra um código (PIN). Os alunos digitam o código no celular e entram com um apelido.', dur: 7000,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-pin"><span>Entre com o código</span><b>482 913</b></div><p class="d-cont" id="d-n">0 alunos</p>
          <div class="d-nomes">${ALUNOS.map(n => `<span class="surge">${n}</span>`).join('')}</div>`);
        p.querySelectorAll('.surge').forEach((e, i) => c.t(400 + i * 420, () => { e.classList.add('vis'); q(p, '#d-n').textContent = `${i + 1} ${i ? 'alunos' : 'aluno'}`; }));
      } },
    { leg: 'Sua vez: você é o aluno! A pergunta aparece no telão e as cores no celular. Toque na resposta certa antes do tempo acabar.', sua: true,
      cena: (p, c) => {
        p.innerHTML = `<div class="d-duo">${tela(`<p class="d-perg">${perg}</p><div class="d-relogio" id="d-rel">20</div>
          <div class="d-alts">${alts.map((a, i) => `<div class="d-alt r${i} vis">${FORMAS[i]} ${a}</div>`).join('')}</div>`)}
          ${cel(`<div class="d-botoes" id="d-bt">${FORMAS.map((f, i) => `<button type="button" class="r${i}" data-i="${i}" aria-label="Alternativa ${alts[i]}">${f}</button>`).join('')}</div>`)}</div>`;
        let s = 20;
        const fim = msg => { clearInterval(id); q(p, '.d-cel-in').innerHTML = `<div class="d-msg ${acertou ? 'ok' : 'nao'}">${msg}</div>`; c.feito(); };
        const id = c.iv(1000, () => { q(p, '#d-rel').textContent = --s; if (s <= 0) fim('Tempo esgotado!'); });
        q(p, '#d-bt').onclick = e => { const b = e.target.closest('button'); if (!b) return; acertou = b.dataset.i === '1'; fim(acertou ? `Correto!<br><small>+${600 + s * 20} pontos</small>` : 'Ops! Era a mitocôndria.'); };
      } },
    { leg: ritmo ? 'O professor acompanha ao vivo o progresso e os acertos de cada aluno.' : 'Quando o tempo acaba, o telão mostra quantos escolheram cada alternativa. Hora de explicar o erro mais comum.', dur: 6500,
      cena: (p, c) => {
        if (ritmo) {
          p.innerHTML = tela(`<div class="d-prog-lista">${ALUNOS.slice(0, 7).map((n, i) => `<div><span>${n}</span><i><b style="--v:${[90, 60, 100, 40, 75, 55, 85][i]}%"></b></i></div>`).join('')}</div>`, 'Painel do professor');
        } else {
          const v = [3, 18, 5, 2];
          p.innerHTML = tela(`<div class="d-barras">${v.map((n, i) => `<div><b class="r${i}" style="--v:${n * 5}%"></b><span>${FORMAS[i]} ${n}</span></div>`).join('')}</div>`);
        }
        c.t(150, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
      } },
    { leg: 'No final aparece o pódio. Depois, o professor abre o relatório com os acertos de cada aluno e de cada pergunta.', dur: 7000,
      cena: (p, c) => {
        const pod = acertou ? ['Gabi', 'Você', 'Caio'] : ['Gabi', 'Caio', 'Iara'];
        p.innerHTML = tela(`<div class="d-podio">${[1, 0, 2].map(k => `<div class="lugar l${k}"><span>${pod[k]}</span><b>${k + 1}º</b></div>`).join('')}</div>`);
        c.t(150, () => p.querySelectorAll('.lugar').forEach(e => e.classList.add('cresce')));
      } },
  ];
};

// ---------- Cartões impressos (Plickers) ----------
const cartaoSvg = (rot = 0) => `<svg class="d-cartao" viewBox="0 0 100 100" style="transform:rotate(${rot}deg)" aria-hidden="true">
  <rect x="4" y="4" width="92" height="92" rx="6" class="papel"/><path d="M22 22h56v20H58v16h20v20H22V58h20V42H22z" class="tinta"/>
  <text x="50" y="16">A</text><text x="88" y="54">B</text><text x="50" y="94">C</text><text x="12" y="54">D</text></svg>`;
const cartoes = () => [
  { leg: 'Cada aluno recebe um cartão impresso com um número. A letra que fica para cima é a resposta. Sua vez: gire o cartão até a letra B ficar em cima.', sua: true,
    cena: (p, c) => {
      let r = 0;
      p.innerHTML = `<div class="d-centro">${cartaoSvg(0)}<button class="btn primario" type="button" id="d-girar">Girar cartão ↻</button><p class="d-cont" id="d-letra">Em cima: A</p></div>`;
      q(p, '#d-girar').onclick = () => {
        r -= 90; q(p, '.d-cartao').style.transform = `rotate(${r}deg)`;
        const letra = 'ABCD'[((-r / 90) % 4 + 4) % 4];
        q(p, '#d-letra').textContent = `Em cima: ${letra}`;
        if (letra === 'B') { q(p, '#d-letra').textContent = 'Em cima: B. É assim que o aluno responde!'; c.feito(); }
      };
    } },
  { leg: 'O professor projeta a pergunta e a turma inteira levanta os cartões ao mesmo tempo.', dur: 5000,
    cena: (p, c) => {
      p.innerHTML = `<div class="d-sala">${ALUNOS.map((n, i) => `<div class="d-aluno surge">${cartaoSvg([0, 270, 90, 270, 270, 180, 270, 0, 270, 270, 90, 270][i])}<span>${n}</span></div>`).join('')}</div>`;
      surgir(p, '.surge', c, 200);
    } },
  { leg: 'Com o app no celular, o professor aponta para a sala. Ele lê todos os cartões de uma vez, em segundos.', dur: 6000,
    cena: (p, c) => {
      const certo = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1];
      p.innerHTML = `<div class="d-sala lendo">${ALUNOS.map((n, i) => `<div class="d-aluno vis" data-c="${certo[i]}">${cartaoSvg([0, 270, 90, 270, 270, 180, 270, 0, 270, 270, 90, 270][i])}<span>${n}</span></div>`).join('')}<div class="d-scan"></div></div>`;
      p.querySelectorAll('.d-aluno').forEach((e, i) => c.t(500 + i * 300, () => e.classList.add(e.dataset.c === '1' ? 'ok' : 'nao')));
    } },
  { leg: 'O resultado aparece na hora: porcentagem de acerto da turma e de cada aluno. Nenhum aluno precisou de celular.', dur: 6000,
    cena: (p, c) => {
      const v = [3, 7, 1, 1];
      p.innerHTML = tela(`<p class="d-perg">58% de acerto · resposta certa: B</p><div class="d-barras">${v.map((n, i) => `<div><b class="r${i}" style="--v:${n * 12}%"></b><span>${'ABCD'[i]} · ${n}</span></div>`).join('')}</div>`, 'Celular do professor');
      c.t(150, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
    } },
];

// ---------- Enquete e nuvem de palavras (Mentimeter) ----------
const enquete = () => [
  { leg: 'O professor cria um slide com uma pergunta e projeta. Os alunos entram no site pelo celular com o código da tela, sem cadastro.', dur: 6000,
    cena: (p, c) => {
      p.innerHTML = `<div class="d-duo">${tela(`<div class="d-pin"><span>Entre no site e use o código</span><b>3471 2290</b></div><p class="d-perg">Que palavra vem à cabeça quando você ouve "célula"?</p>`)}
        ${cel(`<p class="d-lbl">Código</p><p class="d-campo" id="d-cod"></p><button class="d-bt-cel" type="button">Entrar</button>`)}</div>`;
      digitar(q(p, '#d-cod'), '3471 2290', c, 120);
    } },
  { leg: 'Sua vez: digite uma palavra e envie. Veja a nuvem crescer com as respostas da turma: as mais repetidas ficam maiores.', sua: true,
    cena: (p, c) => {
      const cont = {};
      let eu = null;
      p.innerHTML = `<div class="d-duo">${tela('<div class="d-nuvem" id="d-nv"></div>')}
        ${cel(`<form id="d-f"><label class="d-lbl" for="d-in">Sua palavra</label><input id="d-in" maxlength="20" placeholder="ex.: vida" autocomplete="off"><button class="d-bt-cel" type="submit">Enviar</button></form>`)}</div>`;
      const nuvem = () => { q(p, '#d-nv').innerHTML = Object.entries(cont).map(([w, n], i) => `<span class="${w === eu ? 'eu' : ''} c${i % 4}" style="font-size:${Math.min(2.6, 0.9 + n * 0.4)}rem">${esc(w)}</span>`).join(' '); };
      const add = w => { cont[w] = (cont[w] || 0) + 1; nuvem(); };
      ['vida', 'núcleo', 'membrana', 'vida', 'DNA', 'microscópio', 'vida', 'organela', 'núcleo', 'energia', 'vida', 'núcleo'].forEach((w, i) => c.t(300 + i * 500, () => add(w)));
      q(p, '#d-f').onsubmit = e => {
        e.preventDefault();
        const w = q(p, '#d-in').value.trim().toLowerCase(); if (!w) return;
        eu = w; add(w); add(w);
        q(p, '.d-cel-in').innerHTML = '<div class="d-msg ok">Enviado!<br><small>Sua palavra está na nuvem</small></div>';
        c.feito();
      };
    } },
  { leg: 'Há outros tipos de slide: múltipla escolha, escala de 1 a 5 e perguntas abertas. As respostas são anônimas, o que deixa os tímidos à vontade.', dur: 6500,
    cena: (p, c) => {
      const v = [2, 5, 9, 6, 3];
      p.innerHTML = tela(`<p class="d-perg">Quanto você já sabe sobre células?</p><div class="d-barras">${v.map((n, i) => `<div><b class="r${i % 4}" style="--v:${n * 9}%"></b><span>${i + 1}</span></div>`).join('')}</div>`);
      c.t(150, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
    } },
];

// ---------- Mural colaborativo (Padlet) ----------
const mural = () => {
  const cols = ['Produtores', 'Consumidores', 'Decompositores'];
  const posts = [[0, 'Capim-annoni', 'Ana'], [1, 'Quero-quero', 'Caio'], [2, 'Cogumelo-orelha-de-pau', 'Iara'], [0, 'Butiazeiro', 'Enzo'], [1, 'Graxaim-do-campo', 'Lia'], [2, 'Minhoca', 'Nico']];
  const html = extra => `<div class="d-mural">${cols.map((n, k) => `<div class="d-col"><b>${n}</b>${posts.filter(x => x[0] === k).map(x => `<div class="d-post surge"><p>${x[1]}</p><small>${x[2]}</small></div>`).join('')}${extra && extra[0] === k ? `<div class="d-post eu vis"><p>${esc(extra[1])}</p><small>Você</small></div>` : ''}</div>`).join('')}</div>`;
  return [
    { leg: 'O professor cria um mural com colunas e compartilha o link ou o QR code com a turma.', dur: 5500,
      cena: p => { p.innerHTML = tela(`<div class="d-centro"><p class="d-perg">Cadeia alimentar do Pampa</p><div class="d-qr">${Array.from({ length: 49 }, (_, i) => `<i class="${(i * 7 + (i % 5) * 3) % 3 ? 'p' : ''}"></i>`).join('')}</div><span class="d-link">mural.exemplo/pampa</span></div>`, 'Mural do professor'); } },
    { leg: 'Os alunos postam textos, fotos e links pelo celular, e tudo aparece na hora para a turma inteira.', dur: 6000,
      cena: (p, c) => { p.innerHTML = tela(html(), 'Mural'); surgir(p, '.surge', c, 650); } },
    { leg: 'Sua vez: escreva um ser vivo do Pampa, escolha a coluna certa e poste.', sua: true,
      cena: (p, c) => {
        p.innerHTML = tela(html().replace(/surge/g, 'vis'), 'Mural') + `<form class="d-form-linha" id="d-f"><label class="vis-oculto" for="d-in">Seu post</label><input id="d-in" placeholder="ex.: Tatu-mulita" autocomplete="off">
          <label class="vis-oculto" for="d-sel">Coluna</label><select id="d-sel">${cols.map((n, k) => `<option value="${k}">${n}</option>`).join('')}</select><button class="btn primario" type="submit">Postar</button></form>`;
        q(p, '#d-f').onsubmit = e => {
          e.preventDefault(); const v = q(p, '#d-in').value.trim(); if (!v) return;
          p.innerHTML = tela(html([+q(p, '#d-sel').value, v]).replace(/surge/g, 'vis'), 'Mural'); c.feito();
        };
      } },
    { leg: 'Com a moderação ligada, o professor aprova cada post antes de ele aparecer. Também dá para comentar e curtir.', dur: 6000,
      cena: (p, c) => {
        p.innerHTML = tela(html().replace(/class="d-post surge"/g, 'class="d-post vis pend"'), 'Mural com moderação');
        p.querySelectorAll('.pend').forEach((e, i) => c.t(600 + i * 600, () => { e.classList.remove('pend'); e.insertAdjacentHTML('beforeend', `<span class="d-curtir">♥ ${i + 2}</span>`); }));
      } },
  ];
};

// ---------- Jogos de lista (Wordwall) ----------
const listaJogo = () => {
  const pares = [['Núcleo', 'Guarda o DNA'], ['Mitocôndria', 'Produz energia'], ['Membrana', 'Controla o que entra e sai']];
  return [
    { leg: 'O professor digita a lista de termos e definições uma única vez.', dur: 6000,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-editor"><p class="d-lbl">Conteúdo</p>${pares.map(() => '<p class="d-digita d-linha-lista"></p>').join('')}</div>`, 'Editor do professor');
        const ls = p.querySelectorAll('.d-linha-lista');
        pares.forEach(([a, b], i) => c.t(i * 1700, () => digitar(ls[i], `${a}  →  ${b}`, c, 35)));
      } },
    { leg: 'Sua vez: no modelo "Combinar", clique num termo e depois na definição certa.', sua: true,
      cena: (p, c) => {
        const dir = [2, 0, 1];
        let sel = null, ok = 0;
        p.innerHTML = tela(`<div class="d-pares"><div>${pares.map((x, i) => `<button type="button" class="d-par t" data-i="${i}">${x[0]}</button>`).join('')}</div>
          <div>${dir.map(i => `<button type="button" class="d-par d" data-i="${i}">${pares[i][1]}</button>`).join('')}</div></div>`, 'Jogo: Combinar');
        p.onclick = e => {
          const b = e.target.closest('.d-par'); if (!b || b.disabled) return;
          if (b.classList.contains('t')) { p.querySelectorAll('.t').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
          if (!sel) return;
          if (sel.dataset.i === b.dataset.i) { [sel, b].forEach(x => { x.disabled = true; x.classList.add('ok'); x.classList.remove('sel'); }); sel = null; if (++ok === 3) { p.onclick = null; c.feito(); } }
          else { b.classList.add('nao'); c.t(500, () => b.classList.remove('nao')); }
        };
      } },
    { leg: 'Com um clique, o mesmo conteúdo vira outro jogo: roleta, cruzadinha, forca. Sua vez: gire a roleta para sortear um termo.', sua: true,
      cena: (p, c) => {
        let giro = 0;
        p.innerHTML = `<div class="d-centro"><div class="d-roleta-box"><div class="d-roleta" id="d-rol"></div><span class="d-seta">▼</span></div>
          <button class="btn primario" type="button" id="d-gira">Girar roleta</button><p class="d-cont" id="d-sorteio">&nbsp;</p></div>`;
        q(p, '#d-gira').onclick = () => {
          const k = Math.floor(Math.random() * 3); giro += 1080 + (360 - k * 120 - 60) - (giro % 360);
          q(p, '#d-rol').style.transform = `rotate(${giro}deg)`; q(p, '#d-gira').disabled = true;
          c.t(2300, () => { q(p, '#d-sorteio').textContent = `Sorteado: ${pares[k][0]}. O que é?`; q(p, '#d-gira').disabled = false; c.feito(); });
        };
      } },
  ];
};

// ---------- Vídeo com perguntas (Edpuzzle, Khan Academy) ----------
const video = t => {
  const khan = t.id === 'khan';
  const player = () => `<div class="d-player"><div class="d-video"><svg viewBox="0 0 200 110" aria-hidden="true"><g class="d-divide"><circle class="m1" cx="100" cy="55" r="30"/><circle class="m2" cx="100" cy="55" r="30"/></g></svg>
    <div class="d-pergunta" id="d-pq" hidden></div></div><div class="d-barra"><i id="d-pb"></i><span class="marca" style="left:45%"></span></div></div>`;
  return [
    { leg: khan ? 'O professor escolhe vídeos e exercícios em português e atribui para a turma com prazo.' : 'O professor escolhe um vídeo, corta o trecho que interessa e marca pontos onde o vídeo vai parar.', dur: 6000,
      cena: (p, c) => {
        p.innerHTML = tela(player(), khan ? 'Biblioteca de vídeos' : 'Editor de vídeo');
        q(p, '.marca').classList.add('pisca');
      } },
    { leg: khan ? 'Sua vez: assista. Depois do vídeo vem um exercício, e o aluno pode pedir uma dica.' : 'Sua vez: assista. Na marca, o vídeo para sozinho e só continua quando o aluno responde.', sua: true,
      cena: (p, c) => {
        p.innerHTML = tela(player(), 'Tela do aluno');
        let v = 0;
        const pausa = khan ? 100 : 45;
        const perg = () => {
          const box = q(p, '#d-pq'); box.hidden = false;
          box.innerHTML = `<p>Como se chama a divisão em que uma célula vira duas iguais?</p>${['Meiose', 'Mitose', 'Fotossíntese'].map((o, i) => `<button type="button" data-i="${i}">${o}</button>`).join('')}${khan ? '<button type="button" class="dica" data-i="d">Pedir dica</button>' : ''}<p class="d-fb" id="d-fb"></p>`;
          box.onclick = e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.i === 'd') { q(p, '#d-fb').textContent = 'Dica: "mito" vem de fio, os cromossomos que se separam.'; return; }
            if (b.dataset.i === '1') {
              q(p, '#d-fb').textContent = 'Certo! As células-filhas são iguais à mãe.'; box.onclick = null;
              c.t(1200, () => { box.hidden = true; if (khan) c.feito(); else roda(100, () => c.feito()); });
            } else q(p, '#d-fb').textContent = 'Ainda não. Tente de novo.';
          };
        };
        const roda = (ate, fim) => { q(p, '.d-video').classList.add('play'); const id = c.iv(80, () => { v++; q(p, '#d-pb').style.width = v + '%'; if (v >= ate) { clearInterval(id); q(p, '.d-video').classList.remove('play'); fim(); } }); };
        roda(pausa, perg);
      } },
    { leg: 'O professor vê quem assistiu até o fim e como cada um respondeu, antes mesmo da aula.', dur: 6000,
      cena: (p, c) => {
        const d = [[100, '2/2'], [100, '1/2'], [60, '1/1'], [100, '2/2'], [20, '0/0'], [100, '2/2']];
        p.innerHTML = tela(`<div class="d-prog-lista">${d.map(([v, a], i) => `<div><span>${ALUNOS[i]}</span><i><b style="--v:${v}%"></b></i><em>${a}</em></div>`).join('')}</div>`, 'Painel do professor');
        c.t(150, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
      } },
  ];
};

// ---------- Formulário que corrige sozinho (Forms, Conker) ----------
const formulario = t => {
  const ia = t.id === 'conker';
  return [
    { leg: ia ? 'Na Conker, o professor digita o tema, escolhe tipo, quantidade e série, e a IA monta as questões.' : 'O professor cria as perguntas e liga o modo teste: o formulário passa a corrigir e dar nota sozinho.', dur: 7000,
      cena: (p, c) => {
        if (ia) {
          p.innerHTML = tela(`<div class="d-editor"><p class="d-lbl">Tema</p><p class="d-digita" id="d-tema"></p><div class="d-gerando" id="d-ger"></div></div>`, 'Gerador de quiz');
          digitar(q(p, '#d-tema'), 'Células eucariontes · 8º ano · 5 questões', c, 40, () => {
            q(p, '#d-ger').innerHTML = [1, 2, 3, 4, 5].map(n => `<div class="d-q-linha surge">Questão ${n} <i></i></div>`).join(''); surgir(p, '.surge', c, 450);
          });
        } else {
          p.innerHTML = tela(`<div class="d-editor"><div class="d-toggle" id="d-tg"><span></span> Transformar em teste</div>
            <div class="d-q-linha vis">1. Bactérias têm núcleo definido? <i></i></div><div class="d-q-linha vis">2. Onde fica o DNA na célula eucarionte? <i></i></div><p class="d-lbl" id="d-ch">&nbsp;</p></div>`, 'Editor do professor');
          c.t(1500, () => { q(p, '#d-tg').classList.add('on'); q(p, '#d-ch').textContent = 'Chave de resposta e pontos definidos ✓'; });
        }
      } },
    { leg: 'Sua vez: responda como aluno e envie.', sua: true,
      cena: (p, c) => {
        p.innerHTML = tela(`<form class="d-quiz" id="d-f">
          <fieldset><legend>1. Bactérias têm núcleo definido?</legend><label><input type="radio" name="a" value="0"> Sim</label><label><input type="radio" name="a" value="1"> Não</label></fieldset>
          <fieldset><legend>2. Onde fica o DNA na célula eucarionte?</legend><label><input type="radio" name="b" value="1"> No núcleo</label><label><input type="radio" name="b" value="0"> Na parede celular</label></fieldset>
          <button class="btn primario" type="submit">Enviar</button><p class="d-fb" id="d-fb"></p></form>`, 'Tela do aluno');
        q(p, '#d-f').onsubmit = e => {
          e.preventDefault(); const f = new FormData(e.target);
          if (!f.get('a') || !f.get('b')) { q(p, '#d-fb').textContent = 'Responda as duas perguntas.'; return; }
          const n = +f.get('a') + +f.get('b');
          q(p, '#d-fb').textContent = `Nota automática: ${n * 5} de 10. ${n < 2 ? 'O feedback mostra o que revisar.' : 'Parabéns!'}`; c.feito();
        };
      } },
    { leg: 'As respostas chegam corrigidas: a nota de cada aluno e um gráfico por questão mostram o que a turma precisa revisar.', dur: 6000,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-barras">${[['Questão 1', 82], ['Questão 2', 54], ['Questão 3', 91], ['Questão 4', 38]].map(([n, v], i) => `<div><b class="r${i}" style="--v:${v}%"></b><span>${n} · ${v}%</span></div>`).join('')}</div>`, 'Respostas');
        c.t(150, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
      } },
  ];
};

// ---------- Conversa com IA (ChatGPT, NotebookLM, geradores de plano) ----------
const chatIA = t => {
  const nb = t.id === 'notebooklm', plano = t.id === 'planos';
  const pedido = nb ? 'Quais as diferenças entre célula animal e vegetal?' : plano ? 'Plano de aula: biomas brasileiros, 7º ano, 50 minutos' : 'Crie 3 questões sobre células para o 8º ano';
  const resp = nb ? 'A célula vegetal tem parede celular e cloroplastos [1]. A animal não tem parede e guarda energia como glicogênio [2]. As duas têm núcleo, membrana e mitocôndrias [1].'
    : plano ? 'Objetivo: reconhecer os seis biomas e suas características. Abertura (10 min): fotos misteriosas de cada bioma. Desenvolvimento (30 min): grupos montam fichas. Fechamento (10 min): mapa coletivo.'
    : '1. Qual estrutura guarda o DNA? a) Núcleo b) Membrana c) Parede. 2. Que organela produz energia? 3. Qual a diferença entre procarionte e eucarionte?';
  const ajustes = { 'Mais fácil': 'Versão mais simples: frases curtas e exemplos do dia a dia, como comparar a célula a uma casa.', 'Mais exemplos': 'Exemplos: hemácia (sem núcleo quando madura), neurônio (muito longo), célula da cebola (fácil de ver no microscópio).', 'Mais curto': 'Resumo: a célula é a menor unidade viva e tem membrana, citoplasma e material genético.' };
  const chat = `<div class="d-chat">${nb ? '<div class="d-fontes"><b>Fontes</b><span class="surge">📄 aula-celulas.pdf</span><span class="surge">📄 livro-cap3.pdf</span></div>' : ''}<div class="d-msgs" id="d-msgs"></div></div>`;
  const fala = (p, quem, txt, c, fim) => {
    const m = document.createElement('p'); m.className = 'd-bolha ' + quem; q(p, '#d-msgs').append(m);
    if (quem === 'eu') { m.textContent = txt; fim && fim(); return; }
    const pal = txt.split(' '); let k = 0;
    const id = c.iv(70, () => { m.innerHTML = esc(pal.slice(0, ++k).join(' ')).replace(/\[(\d)\]/g, '<sup>$1</sup>'); if (k >= pal.length) { clearInterval(id); fim && fim(); } });
  };
  return [
    { leg: nb ? 'No NotebookLM, o professor envia os PDFs da aula como fontes e faz perguntas sobre eles.' : 'O professor escreve o pedido com detalhes: tema, turma e o que quer receber.', dur: 5000,
      cena: (p, c) => {
        p.innerHTML = tela(chat + `<div class="d-caixa"><span id="d-dig"></span><b>➤</b></div>`, nb ? 'Notebook' : 'Assistente de IA');
        surgir(p, '.surge', c, 500); digitar(q(p, '#d-dig'), pedido, c, 40);
      } },
    { leg: nb ? 'A resposta usa só as fontes enviadas e mostra de onde saiu cada parte (os números são citações).' : 'Em segundos a IA responde. O texto vai aparecendo enquanto ela escreve.', dur: 9000,
      cena: (p, c) => {
        p.innerHTML = tela(chat, nb ? 'Notebook' : 'Assistente de IA');
        p.querySelectorAll('.surge').forEach(e => e.classList.add('vis'));
        fala(p, 'eu', pedido, c); c.t(600, () => fala(p, 'ia', resp, c));
      } },
    { leg: 'Sua vez: peça um ajuste. Dá para conversar até o material ficar do jeito certo.', sua: true,
      cena: (p, c) => {
        p.innerHTML = tela(chat, nb ? 'Notebook' : 'Assistente de IA') + `<div class="d-chips">${Object.keys(ajustes).map(k => `<button type="button" class="chip">${k}</button>`).join('')}</div>`;
        p.querySelectorAll('.surge').forEach(e => e.classList.add('vis'));
        fala(p, 'ia', resp.slice(0, 90) + '...', c);
        q(p, '.d-chips').onclick = e => { const b = e.target.closest('button'); if (!b) return; q(p, '.d-chips').remove(); fala(p, 'eu', b.textContent, c); c.t(500, () => fala(p, 'ia', ajustes[b.textContent], c, () => c.feito())); };
      } },
    { leg: 'Atenção: a IA pode errar ou inventar. Leia tudo, confira os fatos e só depois leve para a turma.', dur: 6000,
      cena: p => { p.innerHTML = tela(`<div class="d-centro"><p class="d-bolha ia">A hemácia humana tem <mark>dois núcleos</mark>.</p><p class="d-alerta">⚠ Errado! A hemácia madura não tem núcleo. Revise sempre.</p></div>`, 'Assistente de IA'); } },
  ];
};

// ---------- Identificação pela câmera (Seek, iNaturalist, Pl@ntNet) ----------
const flor = `<svg class="d-planta" viewBox="0 0 160 160" aria-hidden="true"><path d="M80 160V80" class="caule"/><path d="M80 120c-20-4-30-16-32-30 16 2 28 12 32 30zM80 105c18-6 26-18 26-32-14 4-24 14-26 32z" class="folha"/>
  ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="80" cy="52" rx="14" ry="26" transform="rotate(${a} 80 70)" class="petala"/>`).join('')}<circle cx="80" cy="70" r="9" class="miolo"/></svg>`;
const camera = t => {
  const sug = [['Ipê-amarelo', 'Handroanthus albus', 86], ['Ipê-branco', 'Tabebuia roseoalba', 9], ['Caroba', 'Jacaranda micrantha', 3]];
  const fim = {
    seek: ['Cada descoberta vira um distintivo. Os alunos colecionam conquistas enquanto exploram o pátio.', '<div class="d-centro"><div class="d-selo">🌼<b>Botânico iniciante</b><small>5 plantas encontradas</small></div></div>'],
    inaturalist: ['A observação vai para um mapa público, e pessoas da comunidade confirmam ou corrigem a identificação.', '<div class="d-mapa"><span class="d-pino">📍</span><div class="d-card-obs"><b>Ipê-amarelo</b><small>Pátio da escola · hoje</small><span class="surge">✔ Iara concorda</span><span class="surge">✔ especialista concorda</span><em class="surge">Grau de pesquisa</em></div></div>'],
    plantnet: ['Compare a foto com as imagens de referência antes de confirmar. A flor costuma dar mais certeza que a folha.', `<div class="d-ref">${[1, 2, 3, 4].map(() => `<div class="surge">${flor}</div>`).join('')}</div>`],
  }[t.id];
  return [
    { leg: 'Abra o app e aponte a câmera para a planta, o bicho ou o fungo, bem enquadrado.', dur: 5000,
      cena: p => { p.innerHTML = cel(`<div class="d-visor">${flor}<i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>`, 'Câmera do app'); } },
    { leg: 'O app analisa a imagem e sugere quem é: primeiro o grupo maior, depois família, gênero e espécie, com a porcentagem de semelhança.', dur: 8000,
      cena: (p, c) => {
        p.innerHTML = `<div class="d-duo">${cel(`<div class="d-visor lendo">${flor}<div class="d-scan"></div></div>`, 'Câmera do app')}
          ${tela(`<p class="d-trilha-tax surge">Plantas › Bignoniaceae › Handroanthus</p>${sug.map(([n, s, v]) => `<div class="d-sug surge"><b>${n}</b> <i>${s}</i><span><b style="--v:${v}%"></b></span><em>${v}%</em></div>`).join('')}`, 'Sugestões')}</div>`;
        surgir(p, '.surge', c, 700); c.t(900, () => p.querySelectorAll('[style*="--v"]').forEach(e => e.classList.add('cresce')));
      } },
    { leg: 'Sua vez: olhe a foto e escolha a sugestão mais provável.', sua: true,
      cena: (p, c) => {
        p.innerHTML = `<div class="d-duo">${cel(`<div class="d-visor">${flor}</div>`, 'Sua foto')}${tela(`<div class="d-opcoes">${sug.map(([n, s, v], i) => `<button type="button" data-i="${i}"><b>${n}</b> <i>${s}</i> · ${v}%</button>`).join('')}</div><p class="d-fb" id="d-fb"></p>`, 'Qual é?')}</div>`;
        q(p, '.d-opcoes').onclick = e => {
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.i === '0') { b.classList.add('ok'); q(p, '#d-fb').textContent = 'Isso! Flores amarelas em cacho e alta semelhança.'; q(p, '.d-opcoes').onclick = null; c.feito(); }
          else { b.classList.add('nao'); q(p, '#d-fb').textContent = 'Pouco provável: a semelhança é baixa. Compare a cor da flor.'; }
        };
      } },
    { leg: fim[0], dur: 6500, cena: (p, c) => { p.innerHTML = tela(fim[1], t.nome); surgir(p, '.surge', c, 700); } },
  ];
};

// ---------- Globo (Google Earth) ----------
const BIOMAS = [
  ['Amazônia', 'Maior floresta tropical do mundo. Ocupa quase metade do território brasileiro.', 0.62, 0.32],
  ['Cerrado', 'Savana com enorme biodiversidade. Guarda nascentes de grandes rios do país.', 0.6, 0.5],
  ['Caatinga', 'Único bioma exclusivamente brasileiro, com plantas adaptadas à seca, como o mandacaru.', 0.73, 0.42],
  ['Mata Atlântica', 'Resta pouco mais de 12% da floresta original. Abriga muitas espécies que só existem nela.', 0.7, 0.6],
  ['Pantanal', 'Uma das maiores planícies alagáveis do planeta: cheia e seca mudam a paisagem todo ano.', 0.55, 0.56],
  ['Pampa', 'Campos do sul. No Brasil, só existe no Rio Grande do Sul.', 0.58, 0.72],
];
function globo(cv, c, alvo) {
  const ctx = cv.getContext('2d'), w = cv.width = 320, h = cv.height = 320, r = 140;
  let rot = 0;
  const pontos = Array.from({ length: 420 }, (_, i) => [Math.acos(1 - 2 * ((i * 0.618) % 1)), i * 2.39996]);
  const css = getComputedStyle(document.documentElement), cor = n => css.getPropertyValue(n).trim();
  c.iv(50, () => {
    rot += alvo.girando ? 0.02 : 0;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cor('--faixa'); ctx.beginPath(); ctx.arc(160, 160, r, 0, 7); ctx.fill();
    ctx.strokeStyle = cor('--linha'); ctx.stroke();
    pontos.forEach(([th, ph]) => {
      const x = Math.sin(th) * Math.cos(ph + rot), z = Math.sin(th) * Math.sin(ph + rot), y = Math.cos(th);
      if (z < 0) return;
      const terra = Math.sin(ph * 3 + th * 2) > 0.1;
      ctx.fillStyle = terra ? cor('--folha') : cor('--linha');
      ctx.beginPath(); ctx.arc(160 + x * r, 160 - y * r, terra ? 3 : 1.5, 0, 7); ctx.fill();
    });
    if (alvo.ponto) { ctx.fillStyle = cor('--flor'); ctx.beginPath(); ctx.arc(alvo.ponto[0] * w, alvo.ponto[1] * h, 9, 0, 7); ctx.fill(); }
  });
}
const terra = () => [
  { leg: 'Busque um lugar pelo nome e o globo 3D gira e aproxima até ele.', dur: 6000,
    cena: (p, c) => {
      const alvo = { girando: true };
      p.innerHTML = tela(`<div class="d-centro"><div class="d-caixa"><span id="d-dig"></span><b>🔍</b></div><canvas class="d-globo" id="d-gl"></canvas></div>`, 'Globo 3D');
      globo(q(p, '#d-gl'), c, alvo);
      digitar(q(p, '#d-dig'), 'Pantanal', c, 120, () => c.t(800, () => { alvo.girando = false; alvo.ponto = [0.55, 0.56]; q(p, '#d-gl').classList.add('zoom'); }));
    } },
  { leg: 'Sua vez: clique em pelo menos 3 paradas do roteiro para visitar os biomas brasileiros.', sua: true,
    cena: (p, c) => {
      const alvo = { girando: false }, vistos = new Set();
      p.innerHTML = `<div class="d-duo">${tela(`<canvas class="d-globo" id="d-gl"></canvas><p class="d-fb" id="d-fb">Escolha uma parada.</p>`, 'Globo 3D')}
        <div class="d-paradas">${BIOMAS.map((b, i) => `<button type="button" data-i="${i}">${i + 1}. ${b[0]}</button>`).join('')}</div></div>`;
      globo(q(p, '#d-gl'), c, alvo);
      q(p, '.d-paradas').onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        const [n, txt, x, y] = BIOMAS[b.dataset.i]; alvo.ponto = [x, y]; b.classList.add('ok'); vistos.add(n);
        q(p, '#d-fb').innerHTML = `<b>${n}:</b> ${txt}`;
        if (vistos.size === 3) c.feito();
      };
    } },
  { leg: 'Monte um projeto com marcadores, fotos e textos, e compartilhe o link para a turma fazer a viagem em casa.', dur: 6000,
    cena: (p, c) => { p.innerHTML = tela(`<div class="d-projeto">${BIOMAS.map(b => `<div class="surge">📍 <b>${b[0]}</b></div>`).join('')}</div>`, 'Projeto: Biomas do Brasil'); surgir(p, '.surge', c, 500); } },
];

// ---------- Simulação (PhET) ----------
function aquario(cv, c, estado) {
  const ctx = cv.getContext('2d'), w = cv.width = 320, h = cv.height = 220;
  const css = getComputedStyle(document.documentElement), cor = n => css.getPropertyValue(n).trim();
  let bolhas = [], acum = 0;
  c.iv(40, () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cor('--ipe'); ctx.globalAlpha = estado.luz / 140; ctx.beginPath(); ctx.arc(40, 30, 22, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = cor('--faixa'); ctx.fillRect(90, 40, 200, 170); ctx.strokeStyle = cor('--linha'); ctx.strokeRect(90, 40, 200, 170);
    ctx.strokeStyle = cor('--folha'); ctx.lineWidth = 4;
    [150, 190, 230].forEach((x, i) => { ctx.beginPath(); ctx.moveTo(x, 210); ctx.quadraticCurveTo(x + (i - 1) * 15, 150, x + (i - 1) * 8, 100); ctx.stroke(); });
    acum += estado.luz / 100 * 0.6;
    while (acum > 1) { acum--; bolhas.push([150 + Math.random() * 90, 110, 2 + Math.random() * 3]); estado.cont++; }
    ctx.fillStyle = cor('--sobre-mata'); ctx.strokeStyle = cor('--mata'); ctx.lineWidth = 1.5;
    bolhas = bolhas.filter(b => (b[1] -= 1.6) > 45);
    bolhas.forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); });
  });
}
const simulacao = () => {
  const dados = [];
  return [
    { leg: 'Simulações deixam o aluno mexer nas variáveis e ver o efeito na hora. Aqui: quanto mais luz, mais a planta aquática solta bolhas de oxigênio.', dur: 7000,
      cena: (p, c) => {
        const est = { luz: 10, cont: 0 };
        p.innerHTML = tela(`<canvas class="d-aquario" id="d-aq"></canvas><p class="d-cont" id="d-l">Luz: 10%</p>`, 'Simulação: fotossíntese');
        aquario(q(p, '#d-aq'), c, est);
        c.iv(60, () => { est.luz = Math.min(100, est.luz + 1); q(p, '#d-l').textContent = `Luz: ${est.luz}%`; });
      } },
    { leg: 'Sua vez: antes de mexer, faça uma previsão. O que acontece com as bolhas se a luz aumentar?', sua: true,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-opcoes">${['Aumentam', 'Diminuem', 'Não mudam'].map(o => `<button type="button">${o}</button>`).join('')}</div><p class="d-fb" id="d-fb"></p>`, 'Previsão');
        q(p, '.d-opcoes').onclick = e => { const b = e.target.closest('button'); if (!b) return; b.classList.add('ok'); q(p, '#d-fb').textContent = `Previsão anotada: "${b.textContent}". Agora vamos testar.`; q(p, '.d-opcoes').onclick = null; c.feito(); };
      } },
    { leg: 'Sua vez: mude a luz, espere alguns segundos e clique em "Registrar". Faça 3 medidas diferentes.', sua: true,
      cena: (p, c) => {
        const est = { luz: 30, cont: 0 };
        p.innerHTML = tela(`<canvas class="d-aquario" id="d-aq"></canvas>
          <div class="d-form-linha"><label for="d-luz">Luz</label><input id="d-luz" type="range" min="0" max="100" value="30"><output id="d-lv">30%</output><button class="btn primario" type="button" id="d-reg">Registrar</button></div>
          <table class="d-tab"><thead><tr><th>Luz</th><th>Bolhas em 5 s</th></tr></thead><tbody id="d-tb"></tbody></table>`, 'Simulação: fotossíntese');
        aquario(q(p, '#d-aq'), c, est);
        q(p, '#d-luz').oninput = e => { est.luz = +e.target.value; est.cont = 0; q(p, '#d-lv').textContent = est.luz + '%'; };
        q(p, '#d-reg').onclick = () => {
          const n = Math.round(est.luz / 100 * 0.6 * 25 * 5);
          dados.push([est.luz, n]); q(p, '#d-tb').insertAdjacentHTML('beforeend', `<tr><td>${est.luz}%</td><td>${n}</td></tr>`);
          if (dados.length === 3) c.feito();
        };
      } },
    { leg: 'Na conclusão, o aluno compara a previsão com os dados que ele mesmo mediu. É ciência de verdade, sem laboratório.', dur: 7000,
      cena: p => {
        const d = dados.length ? [...dados].sort((a, b) => a[0] - b[0]) : [[20, 15], [50, 38], [90, 68]];
        const mx = Math.max(...d.map(x => x[1]), 1);
        p.innerHTML = tela(`<svg class="d-graf" viewBox="0 0 300 160" role="img" aria-label="Gráfico de bolhas por luz"><line x1="30" y1="140" x2="290" y2="140"/><line x1="30" y1="10" x2="30" y2="140"/>
          <polyline points="${d.map(([l, n]) => `${30 + l * 2.6},${140 - n / mx * 120}`).join(' ')}"/>${d.map(([l, n]) => `<circle cx="${30 + l * 2.6}" cy="${140 - n / mx * 120}" r="5"/>`).join('')}
          <text x="160" y="156">luz (%)</text><text x="4" y="80">bolhas</text></svg>`, 'Seus dados');
      } },
  ];
};

// ---------- Modelo 3D (BioDigital) ----------
const ORGANELAS = [['nucleo', 'Núcleo', 'Guarda o DNA e controla a célula.'], ['mito', 'Mitocôndria', 'Faz a respiração celular e libera energia.'], ['golgi', 'Complexo de Golgi', 'Embala e envia substâncias.'], ['lis', 'Lisossomo', 'Faz a digestão dentro da célula.'], ['re', 'Retículo endoplasmático', 'Produz e transporta proteínas e lipídios.']];
const celula = () => `<div class="d-3d"><svg viewBox="0 0 300 200" class="d-cel3d" aria-hidden="true">
  <ellipse cx="150" cy="100" rx="140" ry="90" class="memb"/>
  <path data-o="re" class="org re" d="M95 60q20-15 40 0t40 0M90 75q25-15 50 0t45 0M92 140q20 12 40 0t40 0"/>
  <g data-o="nucleo" class="org"><circle cx="150" cy="100" r="32" class="nuc"/><circle cx="158" cy="94" r="9" class="nucleolo"/></g>
  <g data-o="mito" class="org"><ellipse cx="70" cy="110" rx="26" ry="13" class="mito"/><path d="M52 110l6-8 6 16 6-16 6 16 6-16 6 8" class="crista"/><ellipse cx="225" cy="70" rx="22" ry="11" class="mito"/></g>
  <g data-o="golgi" class="org"><path d="M205 120q20 10 40 0M207 130q18 9 36 0M210 140q15 8 30 0" class="golgi"/></g>
  <g data-o="lis" class="org"><circle cx="110" cy="160" r="9" class="lis"/><circle cx="200" cy="160" r="7" class="lis"/></g></svg><p class="d-rotulo" id="d-rot">&nbsp;</p></div>`;
const modelo3d = () => [
  { leg: 'Modelos 3D podem ser girados, aproximados e explorados por camadas. Aqui um exemplo com uma célula; na ferramenta são órgãos e sistemas do corpo humano.', dur: 7000,
    cena: (p, c) => { p.innerHTML = tela(celula(), 'Modelo 3D'); q(p, '.d-cel3d').classList.add('girando'); } },
  { leg: 'Sua vez: clique em 2 estruturas. As outras ficam transparentes e aparece o nome e a função.', sua: true,
    cena: (p, c) => {
      const vistos = new Set();
      p.innerHTML = tela(celula(), 'Modelo 3D');
      q(p, '.d-cel3d').onclick = e => {
        const g = e.target.closest('[data-o]'); if (!g) return;
        const [id, n, f] = ORGANELAS.find(o => o[0] === g.dataset.o);
        p.querySelectorAll('.org').forEach(x => x.classList.toggle('apagada', x !== g));
        q(p, '#d-rot').innerHTML = `<b>${n}:</b> ${f}`; vistos.add(id);
        if (vistos.size === 2) c.feito();
      };
    } },
  { leg: 'Esconda os rótulos e transforme em desafio: a turma tenta adivinhar o nome de cada estrutura.', dur: 6000,
    cena: (p, c) => {
      p.innerHTML = tela(celula(), 'Modo desafio');
      ORGANELAS.forEach((o, i) => c.t(800 + i * 900, () => { p.querySelectorAll('.org').forEach(x => x.classList.toggle('apagada', x.dataset.o !== o[0])); q(p, '#d-rot').textContent = `Estrutura ${i + 1}: qual é o nome?`; }));
    } },
];

// ---------- Tradução para Libras (VLibras, Hand Talk) ----------
const avatar = `<svg class="d-avatar" viewBox="0 0 120 160" aria-hidden="true"><circle cx="60" cy="34" r="20" class="pele"/><path d="M30 150c0-50 10-80 30-80s30 30 30 80z" class="roupa"/>
  <path class="braco b1" d="M38 85 18 120"/><path class="braco b2" d="M82 85 102 120"/></svg>`;
const libras = () => {
  const toca = (p, c, frase, fim) => {
    const pal = frase.split(/\s+/).filter(Boolean); let k = 0;
    q(p, '#d-frase').innerHTML = pal.map(w => `<span>${esc(w)}</span>`).join(' ');
    const id = c.iv(900 / (p._vel || 1), () => {
      p.querySelectorAll('#d-frase span').forEach((s, i) => s.classList.toggle('agora', i === k));
      q(p, '.d-avatar').setAttribute('data-pose', k % 4);
      if (++k > pal.length) { clearInterval(id); q(p, '.d-avatar').removeAttribute('data-pose'); fim && fim(); }
    });
  };
  const palco = extra => `<div class="d-duo">${tela(`<div class="d-centro">${avatar}<p class="d-frase" id="d-frase"></p></div>`, 'Avatar em Libras (ilustração)')}${extra || ''}</div>`;
  return [
    { leg: 'Selecione um texto na página ou digite uma frase no app.', dur: 4500,
      cena: (p, c) => { p.innerHTML = tela(`<div class="d-caixa"><span id="d-dig"></span></div>`, 'Texto'); digitar(q(p, '#d-dig'), 'A célula é a unidade da vida', c, 60); } },
    { leg: 'Um avatar 3D sinaliza a frase em Libras. Nesta ilustração, a palavra destacada é a que está sendo sinalizada; no app real, os sinais são completos.', dur: 8000,
      cena: (p, c) => { p.innerHTML = palco(); toca(p, c, 'A célula é a unidade da vida'); } },
    { leg: 'Sua vez: escreva uma frase curta e direta (frases simples são traduzidas com mais precisão) e escolha a velocidade.', sua: true,
      cena: (p, c) => {
        p.innerHTML = palco(`<form class="d-form-col" id="d-f"><label for="d-in">Sua frase</label><input id="d-in" placeholder="ex.: A planta faz fotossíntese" autocomplete="off">
          <label for="d-vel">Velocidade</label><select id="d-vel"><option value="0.7">Devagar</option><option value="1" selected>Normal</option><option value="1.5">Rápido</option></select><button class="btn primario" type="submit">Traduzir</button></form>`);
        q(p, '#d-f').onsubmit = e => { e.preventDefault(); const v = q(p, '#d-in').value.trim(); if (!v) return; p._vel = +q(p, '#d-vel').value; toca(p, c, v, () => c.feito()); };
      } },
  ];
};

// ---------- Ferramentas da lousa (Classroomscreen) ----------
const lousa = () => [
  { leg: 'Projete na lousa um cronômetro para cada etapa da atividade. Todos veem quanto tempo falta.', dur: 7000,
    cena: (p, c) => { let s = 300; p.innerHTML = tela(`<div class="d-relogio grande" id="d-rel">5:00</div><p class="d-cont">Discussão em grupo</p>`, 'Lousa'); c.iv(1000, () => { s--; q(p, '#d-rel').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }); } },
  { leg: 'Sua vez: use o sorteador de nomes para escolher, de forma justa, quem apresenta primeiro.', sua: true,
    cena: (p, c) => {
      p.innerHTML = tela(`<div class="d-centro"><p class="d-sorteado" id="d-nome">?</p><button class="btn primario" type="button" id="d-sort">Sortear</button></div>`, 'Lousa');
      q(p, '#d-sort').onclick = () => {
        q(p, '#d-sort').disabled = true; let k = 0;
        const id = c.iv(80, () => { q(p, '#d-nome').textContent = ALUNOS[Math.floor(Math.random() * ALUNOS.length)]; if (++k > 20) { clearInterval(id); q(p, '#d-nome').classList.add('ok'); q(p, '#d-sort').disabled = false; c.feito(); } });
      };
    } },
  { leg: 'Sua vez: o semáforo mostra a regra de conversa. Clique nas luzes: vermelho é silêncio, amarelo é cochicho, verde é conversa.', sua: true,
    cena: (p, c) => {
      const regras = ['Silêncio: trabalho individual', 'Cochicho: só com a dupla', 'Conversa: trabalho em grupo'];
      p.innerHTML = tela(`<div class="d-centro"><div class="d-semaforo">${['verm', 'amar', 'verd'].map((k, i) => `<button type="button" class="${k}" data-i="${i}" aria-label="${regras[i]}"></button>`).join('')}</div><p class="d-cont" id="d-reg">&nbsp;</p></div>`, 'Lousa');
      let n = 0;
      q(p, '.d-semaforo').onclick = e => { const b = e.target.closest('button'); if (!b) return; p.querySelectorAll('.d-semaforo button').forEach(x => x.classList.toggle('acesa', x === b)); q(p, '#d-reg').textContent = regras[b.dataset.i]; if (++n === 2) c.feito(); };
    } },
];

// ---------- Turma on-line (Google Sala de Aula) ----------
const turma = () => [
  { leg: 'O professor cria a turma e passa o código. Os alunos entram com a conta deles.', dur: 5500,
    cena: (p, c) => { p.innerHTML = tela(`<div class="d-capa"><b>Biologia · 1º ano A</b><span>Código da turma: <code>k7mq2xa</code></span></div><div class="d-nomes">${ALUNOS.slice(0, 8).map(n => `<span class="surge">${n}</span>`).join('')}</div>`, 'Turma'); surgir(p, '.surge', c, 400); } },
  { leg: 'Ele posta uma tarefa com instruções, arquivos anexos e prazo de entrega. Todos recebem um aviso.', dur: 6500,
    cena: (p, c) => {
      p.innerHTML = tela(`<div class="d-capa"><b>Biologia · 1º ano A</b></div><div class="d-tarefa"><b>📝 <span id="d-tt"></span></b><p id="d-ti" class="surge">Leia o capítulo 3 e responda as 5 questões.</p><p class="surge">📎 questoes.pdf · Prazo: sexta, 23h59</p></div>`, 'Turma');
      digitar(q(p, '#d-tt'), 'Tarefa: Organelas celulares', c, 50, () => surgir(p, '.surge', c, 600));
    } },
  { leg: 'Os alunos entregam pelo celular ou pelo computador, e o professor vê quem já entregou.', dur: 6000,
    cena: (p, c) => {
      p.innerHTML = tela(`<div class="d-entregas">${ALUNOS.slice(0, 6).map(n => `<div><span>${n}</span><em class="st">Atribuída</em></div>`).join('')}</div>`, 'Trabalhos dos alunos');
      p.querySelectorAll('.st').forEach((e, i) => c.t(600 + i * 700, () => { if (i !== 4) { e.textContent = 'Entregue'; e.classList.add('ok'); } }));
    } },
  { leg: 'Sua vez: corrija o trabalho da Ana. Dê uma nota e clique em "Devolver".', sua: true,
    cena: (p, c) => {
      p.innerHTML = tela(`<div class="d-correcao"><p><b>Ana</b> · Tarefa: Organelas celulares</p><p class="d-resp">"A mitocôndria produz energia pela respiração celular e o ribossomo fabrica proteínas."</p>
        <form class="d-form-linha" id="d-f"><label for="d-nota">Nota</label><input id="d-nota" type="number" min="0" max="10" value="9"><span>/ 10</span><button class="btn primario" type="submit">Devolver</button></form><p class="d-fb" id="d-fb"></p></div>`, 'Correção');
      q(p, '#d-f').onsubmit = e => { e.preventDefault(); const n = Math.min(10, Math.max(0, +q(p, '#d-nota').value || 0)); q(p, '#d-fb').textContent = `Devolvido! A Ana recebe a nota ${n}/10 e os seus comentários.`; c.feito(); };
    } },
];

// ---------- Editor com modelos (Genially, Canva) ----------
const editorModelo = t => {
  const gen = t.id === 'genially';
  const temas = [['#2E7D4F', '#E5AE10'], ['#A8437E', '#F6E7F0'], ['#1F5A8C', '#BFE3F0'], ['#6B5236', '#E8D9B5'], ['#15301F', '#86D3A4'], ['#B2362B', '#FBE6E3']];
  return [
    { leg: gen ? 'Comece por um modelo pronto de jogo, quiz ou apresentação interativa.' : 'Comece por um modelo pronto: apresentação, infográfico, folha de atividade ou cartaz.', dur: 5500,
      cena: (p, c) => {
        p.innerHTML = tela(`<div class="d-galeria">${temas.map(([a, b], i) => `<div class="surge ${i === 4 ? 'esc' : ''}" style="background:linear-gradient(135deg,${a} 50%,${b} 50%)"></div>`).join('')}</div>`, 'Modelos');
        surgir(p, '.surge', c, 250);
      } },
    gen
      ? { leg: 'Sua vez: clique nos 3 pontos que piscam. Cada um revela um conteúdo, como numa apresentação interativa.', sua: true,
          cena: (p, c) => {
            const pts = [['18%', '30%', 'Núcleo: guarda o DNA.'], ['62%', '55%', 'Mitocôndria: produz energia.'], ['40%', '78%', 'Membrana: controla o que entra e sai.']];
            const vistos = new Set();
            p.innerHTML = tela(`<div class="d-slide"><b>Desafio das Células</b>${pts.map(([x, y], i) => `<button type="button" class="d-hot" style="left:${x};top:${y}" data-i="${i}" aria-label="Ponto ${i + 1}">+</button>`).join('')}<p class="d-pop" id="d-pop" hidden></p></div>`, 'Apresentação interativa');
            q(p, '.d-slide').onclick = e => { const b = e.target.closest('.d-hot'); if (!b) return; b.classList.add('visto'); const pop = q(p, '#d-pop'); pop.hidden = false; pop.textContent = pts[b.dataset.i][2]; vistos.add(b.dataset.i); if (vistos.size === 3) c.feito(); };
          } }
      : { leg: 'Sua vez: escolha uma cor para o infográfico e clique no título para editar.', sua: true,
          cena: (p, c) => {
            p.innerHTML = tela(`<div class="d-arte" id="d-arte"><p class="d-titulo-arte" contenteditable="true" spellcheck="false">Ciclo da Água</p><div class="d-blocos"><span>☀ Evaporação</span><span>☁ Condensação</span><span>🌧 Precipitação</span></div></div>
              <div class="d-cores">${temas.map(([a], i) => `<button type="button" data-i="${i}" style="background:${a}" aria-label="Cor ${i + 1}"></button>`).join('')}</div>`, 'Editor');
            q(p, '.d-cores').onclick = e => { const b = e.target.closest('button'); if (!b) return; const [a, bb] = temas[b.dataset.i]; q(p, '#d-arte').style.cssText = `background:${bb};color:${a};border-color:${a}`; c.feito(); };
          } },
    { leg: gen ? 'Publique e compartilhe o link: os alunos jogam no celular ou no computador.' : 'Compartilhe com a turma para criarem juntos, apresente em sala ou baixe para imprimir.', dur: 5500,
      cena: p => { p.innerHTML = `<div class="d-duo">${tela('<div class="d-centro"><span class="d-link">🔗 link.exemplo/desafio-celulas</span><button class="btn primario" type="button" tabindex="-1">Publicar</button></div>', 'Compartilhar')}${cel('<div class="d-msg ok">Desafio das Células<br><small>Toque para jogar</small></div>')}</div>`; } },
  ];
};

const DEMOS = {
  chatgpt: chatIA, notebooklm: chatIA, planos: chatIA,
  kahoot: quizAoVivo, wayground: quizAoVivo,
  plickers: cartoes, mentimeter: enquete, padlet: mural, wordwall: listaJogo,
  edpuzzle: video, khan: video, forms: formulario, conker: formulario,
  inaturalist: camera, seek: camera, plantnet: camera, earth: terra,
  phet: simulacao, biodigital: modelo3d, vlibras: libras, handtalk: libras,
  classroomscreen: lousa, classroom: turma, genially: editorModelo, canva: editorModelo,
};

// ---------- Narração ----------
// Usa a voz em português do próprio navegador (grátis, sem internet extra). Preferência salva por professor.
const temVoz = 'speechSynthesis' in window;
let narrar = temVoz && ler('demo-som') === true;
function falar(texto) {
  if (!temVoz || !narrar) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR'; u.rate = 1.05;
  const voz = speechSynthesis.getVoices().find(v => v.lang === 'pt-BR') || speechSynthesis.getVoices().find(v => v.lang.startsWith('pt'));
  if (voz) u.voice = voz;
  speechSynthesis.speak(u);
}
const calar = () => { if (temVoz) speechSynthesis.cancel(); };
// Com narração, a cena dura pelo menos o tempo de ler a legenda em voz alta.
const duracao = (s, leg) => narrar ? Math.max(s.dur, leg.length * 68 + 900) : s.dur;

// ---------- Player ----------
let pararDemo = () => {};
function tocarDemo(el, t) {
  pararDemo();
  const cenas = DEMOS[t.id](t);
  let i = 0, tocando = true, timers = [], auto = null;
  const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`como usar ${t.nome.replace(/\s*\(.*\)/, '')} tutorial professor`);
  el.innerHTML = `<div class="demo">
    <div class="demo-palco" id="d-palco"></div>
    <p class="demo-leg" id="d-leg" aria-live="polite"></p>
    <div class="demo-ctl">
      <button type="button" id="d-ant" aria-label="Cena anterior">⏮</button>
      <button type="button" id="d-play" aria-label="Pausar">⏸</button>
      <button type="button" id="d-prox" aria-label="Próxima cena">⏭</button>
      ${temVoz ? `<button type="button" id="d-som" aria-pressed="${narrar}" aria-label="Narração" title="Narração em voz alta">${narrar ? '🔊' : '🔇'}</button>` : ''}
      <div class="demo-prog" aria-hidden="true">${cenas.map(() => '<span><i></i></span>').join('')}</div>
      <span class="demo-cont" id="d-cont"></span>
    </div>
    <p class="nota">Demonstração com telas genéricas para mostrar como a ferramenta funciona. <a href="${yt}" target="_blank" rel="noopener">Ver vídeos de quem usa no YouTube ↗</a></p>
  </div>`;
  const palco = $('d-palco'), segs = el.querySelectorAll('.demo-prog span');
  const limpar = () => { timers.forEach(x => { clearTimeout(x); clearInterval(x); }); timers = []; clearTimeout(auto); calar(); };
  const ctl = {
    t: (ms, fn) => { const x = setTimeout(fn, ms); timers.push(x); return x; },
    iv: (ms, fn) => { const x = setInterval(fn, ms); timers.push(x); return x; },
    feito: () => {
      segs[i].className = 'feito';
      $('d-leg').insertAdjacentHTML('beforeend', ' <b class="demo-ok">Muito bem!</b>');
      falar('Muito bem!');
      if (tocando) auto = setTimeout(() => ir(i + 1), 2200);
    },
  };
  const ir = k => {
    limpar(); palco.onclick = null;
    if (k >= cenas.length) return fim();
    i = Math.max(0, k);
    const s = cenas[i];
    segs.forEach((g, j) => { g.className = j < i ? 'feito' : ''; g.style.removeProperty('--dur'); });
    const leg = s.leg.replace(/^Sua vez: (.)/, (_, l) => l.toUpperCase());
    const dur = duracao(s, leg);
    segs[i].className = s.sua ? 'sua' : 'agora' + (tocando ? '' : ' pausado');
    if (!s.sua) segs[i].style.setProperty('--dur', dur + 'ms');
    $('d-leg').innerHTML = (s.sua ? '<b class="demo-sua">Sua vez</b> ' : '') + esc(leg);
    $('d-cont').textContent = `${i + 1}/${cenas.length}`;
    palco.innerHTML = '';
    s.cena(palco, ctl, t);
    if (tocando) falar((s.sua ? 'Sua vez. ' : '') + leg);
    if (!s.sua && tocando) auto = setTimeout(() => ir(i + 1), dur);
  };
  const fim = () => {
    segs.forEach(g => { g.className = 'feito'; });
    $('d-leg').textContent = `Fim da demonstração de ${t.nome}.`;
    palco.innerHTML = `<div class="d-centro d-fim"><b>Agora você já sabe como funciona!</b>
      <div class="linha"><button class="btn contorno" type="button" id="d-rever">Rever demonstração</button><button class="btn primario" type="button" id="d-treino">Ir para o treino</button></div></div>`;
    $('d-rever').onclick = () => ir(0);
    $('d-treino').onclick = () => $('aba-sim').click();
  };
  if (temVoz) $('d-som').onclick = () => {
    narrar = !narrar; guardar('demo-som', narrar);
    $('d-som').textContent = narrar ? '🔊' : '🔇'; $('d-som').setAttribute('aria-pressed', String(narrar));
    if (i < cenas.length) ir(i); // recomeça a cena para narrar desde o início
  };
  $('d-ant').onclick = () => ir(i - 1);
  $('d-prox').onclick = () => ir(i + 1);
  $('d-play').onclick = () => {
    tocando = !tocando;
    $('d-play').textContent = tocando ? '⏸' : '▶'; $('d-play').setAttribute('aria-label', tocando ? 'Pausar' : 'Continuar');
    if (tocando) ir(i); else { clearTimeout(auto); calar(); segs[i].classList.add('pausado'); }
  };
  pararDemo = limpar;
  ir(0);
}

console.assert(FERRAMENTAS.every(t => DEMOS[t.id]), 'Ferramenta sem demonstração: ' + FERRAMENTAS.filter(t => !DEMOS[t.id]).map(t => t.id));
