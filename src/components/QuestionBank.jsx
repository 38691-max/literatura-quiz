import React, { useState, useMemo } from "react";
import {
  Database,
  Search,
  Filter,
  CheckSquare,
  Square,
  Play,
  Trash2,
  Copy,
  Edit3,
  Bookmark,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen
} from "lucide-react";
import { LITERARY_SCHOOLS } from "../data/defaultQuestions";

export function QuestionBank({
  questions,
  onSaveQuestion,
  onDeleteQuestion,
  onDeleteMultipleQuestions,
  onDuplicateQuestion,
  onToggleNeedsReview,
  onStartQuizWithIds,
  onNavigate,
  notify
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | timesAnswered | accuracy | hardest
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal de Edição
  const [editingQuestion, setEditingQuestion] = useState(null);
  // Modal de Exclusão
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // id or 'selected'

  // Filtragem e Ordenação
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        // Busca textual
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          !term ||
          q.statement.toLowerCase().includes(term) ||
          (q.author && q.author.toLowerCase().includes(term)) ||
          (q.work && q.work.toLowerCase().includes(term)) ||
          (q.school && q.school.toLowerCase().includes(term));

        // Filtro de Escola Literária
        const matchesSchool = schoolFilter === "all" || q.school === schoolFilter;

        // Filtro de Dificuldade
        const matchesDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter;

        return matchesTerm && matchesSchool && matchesDiff;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "timesAnswered") {
          return (b.timesAnswered || 0) - (a.timesAnswered || 0);
        }
        if (sortBy === "hardest") {
          // Mais erradas
          return (b.timesIncorrect || 0) - (a.timesIncorrect || 0);
        }
        if (sortBy === "accuracy") {
          const accA = a.timesAnswered ? (a.timesCorrect || 0) / a.timesAnswered : 0;
          const accB = b.timesAnswered ? (b.timesCorrect || 0) / b.timesAnswered : 0;
          return accB - accA;
        }
        return 0;
      });
  }, [questions, searchTerm, schoolFilter, difficultyFilter, sortBy]);

  // Seleção de Questões
  const isAllSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedIds.includes(q.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Desmarcar todas as filtradas
      setSelectedIds((prev) => prev.filter((id) => !filteredQuestions.some((q) => q.id === id)));
    } else {
      // Marcar todas as filtradas
      const newIds = Array.from(new Set([...selectedIds, ...filteredQuestions.map((q) => q.id)]));
      setSelectedIds(newIds);
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Ações em Massa (Requisito 8)
  const handleBulkStartQuiz = () => {
    if (selectedIds.length === 0) return;
    onStartQuizWithIds(selectedIds);
  };

  const handleBulkRetryWrong = () => {
    const wrongSelected = questions
      .filter((q) => selectedIds.includes(q.id) && q.timesIncorrect > 0)
      .map((q) => q.id);

    if (wrongSelected.length === 0) {
      notify("Nenhuma das questões selecionadas possui histórico de erros.", "info");
      return;
    }
    onStartQuizWithIds(wrongSelected);
  };

  const handleBulkMarkReview = () => {
    selectedIds.forEach((id) => {
      onToggleNeedsReview(id, true);
    });
    notify(`${selectedIds.length} questões marcadas para revisão!`, "success");
    setSelectedIds([]);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmTarget === "selected") {
      onDeleteMultipleQuestions(selectedIds);
      notify(`${selectedIds.length} questões excluídas com sucesso.`, "info");
      setSelectedIds([]);
    } else if (deleteConfirmTarget) {
      onDeleteQuestion(deleteConfirmTarget);
      notify("Questão excluída com sucesso.", "info");
      setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmTarget));
    }
    setDeleteConfirmTarget(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Banco de Questões</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie, selecione, edite e organize todo o acervo literário ({questions.length} questões cadastradas).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("questionarios")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Questão</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por texto, autor, obra..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filtro Escola Literária */}
          <div>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas as Escolas Literárias</option>
              {LITERARY_SCHOOLS.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Dificuldade */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas as Dificuldades</option>
              <option value="Fácil">Fácil</option>
              <option value="Média">Média</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Mais recentes</option>
              <option value="timesAnswered">Mais respondidas</option>
              <option value="hardest">Mais erradas (Dificuldade)</option>
              <option value="accuracy">Maior taxa de acerto</option>
            </select>
          </div>
        </div>

        {/* Barra de Ações em Massa para Questões Selecionadas (Requisito 8) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md bg-indigo-200 dark:bg-indigo-900">
                {selectedIds.length} selecionada(s)
              </span>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 hidden sm:inline">
                Escolha uma ação em lote:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkStartQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Criar Questionário</span>
              </button>

              <button
                onClick={handleBulkRetryWrong}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refazer Erradas</span>
              </button>

              <button
                onClick={handleBulkMarkReview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Marcar para Revisão</span>
              </button>

              <button
                onClick={() => setDeleteConfirmTarget("selected")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 px-1"
              >
                Limpar seleção
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela / Grid de Questões */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Master Select Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Selecionar todas ({filteredQuestions.length})</span>
            </button>
          </div>

          <span>Exibindo {filteredQuestions.length} de {questions.length} questões</span>
        </div>

        {/* Lista de Questões */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question, index) => {
              const isSelected = selectedIds.includes(question.id);
              const accuracy = question.timesAnswered
                ? Math.round((question.timesCorrect / question.timesAnswered) * 100)
                : 0;

              return (
                <div
                  key={question.id}
                  className={`p-4 sm:p-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex items-start gap-3.5 ${
                    isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  {/* Individual Checkbox (Requisito 8) */}
                  <button
                    onClick={() => handleToggleSelectOne(question.id)}
                    className="mt-1 text-slate-400 hover:text-indigo-600 shrink-0"
                    title={isSelected ? "Desmarcar" : "Selecionar"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Detalhes da Questão */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{question.id.replace("q-", "")}
                      </span>

                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {question.school}
                      </span>

                      {question.author && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {question.author}
                        </span>
                      )}

                      {question.work && (
                        <span className="text-xs italic px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {question.work}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          question.difficulty === "Fácil"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : question.difficulty === "Difícil"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {question.difficulty}
                      </span>

                      {question.needsReview && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          <span>Revisar</span>
                        </span>
                      )}
                    </div>

                    {/* Enunciado truncado com elegância */}
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {question.statement}
                    </p>

                    {/* Estatísticas da Questão (Requisito 6) */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Gabarito: ({question.correctAnswer})
                      </span>
                      <span>Respondida: <strong>{question.timesAnswered || 0}x</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400">Acertos: <strong>{question.timesCorrect || 0}</strong></span>
                      <span className="text-rose-600 dark:text-rose-400">Erros: <strong>{question.timesIncorrect || 0}</strong></span>
                      {question.timesAnswered > 0 && (
                        <span>Taxa de Acerto: <strong>{accuracy}%</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ações Individuais (Requisito 6) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onStartQuizWithIds([question.id])}
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      title="Resolver esta questão agora"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Editar questão"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDuplicateQuestion(question)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicar questão"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmTarget(question.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Excluir questão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Database className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm">Nenhuma questão encontrada com estes filtros.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSchoolFilter("all");
                  setDifficultyFilter("all");
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão (Requisito 13) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {deleteConfirmTarget === "selected"
                  ? `Excluir ${selectedIds.length} questões?`
                  : "Excluir esta questão?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Esta ação removerá permanentemente {deleteConfirmTarget === "selected" ? "as questões selecionadas" : "a questão"} do banco de dados.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Questão */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>Editar Questão #{editingQuestion.id.replace("q-", "")}</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Enunciado
                </label>
                <textarea
                  value={editingQuestion.statement}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, statement: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Alternativas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Alternativas (Selecione a Correta)
                </label>
                <div className="space-y-2">
                  {editingQuestion.options.map((opt) => {
                    const isCorrect = editingQuestion.correctAnswer === opt.id;
                    return (
                      <div key={opt.id} className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt.id })}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {opt.id}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = editingQuestion.options.map((o) =>
                              o.id === opt.id ? { ...o, text: e.target.value } : o
                            );
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Escola Literária
                  </label>
                  <select
                    value={editingQuestion.school}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, school: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  >
                    {LITERARY_SCHOOLS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.author || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, author: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Média">Média</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Explicação Pedagógica
                </label>
                <textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={2}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveQuestion(editingQuestion);
                  setEditingQuestion(null);
                  notify("Questão atualizada com sucesso!", "success");
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
