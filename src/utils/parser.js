/**
 * Parser inteligente de questões de Literatura
 * Capaz de processar formatos ENEM, Fuvest, Unicamp, vestibulares e apostilas
 */

const KNOWN_AUTHORS_MAP = [
  { name: "Machado de Assis", school: "Realismo", keywords: ["machado de assis", "brás cubas", "dom casmurro", "capitu", "quincas borba", "bentinho", "iaia garcia", "memorial de aires", "a cartomante", "alienista"] },
  { name: "Aluísio Azevedo", school: "Naturalismo", keywords: ["aluísio azevedo", "aluisio azevedo", "o cortiço", "o cortico", "joão romão", "miranda", "jerônimo", "o mulato", "casa de pensão"] },
  { name: "Carlos Drummond de Andrade", school: "Modernismo", keywords: ["drummond", "no meio do caminho", "a rosa do povo", "sentimento do mundo", "alguma poesia", "josé", "e agora, josé"] },
  { name: "Mário de Andrade", school: "Modernismo", keywords: ["mário de andrade", "mario de andrade", "macunaíma", "macunaima", "pauliceia desvairada", "herói sem nenhum caráter"] },
  { name: "Oswald de Andrade", school: "Modernismo", keywords: ["oswald de andrade", "manifesto antropófago", "antropofagia", "pau-brasil", "sera fim ponte grande", "memórias sentimentais"] },
  { name: "Clarice Lispector", school: "Modernismo", keywords: ["clarice lispector", "a hora da estrela", "macabéa", "olímpico", "laços de família", "a paixão segundo g.h.", "perto do coração selvagem"] },
  { name: "João Guimarães Rosa", school: "Modernismo", keywords: ["guimarães rosa", "guimaraes rosa", "grande sertão: veredas", "riobaldo", "diadorim", "primeiras estórias", "sagarana", "a terceira margem do rio"] },
  { name: "Graciliano Ramos", school: "Modernismo", keywords: ["graciliano ramos", "vidas secas", "fabiano", "sinhá vitória", "baleia", "são bernardo", "paulo honório", "angústia"] },
  { name: "José de Alencar", school: "Romantismo", keywords: ["josé de alencar", "jose de alencar", "iracema", "o guarani", "peri", "senhora", "aurélia camargo", "lucíola", "ubirajara"] },
  { name: "Álvares de Azevedo", school: "Romantismo", keywords: ["álvares de azevedo", "alvares de azevedo", "lira dos vinte anos", "noite na taverna", "se eu morresse amanhã", "mal do século", "byroniano"] },
  { name: "Castro Alves", school: "Romantismo", keywords: ["castro alves", "o navio negreiro", "espumas flutuantes", "voz d'áfrica", "poeta dos escravos", "condoreira"] },
  { name: "Gregório de Matos", school: "Barroco", keywords: ["gregório de matos", "gregorio de matos", "boca do inferno", "boca de brasa", "desengano da vida", "soneto barroco"] },
  { name: "Padre Antônio Vieira", school: "Barroco", keywords: ["antônio vieira", "padre vieira", "sermão de santo antônio", "sermão da sexagésima"] },
  { name: "Tomás Antônio Gonzaga", school: "Arcadismo", keywords: ["tomás antônio gonzaga", "marília de dirceu", "cartas chilenas", "dirceu", "árcade"] },
  { name: "Cláudio Manuel da Costa", school: "Arcadismo", keywords: ["cláudio manuel da costa", "claudio manuel", "vila rica", "locus amoenus"] },
  { name: "Olavo Bilac", school: "Parnasianismo", keywords: ["olavo bilac", "ouvir estrelas", "profissão de fé", "parnasianismo", "vaso grego"] },
  { name: "Cruz e Sousa", school: "Simbolismo", keywords: ["cruz e sousa", "missal", "broquéis", "emparedado", "cisne negro", "sinestesia"] },
  { name: "Augusto dos Anjos", school: "Pré-Modernismo", keywords: ["augusto dos anjos", "eu e outras poesias", "psicologia de um vencido", "monólogo de uma sombra"] },
  { name: "Lima Barreto", school: "Pré-Modernismo", keywords: ["lima barreto", "triste fim de policarpo quaresma", "policarpo quaresma", "clara dos anjos"] },
  { name: "Euclides da Cunha", school: "Pré-Modernismo", keywords: ["euclides da cunha", "os sertões", "antônio conselheiro", "canudos"] },
  { name: "Jorge Amado", school: "Modernismo", keywords: ["jorge amado", "capitães da areia", "pedro bala", "gabriela cravo e canela", "dona flor e seus dois maridos"] },
  { name: "Fernando Pessoa", school: "Modernismo", keywords: ["fernando pessoa", "álvaro de campos", "ricardo reis", "alberto caeiro", "autopsicografia", "mensagem"] },
  { name: "Luís de Camões", school: "Classicismo", keywords: ["camões", "camoes", "os lusíadas", "amor é fogo que arde sem se ver", "alma minha gentil"] }
];

