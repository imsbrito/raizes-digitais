// Catálogo de ferramentas. Para adicionar uma, copie um bloco e preencha os campos.
// sim: cada passo é [tela, missão, opções]. Opções separadas por "|", a certa começa com "*".
//      "campo:texto de exemplo" pede que o professor digite algo.
// prompt: função que recebe a aula {materia, tema, serie, n} e devolve o texto.

const OBJETIVOS = {
  quiz: 'Quiz e avaliação',
  jogo: 'Jogos',
  aovivo: 'Participação ao vivo',
  colab: 'Colaboração',
  video: 'Vídeo e conteúdo',
  plano: 'Planejamento e slides',
  campo: 'Campo e natureza',
  simulacao: 'Simulação e 3D',
  inclusao: 'Inclusão',
  gestao: 'Gestão da turma',
};

// materias: só nas ferramentas de matérias específicas. Sem o campo, a ferramenta serve para todas.
const MATERIAS = ['Ciências', 'Biologia', 'Física', 'Química', 'Matemática', 'Geografia', 'História', 'Língua Portuguesa', 'Línguas estrangeiras', 'Artes', 'Educação Física'];

const SERIES = [
  'Educação Infantil', '1º ao 5º ano do Ensino Fundamental', '6º ano do Ensino Fundamental', '7º ano do Ensino Fundamental',
  '8º ano do Ensino Fundamental', '9º ano do Ensino Fundamental', '1º ano do Ensino Médio', '2º ano do Ensino Médio',
  '3º ano do Ensino Médio', 'EJA', 'Ensino Superior',
];

const busca = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);

