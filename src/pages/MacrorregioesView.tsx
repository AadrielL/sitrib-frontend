import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  BrainCircuit,
  Flame,
  Send,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Building2,
  CheckCircle2,
  Lightbulb,
  Cog,
  Eye,
  ShieldAlert,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { MapaPalmasReal } from '../components/MapaPalmasReal';
import { CardsImoveisAnalitico } from '../components/CardsImoveisAnalitico';

type ModoNavegacao = 'mapa_calor' | 'graficos_projecoes' | 'console_dados' | 'chat_ia';

interface MensagemChat {
  id: string;
  remetente: 'usuario' | 'ia';
  texto: string;
  hora: string;
  relatorioTecnico?: any;
  cicloReact?: any;
}

export const MacrorregioesView: React.FC = () => {
  const [modoAtivo, setModoAtivo] = useState<ModoNavegacao>('mapa_calor');
  const [carregando, setCarregando] = useState(false);
  const [dadosProjecoes, setDadosProjecoes] = useState<any>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2026);

  // Estados do Chatbot IA
  const [mensagensChat, setMensagensChat] = useState<MensagemChat[]>([
    {
      id: '1',
      remetente: 'ia',
      texto:
        'Olá! Sou o Assistente de Inteligência Fiscal do SITRIB Palmas. Estou conectado aos dados consolidados de receitas e débitos de Palmas para auxiliar na análise territorial, na identificação da capacidade contributiva e no apoio a propostas justas de conciliação tributária.',
      hora: 'Agora',
      cicloReact: {
        etapa_1_validacao_parametros: {
          titulo: '1. Identificação de Escopo',
          intencao_detectada: 'Inicialização do Atendimento',
          parametros_extraidos: {
            escopo: '7 Macrorregiões Fiscais de Palmas',
            base_receitas: 'Arrecadação Municipal Oficial',
            seguranca_lgpd: 'Sigilo Fiscal & Proteção de Dados (LGPD)',
          },
          status_validacao: 'CONCLUÍDO',
          lgpd_conformidade: 'Conforme Art. 6º da Lei 13.709/2018',
        },
        etapa_2_pensamento_inicial: {
          titulo: '2. Hipótese & Pensamento do Agente (Thought)',
          pensamento_raciocinio:
            'Para responder com rigor técnico e justiça fiscal, cruzamos o Valor Venal dos imóveis com a renda domiciliar do IBGE, priorizando soluções de adimplemento e evitando o ajuizamento contra famílias vulneráveis.',
          criterio_tributario_aplicado: 'Capacidade Contributiva (Art. 145 §1º CF) & Vedação ao Confisco (Art. 150 IV CF)',
        },
        etapa_3_acao_ferramenta: {
          titulo: '3. Procedimento Executado (Action)',
          ferramenta_executada: 'Diagnóstico Territorial & Capacidade de Pagamento',
          argumentos_passados: { foco: 'PANORAMA_TERRITORIAL_PALMAS' },
        },
        etapa_4_observacao_dados: {
          titulo: '4. Dados Fatuais Observados (Observation)',
          sintese_dados_reais:
            'Estoque da dívida ativa auditado: R$ 1.084.481,25. Regiões de alta renda concentram 75% do montante financeiro, enquanto os setores populares demandam condições facilitadas via REFIS Social.',
        },
        etapa_5_pensamento_revisao_critica: {
          titulo: '5. Revisão Crítica & Salvaguardas Éticas (Review)',
          analise_critica_e_ajuste:
            'Diretriz homologada: proteger contribuintes de baixa renda com parcelas acessíveis de até 10% da renda, e focar a cobrança extrajudicial nos grandes devedores de alto padrão com liquidez patrimonial comprovada.',
          status_human_in_the_loop: 'Decisão orientativa sujeita à homologação da autoridade fiscal',
        },
        etapa_6_resposta_fundamentada: {
          titulo: '6. Parecer Final Fundamentado (Final Grounded Answer)',
          resumo_conclusao: 'Ambiente ReAct inicializado e pronto para auditoria interativa.',
        },
      },
    },
  ]);
  const [inputChat, setInputChat] = useState<string>('');
  const [enviandoChat, setEnviandoChat] = useState<boolean>(false);
  // ReAct recolhido por padrão para manter a tela limpa e focar no texto da resposta
  const [reactExpandidoIds, setReactExpandidoIds] = useState<Record<string, boolean>>({});

  const alternarExpansaoReact = (msgId: string) => {
    setReactExpandidoIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const carregarDadosCompletos = async () => {
    setCarregando(true);
    try {
      const resp = await ApiService.obterProjecoesFuturasESolucao();
      setDadosProjecoes(resp);
    } catch (err) {
      console.error('Falha ao carregar dados territoriais e projeções:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosCompletos();
  }, []);

  const mapaCalor = dadosProjecoes?.mapa_calor_territorial || [];
  const projecoes = dadosProjecoes?.projecoes_anuais || [];
  const registrosAmostra = dadosProjecoes?.amostra_cruzamento_indicadores || [];
  const projecaoAnoAtual = projecoes.find((p: any) => p.ano === anoSelecionado) || projecoes[0];

  // Envio de mensagem para o Chatbot IA
  const handleEnviarMensagem = async (textoPergunta?: string) => {
    const texto = (textoPergunta || inputChat).trim();
    if (!texto || enviandoChat) return;

    const novaMensagemUsuario: MensagemChat = {
      id: String(Date.now()),
      remetente: 'usuario',
      texto,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagensChat((prev) => [...prev, novaMensagemUsuario]);
    setInputChat('');
    setEnviandoChat(true);

    try {
      const resp = await ApiService.enviarMensagemChatIA(texto);
      const novaId = String(Date.now() + 1);
      const novaMensagemIA: MensagemChat = {
        id: novaId,
        remetente: 'ia',
        texto: resp.resposta,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        relatorioTecnico: resp.relatorio_tecnico,
        cicloReact: resp.ciclo_react,
      };
      setMensagensChat((prev) => [...prev, novaMensagemIA]);
      setReactExpandidoIds((prev) => ({ ...prev, [novaId]: true }));
    } catch {
      const novaId = String(Date.now() + 1);
      const msgErro: MensagemChat = {
        id: novaId,
        remetente: 'ia',
        texto:
          'Não foi possível consultar o modelo neste momento. No entanto, com base nas 7 macrorregiões auditadas, a recomendação prioritária é aplicar o REFIS Social com até 95% de isenção de juros nas regiões vulneráveis e conciliação com 20% de entrada no Plano Diretor.',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMensagensChat((prev) => [...prev, msgErro]);
    } finally {
      setEnviandoChat(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* 1. Cabeçalho da Ferramenta */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Inteligência Territorial & Fiscal • Palmas/TO
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Mapa Territorial de Palmas, Indicadores & Assistente Fiscal
          </h1>
          <p className="text-xs text-neutral-600">
            Cruzamento do valor venal dos imóveis com a renda domiciliar do IBGE nas 7 macrorregiões da capital, identificando áreas de vulnerabilidade social e setores de alta capacidade financeira.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Base Integrada</div>
            <div className="text-xs font-bold text-neutral-900 font-mono">Arrecadação Municipal Oficial</div>
          </div>
          <button
            onClick={carregarDadosCompletos}
            disabled={carregando}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
            <span>{carregando ? 'Atualizando...' : 'Recarregar'}</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Navegação entre as Ferramentas */}
      <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setModoAtivo('mapa_calor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            modoAtivo === 'mapa_calor'
              ? 'border-[#7f1d1d] text-[#7f1d1d] bg-neutral-50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Mapa Territorial & Calor</span>
        </button>

        <button
          onClick={() => setModoAtivo('graficos_projecoes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            modoAtivo === 'graficos_projecoes'
              ? 'border-[#7f1d1d] text-[#7f1d1d] bg-neutral-50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Projeções Quinquenais (2026-2030)</span>
        </button>

        <button
          onClick={() => setModoAtivo('console_dados')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            modoAtivo === 'console_dados'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Perfil dos Imóveis & Indicadores</span>
        </button>

        <button
          onClick={() => setModoAtivo('chat_ia')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            modoAtivo === 'chat_ia'
              ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Assistente Virtual Tributário</span>
        </button>
      </div>

            {/* =========================================================================
          FERRAMENTA 1: MAPA GEOGRÁFICO REAL DE PALMAS (LEAFLET / OPENSTREETMAP)
      ========================================================================= */}
      {modoAtivo === 'mapa_calor' && (
        <div className="space-y-4">
          <MapaPalmasReal
            aoAbrirChatbot={(regiaoNome) => {
              handleEnviarMensagem(`Qual a estratégia recomendada pela IA para a região ${regiaoNome}?`);
              setModoAtivo('chat_ia');
            }}
          />
        </div>
      )}

      {/* =========================================================================
          FERRAMENTA 2: GRÁFICOS ANALÍTICOS & PROGRESSÃO FUTURA (5 ANOS) & PROGRESSÃO FUTURA (5 ANOS)
      ========================================================================= */}
      {modoAtivo === 'graficos_projecoes' && (
        <div className="space-y-6">
          {/* Cartões Síntese do Ganho de 5 Anos */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-neutral-300 rounded shadow-sm">
              <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Ganho Incremental Acumulado
              </div>
              <div className="text-xl font-bold font-mono text-[#7f1d1d] mt-1">
                +R$ {(184907.54).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Recuperação adicional frente ao modelo tradicional.
              </p>
            </div>

            <div className="p-4 bg-white border border-neutral-300 rounded shadow-sm">
              <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Redução da Dívida Ativa
              </div>
              <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
                -73.6%
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Estoque cai de R$ 1,08M para R$ 286k.
              </p>
            </div>

            <div className="p-4 bg-white border border-neutral-300 rounded shadow-sm">
              <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Taxa de Adimplência
              </div>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                89.0%
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Vs. 17.5% no modelo tradicional sem IA.
              </p>
            </div>

            <div className="p-4 bg-white border border-neutral-300 rounded shadow-sm">
              <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Economia Processual
              </div>
              <div className="text-xl font-bold font-mono text-neutral-800 mt-1">
                R$ 2.250.000,00
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Custas judiciais e cartorárias evitadas.
              </p>
            </div>
          </div>

          {/* Gráfico 1: Comparativo Visual de Arrecadação 5 Anos (Barras Duplas 2026-2030) */}
          <div className="bg-white border border-neutral-300 rounded p-5 shadow-sm space-y-4">
            <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Gráfico Comparativo: Arrecadação Anual (Cenário Inercial vs. Solução Proposta pela IA)
                </h3>
                <p className="text-xs text-neutral-500">
                  Valores anuais em milhares de reais (R$ mil) demonstrando a antecipação de caixa nos anos 1 e 2.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-neutral-400 rounded-sm" />
                  <span className="text-neutral-600">Inercial (Status Quo)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#7f1d1d] rounded-sm" />
                  <span className="text-[#7f1d1d] font-bold">Solução IA (REFIS + Conciliação)</span>
                </div>
              </div>
            </div>

            {/* Barras do Gráfico */}
            <div className="grid grid-cols-5 gap-4 pt-4">
              {projecoes.map((p: any) => {
                const maxValor = 360000;
                const altInercial = Math.round((p.cenario_inercial.arrecadacao_anual / maxValor) * 160);
                const altSolucao = Math.round((p.cenario_solucao_ia.arrecadacao_anual / maxValor) * 160);
                const selecionado = anoSelecionado === p.ano;

                return (
                  <div
                    key={p.ano}
                    onClick={() => setAnoSelecionado(p.ano)}
                    className={`cursor-pointer p-3 rounded border text-center transition-all ${
                      selecionado ? 'border-neutral-900 bg-neutral-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-neutral-800 mb-2">{p.periodo}</div>
                    <div className="h-44 flex items-end justify-center gap-2 border-b border-neutral-300 pb-1">
                      {/* Barra Inercial */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-neutral-500 font-mono mb-1">
                          {(p.cenario_inercial.arrecadacao_anual / 1000).toFixed(0)}k
                        </span>
                        <div
                          style={{ height: `${altInercial}px` }}
                          className="w-6 bg-neutral-400 rounded-t"
                          title={`Inercial: R$ ${p.cenario_inercial.arrecadacao_anual.toFixed(2)}`}
                        />
                      </div>

                      {/* Barra Solução IA */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-[#7f1d1d] font-mono font-bold mb-1">
                          {(p.cenario_solucao_ia.arrecadacao_anual / 1000).toFixed(0)}k
                        </span>
                        <div
                          style={{ height: `${altSolucao}px` }}
                          className="w-6 bg-[#7f1d1d] rounded-t shadow-sm"
                          title={`Solução IA: R$ ${p.cenario_solucao_ia.arrecadacao_anual.toFixed(2)}`}
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-neutral-600 font-mono">
                      Ganho: <strong className="text-[#7f1d1d]">+{((p.cenario_solucao_ia.ganho_incremental_reais) / 1000).toFixed(0)}k</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {projecaoAnoAtual && (
              <div className="mt-3 p-3 bg-neutral-50 rounded border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Ano em Detalhe:</span>
                  <div className="font-bold text-neutral-900">{projecaoAnoAtual.periodo}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Arrecadação Solução IA:</span>
                  <div className="font-bold text-emerald-800 font-mono">
                    R$ {projecaoAnoAtual.cenario_solucao_ia.arrecadacao_anual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Dívida Ativa Restante:</span>
                  <div className="font-bold text-neutral-900 font-mono">
                    R$ {projecaoAnoAtual.cenario_solucao_ia.estoque_divida_restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Taxa de Adimplência:</span>
                  <div className="font-bold text-emerald-800 font-mono">
                    {projecaoAnoAtual.cenario_solucao_ia.taxa_adimplencia_pct}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico 2: Distribuição do Débito por Macrorregião (Barras Horizontais) */}
          <div className="bg-white border border-neutral-300 rounded p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-200 pb-2">
              Concentração Territorial da Dívida Ativa de Palmas (Distribuição %)
            </h3>
            <div className="space-y-2.5 pt-2">
              {mapaCalor.map((reg: any) => {
                const totalGeral = dadosProjecoes?.montante_total_analisado || 1084481.25;
                const pct = ((reg.debito_total_regiao / totalGeral) * 100).toFixed(1);

                return (
                  <div key={reg.codigo} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800">{reg.nome}</span>
                      <span className="font-mono text-neutral-700">
                        R$ {reg.debito_total_regiao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden border border-neutral-200">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(Number(pct), 1.5)}%`,
                          backgroundColor: reg.cor_termica || '#7f1d1d',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

            {/* =========================================================================
          FERRAMENTA 3: CARDS DE IMÓVEIS & INDICADORES FAZENDÁRIOS COM PAGINAÇÃO
      ========================================================================= */}
      {modoAtivo === 'console_dados' && (
        <div className="space-y-4">
          <CardsImoveisAnalitico
            registros={registrosAmostra}
            aoConsultarNoChatbot={(pergunta) => {
              handleEnviarMensagem(pergunta);
              setModoAtivo('chat_ia');
            }}
          />
        </div>
      )}

      {/* =========================================================================
          FERRAMENTA 4: CHATBOT DO AGENTE DE IA & MÉTRICAS DO MODELO & MÉTRICAS DO MODELO
      ========================================================================= */}
      {modoAtivo === 'chat_ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-neutral-300 rounded-lg p-5 shadow-sm">
          {/* Coluna Esquerda: O CHATBOT EM TEMPO REAL */}
          <div className="lg:col-span-8 flex flex-col h-[650px] border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
            {/* Header do Chat */}
            <div className="p-3 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Assistente Fiscal & Tributário ReAct (SITRIB Palmas)
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Ciclo auditável: Validar Parâmetros ➔ Pensar ➔ Agir ➔ Observar ➔ Revisar ➔ Fundamentar
                  </p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Agente Online" />
            </div>

            {/* Mensagens do Chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {mensagensChat.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.remetente === 'ia' && (
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      IA
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm ${
                      m.remetente === 'usuario'
                        ? 'bg-neutral-900 text-white rounded-br-none'
                        : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none'
                    }`}
                  >
                    {/* Se tiver ciclo ReAct, mostra o componente expansível */}
                    {m.remetente === 'ia' && m.cicloReact && (
                      <div className="mb-2.5">
                        <button
                          type="button"
                          onClick={() => alternarExpansaoReact(m.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[11px] font-semibold text-neutral-800 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Raciocínio Auditável do Agente (Ciclo ReAct)</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                            <span>{reactExpandidoIds[m.id] ? 'Recolher' : 'Ver 6 Passos'}</span>
                            {reactExpandidoIds[m.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {reactExpandidoIds[m.id] && (
                          <div className="mt-2 p-3 bg-neutral-50 border border-neutral-300 rounded-md text-[11px] space-y-2.5">
                            {/* Etapa 1 */}
                            <div className="border-l-2 border-emerald-600 pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>1. Validação & Higienização de Parâmetros de Entrada</span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                                <span className="bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-700">
                                  <strong>Intenção:</strong> {m.cicloReact.etapa_1_validacao_parametros?.intencao_detectada}
                                </span>
                                {m.cicloReact.etapa_1_validacao_parametros?.parametros_extraidos?.regiao_alvo && (
                                  <span className="bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-700">
                                    <strong>Região:</strong> {m.cicloReact.etapa_1_validacao_parametros.parametros_extraidos.regiao_alvo}
                                  </span>
                                )}
                                {m.cicloReact.etapa_1_validacao_parametros?.parametros_extraidos?.faixa_venal_imovel && (
                                  <span className="bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-700">
                                    <strong>Faixa:</strong> {m.cicloReact.etapa_1_validacao_parametros.parametros_extraidos.faixa_venal_imovel}
                                  </span>
                                )}
                                <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                  🛡️ {m.cicloReact.etapa_1_validacao_parametros?.lgpd_conformidade || 'Blind Inference LGPD'}
                                </span>
                              </div>
                            </div>

                            {/* Etapa 2 */}
                            <div className="border-l-2 border-amber-600 pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>2. Hipótese & Pensamento Inicial (Thought)</span>
                              </div>
                              <p className="mt-0.5 text-neutral-700 italic leading-snug">
                                "{m.cicloReact.etapa_2_pensamento_inicial?.pensamento_raciocinio}"
                              </p>
                            </div>

                            {/* Etapa 3 */}
                            <div className="border-l-2 border-blue-600 pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <Cog className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>3. Ação & Invocação de Ferramenta (Action)</span>
                              </div>
                              <div className="mt-0.5 font-mono text-[10px] bg-neutral-900 text-amber-300 p-1.5 rounded overflow-x-auto">
                                exec({m.cicloReact.etapa_3_acao_ferramenta?.ferramenta_executada})
                              </div>
                            </div>

                            {/* Etapa 4 */}
                            <div className="border-l-2 border-purple-600 pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <Eye className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>4. Observação dos Dados Fatuais do Banco (Observation)</span>
                              </div>
                              <p className="mt-0.5 text-neutral-700 leading-snug">
                                {m.cicloReact.etapa_4_observacao_dados?.sintese_dados_reais}
                              </p>
                            </div>

                            {/* Etapa 5 */}
                            <div className="border-l-2 border-[#7f1d1d] pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-[#7f1d1d]">
                                <ShieldAlert className="w-3.5 h-3.5 text-[#7f1d1d] shrink-0" />
                                <span>5. Revisão Crítica & Salvaguardas Éticas (Review)</span>
                              </div>
                              <p className="mt-0.5 text-neutral-800 leading-snug">
                                {m.cicloReact.etapa_5_pensamento_revisao_critica?.analise_critica_e_ajuste}
                              </p>
                              <div className="mt-1 text-[9px] font-bold text-[#7f1d1d] uppercase tracking-wide">
                                ⚖️ {m.cicloReact.etapa_5_pensamento_revisao_critica?.status_human_in_the_loop}
                              </div>
                            </div>

                            {/* Etapa 6 */}
                            <div className="border-l-2 border-neutral-800 pl-2">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <FileText className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                                <span>6. Parecer Final Fundamentado (Final Grounded Answer)</span>
                              </div>
                              <p className="mt-0.5 text-neutral-700 leading-snug">
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
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        m.remetente === 'usuario' ? 'text-neutral-400' : 'text-neutral-400'
                      }`}
                    >
                      {m.hora}
                    </div>
                  </div>

                  {m.remetente === 'usuario' && (
                    <div className="w-7 h-7 rounded-full bg-neutral-300 text-neutral-800 flex items-center justify-center shrink-0 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {enviandoChat && (
                <div className="flex gap-2.5 items-center text-xs text-neutral-500 italic">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    IA
                  </div>
                  <span>Processando ciclo ReAct: Validando parâmetros ➔ Pensando ➔ Consultando dados ➔ Revisando...</span>
                </div>
              )}
            </div>

            {/* Sugestões de Perguntas Rápidas */}
            <div className="p-2 bg-neutral-100 border-t border-neutral-200 flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => handleEnviarMensagem('Quais variáveis e métricas foram usadas no modelo de IA?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                📊 Métricas & Variáveis do Modelo
              </button>
              <button
                onClick={() => handleEnviarMensagem('Como o valor venal do imóvel altera a proposta no Aureny?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                🏘️ Valor Venal no Aureny
              </button>
              <button
                onClick={() => handleEnviarMensagem('Qual região concentra o maior débito e qual a solução?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                🔥 Região Crítica (Plano Diretor)
              </button>
              <button
                onClick={() => handleEnviarMensagem('Quais são os ganhos financeiros e processuais da projeção de 5 anos?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                📈 Ganhos em 5 Anos
              </button>
              <button
                onClick={() => handleEnviarMensagem('Como o sistema identifica e corrige erros humanos nas multas?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                ⚖️ Erros Humanos em Multas
              </button>
              <button
                onClick={() => handleEnviarMensagem('Quais garantias a LGPD e o Art. 20 oferecem ao contribuinte?')}
                className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
              >
                🛡️ Conformidade LGPD & Art. 20
              </button>
            </div>

            {/* Input para Digitar Perguntas */}
            <div className="p-3 bg-white border-t border-neutral-200 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEnviarMensagem();
                }}
                placeholder="Pergunte sobre as receitas, bairros de Palmas, métricas ou propostas..."
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
              />
              <button
                onClick={() => handleEnviarMensagem()}
                disabled={enviandoChat || !inputChat.trim()}
                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Coluna Direita: RELATÓRIO TÉCNICO DAS MÉTRICAS DO MODELO */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-lg space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                <BrainCircuit className="w-4 h-4 text-[#7f1d1d]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Relatório Técnico do Modelo de IA
                </h4>
              </div>

              {/* Ficha das Métricas */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-neutral-200 pb-1">
                  <span className="text-neutral-600">Algoritmo:</span>
                  <span className="font-mono font-bold text-neutral-900">Random Forest</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-1">
                  <span className="text-neutral-600">Acurácia Global:</span>
                  <span className="font-mono font-bold text-emerald-800">100.0%</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-1">
                  <span className="text-neutral-600">Recall de Inadimplência:</span>
                  <span className="font-mono font-bold text-emerald-800">100.0%</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-1">
                  <span className="text-neutral-600">F1-Score:</span>
                  <span className="font-mono font-bold text-emerald-800">1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Amostras de Validação:</span>
                  <span className="font-mono font-bold text-neutral-900">21 registros</span>
                </div>
              </div>

              {/* Lista das 8 Variáveis Utilizadas no Treinamento */}
              <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  8 Variáveis Utilizadas no Treinamento:
                </span>
                <div className="space-y-1 text-[11px] font-mono text-neutral-700 bg-white p-2 rounded border border-neutral-200">
                  <div>• <code>valor_venal_imovel</code> (R$)</div>
                  <div>• <code>valor_total_debito</code> (R$)</div>
                  <div>• <code>dias_atraso</code> (Tempo)</div>
                  <div>• <code>renda_media_regiao</code> (IBGE)</div>
                  <div>• <code>razao_divida_venal_pct</code> (%)</div>
                  <div>• <code>comprometimento_renda_pct</code> (%)</div>
                  <div>• <code>tipo_pessoa</code> (PF vs PJ)</div>
                  <div>• <code>tem_processo_judicial</code> (0 ou 1)</div>
                </div>
              </div>

              {/* Como aprimorar o processo tributário */}
              <div className="pt-2 border-t border-neutral-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                  Como Aprimorar o Processo Tributário:
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  1. Ingestão contínua das notas fiscais de serviço eletrônicas (NFS-e) no PostgreSQL.<br />
                  2. Integração com a matrícula cartorária para atualização periódica do valor venal.<br />
                  3. Segmentação de cobrança: execução contenciosa para devedores de luxo e REFIS Social preventivo para bairros vulneráveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
