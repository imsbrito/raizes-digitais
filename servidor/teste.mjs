// Teste do worker sem a Cloudflare: simula a IA. Rode com: node servidor/teste.mjs
import assert from 'node:assert/strict';
import worker from './worker.js';

const env = (run) => ({ ORIGENS: 'https://site.exemplo,http://localhost:8765', MODELO: '@cf/teste/a', AI: { run } });
const pedir = (corpo, origem = 'https://site.exemplo', metodo = 'POST') =>
  new Request('https://w.exemplo/', { method: metodo, headers: { Origin: origem, 'Content-Type': 'application/json' }, body: metodo === 'POST' ? JSON.stringify(corpo) : undefined });

// resposta normal, formato antigo e formato OpenAI
let r = await worker.fetch(pedir({ sistema: 's', conteudo: 'oi' }), env(async () => ({ response: 'olá' })));
assert.equal(r.status, 200); assert.equal((await r.json()).texto, 'olá');
assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://site.exemplo');
r = await worker.fetch(pedir({ conteudo: 'oi' }), env(async () => ({ choices: [{ message: { content: 'oi!' } }] })));
assert.equal((await r.json()).texto, 'oi!');

// site não autorizado
r = await worker.fetch(pedir({ conteudo: 'oi' }, 'https://outro.site'), env(async () => ({ response: 'x' })));
assert.equal(r.status, 403);

// preflight
r = await worker.fetch(pedir(null, 'http://localhost:8765', 'OPTIONS'), env(async () => ({})));
assert.equal(r.status, 204);

// pedido vazio
r = await worker.fetch(pedir({}), env(async () => ({ response: 'x' })));
assert.equal(r.status, 400);

// modelo principal falha -> usa reserva
const usados = [];
r = await worker.fetch(pedir({ conteudo: 'oi' }), env(async m => { usados.push(m); if (m === '@cf/teste/a') throw new Error('model not found'); return { response: 'reserva' }; }));
assert.equal((await r.json()).texto, 'reserva'); assert.equal(usados.length, 2);

// cota acabou
r = await worker.fetch(pedir({ conteudo: 'oi' }), env(async () => { throw new Error('4006: you have used up your daily free allocation of 10,000 neurons'); }));
assert.equal(r.status, 429);

// texto gigante é cortado antes de ir para a IA
let recebido = '';
await worker.fetch(pedir({ conteudo: 'a'.repeat(50000) }), env(async (m, o) => { recebido = o.messages[1].content; return { response: 'ok' }; }));
assert.equal(recebido.length, 20000);

console.log('worker: todos os testes passaram');