export function parseLiteratureQuestion(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      error: "O texto da questão está vazio."
    };
  }

  const warnings = [];
  const text = rawText.replace(/\r\n/g, "\n").trim();

  // 1. Extrair metadados explícitos ao final ou começo se existirem (Gabarito, Explicação, Autor, Obra, Escola, Dificuldade)
  let extractedCorrectAnswer = "";
  let extractedExplanation = "";
  let extractedAuthor = "";
  let extractedWork = "";
  let extractedSchool = "";
  let extractedDifficulty = "Média";

  // Regex para gabarito / resposta correta
  const gabaritoMatch = text.match(/(?:gabarito(?:\s+oficial)?|resposta(?:\s+correta)?|correta|alt(?:\.|ernativa)?\s+correta|res(?:\.|posta)?)\s*[:=-]?\s*\(?([A-Ea-e])\)?/i);
  if (gabaritoMatch) {
    extractedCorrectAnswer = gabaritoMatch[1].toUpperCase();
  }

  // Regex para explicação
  const explicacaoMatch = text.match(/(?:explicaç(?:ã|a)o|coment(?:á|a)rio|resoluç(?:ã|a)o)\s*[:=-]\s*([\s\S]*?)(?=(?:autor|obra|escola|gabarito|dificuldade|\n\n[A-Z]|$))/i);
  if (explicacaoMatch) {
    extractedExplanation = explicacaoMatch[1].trim();
  }

  // Regex para autor explícito
  const autorMatch = text.match(/(?:autor|escritor)\s*[:=-]\s*([^\n]+)/i);
  if (autorMatch) {
    extractedAuthor = autorMatch[1].trim();
  }

  // Regex para obra explícita
  const obraMatch = text.match(/(?:obra|livro|romance|poema|conto)\s*[:=-]\s*([^\n]+)/i);
  if (obraMatch) {
    extractedWork = obraMatch[1].trim();
  }

  // Regex para escola literária
  const escolaMatch = text.match(/(?:escola(?:\s+literária)?|estilo(?:\s+de\s+(?:época|literatura))?|movimento)\s*[:=-]\s*([^\n]+)/i);
  if (escolaMatch) {
    extractedSchool = escolaMatch[1].trim();
  }

  // Regex para dificuldade
  const diffMatch = text.match(/(?:dificuldade|nível)\s*[:=-]\s*(fácil|facil|média|media|difícil|dificil)/i);
  if (diffMatch) {
    const val = diffMatch[1].toLowerCase();
    if (val.includes("fac")) extractedDifficulty = "Fácil";
    else if (val.includes("dif")) extractedDifficulty = "Difícil";
    else extractedDifficulty = "Média";
  }

  // 2. Localizar as alternativas A, B, C, D e opcional E
  // Padrão que detecta início de alternativas: ex. \n(A) ou \nA) ou \nA - ou \n[A] ou \nA.
  const optionRegex = /(?:^|\n)\s*(?:\(?([A-Ea-e])\)|\b([A-Ea-e])[\)\.\-–—\]]|\b([A-Ea-e])\s*[-–—])\s+/;
  
  // Encontrar todas as ocorrências de início de alternativa
  const lines = text.split("\n");
  const optionStarts = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Se a linha começar com Gabarito / Resposta / Explicação / etc, parar busca de alternativas
    if (line.match(/^(?:gabarito|resposta|explicaç|autor|obra|escola|dificuldade)/i)) {
      continue;
    }
    const match = line.match(/^\s*(?:\(?([A-Ea-e])\)|([A-Ea-e])[\)\.\-–—\]]|([A-Ea-e])\s*[-–—])\s+(.*)$/);
    if (match) {
      const letter = (match[1] || match[2] || match[3]).toUpperCase();
      const content = match[4] || "";
      optionStarts.push({
        lineIndex: i,
        letter,
        firstLineContent: content
      });
    }
  }

  // Validar se encontramos pelo menos as alternativas A, B, C, D
  let options = [];
  let statement = "";

  if (optionStarts.length >= 3) {
    // Pegar o enunciado (tudo antes da primeira alternativa)
    const firstOptionLine = optionStarts[0].lineIndex;
    statement = lines.slice(0, firstOptionLine).join("\n").trim();

    // Reconstruir as alternativas com suporte a quebras de linha dentro da mesma alternativa
    for (let j = 0; j < optionStarts.length; j++) {
      const current = optionStarts[j];
      const next = optionStarts[j + 1];
      
      let nextLineIndex;
      if (next) {
        nextLineIndex = next.lineIndex;
      } else {
        // Encontrar onde termina a última alternativa (pode ser antes de Gabarito: ou fim do texto)
        nextLineIndex = lines.length;
        for (let k = current.lineIndex + 1; k < lines.length; k++) {
          if (lines[k].match(/^(?:gabarito|resposta|explicaç|autor|obra|escola|dificuldade)/i)) {
            nextLineIndex = k;
            break;
          }
        }
      }

      const optionContentLines = [current.firstLineContent];
      for (let k = current.lineIndex + 1; k < nextLineIndex; k++) {
        // Ignorar se encontrar linha de metadados
        if (lines[k].match(/^(?:gabarito|resposta|explicaç|autor|obra|escola|dificuldade)/i)) {
          break;
        }
        optionContentLines.push(lines[k]);
      }

      options.push({
        id: current.letter,
        text: optionContentLines.join("\n").trim()
      });
    }
  } else {
    // Tentar fallback baseado em busca no bloco de texto inteiro
    warnings.push("Alternativas não foram reconhecidas de forma padrão no formato A), B), C), D). O enunciado completo foi preservado para revisão manual.");
    statement = text.replace(/(?:gabarito|resposta|explicaç|autor|obra|escola|dificuldade)[\s\S]*$/i, "").trim();
    options = [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
      { id: "E", text: "" }
    ];
  }

  // Limpar texto de "Questão 1" ou prefixos comuns do enunciado se desejado, preservando vestibular
  statement = statement.replace(/^quest(?:ã|a)o\s*\d+[\s\.\:\-–—]*\n*/i, "").trim();

  // 3. Inteligência contextual para preencher Autor e Escola Literária caso não tenham sido informados
  const statementSearchText = statement.toLowerCase();
  const fullSearchText = (statement + " " + options.map(o => o.text).join(" ")).toLowerCase();

  if (!extractedAuthor || !extractedSchool) {
    // Tenta primeiro no enunciado (mais confiável)
    for (const item of KNOWN_AUTHORS_MAP) {
      const matched = item.keywords.some(kw => statementSearchText.includes(kw));
      if (matched) {
        if (!extractedAuthor) extractedAuthor = item.name;
        if (!extractedSchool) extractedSchool = item.school;
        break;
      }
    }

    // Se ainda não encontrou e temos a alternativa correta identificada, verificar no texto dela primeiro
    if ((!extractedAuthor || !extractedSchool) && extractedCorrectAnswer) {
      const correctOpt = options.find(o => o.id === extractedCorrectAnswer);
      if (correctOpt && correctOpt.text) {
        const correctOptText = correctOpt.text.toLowerCase();
        for (const item of KNOWN_AUTHORS_MAP) {
          const matched = item.keywords.some(kw => correctOptText.includes(kw));
          if (matched) {
            if (!extractedAuthor) extractedAuthor = item.name;
            if (!extractedSchool) extractedSchool = item.school;
            break;
          }
        }
      }
    }

    // Se ainda não encontrou, busca no texto completo incluindo todas as alternativas
    if (!extractedAuthor || !extractedSchool) {
      for (const item of KNOWN_AUTHORS_MAP) {
        const matched = item.keywords.some(kw => fullSearchText.includes(kw));
        if (matched) {
          if (!extractedAuthor) extractedAuthor = item.name;
          if (!extractedSchool) extractedSchool = item.school;
          break;
        }
      }
    }
  }

  // Se ainda não encontrou a escola literária, verificar menções diretas
  if (!extractedSchool) {
    const schools = [
      "Modernismo", "Romantismo", "Realismo", "Naturalismo", "Parnasianismo",
      "Simbolismo", "Barroco", "Arcadismo", "Classicismo", "Quinhentismo"
    ];
    for (const sc of schools) {
      if (statementSearchText.includes(sc.toLowerCase()) || fullSearchText.includes(sc.toLowerCase())) {
        extractedSchool = sc;
        break;
      }
    }
    if (!extractedSchool) {
      extractedSchool = "Literatura Brasileira";
    }
  }

  if (!extractedCorrectAnswer) {
    warnings.push("A resposta correta não foi encontrada automaticamente. Por favor, marque qual é a alternativa correta abaixo.");
  }

  // Filtrar alternativas vazias se foram detectadas 5 mas algumas são nulas
  options = options.filter(opt => opt.text.trim().length > 0 || options.length <= 4);

  return {
    success: true,
    statement: statement || "Enunciado da questão...",
    options: options.length >= 2 ? options : [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" }
    ],
    correctAnswer: extractedCorrectAnswer,
    explanation: extractedExplanation,
    author: extractedAuthor || "",
    work: extractedWork || "",
    school: extractedSchool || "Literatura Brasileira",
    difficulty: extractedDifficulty,
    warnings
  };
}
