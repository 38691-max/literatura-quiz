import React, { useState } from "react";
import {
  Sparkles,
  PlusCircle,
  Play,
  ClipboardPaste,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Feather,
  Bookmark,
  Trash2,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";
import { parseLiteratureQuestion } from "../utils/parser";
import { SAMPLE_INPUT_TEXT, LITERARY_SCHOOLS } from "../data/defaultQuestions";

export function QuestionInput({
  questions,
  onSaveQuestion,
  onStartQuiz,
  onStartCustomQuiz,
  notify
}) {
  const [activeTab, setActiveTab] = useState("paste"); // "paste" | "manual" | "quiz-config"
  const [pasteText, setPasteText] = useState("");
  const [parsedPreview, setParsedPreview] = useState(null);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    statement: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    hasOptionE: true,
    correctAnswer: "A",
    school: "Literatura Brasileira",
    author: "",
    work: "",
    explanation: "",
    difficulty: "Média"
  });

  // Quiz Launcher Configuration State
  const [quizConfig, setQuizConfig] = useState({
    school: "all",
    count: Math.min(10, questions.length),
    difficulty: "all",
    filterWrongOnly: false
  });

  // Processar texto colado com o parser inteligente
  const handleProcessText = () => {
    if (!pasteText.trim()) {
      notify("Por favor, cole o texto da questão na caixa abaixo.", "error");
      return;
    }

    const result = parseLiteratureQuestion(pasteText);
    if (!result.success) {
      notify(result.error || "Não foi possível identificar o formato da questão.", "error");
      return;
    }

    setParsedPreview(result);
    if (result.warnings && result.warnings.length > 0) {
      notify("Questão processada! Por favor, revise os campos destacados.", "warning");
    } else {
      notify("Questão identificada com sucesso!", "success");
    }
  };

  const handleLoadSample = () => {
    setPasteText(SAMPLE_INPUT_TEXT);
    notify("Exemplo de questão do ENEM carregado na caixa de texto!", "info");
  };

  const handleClearPaste = () => {
    setPasteText("");
    setParsedPreview(null);
  };

  // Salvar a questão do preview
  const handleConfirmParsedQuestion = (startQuizImmediately = false) => {
    if (!parsedPreview) return;

    if (!parsedPreview.statement || parsedPreview.statement.trim().length < 5) {
      notify("O enunciado da questão não pode ficar vazio.", "error");
      return;
    }

    if (!parsedPreview.correctAnswer) {
      notify("Por favor, selecione qual é a alternativa correta antes de salvar.", "error");
      return;
    }

    // Validar alternativas
    const validOptions = parsedPreview.options.filter((o) => o.text && o.text.trim().length > 0);
    if (validOptions.length < 2) {
      notify("A questão precisa ter no mínimo duas alternativas preenchidas.", "error");
      return;
    }

    const newQuestion = {
      id: "q-" + Date.now(),
      statement: parsedPreview.statement.trim(),
      options: validOptions,
      correctAnswer: parsedPreview.correctAnswer,
      explanation: parsedPreview.explanation || "",
      school: parsedPreview.school || "Literatura Brasileira",
      author: parsedPreview.author || "",
      work: parsedPreview.work || "",
      difficulty: parsedPreview.difficulty || "Média",
      timesAnswered: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      needsReview: false,
      createdAt: new Date().toISOString()
    };

    onSaveQuestion(newQuestion);
    notify("Questão adicionada ao banco com sucesso!", "success");
    setParsedPreview(null);
    setPasteText("");

    if (startQuizImmediately) {
      onStartCustomQuiz([newQuestion.id]);
    }
  };

  // Salvar questão manual
  const handleSaveManual = (e) => {
    e.preventDefault();
    if (!manualForm.statement.trim()) {
      notify("O enunciado da questão é obrigatório.", "error");
      return;
    }
    if (!manualForm.optionA.trim() || !manualForm.optionB.trim()) {
      notify("As alternativas A e B são obrigatórias.", "error");
      return;
    }

    const options = [
      { id: "A", text: manualForm.optionA.trim() },
      { id: "B", text: manualForm.optionB.trim() },
      { id: "C", text: manualForm.optionC.trim() },
      { id: "D", text: manualForm.optionD.trim() }
    ];

    if (manualForm.hasOptionE && manualForm.optionE.trim()) {
      options.push({ id: "E", text: manualForm.optionE.trim() });
    }

    const newQuestion = {
      id: "q-" + Date.now(),
      statement: manualForm.statement.trim(),
      options,
      correctAnswer: manualForm.correctAnswer,
      school: manualForm.school,
      author: manualForm.author.trim(),
      work: manualForm.work.trim(),
      explanation: manualForm.explanation.trim(),
      difficulty: manualForm.difficulty,
      timesAnswered: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      needsReview: false,
      createdAt: new Date().toISOString()
    };

    onSaveQuestion(newQuestion);
    notify("Questão manual salva com sucesso!", "success");

    // Limpar formulário
    setManualForm({
      statement: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
      hasOptionE: true,
      correctAnswer: "A",
      school: "Literatura Brasileira",
      author: "",
      work: "",
      explanation: "",
      difficulty: "Média"
    });
  };

  // Iniciar Quiz configurado
  const handleStartConfiguredQuiz = () => {
    let pool = [...questions];

    if (quizConfig.filterWrongOnly) {
      pool = pool.filter((q) => (q.timesIncorrect > 0 && q.needsReview) || q.timesIncorrect > q.timesCorrect);
      if (pool.length === 0) {
        notify("Você não possui questões erradas pendentes!", "info");
        return;
      }
    }

    if (quizConfig.school !== "all") {
      pool = pool.filter((q) => q.school === quizConfig.school);
    }

    if (quizConfig.difficulty !== "all") {
      pool = pool.filter((q) => q.difficulty === quizConfig.difficulty);
    }

    if (pool.length === 0) {
      notify("Nenhuma questão encontrada com os filtros selecionados.", "error");
      return;
    }

    // Embaralhar e limitar à quantidade
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(quizConfig.count, shuffled.length);
    const selectedIds = shuffled.slice(0, count).map((q) => q.id);

    onStartCustomQuiz(selectedIds);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Área de Questionários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cole questões, adicione manualmente ou configure um simulado personalizado.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("paste");
              setParsedPreview(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "paste"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colar Questão Rápida</span>
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "manual"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Adicionar Manualmente</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz-config")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "quiz-config"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Iniciar Simulado</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COLAR QUESTÃO RÁPIDA (REQUISITO PRINCIPAL 2 & 14) */}
      {activeTab === "paste" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Processador Inteligente de Questões</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Cole sua questão aqui
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Cole o enunciado, alternativas e, se disponível, a resposta correta. O sistema organizará automaticamente as informações, reconhecendo autores e escolas literárias.
              </p>
            </div>

            {/* Caixa de Texto Principal */}
            <div className="relative">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Exemplo:\n(ENEM) Qual característica do Romantismo manifesta-se nos versos...\n\nA) O pessimismo byroniano e o culto da morte.\nB) O objetivismo científico e experimental.\nC) A ironia cortante e a digressão psicológica.\nD) A harmonia clássica e a contenção das paixões.\nE) A valorização da linguagem coloquial e modernista.\n\nGabarito: A\nExplicação: O pessimismo e o escapismo pela morte caracterizam a Segunda Geração Romântica...`}
                rows={11}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition font-mono leading-relaxed resize-y"
              />

              {pasteText && (
                <button
                  onClick={handleClearPaste}
                  title="Limpar texto"
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Barra de Ações do Processamento */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Carregar Exemplo de Prova</span>
                </button>

                <span className="text-xs text-slate-400 hidden sm:inline">
                  {pasteText.length > 0 ? `${pasteText.length} caracteres` : "Suporta formatos ENEM, Fuvest e vestibulares"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {pasteText && (
                  <button
                    type="button"
                    onClick={handleClearPaste}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"
                  >
                    Limpar
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleProcessText}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Processar questão</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal / Área de Validação e Correção da Questão Processada */}
          {parsedPreview && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-indigo-500/40 dark:border-indigo-500/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Estrutura Identificada</span>
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Revise e confirme os dados da questão
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Você pode alterar qualquer campo antes de adicionar ao banco ou responder.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setParsedPreview(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Alertas se houver avisos (ex: falta de gabarito) */}
              {parsedPreview.warnings && parsedPreview.warnings.length > 0 && (
                <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {parsedPreview.warnings.map((warn, i) => (
                      <p key={i}>{warn}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário Interativo de Edição do Preview */}
              <div className="space-y-4">
                {/* Enunciado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Enunciado da Questão
                  </label>
                  <textarea
                    value={parsedPreview.statement}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, statement: e.target.value })}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Alternativas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Alternativas (Clique no círculo da resposta correta)
                    </label>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      Gabarito selecionado: {parsedPreview.correctAnswer || "Nenhum (selecione abaixo)"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {parsedPreview.options.map((opt) => {
                      const isCorrect = parsedPreview.correctAnswer === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            isCorrect
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setParsedPreview({ ...parsedPreview, correctAnswer: opt.id })}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                              isCorrect
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                            }`}
                            title="Marcar como alternativa correta"
                          >
                            {opt.id}
                          </button>

                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = parsedPreview.options.map((o) =>
                                o.id === opt.id ? { ...o, text: e.target.value } : o
                              );
                              setParsedPreview({ ...parsedPreview, options: newOpts });
                            }}
                            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                            placeholder={`Texto da alternativa ${opt.id}...`}
                          />

                          {isCorrect && (
                            <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                              Correta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metadados: Escola, Autor, Obra, Dificuldade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Escola Literária
                    </label>
                    <select
                      value={parsedPreview.school}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, school: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      {LITERARY_SCHOOLS.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Autor Relacionado
                    </label>
                    <input
                      type="text"
                      value={parsedPreview.author}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, author: e.target.value })}
                      placeholder="Ex: Machado de Assis"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Obra Literária
                    </label>
                    <input
                      type="text"
                      value={parsedPreview.work}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, work: e.target.value })}
                      placeholder="Ex: Dom Casmurro"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Dificuldade
                    </label>
                    <select
                      value={parsedPreview.difficulty}
                      onChange={(e) => setParsedPreview({ ...parsedPreview, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Média">Média</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>
                </div>

                {/* Explicação da Resposta */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Comentário Pedagógico / Explicação (Opcional, para o Modo de Revisão)
                  </label>
                  <textarea
                    value={parsedPreview.explanation}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, explanation: e.target.value })}
                    placeholder="Adicione uma justificativa do porquê esta é a resposta correta..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Botões de Ação do Preview */}
              <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setParsedPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmParsedQuestion(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                >
                  Salvar no Banco de Questões
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmParsedQuestion(true)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Salvar e Resolver Agora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADICIONAR MANUALMENTE */}
      {activeTab === "manual" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Cadastrar Questão Manualmente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Preencha os campos para cadastrar uma nova questão de Literatura.
            </p>
          </div>

          <form onSubmit={handleSaveManual} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Enunciado da Questão *
              </label>
              <textarea
                value={manualForm.statement}
                onChange={(e) => setManualForm({ ...manualForm, statement: e.target.value })}
                rows={4}
                required
                placeholder="Insira o texto completo, trechos de poemas ou obras de literatura e o comando da questão..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Alternativas A a E */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Alternativas e Gabarito *
              </label>

              {["A", "B", "C", "D"].map((letter) => {
                const fieldKey = `option${letter}`;
                const isCorrect = manualForm.correctAnswer === letter;
                return (
                  <div key={letter} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, correctAnswer: letter })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                        isCorrect
                          ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                      title="Clique para marcar como resposta correta"
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      required
                      value={manualForm[fieldKey]}
                      onChange={(e) => setManualForm({ ...manualForm, [fieldKey]: e.target.value })}
                      placeholder={`Alternativa ${letter}...`}
                      className={`w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isCorrect ? "border-emerald-500 dark:border-emerald-600" : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                  </div>
                );
              })}

              {/* Alternativa E opcional */}
              {manualForm.hasOptionE ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, correctAnswer: "E" })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                      manualForm.correctAnswer === "E"
                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    E
                  </button>
                  <input
                    type="text"
                    value={manualForm.optionE}
                    onChange={(e) => setManualForm({ ...manualForm, optionE: e.target.value })}
                    placeholder="Alternativa E (opcional)..."
                    className={`w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      manualForm.correctAnswer === "E"
                        ? "border-emerald-500 dark:border-emerald-600"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setManualForm({
                        ...manualForm,
                        hasOptionE: false,
                        optionE: "",
                        correctAnswer: manualForm.correctAnswer === "E" ? "A" : manualForm.correctAnswer
                      });
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 px-2"
                  >
                    Remover E
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setManualForm({ ...manualForm, hasOptionE: true })}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar Alternativa E</span>
                </button>
              )}
            </div>

            {/* Metadados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Escola Literária
                </label>
                <select
                  value={manualForm.school}
                  onChange={(e) => setManualForm({ ...manualForm, school: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {LITERARY_SCHOOLS.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={manualForm.author}
                  onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                  placeholder="Ex: Aluísio Azevedo"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Obra
                </label>
                <input
                  type="text"
                  value={manualForm.work}
                  onChange={(e) => setManualForm({ ...manualForm, work: e.target.value })}
                  placeholder="Ex: O Cortiço"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Dificuldade
                </label>
                <select
                  value={manualForm.difficulty}
                  onChange={(e) => setManualForm({ ...manualForm, difficulty: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Média">Média</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Explicação / Justificativa da Resposta
              </label>
              <textarea
                value={manualForm.explanation}
                onChange={(e) => setManualForm({ ...manualForm, explanation: e.target.value })}
                rows={2}
                placeholder="Explique o contexto literário ou a regra que justifica a alternativa correta..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Questão</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CONFIGURAR E INICIAR SIMULADO */}
      {activeTab === "quiz-config" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Configurar Simulado
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Escolha a quantidade e filtros para iniciar o seu teste agora mesmo.
            </p>
          </div>

          <div className="space-y-5">
            {/* Quantidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Quantidade de Questões: {quizConfig.count}
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10, 15, questions.length].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuizConfig({ ...quizConfig, count: Math.min(num, questions.length) })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      quizConfig.count === Math.min(num, questions.length)
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {num === questions.length ? `Todas (${num})` : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtrar por Escola Literária */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Filtrar por Escola Literária
              </label>
              <select
                value={quizConfig.school}
                onChange={(e) => setQuizConfig({ ...quizConfig, school: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Todas as Escolas Literárias</option>
                {LITERARY_SCHOOLS.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtrar por Dificuldade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Nível de Dificuldade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "all", label: "Todas" },
                  { id: "Fácil", label: "Fácil" },
                  { id: "Média", label: "Média" },
                  { id: "Difícil", label: "Difícil" }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setQuizConfig({ ...quizConfig, difficulty: diff.id })}
                    className={`py-2 rounded-xl text-xs font-semibold transition ${
                      quizConfig.difficulty === diff.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apenas questões que já errou */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Apenas questões que errei anteriormente
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Foca exclusivamente no reforço e revisão de falhas
                </span>
              </div>
              <input
                type="checkbox"
                checked={quizConfig.filterWrongOnly}
                onChange={(e) => setQuizConfig({ ...quizConfig, filterWrongOnly: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleStartConfiguredQuiz}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-base shadow-lg shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>Começar Questionário Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