const FERRAMENTAS = [
  {
    id: 'chatgpt', nome: 'ChatGPT', objetivos: ['quiz', 'plano', 'inclusao'], guia: true,
    links: [['Abrir ChatGPT', 'https://chatgpt.com/']], custo: 'Tem plano grátis com limite de uso.',
    faz: 'IA de texto que gera perguntas, roteiros, textos de apoio e adaptações. Prepare o conteúdo aqui e leve para as outras ferramentas.',
    passos: ['Abra o ChatGPT (o mesmo vale para Gemini, Claude ou Copilot).', 'Copie o prompt pronto desta ficha, já preenchido com a sua aula.', 'Cole, envie e leia a resposta com atenção: a IA pode errar fatos.', 'Peça ajustes ("deixe mais fácil", "troque a questão 3") até ficar bom.', 'Copie o resultado para a ferramenta onde vai aplicar a atividade.'],
    dica: 'Quanto mais contexto (turma, objetivo, o que já foi visto), melhor a resposta.',
    sim: [
      ['Página inicial', 'Comece uma conversa nova.', 'Configurações|*Nova conversa|Explorar GPTs'],
      ['Caixa de mensagem', 'Cole o prompt da sua aula na caixa de mensagem.', 'campo:Crie um quiz de 10 questões sobre células para o 8º ano...'],
      ['Conversa', 'A resposta chegou. O que fazer antes de usar com a turma?', 'Copiar e aplicar direto|*Ler e conferir os fatos|Apagar a conversa'],
      ['Conversa', 'A questão 3 ficou difícil demais. Peça um ajuste.', 'campo:Deixe a questão 3 mais simples'],
      ['Conversa', 'Tudo revisado. Leve o resultado para a ferramenta.', '*Copiar resposta|Compartilhar conversa|Nova conversa'],
    ],
    prompt: a => `Você é professor de ${a.materia} do ${a.serie}. Crie um quiz de ${a.n} questões de múltipla escolha sobre "${a.tema}".

Para cada questão:
- enunciado curto e claro, adequado à idade;
- 4 alternativas (A a D), só uma correta;
- a resposta correta;
- feedback de acerto (1 frase) e de erro explicando o conceito (2 frases);
- se o aluno errar: uma questão de reforço mais simples sobre o mesmo ponto.

Comece pelas mais fáceis e termine com 2 que exijam aplicar o conteúdo numa situação do dia a dia.`,
  },
  {
    id: 'kahoot', nome: 'Kahoot', objetivos: ['quiz', 'aovivo'], guia: true,
    links: [['Criar no Kahoot', 'https://create.kahoot.it/'], ['Alunos entram em kahoot.it', 'https://kahoot.it/']],
    custo: 'Grátis para criar Quiz e Verdadeiro ou falso.',
    faz: 'Quiz em forma de competição, ao vivo na sala ou como tarefa com prazo. Gera relatório por aluno e por pergunta.',
    passos: ['Cadastre-se gratuitamente no site.', 'Clique em "Criar", escolha "Kahoot" e depois "Tela em branco".', 'Escolha o formato. No plano grátis: Quiz e Verdadeiro ou falso.', 'Escreva as perguntas e alternativas e adicione imagens, se quiser.', 'Finalize e faça a pré-visualização para conferir.', 'Na Biblioteca, clique em "Atribuir" para definir prazo e horário, ou jogue ao vivo.', 'Compartilhe o PIN gerado com os alunos.', 'Depois, veja o desempenho por aluno e o nível de dificuldade de cada pergunta.'],
    dica: 'O texto tem limite de tamanho, por isso o prompt já pede perguntas e alternativas curtas.',
    sim: [
      ['Painel do professor', 'Comece um quiz novo.', 'Biblioteca|*Criar|Relatórios'],
      ['Criar', 'Que tipo de material você quer criar?', '*Kahoot|Curso|Pasta'],
      ['Novo kahoot', 'Comece do zero.', 'Usar modelo|*Tela em branco|Importar'],
      ['Editor', 'Escreva a primeira pergunta.', 'campo:Qual organela produz energia na célula?'],
      ['Editor', 'Marque a alternativa correta entre as quatro.', 'Ribossomo|*Mitocôndria|Lisossomo|Complexo de Golgi'],
      ['Biblioteca', 'Quer mandar como tarefa para casa, com prazo. O que clicar?', 'Jogar ao vivo|*Atribuir|Duplicar'],
      ['Tarefa criada', 'O que os alunos precisam para entrar?', 'Seu e-mail|*O PIN do jogo|Sua senha'],
    ],
    prompt: a => `Crie ${a.n} perguntas para um Kahoot sobre "${a.tema}" (${a.materia}, ${a.serie}).

Regras:
- pergunta com no máximo 120 caracteres;
- 4 alternativas com no máximo 75 caracteres cada;
- só uma correta; as erradas devem ser plausíveis (erros comuns dos alunos);
- tempo sugerido: 20 segundos (30 para as mais difíceis).

Responda em tabela: Pergunta | Alternativa 1 | Alternativa 2 | Alternativa 3 | Alternativa 4 | Tempo (s) | Nº da correta`,
  },
  {
    id: 'wayground', nome: 'Wayground (antigo Quizizz)', objetivos: ['quiz', 'aovivo'],
    links: [['Abrir Wayground', 'https://wayground.com/']], custo: 'Tem plano grátis para professores.',
    faz: 'Quizzes e lições em que cada aluno avança no próprio ritmo, ao vivo ou como tarefa. Cria questões com IA a partir de um tema ou arquivo.',
    passos: ['Crie uma conta de professor.', 'Clique em "Criar" e escolha avaliação (quiz) ou lição.', 'Gere as questões com IA (tema, texto ou arquivo) ou escreva as suas.', 'Revise e ajuste cada questão.', 'Publique e escolha: começar ao vivo ou atribuir como tarefa com prazo.', 'Os alunos entram pelo link ou pelo código mostrado na tela.', 'Veja o relatório por questão e por aluno.'],
    dica: 'Como cada aluno vai no seu ritmo, funciona bem em turmas com níveis diferentes.',
    sim: [
      ['Início', 'Crie uma atividade nova.', 'Explorar|*Criar|Relatórios'],
      ['Criar', 'O que você quer criar?', '*Avaliação (quiz)|Vídeo|Passagem de leitura'],
      ['Gerar com IA', 'Diga o tema para a IA gerar as questões.', 'campo:Fotossíntese, 7º ano'],
      ['Revisão', 'As questões chegaram. Qual o próximo passo?', 'Publicar sem ler|*Revisar cada questão|Excluir tudo'],
      ['Publicado', 'A turma vai fazer em casa até sexta.', 'Começar ao vivo|*Atribuir tarefa|Imprimir'],
    ],
    prompt: a => `Crie ${a.n} questões sobre "${a.tema}" para o ${a.serie} (${a.materia}), para importar num quiz em que o aluno avança no próprio ritmo.

Misture níveis: 40% fáceis, 40% médias, 20% desafiadoras.
Para cada uma: enunciado, 4 alternativas, a correta e uma explicação de 1 frase que aparece depois da resposta.`,
  },
  {
    id: 'conker', nome: 'Conker AI', objetivos: ['quiz'], guia: true,
    links: [['Abrir Conker AI', 'https://www.conker.ai/']],
    faz: 'Gera questionários prontos a partir do tema, do tipo de questão e do nível escolar. Você revisa e compartilha um link.',
    passos: ['Na aba inicial, escreva o tema da atividade.', 'Selecione o tipo de questionário.', 'Escolha o número de questões, o nível de escolaridade e o idioma.', 'Se quiser, inclua um texto de apoio para guiar as perguntas.', 'Analise as questões e respostas geradas e altere o que precisar.', 'Pronto: compartilhe o link com os alunos.'],
    dica: 'O texto de apoio deixa as perguntas mais fiéis ao que você deu em aula. O prompt pronto gera esse texto.',
    sim: [
      ['Aba inicial', 'Escreva o tema da atividade.', 'campo:Células eucariontes'],
      ['Configurar', 'Escolha o tipo de questionário.', '*Múltipla escolha|Somente leitura|Sem perguntas'],
      ['Configurar', 'Defina o nível de escolaridade.', 'Pós-graduação|*8º ano|Sem nível'],
      ['Texto de apoio', 'Quer as perguntas fiéis à sua aula. O que fazer?', '*Colar um texto de apoio|Pular|Trocar o idioma'],
      ['Revisão', 'Questões geradas. Antes de enviar:', 'Enviar direto|*Analisar e editar|Gerar de novo sem ler'],
      ['Pronto', 'Como os alunos acessam?', '*Pelo link compartilhado|Pelo seu e-mail|Por impressão apenas'],
    ],
    prompt: a => `Escreva um texto de apoio de 200 a 250 palavras sobre "${a.tema}" para alunos do ${a.serie}, na disciplina de ${a.materia}.

O texto vai servir de base para um gerador automático de questionário, então:
- traga os conceitos principais com definições claras;
- inclua 2 exemplos concretos;
- cite 1 erro comum que os alunos cometem sobre o tema;
- use linguagem simples e frases curtas, sem listas.`,
  },
  {
    id: 'genially', nome: 'Genially', objetivos: ['jogo', 'quiz'], guia: true,
    links: [['Abrir Genially', 'https://genially.com/pt-br/']], custo: 'Tem plano grátis.',
    faz: 'Modelos prontos de jogos, quizzes, escape rooms e infográficos animados. Você troca textos e imagens e publica com um link.',
    passos: ['Faça um cadastro. Seu espaço fica pronto; clique em "Modelos".', 'Selecione a opção "Jogos" e veja os modelos.', 'Escolha um modelo e edite: troque imagens, coloque perguntas e explore a ferramenta.', 'Publique e compartilhe o link com a turma.'],
    dica: 'Escolha o modelo primeiro e depois gere o roteiro: assim o número de desafios bate com as telas.',
    sim: [
      ['Seu espaço', 'Procure um modelo pronto.', 'Criar em branco|*Modelos|Configurações'],
      ['Modelos', 'Você quer uma atividade lúdica.', 'Apresentações|*Jogos|Relatórios'],
      ['Jogos', 'Escolha um modelo para editar.', '*Quiz com trilha|Currículo|Infográfico de dados'],
      ['Editor', 'Troque o título do jogo.', 'campo:Desafio das Células'],
      ['Editor', 'Tudo editado. Como a turma vai jogar?', 'Baixar como imagem|*Publicar e compartilhar link|Apagar'],
    ],
    prompt: a => `Monte o roteiro de um jogo interativo no Genially sobre "${a.tema}" para o ${a.serie} (${a.materia}).

1. Título do jogo e uma história curta de abertura (até 3 frases) que dê uma missão ao aluno.
2. ${a.n} desafios. Para cada um: pergunta, alternativas, resposta correta, mensagem de acerto e mensagem de erro com dica.
3. Tela final com parabéns e um resumo de 3 frases do que foi aprendido.

No máximo 25 palavras por tela.`,
  },
  {
    id: 'wordwall', nome: 'Wordwall', objetivos: ['jogo'],
    links: [['Abrir Wordwall', 'https://wordwall.net/pt']], custo: 'Plano grátis com número limitado de atividades.',
    faz: 'Jogos rápidos como ligar pares, roleta, palavras cruzadas e caça-palavras, a partir de uma lista de conteúdo.',
    passos: ['Crie uma conta e clique em "Criar atividade".', 'Escolha um modelo (Combinar, Questionário, Palavras cruzadas...).', 'Cole os pares ou as perguntas.', 'Compartilhe o link ou projete na sala.', 'O mesmo conteúdo troca de modelo com um clique.'],
    dica: 'Bom para revisar vocabulário e conceitos no começo ou no fim da aula.',
    sim: [
      ['Início', 'Comece uma atividade.', '*Criar atividade|Minhas atividades|Comunidade'],
      ['Modelos', 'Quer que os alunos liguem termo e definição.', 'Roleta|*Combinar|Anagrama'],
      ['Conteúdo', 'Digite o primeiro par.', 'campo:Mitocôndria : produz energia'],
      ['Pronto', 'Quer testar o mesmo conteúdo como palavras cruzadas.', 'Criar do zero|*Trocar modelo|Excluir'],
    ],
    prompt: a => `Faça uma lista de ${a.n} pares "termo : definição curta" sobre "${a.tema}" para o ${a.serie} (${a.materia}).

- termo com até 3 palavras;
- definição com até 12 palavras, sem repetir o termo;
- um par por linha, no formato: termo : definição

Depois, sugira 4 palavras para um caça-palavras e 3 dicas para palavras cruzadas.`,
  },
  {
    id: 'forms', nome: 'Google Forms', objetivos: ['quiz'],
    links: [['Abrir Google Forms', 'https://forms.google.com/']], custo: 'Grátis com conta Google.',
    faz: 'Formulário que vira prova com nota automática. Bom para tarefa de casa e para quem já usa o Google Sala de Aula.',
    passos: ['Crie um formulário em branco.', 'Em Configurações, ative "Transformar em teste".', 'Crie as perguntas, marque a chave de resposta e a pontuação.', 'Adicione feedback para respostas certas e erradas.', 'Clique em "Enviar" e compartilhe o link (ou publique no Google Sala de Aula).', 'Veja as respostas em gráficos ou numa planilha.'],
    dica: 'Ative "Coletar e-mails" só se precisar identificar o aluno.',
    sim: [
      ['Formulários', 'Comece do zero.', '*Em branco|Modelo de festa|Lixeira'],
      ['Configurações', 'Faça o formulário dar nota sozinho.', 'Coletar e-mails|*Transformar em teste|Tema'],
      ['Pergunta', 'Escreva a pergunta.', 'campo:O que diferencia célula procarionte?'],
      ['Pergunta', 'Defina qual alternativa é a certa.', 'Duplicar|*Chave de resposta|Excluir'],
      ['Pronto', 'Mande para a turma.', 'Imprimir|*Enviar link|Desativar respostas'],
    ],
    prompt: a => `Crie uma avaliação de ${a.n} questões sobre "${a.tema}" para o ${a.serie} (${a.materia}), para montar no Google Forms.

Misture múltipla escolha (maioria), verdadeiro ou falso e 1 questão aberta curta.
Para cada questão: enunciado, alternativas, resposta correta, pontos (total 10) e feedback de 1 frase para quem errar.
Para a questão aberta, dê os critérios de correção.`,
  },
  {
    id: 'plickers', nome: 'Plickers', objetivos: ['quiz', 'aovivo'],
    links: [['Abrir Plickers', 'https://www.plickers.com/']], custo: 'Tem plano grátis.',
    faz: 'Quiz ao vivo em que só o professor usa celular. Cada aluno levanta um cartão impresso girado na letra escolhida e o app lê todos de uma vez.',
    passos: ['Crie uma conta e baixe o app no seu celular.', 'Imprima os cartões: cada aluno recebe um número fixo.', 'Cadastre a turma com os alunos na ordem dos cartões.', 'Crie as perguntas (múltipla escolha ou verdadeiro ou falso).', 'Projete a pergunta pelo computador.', 'Os alunos giram o cartão para a letra escolhida e levantam.', 'Escaneie a sala com o app e veja na hora quem acertou.'],
    dica: 'Ideal para escolas sem celular ou internet para os alunos.',
    sim: [
      ['Antes da aula', 'O que os alunos precisam ter em mãos?', 'Celular com internet|*Um cartão impresso|Notebook'],
      ['Turmas', 'Crie a turma.', 'campo:8º ano B'],
      ['Biblioteca', 'Crie uma pergunta de verdadeiro ou falso.', 'campo:Bactérias têm núcleo definido.'],
      ['Ao vivo', 'Pergunta projetada. Como os alunos respondem?', '*Giram o cartão na letra certa|Digitam no celular|Falam em voz alta'],
      ['Ao vivo', 'Como você coleta as respostas?', 'Recolhe os cartões|*Escaneia com o celular|Conta à mão'],
    ],
    prompt: a => `Crie ${a.n} perguntas rápidas de verificação sobre "${a.tema}" (${a.materia}, ${a.serie}) para usar com cartões de resposta A, B, C e D.

- enunciado curto, que dê para ler projetado de longe;
- 4 alternativas com até 6 palavras;
- só uma correta, e uma das erradas deve representar um erro comum;
- depois de cada pergunta, 1 frase para o professor explicar a resposta.`,
  },
  {
    id: 'mentimeter', nome: 'Mentimeter', objetivos: ['aovivo'],
    links: [['Abrir Mentimeter', 'https://www.mentimeter.com/pt-BR']], custo: 'Plano grátis com limites.',
    faz: 'Enquetes, nuvem de palavras e perguntas ao vivo projetadas na tela. Os alunos respondem pelo celular, sem cadastro.',
    passos: ['Crie uma apresentação.', 'Escolha o tipo de slide: nuvem de palavras, múltipla escolha, escala ou pergunta aberta.', 'Projete na sala.', 'Os alunos entram em menti.com com o código que aparece na tela.', 'As respostas aparecem na hora, sem identificar quem respondeu.'],
    dica: 'Ótimo no começo da aula para descobrir o que a turma já sabe.',
    sim: [
      ['Apresentações', 'Comece uma apresentação nova.', '*Nova apresentação|Modelos|Lixeira'],
      ['Tipo de slide', 'Quer ver as palavras que a turma associa ao tema.', 'Escala|*Nuvem de palavras|Ranking'],
      ['Slide', 'Escreva a pergunta.', 'campo:Que palavra vem à cabeça quando ouve "célula"?'],
      ['Apresentando', 'Como os alunos entram?', 'Com login e senha|*Em menti.com com o código|Por e-mail'],
    ],
    prompt: a => `Vou abrir uma aula de ${a.materia} sobre "${a.tema}" para o ${a.serie} com perguntas ao vivo.

Sugira 5 slides interativos para levantar os conhecimentos prévios:
1. pergunta para nuvem de palavras;
2. múltipla escolha que revele um erro comum;
3. escala de 1 a 5 ("quanto você sabe sobre...");
4. pergunta aberta curta;
5. pergunta para repetir no fim da aula e comparar.

Para cada slide, diga o que observar nas respostas.`,
  },
  {
    id: 'padlet', nome: 'Padlet', objetivos: ['colab'],
    links: [['Abrir Padlet', 'https://padlet.com/']], custo: 'Plano grátis com número limitado de murais.',
    faz: 'Mural on-line onde a turma posta textos, fotos, vídeos e links. Serve para chuva de ideias, portfólio, linha do tempo e mapa.',
    passos: ['Crie uma conta.', 'Clique em "Criar um Padlet" e escolha o formato: mural, colunas, linha do tempo ou mapa.', 'Dê título e instruções no topo do mural.', 'Em Compartilhar, defina quem pode ver e postar.', 'Envie o link ou o QR code para a turma.', 'Use a moderação para aprovar posts antes de aparecerem.'],
    dica: 'O formato mapa funciona bem para registrar onde cada aluno encontrou uma espécie.',
    sim: [
      ['Painel', 'Crie um mural.', '*Criar um Padlet|Configurações|Lixeira'],
      ['Formato', 'Vai organizar os posts em grupos: produtores, consumidores, decompositores.', 'Mural livre|*Colunas|Linha do tempo'],
      ['Mural', 'Dê um título.', 'campo:Cadeia alimentar do Pampa'],
      ['Compartilhar', 'Quer conferir os posts antes de aparecerem.', 'Deixar tudo público|*Ativar moderação|Bloquear o mural'],
      ['Compartilhar', 'Como enviar para a turma?', '*Link ou QR code|Imprimir o mural|Pelo seu login'],
    ],
    prompt: a => `Planeje uma atividade colaborativa num mural on-line sobre "${a.tema}" para o ${a.serie} (${a.materia}).

Inclua: título do mural, formato ideal (mural, colunas, linha do tempo ou mapa) e o porquê, nomes das colunas, instruções para os alunos (o que postar e como), 3 exemplos de post e uma rubrica simples de avaliação.`,
  },
  {
    id: 'edpuzzle', nome: 'Edpuzzle', objetivos: ['video', 'quiz'],
    links: [['Abrir Edpuzzle', 'https://edpuzzle.com/']], custo: 'Plano grátis com número limitado de vídeos.',
    faz: 'Coloca perguntas dentro de vídeos (YouTube, Khan Academy ou seus). O vídeo pausa e o aluno responde para continuar.',
    passos: ['Crie uma conta de professor.', 'Busque um vídeo ou envie o seu.', 'Corte só o trecho que interessa.', 'Adicione perguntas em pontos do vídeo (múltipla escolha, aberta ou nota).', 'Atribua à turma com prazo e impeça pular trechos.', 'Veja quem assistiu e como respondeu.'],
    dica: 'Vídeos curtos (até 6 minutos) com 3 ou 4 perguntas rendem mais.',
    sim: [
      ['Busca', 'Encontre um vídeo sobre o tema.', 'campo:divisão celular mitose'],
      ['Editor', 'O vídeo tem 15 minutos e só interessa um trecho.', '*Cortar|Narrar|Excluir'],
      ['Editor', 'Pare o vídeo no minuto 2 e insira uma pergunta.', 'Comentário|*Múltipla escolha|Música'],
      ['Atribuir', 'Quer garantir que assistam tudo.', 'Permitir pular|*Impedir pular|Ocultar vídeo'],
    ],
    prompt: a => `Vou usar um vídeo curto sobre "${a.tema}" com alunos do ${a.serie} (${a.materia}).

Crie 4 perguntas para inserir ao longo do vídeo:
- 1 de lembrar (logo no início);
- 2 de entender (no meio);
- 1 aberta de aplicar (no fim).
Para cada uma, diga em que momento do vídeo ela faz sentido (ex.: "depois da explicação de X"), a resposta esperada e o feedback.`,
  },
  {
    id: 'khan', nome: 'Khan Academy', materias: ['Matemática', 'Ciências', 'Biologia', 'Física', 'Química', 'História', 'Língua Portuguesa'], objetivos: ['video', 'quiz'],
    links: [['Abrir Khan Academy', 'https://pt.khanacademy.org/']], custo: 'Grátis.',
    faz: 'Vídeos e exercícios em português de várias matérias, alinhados à BNCC. O professor atribui conteúdos e acompanha o progresso.',
    passos: ['Crie uma conta de professor.', 'Crie uma turma; os alunos entram com o código da turma.', 'Escolha o curso e atribua vídeos e exercícios por tema.', 'Defina prazos.', 'Acompanhe o progresso e as habilidades com dificuldade.'],
    dica: 'Os exercícios corrigem sozinhos e dão dica ao aluno: bom para reforço.',
    sim: [
      ['Painel do professor', 'Crie a turma.', '*Adicionar turma|Explorar cursos|Configurações'],
      ['Turma', 'Como os alunos entram?', 'Com sua senha|*Com o código da turma|Por convite impresso'],
      ['Cursos', 'Procure o conteúdo.', 'campo:Células'],
      ['Atribuir', 'Mande exercícios com prazo.', '*Atribuir|Salvar para depois|Compartilhar no Facebook'],
    ],
    prompt: a => `Monte uma sequência de reforço de 1 semana sobre "${a.tema}" para o ${a.serie} (${a.materia}), usando vídeos e exercícios on-line.

Para cada dia: o que o aluno assiste ou pratica (descreva o tipo de conteúdo a buscar), tempo estimado, 1 pergunta de autoavaliação.
No fim: como o professor confere quem precisa de ajuda.`,
  },
  {
    id: 'notebooklm', nome: 'NotebookLM', objetivos: ['plano', 'video'],
    links: [['Abrir NotebookLM', 'https://notebooklm.google.com/']], custo: 'Grátis com conta Google.',
    faz: 'IA do Google que estuda só os materiais que você enviar (PDFs, links, textos) e cria resumos, guias de estudo, perguntas, mapas mentais e resumos em áudio.',
    passos: ['Entre com sua conta Google.', 'Crie um "Novo notebook".', 'Envie as fontes: PDFs da aula, links, textos ou vídeos do YouTube.', 'Faça perguntas: as respostas mostram de qual fonte saíram.', 'Gere guia de estudo, perguntas frequentes, mapa mental ou resumo em áudio.', 'Compartilhe o notebook com a turma, se quiser.'],
    dica: 'Como a IA responde só com base nas fontes, ela inventa menos. Confira as citações.',
    sim: [
      ['Início', 'Comece um caderno de estudos.', '*Novo notebook|Configurações|Ajuda'],
      ['Fontes', 'Adicione o material da aula.', 'Nada, a IA já sabe|*Enviar o PDF da aula|Escolher um tema'],
      ['Conversa', 'Faça uma pergunta sobre o material.', 'campo:Quais são as diferenças entre célula animal e vegetal?'],
      ['Estúdio', 'Quer um material de revisão para a turma.', '*Guia de estudo|Excluir fontes|Sair'],
    ],
    prompt: a => `Com base nas fontes deste notebook (aula de ${a.materia} sobre "${a.tema}", ${a.serie}):

1. faça um resumo de 1 página em linguagem adequada à turma;
2. liste 10 conceitos-chave com definição curta;
3. crie ${a.n} perguntas de revisão com resposta;
4. aponte 3 pontos em que os alunos costumam se confundir.

Cite a fonte de cada parte.`,
  },
  {
    id: 'canva', nome: 'Canva para Educação', objetivos: ['plano', 'colab'],
    links: [['Abrir Canva Educação', 'https://www.canva.com/pt_br/educacao/']], custo: 'Grátis para professores verificados.',
    faz: 'Slides, infográficos, folhas de atividade e cartazes com modelos prontos e IA. Os alunos podem criar junto.',
    passos: ['Cadastre-se como professor e envie a comprovação pedida.', 'Busque um modelo (apresentação, infográfico, folha de atividade).', 'Edite textos, imagens e cores.', 'Use a IA do Canva para gerar texto ou imagens, se quiser.', 'Crie uma turma e convide os alunos para criar juntos.', 'Apresente, compartilhe o link ou baixe.'],
    dica: 'Infográficos feitos pelos alunos são uma ótima forma de avaliação.',
    sim: [
      ['Início', 'Procure um modelo.', 'campo:infográfico ciclo da água'],
      ['Modelos', 'Escolha o formato.', '*Infográfico|Cartão de visita|Logotipo'],
      ['Editor', 'Os alunos vão completar em grupo.', 'Baixar PDF|*Compartilhar com a turma|Apagar'],
    ],
    prompt: a => `Crie o texto de um infográfico sobre "${a.tema}" para o ${a.serie} (${a.materia}).

- título chamativo (até 6 palavras);
- 5 blocos, cada um com subtítulo e até 20 palavras;
- 1 dado curioso;
- sugestão de ícone ou imagem para cada bloco;
- uma pergunta final para a turma.`,
  },
  {
    id: 'planos', nome: 'Geradores de plano de aula', objetivos: ['plano'], guia: true,
    links: [['Teachy', 'https://www.teachy.com.br/teachers'], ['Chalkie', 'https://chalkie.ai/'], ['Slidesgo', 'https://slidesgo.com/pt/ia/gerador-de-planos-de-aulas'], ['Buscar ensinei', busca('ensinei plano de aula IA')], ['Buscar Qconcursos Avalia', busca('Qconcursos Avalia plano de aula')]],
    custo: 'A maioria tem plano grátis com créditos limitados.',
    faz: 'Teachy, Chalkie, Slidesgo, ensinei e Qconcursos Avalia montam planos de aula, slides e materiais com IA.',
    passos: ['Escolha uma das ferramentas abaixo.', 'Cadastre-se com e-mail e senha ou com a conta Google (o cadastro é parecido em todas).', 'Informe série, matéria, tema e duração da aula.', 'Revise o plano: objetivos, tempo de cada etapa e avaliação.', 'Exporte ou copie para o modelo da sua escola.'],
    dica: 'A Teachy alinha os planos à BNCC. Sem cadastro, use o prompt pronto direto numa IA.',
    sim: [
      ['Cadastro', 'Entre na ferramenta.', '*Entrar com Google|Pagar plano anual|Fechar'],
      ['Novo plano', 'Informe o tema.', 'campo:Biomas brasileiros'],
      ['Novo plano', 'Qual informação mais muda o plano?', 'Cor do slide|*Série e duração da aula|Fonte'],
      ['Plano gerado', 'Antes de usar:', 'Imprimir direto|*Revisar objetivos e tempos|Gerar 10 versões'],
    ],
    prompt: a => `Crie um plano de aula de 50 minutos sobre "${a.tema}" para o ${a.serie}, em ${a.materia}.

Inclua:
- habilidade(s) da BNCC relacionadas (com código);
- até 3 objetivos de aprendizagem com verbos observáveis;
- materiais necessários;
- etapas com tempo: abertura (10 min), desenvolvimento (30 min), fechamento (10 min);
- uma atividade em dupla ou grupo;
- avaliação: como saber se aprenderam;
- uma adaptação para quem tem dificuldade e um desafio para quem termina antes.`,
  },
  {
    id: 'classroom', nome: 'Google Sala de Aula', objetivos: ['gestao'],
    links: [['Abrir Google Sala de Aula', 'https://classroom.google.com/']], custo: 'Grátis com conta Google.',
    faz: 'Organiza a turma on-line: materiais, tarefas com prazo, correção com nota e comentários, tudo num só lugar.',
    passos: ['Entre em classroom.google.com e clique em "+" > "Criar turma".', 'Compartilhe o código da turma com os alunos.', 'Em "Atividades", crie tarefa, teste ou material.', 'Anexe arquivos, links ou um Google Forms e defina o prazo.', 'Corrija, comente e devolva com nota.'],
    dica: 'Organize as atividades por tópicos (unidades) para a turma achar tudo rápido.',
    sim: [
      ['Início', 'Crie a turma.', '*+ Criar turma|Participar de turma|Agenda'],
      ['Turma', 'Dê um nome.', 'campo:Biologia 1º ano A'],
      ['Atividades', 'Mande um trabalho com prazo.', 'Material|*Tarefa|Pergunta'],
      ['Corrigir', 'Trabalho corrigido. Como o aluno recebe a nota?', 'Por e-mail seu|*Clicando em Devolver|Ele não recebe'],
    ],
    prompt: a => `Escreva as instruções de uma tarefa sobre "${a.tema}" para postar na sala de aula on-line do ${a.serie} (${a.materia}).

Inclua: título, objetivo em 1 frase, passo a passo numerado para o aluno, o que entregar e em que formato, prazo sugerido e uma rubrica com 3 critérios (nota total 10).`,
  },
  {
    id: 'classroomscreen', nome: 'Classroomscreen', objetivos: ['gestao'],
    links: [['Abrir Classroomscreen', 'https://classroomscreen.com/']], custo: 'Tem versão grátis; dá para usar sem conta.',
    faz: 'Tela para projetar na lousa com cronômetro, sorteador de nomes, semáforo de trabalho, medidor de barulho e QR code.',
    passos: ['Abra o site no computador ligado ao projetor.', 'Escolha os widgets na barra de baixo.', 'Use o sorteador com a lista de nomes da turma.', 'Ligue o cronômetro para as etapas da atividade.', 'Use o semáforo para indicar silêncio, cochicho ou conversa.'],
    dica: 'O medidor de barulho ajuda a turma a se autorregular em trabalhos em grupo.',
    sim: [
      ['Tela da lousa', 'Os grupos têm 10 minutos.', 'Sorteador|*Cronômetro|Desenho'],
      ['Tela da lousa', 'Escolha quem apresenta primeiro, de forma justa.', '*Sorteador de nomes|Calendário|Imagem'],
      ['Tela da lousa', 'Hora de trabalho individual em silêncio.', 'Medidor de barulho no máximo|*Semáforo vermelho|QR code'],
    ],
    prompt: a => `Planeje uma aula de 50 minutos sobre "${a.tema}" (${a.materia}, ${a.serie}) dividida em blocos com tempo marcado, para projetar com cronômetro.

Para cada bloco: duração, o que a turma faz, regra de conversa (silêncio, cochicho ou conversa) e a instrução curta que fica projetada na lousa.`,
  },
  {
    id: 'inaturalist', nome: 'iNaturalist', materias: ['Ciências', 'Biologia', 'Geografia'], objetivos: ['campo'], extra: 'Ciências e Biologia', guia: true,
    links: [['Abrir iNaturalist', 'https://www.inaturalist.org/']], custo: 'Grátis. Conta a partir de 13 anos.',
    faz: 'Registra observações da biodiversidade, mostra identificações feitas pela comunidade e onde cada espécie ocorre.',
    passos: ['Instale o aplicativo ou entre pelo site.', 'Crie uma conta grátis (idade mínima: 13 anos).', 'Toque no "+" para iniciar uma observação.', 'Fotografe o organismo, se possível de vários ângulos.', 'Identifique com as sugestões automáticas ou escolha um grupo geral (plantas, insetos, fungos).', 'Confira a data e o local da observação.', 'Salve e envie a observação.', 'Acompanhe as identificações que outros usuários sugerirem.'],
    dica: 'Com turmas abaixo de 13 anos, use a conta do professor ou o Seek.',
    sim: [
      ['App', 'Encontrou uma planta no pátio. Comece o registro.', 'Perfil|*+ Nova observação|Explorar'],
      ['Câmera', 'Como fotografar?', 'Uma foto de longe|*Vários ângulos e detalhes|Sem foto'],
      ['Identificação', 'Não tem certeza da espécie.', 'Inventar um nome|*Escolher um grupo geral (Plantas)|Deixar sem nada'],
      ['Detalhes', 'Antes de enviar, confira:', '*Data e local|Cor do app|Seu avatar'],
      ['Comunidade', 'Depois de enviar, o que acontece?', 'Nada|*Outras pessoas sugerem identificações|O registro some'],
    ],
    prompt: a => `Planeje uma saída de campo de 1 aula no pátio ou arredores da escola usando um app de registro de biodiversidade, para o ${a.serie}, sobre "${a.tema}" (${a.materia}).

Inclua: objetivo, regras de segurança, divisão em grupos, ficha de observação (o que registrar além da foto), 5 perguntas para discutir na volta e como avaliar a participação.`,
  },
  {
    id: 'seek', nome: 'Seek by iNaturalist', materias: ['Ciências', 'Biologia'], objetivos: ['campo'], extra: 'Ciências e Biologia', guia: true,
    links: [['Página do Seek', 'https://www.inaturalist.org/pages/seek_app']], custo: 'Grátis e sem cadastro.',
    faz: 'Identifica plantas, animais e fungos pela câmera do celular, sem precisar de conta. Dá distintivos por descobertas.',
    passos: ['Instale o "Seek by iNaturalist" na loja de aplicativos.', 'Abra e permita o acesso à câmera (e, se quiser, à localização aproximada).', 'Selecione a câmera.', 'Aponte para o organismo, bem enquadrado.', 'Aguarde as sugestões (família, gênero ou espécie).', 'Toque na identificação para ver mais informações.', 'Adicione às suas observações e ganhe distintivos.'],
    dica: 'Como não pede cadastro, é a opção para alunos mais novos.',
    sim: [
      ['Primeiro uso', 'O app pede permissão. Para identificar, ele precisa de:', '*Câmera|Contatos|Microfone'],
      ['Câmera', 'Como enquadrar?', 'De muito longe|*Organismo visível e bem enquadrado|Com o dedo na lente'],
      ['Reconhecimento', 'Apareceu "Família: Asteraceae". O que isso quer dizer?', '*Identificou até o nível de família|Errou|É o nome do aluno'],
      ['Descoberta', 'Guarde a descoberta.', 'Fechar o app|*Adicionar às observações|Apagar'],
    ],
    prompt: a => `Crie um "bingo da biodiversidade" para usar com um app de identificação pela câmera no pátio da escola, para o ${a.serie} (${a.materia}, tema: "${a.tema}").

Cartela 4x4 com 16 itens possíveis de achar numa escola brasileira (ex.: "uma planta com flor amarela", "um inseto com asas"), regras do jogo e 3 perguntas de reflexão para depois.`,
  },
  {
    id: 'plantnet', nome: 'Pl@ntNet', materias: ['Ciências', 'Biologia'], objetivos: ['campo'], extra: 'Ciências e Biologia',
    links: [['Abrir Pl@ntNet', 'https://plantnet.org/']], custo: 'Grátis.',
    faz: 'Identifica plantas pela foto de folha, flor, fruto ou casca, com a porcentagem de confiança de cada sugestão.',
    passos: ['Instale o app ou use o site.', 'Fotografe uma parte da planta: folha, flor, fruto ou casca.', 'Diga qual parte fotografou.', 'Veja as sugestões e a porcentagem de semelhança.', 'Compare com as fotos de referência antes de confirmar.'],
    dica: 'Discuta com a turma por que a flor costuma dar uma identificação mais certeira que a folha.',
    sim: [
      ['Câmera', 'Qual parte da planta fotografar primeiro?', '*Flor ou folha bem nítida|O vaso|O chão'],
      ['Órgão', 'Fotografou uma folha. Indique isso.', 'Flor|*Folha|Fruto'],
      ['Resultados', 'Duas sugestões: 82% e 9%. O que fazer?', 'Aceitar a de 9%|*Comparar com as fotos de referência|Desistir'],
    ],
    prompt: a => `Crie uma atividade investigativa de identificação de plantas da escola com app de foto, para o ${a.serie} (${a.materia}, tema: "${a.tema}").

Inclua: pergunta-problema, ficha de campo (nome popular, nome científico sugerido, % de confiança, parte fotografada, local), discussão sobre por que a IA pode errar e uma tarefa final de montar um "herbário digital" da escola.`,
  },
  {
    id: 'earth', nome: 'Google Earth', materias: ['Geografia', 'História', 'Ciências', 'Biologia'], objetivos: ['campo', 'simulacao'],
    links: [['Abrir Google Earth', 'https://earth.google.com/web/']], custo: 'Grátis, roda no navegador.',
    faz: 'Globo 3D para explorar biomas, relevo, cidades e mudanças na paisagem. Dá para criar projetos com marcadores, fotos e textos.',
    passos: ['Abra o Google Earth no navegador.', 'Busque um lugar pelo nome.', 'Use o modo 3D e o Street View para explorar.', 'Abra "Projetos" e crie um com marcadores, fotos e descrições.', 'Compartilhe o projeto com a turma ou apresente em sala.'],
    dica: 'Compare um mesmo lugar em anos diferentes para discutir desmatamento e urbanização.',
    sim: [
      ['Globo', 'Encontre um bioma.', 'campo:Pantanal'],
      ['Mapa', 'Quer ver o relevo de lado.', '*Ativar 3D|Zoom out total|Fechar'],
      ['Projetos', 'Monte um roteiro com 5 paradas.', '*Novo projeto com marcadores|Imprimir mapa|Trocar idioma'],
    ],
    prompt: a => `Crie um roteiro de "viagem virtual" num globo 3D sobre "${a.tema}" para o ${a.serie} (${a.materia}).

5 paradas (lugares reais), e para cada uma: nome do lugar, o que observar, 1 pergunta para a turma e 1 curiosidade. Termine com uma pergunta que ligue todas as paradas.`,
  },
  {
    id: 'phet', nome: 'PhET Simulações', materias: ['Física', 'Química', 'Matemática', 'Ciências', 'Biologia'], objetivos: ['simulacao'],
    links: [['Abrir PhET em português', 'https://phet.colorado.edu/pt_BR/']], custo: 'Grátis.',
    faz: 'Simulações interativas de Física, Química, Matemática, Biologia e Ciências da Terra. Rodam no navegador.',
    passos: ['Busque uma simulação pelo tema ou pela matéria.', 'Teste antes da aula para saber o que cada controle faz.', 'Projete na sala ou mande o link para os alunos.', 'Guie a exploração com um roteiro de perguntas.'],
    dica: 'Peça que o aluno preveja o resultado antes de mexer na simulação.',
    sim: [
      ['Simulações', 'Procure pelo tema.', 'campo:seleção natural'],
      ['Simulação', 'Antes de mostrar à turma:', '*Testar todos os controles|Projetar sem ver|Mandar sem roteiro'],
      ['Na aula', 'O que os alunos fazem antes de mexer?', 'Nada|*Escrevem uma previsão|Copiam o resultado'],
    ],
    prompt: a => `Vou usar uma simulação interativa em aula de ${a.materia} sobre "${a.tema}" para o ${a.serie}.

Sugira qual simulação do PhET combina com o tema e crie um roteiro investigativo com:
1. uma pergunta-problema;
2. 3 previsões que o aluno anota antes de mexer;
3. passos de exploração (o que alterar e o que observar);
4. tabela para registrar resultados;
5. 3 perguntas de conclusão.`,
  },
  {
    id: 'biodigital', nome: 'BioDigital Human', materias: ['Biologia', 'Ciências', 'Educação Física'], objetivos: ['simulacao'], extra: 'Ciências e Biologia',
    links: [['Abrir BioDigital', 'https://human.biodigital.com/']], custo: 'Tem plano grátis.',
    faz: 'Corpo humano em 3D: gire, aproxime e isole sistemas, órgãos e estruturas. Tem modelos prontos de anatomia e doenças.',
    passos: ['Crie uma conta e abra a biblioteca de modelos.', 'Escolha um sistema ou órgão.', 'Gire, aproxime e use a ferramenta de isolar ou esconder estruturas.', 'Use os rótulos para nomear as partes.', 'Projete ou compartilhe o link do modelo.'],
    dica: 'Esconda os rótulos e peça para a turma adivinhar a estrutura.',
    sim: [
      ['Biblioteca', 'A aula é sobre digestão.', 'Sistema nervoso|*Sistema digestório|Esqueleto'],
      ['Modelo 3D', 'Quer mostrar só o estômago.', 'Girar|*Isolar a estrutura|Apagar o modelo'],
      ['Modelo 3D', 'Modo desafio para a turma.', '*Esconder os rótulos|Mostrar tudo|Fechar'],
    ],
    prompt: a => `Crie uma atividade de exploração de um modelo 3D sobre "${a.tema}" para o ${a.serie} (${a.materia}).

Inclua: 6 estruturas para localizar, a função de cada uma em 1 frase, um desafio de "adivinhe a estrutura" com dicas e 3 perguntas que liguem estrutura e função.`,
  },
  {
    id: 'vlibras', nome: 'VLibras', objetivos: ['inclusao'],
    links: [['Abrir VLibras', 'https://www.gov.br/governodigital/pt-br/vlibras']], custo: 'Grátis (Governo Federal).',
    faz: 'Traduz texto em português para Libras com um avatar 3D. Tem extensão de navegador e aplicativo.',
    passos: ['Instale a extensão do navegador ou o app.', 'Selecione o texto da atividade.', 'O avatar sinaliza o texto em Libras.', 'Textos curtos e diretos são traduzidos com mais precisão.'],
    dica: 'Não substitui um intérprete, mas ajuda no dia a dia. O prompt pronto adapta textos para linguagem simples.',
    sim: [
      ['Navegador', 'Primeiro passo:', '*Instalar a extensão|Trocar de navegador|Desligar o som'],
      ['Página', 'Traduza o enunciado da atividade.', 'Imprimir|*Selecionar o texto|Fechar a aba'],
      ['Avatar', 'A tradução ficou confusa. O que ajuda?', '*Frases mais curtas e diretas|Texto mais longo|Letra maior'],
    ],
    prompt: a => `Adapte a atividade abaixo sobre "${a.tema}" (${a.materia}, ${a.serie}) para linguagem simples, pensando em alunos com deficiência auditiva, dislexia, TDAH ou TEA.

- frases curtas, na ordem direta, uma ideia por frase;
- troque palavras difíceis por comuns e explique os termos técnicos;
- uma instrução por vez, numerada;
- sugira onde colocar uma imagem de apoio;
- mantenha o mesmo conteúdo e nível de exigência.

Atividade:
[cole aqui a sua atividade]`,
  },
  {
    id: 'handtalk', nome: 'Hand Talk', objetivos: ['inclusao'],
    links: [['Abrir Hand Talk', 'https://www.handtalk.me/br/']], custo: 'App grátis.',
    faz: 'Aplicativo que traduz texto e voz em português para Libras com avatares 3D. Tem dicionário de sinais.',
    passos: ['Instale o app Hand Talk.', 'Digite ou fale a frase.', 'O avatar sinaliza em Libras.', 'Ajuste a velocidade para acompanhar melhor.', 'Use o dicionário para aprender sinais de termos da matéria.'],
    dica: 'Aprenda com a turma os sinais de 5 termos da aula: é inclusão para todos.',
    sim: [
      ['App', 'Traduza uma frase da aula.', 'campo:A célula é a unidade da vida'],
      ['Avatar', 'Está rápido demais.', '*Diminuir a velocidade|Fechar o app|Aumentar o volume'],
      ['Dicionário', 'Quer aprender o sinal de um termo da matéria.', '*Buscar no dicionário|Inventar um sinal|Pular'],
    ],
    prompt: a => `Liste 10 termos-chave sobre "${a.tema}" (${a.materia}, ${a.serie}) que a turma deveria aprender também em Libras.

Para cada termo: definição em linguagem simples (até 12 palavras) e uma frase-exemplo curta, na ordem direta, boa para tradução em Libras.`,
  },
];
