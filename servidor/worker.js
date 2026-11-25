// Mini servidor da IA grátis do Raízes Digitais (Cloudflare Worker + Workers AI).
// O site manda { sistema, conteudo } e recebe { texto }. Nenhuma chave fica no site.
// No plano grátis da Cloudflare, quando a cota diária acaba as chamadas falham até 00:00 UTC; nunca há cobrança.

const MODELOS_RESERVA = ['@cf/meta/llama-4-scout-17b-16e-instruct', '@cf/qwen/qwen3-30b-a3b-fp8', '@cf/meta/llama-3.3-70b-instruct-fp8-fast'];
const MAX_SISTEMA = 6000;
const MAX_CONTEUDO = 20000;

function cabecalhos(origem, env) {
  const permitidas = (env.ORIGENS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = permitidas.includes(origem);
  return {
    'Content-Type': 'application/json; charset=utf-8',
    ...(ok ? { 'Access-Control-Allow-Origin': origem, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : {}),
  };
}
const resposta = (corpo, status, h) => new Response(JSON.stringify(corpo), { status, headers: h });

export default {
  async fetch(req, env) {
    const origem = req.headers.get('Origin') || '';
    const h = cabecalhos(origem, env);
    if (!h['Access-Control-Allow-Origin']) return resposta({ erro: 'Site não autorizado.' }, 403, h);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (req.method !== 'POST') return resposta({ erro: 'Use POST.' }, 405, h);

    let dados;
    try { dados = await req.json(); } catch { return resposta({ erro: 'Pedido inválido.' }, 400, h); }
    const sistema = typeof dados.sistema === 'string' ? dados.sistema.slice(0, MAX_SISTEMA) : '';
    const conteudo = typeof dados.conteudo === 'string' ? dados.conteudo.slice(0, MAX_CONTEUDO) : '';
    if (!sistema && !conteudo) return resposta({ erro: 'Pedido vazio.' }, 400, h);

    const messages = [{ role: 'system', content: sistema || 'Você é um assistente para professores.' }, { role: 'user', content: conteudo || 'Siga as instruções.' }];
    const modelos = [env.MODELO, ...MODELOS_RESERVA].filter((m, i, a) => m && a.indexOf(m) === i);
    let ultimo = '';
    for (const modelo of modelos) {
      try {
        const out = await env.AI.run(modelo, { messages, max_tokens: 3000, temperature: 0.6 });
        const texto = out?.response ?? out?.choices?.[0]?.message?.content ?? '';
        if (texto) return resposta({ texto: typeof texto === 'string' ? texto : JSON.stringify(texto), modelo }, 200, h);
      } catch (e) {
        ultimo = String(e?.message || e);
        // Cota do dia acabou: não adianta tentar outro modelo.
        if (/neuron|quota|limit|4006/i.test(ultimo)) return resposta({ erro: 'A cota grátis de IA de hoje acabou. Volta amanhã (21h no horário de Brasília) ou use o modo Gemini.' }, 429, h);
      }
    }
    return resposta({ erro: 'A IA não respondeu agora. Tente de novo em instantes.', detalhe: ultimo.slice(0, 200) }, 502, h);
  },
};
