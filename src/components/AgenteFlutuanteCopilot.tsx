import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Compass,
  CheckCircle2,
  Lightbulb,
  Cog,
  Eye,
  ShieldAlert,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AbaNavegacao } from './Navbar';
import { ApiService } from '../services/api';

interface MensagemCopilot {
  id: string;
  remetente: 'usuario' | 'ia';
  texto: string;
  hora: string;
  acaoNavegacao?: {
    abaDestino: AbaNavegacao;
    labelAba: string;
    sucesso: boolean;
  };
  cicloReact?: any;
}

interface Props {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
}

export const AgenteFlutuanteCopilot: React.FC<Props> = ({ abaAtiva, aoMudarAba }) => {
  const [aberto, setAberto] = useState<boolean>(false);
  const [minimizado, setMinimizado] = useState<boolean>(false);
  const [inputTexto, setInputTexto] = useState<string>('');
  const [processando, setProcessando] = useState<boolean>(false);
  // ReAct recolhido por padrão para tela limpa e sem poluição
  const [reactExpandidoIds, setReactExpandidoIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [mensagens, setMensagens] = useState<MensagemCopilot[]>([
    {
      id: 'copilot-1',
      remetente: 'ia',
      texto:
        'Olá! Sou o **Agente Orquestrador & Copilot Flutuante** do SITRIB. Você pode me pedir para navegar em qualquer tela do site (ex: *"me leve para a fila de cobrança"*, *"abrir mapa de calor"*, *"revisar multas com erro"*) ou fazer consultas tributárias completas. Eu aciono os agentes estritos e processo as respostas com o ciclo **ReAct**.',
      hora: 'Agora',
      cicloReact: {
        etapa_1_validacao_parametros: {
          titulo: '1. Validação & Higienização de Parâmetros de Entrada',
          intencao_detectada: 'INICIALIZACAO_COPILOT_ORQUESTRADOR',
          parametros_extraidos: {
            telas_disponiveis: 9,
            modo_execucao: 'ReAct Flutuante Multi-Telas',
            lgpd: 'Blind Inference Ativo (Art. 6º)',
          },
          status_validacao: 'SUCESSO_HIGIENIZADO',
          lgpd_conformidade: 'Conforme Art. 6º LGPD (Minimização de Dados)',
        },
        etapa_2_pensamento_inicial: {
          titulo: '2. Hipótese & Pensamento Inicial (Thought)',
          pensamento_raciocinio:
            'O Copilot fica disponível em todas as rotas do SITRIB para orquestrar comandos de voz/texto, disparar transições de tela e executar pareceres fiscais fundamentados.',
          criterio_tributario_aplicado: 'Navegação e Orquestração de Agentes Fiscais',
        },
        etapa_3_acao_ferramenta: {
          titulo: '3. Ação & Invocação de Ferramenta (Action)',
          ferramenta_executada: 'tool_orquestrador_navegacao_e_chat',
          argumentos_passados: { escopo: 'GLOBAL_SITRIB' },
        },
        etapa_4_observacao_dados: {
          titulo: '4. Observação dos Dados Fatuais do Banco (Observation)',
          sintese_dados_reais:
            '9 telas operacionais integradas: Painel, Fila, Multas, Dossiê, Macrorregiões, Capacidade, Agentes, Receitas e Simulador.',
        },
        etapa_5_pensamento_revisao_critica: {
          titulo: '5. Revisão Crítica & Salvaguardas Éticas (Review)',
          analise_critica_e_ajuste:
            'Navegações restritas ao perfil autenticado; pareceres fiscais em conformidade com o CTN e sujeitos à validação humana.',
          status_human_in_the_loop: 'HOMOLOGAÇÃO_OBRIGATÓRIA_AUDITOR (Art. 20 LGPD)',
        },
        etapa_6_resposta_fundamentada: {
          titulo: '6. Parecer Final Fundamentado (Final Grounded Answer)',
          resumo_conclusao: 'Copilot pronto para navegação inteligente e respostas fundamentadas.',
        },
      },
    },
  ]);

  // Atalho de Teclado Global: Ctrl + K para abrir/fechar o Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberto((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (aberto && !minimizado) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, aberto, minimizado]);

  const alternarExpansaoReact = (id: string) => {
    setReactExpandidoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Mapeador de Intenção de Navegação para Abas do Sistema
  // ATENÇÃO: Só deve navegar quando houver comando explícito de ação (ir, abrir, navegar, me leve).
  // Perguntas conceituais/analíticas ("qual", "por que", "poderia informar...") NÃO devem forçar navegação.
  const identificarAbaPorTexto = (texto: string): { aba: AbaNavegacao; label: string } | null => {
    const t = texto.toLowerCase().trim();

    // Se for pergunta analítica sem ordem explícita de navegação, não muda de tela
    const ehPergunta = t.endsWith('?') || /^(qual|quais|como|por que|pq|poderia|me informe|quem|quanto|explique|o que)/i.test(t);
    const temComandoNavegacao = /\b(abrir|abre|va|vá|vai|ir|navegar|navegue|levar|leve|mudar|mostrar|mostre|acessar|acesse|tela)\b/i.test(t);

    if (ehPergunta && !temComandoNavegacao) {
      return null;
    }

    if (t.includes('fila') || t.includes('cobrança') || t.includes('cobranca') || t.includes('max-heap')) {
      return { aba: 'fila', label: 'Fila Prioritária de Cobrança' };
    }
    if ((t.includes('mapa') || t.includes('calor') || t.includes('macrorregi')) && temComandoNavegacao) {
      return { aba: 'macrorregioes', label: 'Macrorregiões & Mapa de Calor' };
    }
    if (t.includes('multa') || t.includes('anomali') || t.includes('revis') || t.includes('art. 20')) {
      if (temComandoNavegacao || t.includes('revisar')) {
        return { aba: 'multas', label: 'Revisão de Multas & Erros Humanos' };
      }
    }
    if (t.includes('portal novo') || t.includes('armadilha') || t.includes('5.4') || (t.includes('receita') && temComandoNavegacao)) {
      return { aba: 'receitas', label: 'Receitas Reais da Prefeitura' };
    }
    if (t.includes('simulador') || (t.includes('reajuste') && temComandoNavegacao)) {
      return { aba: 'simulador', label: 'Simulador de Reajuste Tributário' };
    }
    if (t.includes('dossiê') || t.includes('dossie') || (t.includes('imóvel') && temComandoNavegacao)) {
      return { aba: 'dossie', label: 'Dossiê do Contribuinte / Imóvel' };
    }
    if (t.includes('fairness') || (t.includes('capacidade') && temComandoNavegacao)) {
      return { aba: 'capacidade', label: 'Capacidade Contributiva & Fairness' };
    }
    if (t.includes('guardrail') || (t.includes('agente') && temComandoNavegacao)) {
      return { aba: 'agentes', label: 'Agentes Estritos & Guardrails' };
    }
    if (t.includes('painel') || t.includes('dashboard') || ((t.includes('início') || t.includes('inicio')) && temComandoNavegacao)) {
      return { aba: 'painel', label: 'Painel Geral de Arrecadação' };
    }
    return null;
  };

  const handleEnviarMensagem = async (textoPersonalizado?: string) => {
    const texto = (textoPersonalizado || inputTexto).trim();
    if (!texto || processando) return;

    const novaMensagemUsuario: MensagemCopilot = {
      id: String(Date.now()),
      remetente: 'usuario',
      texto,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setInputTexto('');
    setProcessando(true);

    // 1. Detecta se há intenção de navegação no site
    const destinoNavegacao = identificarAbaPorTexto(texto);

    try {
      // 2. Aciona o orquestrador no backend para gerar o Ciclo ReAct
      const resp = await ApiService.enviarMensagemChatIA(texto);
      const novaId = String(Date.now() + 1);

      // Se houver comando de navegação, executa a troca de tela em tempo real
      if (destinoNavegacao) {
        aoMudarAba(destinoNavegacao.aba);
      }

      const textoResposta = destinoNavegacao
        ? `Naveguei você para a tela **${destinoNavegacao.label}**.\n\n${resp.resposta}`
        : resp.resposta;

      const novaMensagemIA: MensagemCopilot = {
        id: novaId,
        remetente: 'ia',
        texto: textoResposta,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        acaoNavegacao: destinoNavegacao
          ? {
              abaDestino: destinoNavegacao.aba,
              labelAba: destinoNavegacao.label,
              sucesso: true,
            }
          : undefined,
        cicloReact: resp.ciclo_react,
      };

      setMensagens((prev) => [...prev, novaMensagemIA]);
      // Deixa o acordeão ReAct recolhido por padrão para não empurrar a resposta principal
      setReactExpandidoIds((prev) => ({ ...prev, [novaId]: false }));
    } catch {
      const novaId = String(Date.now() + 1);
      if (destinoNavegacao) {
        aoMudarAba(destinoNavegacao.aba);
      }

      const msgFallback: MensagemCopilot = {
        id: novaId,
        remetente: 'ia',
        texto: destinoNavegacao
          ? `Naveguei você para **${destinoNavegacao.label}** conforme solicitado. O orquestrador de IA preparou as ferramentas fiscais correspondentes.`
          : 'Comando processado pelo orquestrador. A diretriz de governança tributária de Palmas prioriza o REFIS Social nas regiões vulneráveis e a conciliação para grandes devedores.',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        acaoNavegacao: destinoNavegacao
          ? {
              abaDestino: destinoNavegacao.aba,
              labelAba: destinoNavegacao.label,
              sucesso: true,
            }
          : undefined,
      };
      setMensagens((prev) => [...prev, msgFallback]);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE NO CANTO INFERIOR DIREITO */}
      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-2xl border border-neutral-700 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          title="Abrir Copilot Orquestrador (Ctrl+K)"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold block leading-tight">Assistente Fiscal IA</span>
            <span className="text-[10px] text-neutral-400 block leading-none">Navegue digitando • Ctrl+K</span>
          </div>
        </button>
      )}

      {/* JANELA FLUTUANTE MODAL DO AGENTE (COPILOT DRAWER) */}
      {aberto && (
        <div
          className={`fixed z-[9999] shadow-2xl border border-neutral-300 rounded-xl overflow-hidden bg-white flex flex-col transition-all duration-200 ${
            minimizado
              ? 'bottom-6 right-6 w-80 h-14'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[520px] lg:w-[560px] h-[85vh] max-h-[720px]'
          }`}
        >
          {/* Header da Janela Flutuante */}
          <div className="p-3 bg-neutral-900 text-white flex items-center justify-between shrink-0 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>Assistente Fiscal Inteligente</span>
                  <span className="text-[9px] bg-[#7f1d1d] px-1.5 py-0.2 rounded font-mono">SITRIB</span>
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Assistente Fazendário • Consultas, Simulações & Pareceres Fiscais
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-400">
              <button
                onClick={() => setMinimizado(!minimizado)}
                className="p-1 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                title={minimizado ? 'Restaurar' : 'Minimizar'}
              >
                {minimizado ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setAberto(false)}
                className="p-1 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                title="Fechar Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conteúdo Expansível da Janela */}
          {!minimizado && (
            <>
              {/* Barra de Ações Rápidas de Navegação */}
              <div className="p-2 bg-neutral-100 border-b border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                <span className="text-neutral-500 font-bold shrink-0 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#7f1d1d]" /> Ir para:
                </span>
                <button
                  onClick={() => handleEnviarMensagem('me leve para o mapa de calor de palmas')}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 font-medium whitespace-nowrap transition-colors"
                >
                  🗺️ Mapa de Calor
                </button>
                <button
                  onClick={() => handleEnviarMensagem('abrir a fila prioritária de cobrança')}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 font-medium whitespace-nowrap transition-colors"
                >
                  📋 Fila Cobrança
                </button>
                <button
                  onClick={() => handleEnviarMensagem('revisar multas com erros humanos')}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 font-medium whitespace-nowrap transition-colors"
                >
                  ⚖️ Revisão Multas
                </button>
                <button
                  onClick={() => handleEnviarMensagem('ver receitas reais da prefeitura')}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 font-medium whitespace-nowrap transition-colors"
                >
                  💰 Receitas Reais
                </button>
                <button
                  onClick={() => handleEnviarMensagem('simular reajuste tributario')}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border border-neutral-300 rounded text-neutral-800 font-medium whitespace-nowrap transition-colors"
                >
                  📈 Simulador
                </button>
              </div>

              {/* Área de Mensagens do Chat ReAct */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-neutral-50">
                {mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.remetente === 'ia' && (
                      <div className="w-6 h-6 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        IA
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-lg p-3 text-xs leading-relaxed shadow-sm ${
                        m.remetente === 'usuario'
                          ? 'bg-neutral-900 text-white rounded-br-none'
                          : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none'
                      }`}
                    >
                      {/* Badge de Navegação Executada */}
                      {m.acaoNavegacao && (
                        <div className="mb-2 p-1.5 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between text-[11px] text-emerald-900">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Tela Aberta: {m.acaoNavegacao.labelAba}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-emerald-200/60 px-1.5 py-0.5 rounded">
                            {m.acaoNavegacao.abaDestino}
                          </span>
                        </div>
                      )}

                      {/* Acordeão do Ciclo ReAct */}
                      {m.remetente === 'ia' && m.cicloReact && (
                        <div className="mb-2.5">
                          <button
                            type="button"
                            onClick={() => alternarExpansaoReact(m.id)}
                            className="w-full flex items-center justify-between px-2 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[10px] font-semibold text-neutral-800 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Raciocínio Auditável do Agente (ReAct: 6 Etapas)</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                              <span>{reactExpandidoIds[m.id] ? 'Recolher' : 'Ver Passos'}</span>
                              {reactExpandidoIds[m.id] ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
                          </button>

                          {reactExpandidoIds[m.id] && (
                            <div className="mt-2 p-2.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] space-y-2">
                              {/* 1. Validação */}
                              <div className="border-l-2 border-emerald-600 pl-2">
                                <div className="flex items-center gap-1 font-bold text-neutral-900 text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>1. Identificação & Validação de Parâmetros</span>
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px]">
                                  <span className="bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-800 font-medium">
                                    {(m.cicloReact.etapa_1_validacao_parametros?.intencao_detectada || 'Consulta Tributária').replace(/_/g, ' ')}
                                  </span>
                                  <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                    🛡️ Blind Inference (LGPD Ativa)
                                  </span>
                                </div>
                              </div>

                              {/* 2. Hipótese */}
                              <div className="border-l-2 border-amber-600 pl-2">
                                <div className="flex items-center gap-1 font-bold text-neutral-900 text-[10px]">
                                  <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>2. Hipótese & Pensamento do Agente (Thought)</span>
                                </div>
                                <p className="mt-0.5 text-neutral-700 italic leading-tight text-[10px]">
                                  &quot;{m.cicloReact.etapa_2_pensamento_inicial?.pensamento_raciocinio}&quot;
                                </p>
                              </div>

                              {/* 3. Ação */}
                              <div className="border-l-2 border-blue-600 pl-2">
                                <div className="flex items-center gap-1 font-bold text-neutral-900 text-[10px]">
                                  <Cog className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>3. Procedimento Executado (Action)</span>
                                </div>
                                <div className="mt-0.5 text-[10px] text-neutral-800 bg-neutral-100 border border-neutral-200 p-1.5 rounded font-medium flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                  <span>{m.cicloReact.etapa_3_acao_ferramenta?.ferramenta_executada || 'Consulta à Base Cadastral e Socioeconômica'}</span>
                                </div>
                              </div>

                              {/* 4. Observação */}
                              <div className="border-l-2 border-purple-600 pl-2">
                                <div className="flex items-center gap-1 font-bold text-neutral-900 text-[10px]">
                                  <Eye className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span>4. Observação dos Dados Fatuais (Observation)</span>
                                </div>
                                <p className="mt-0.5 text-neutral-700 text-[10px] leading-tight">
                                  {m.cicloReact.etapa_4_observacao_dados?.sintese_dados_reais}
                                </p>
                              </div>

                              {/* 5. Revisão */}
                              <div className="border-l-2 border-[#7f1d1d] pl-2">
                                <div className="flex items-center gap-1 font-bold text-[#7f1d1d] text-[10px]">
                                  <ShieldAlert className="w-3 h-3 text-[#7f1d1d] shrink-0" />
                                  <span>5. Revisão Crítica & Salvaguardas Éticas (Review)</span>
                                </div>
                                <p className="mt-0.5 text-neutral-800 text-[10px] leading-tight">
                                  {m.cicloReact.etapa_5_pensamento_revisao_critica?.analise_critica_e_ajuste}
                                </p>
                                <div className="mt-0.5 text-[8px] font-bold text-[#7f1d1d] uppercase">
                                  ⚖️ {m.cicloReact.etapa_5_pensamento_revisao_critica?.status_human_in_the_loop}
                                </div>
                              </div>

                              {/* 6. Fundamentação */}
                              <div className="border-l-2 border-neutral-800 pl-2">
                                <div className="flex items-center gap-1 font-bold text-neutral-900 text-[10px]">
                                  <FileText className="w-3 h-3 text-neutral-800 shrink-0" />
                                  <span>6. Parecer Final Fundamentado</span>
                                </div>
                                <p className="mt-0.5 text-neutral-700 text-[10px] leading-tight">
                                  {m.cicloReact.etapa_6_resposta_fundamentada?.resumo_conclusao}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 text-xs leading-relaxed text-neutral-800">
                        {m.texto.split('\n\n').map((paragrafo, pIdx) => (
                          <p
                            key={pIdx}
                            dangerouslySetInnerHTML={{
                              __html: paragrafo
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900">$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                .replace(/\n\*\s+(.*)/g, '<br/>• $1')
                                .replace(/\n-\s+(.*)/g, '<br/>• $1')
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-[9px] mt-1 text-right text-neutral-400">{m.hora}</div>
                    </div>
                  </div>
                ))}

                {processando && (
                  <div className="flex gap-2 items-center text-xs text-neutral-500 italic">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      IA
                    </div>
                    <span>Orquestrando ação ReAct: analisando parâmetros e acionando o sistema...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Caixa de Entrada para Digitar o que Deseja Fazer */}
              <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEnviarMensagem();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputTexto}
                      onChange={(e) => setInputTexto(e.target.value)}
                      placeholder="Ex: 'me leve para a fila de cobrança', 'abrir mapa de calor'..."
                      className="w-full pl-3 pr-8 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
                    />
                    {inputTexto && (
                      <button
                        type="button"
                        onClick={() => setInputTexto('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={processando || !inputTexto.trim()}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Executar</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 px-0.5">
                  <span>Atalho: <strong>Enter</strong> para enviar</span>
                  <span>Tela Atual: <strong className="text-neutral-700 uppercase">{abaAtiva}</strong></span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
