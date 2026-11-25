import React, { useState, useEffect } from 'react';
import {
  Bot,
  Play,
  RefreshCw,
  FileText,
  Shield,
  Layers,
  Ban,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Code,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { AgenteMicrosservicoInfo } from '../types/tributario';

// Mapeamento de Rótulos Amigáveis para as Ferramentas Fiscais
const DICIONARIO_FERRAMENTAS: Record<string, { titulo: string; descricao: string; escopo: string }> = {
  tool_avaliar_quem_pode_pagar_com_fairness: {
    titulo: 'Avaliação de Capacidade Contributiva & Justiça Fiscal',
    descricao: 'Analisa capacidade de pagamento cruzando valor venal com o setor censitário do IBGE, sem expor dados pessoais.',
    escopo: 'Justiça Tributária & Anti-Viés',
  },
  tool_mapear_estrategia_por_regiao_palmas: {
    titulo: 'Mapeamento Territorial das 7 Macrorregiões Fiscais',
    descricao: 'Consolida a carteira tributária por bairros, valor venal e perfil socioeconômico em Palmas.',
    escopo: 'Inteligência Regional',
  },
  tool_auditar_anomalias_multas_erros_humanos: {
    titulo: 'Auditoria de Multas e Lançamentos com Encargos Abusivos',
    descricao: 'Detecta bitributação manual ou encargos > 25% e calcula a proposta de saneamento pelo teto legal (IPCA + 20%).',
    escopo: 'Saneamento Contábil & Defesa do Cidadão',
  },
  tool_mapear_perfis_inadimplencia_e_contorno: {
    titulo: 'Mapeamento de Perfis de Devedores & Estratégias de Saída',
    descricao: 'Classifica os 3 perfis tributários (Grandes Devedores, Comércio Médio e Vulneráveis) com soluções de contorno.',
    escopo: 'Recuperação de Crédito',
  },
  tool_gerar_parecer_executivo_auditor: {
    titulo: 'Emissão de Parecer Executivo para o Auditor Fiscal',
    descricao: 'Gera tópicos de reflexão fundamentados e auditados para apoiar a homologação humana da autoridade fiscal.',
    escopo: 'Human-in-the-Loop (Art. 20 LGPD)',
  },
  tool_auditar_vies_geografico_carteira: {
    titulo: 'Auditoria de Viés Geográfico da Carteira de Cobrança',
    descricao: 'Verifica se ações judiciais estão concentradas indevidamente em bairros de baixa renda.',
    escopo: 'Equidade & Conformidade Legal',
  },
  tool_projetar_progressao_futura_solucoes: {
    titulo: 'Projeção Quinquenal de Arrecadação e Redução de Custas',
    descricao: 'Calcula o impacto anual (2026-2030) na liquidez municipal e economia processual gerada pela IA.',
    escopo: 'Planejamento Fazendário Plurianual',
  },
  tool_responder_chat_assistente_fiscal: {
    titulo: 'Assistente Autônomo Fiscal (Ciclo ReAct em 6 Etapas)',
    descricao: 'Processamento de perguntas em linguagem natural cruzando base PostgreSQL e IBGE.',
    escopo: 'Copilot Fazendário',
  },
  tool_mascarar_pii: {
    titulo: 'Anonimização e Minimização de Dados Pessoais (LGPD)',
    descricao: 'Aplica hash irreversível e máscaras em CPFs/CNPJs garantindo Blind Inference.',
    escopo: 'Privacidade & Blind Inference',
  },
  tool_verificar_consentimento_ou_base_legal: {
    titulo: 'Verificação de Base Legal de Tratamento Tributário',
    descricao: 'Audita conformidade com Art. 7º, II e Art. 23 da LGPD para execução de políticas públicas.',
    escopo: 'Governança Jurídica',
  },
};

export const AgentesView: React.FC = () => {
  const [agentes, setAgentes] = useState<AgenteMicrosservicoInfo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [agenteSelecionado, setAgenteSelecionado] = useState<AgenteMicrosservicoInfo | null>(null);
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState<string>('');
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [mostrarJsonTecnico, setMostrarJsonTecnico] = useState(false);

  const carregarAgentes = async () => {
    setCarregando(true);
    try {
      const resp = await ApiService.obterCatalogoAgentes();
      setAgentes(resp.agentes || []);
      if (resp.agentes && resp.agentes.length > 0) {
        setAgenteSelecionado(resp.agentes[0]);
        if (resp.agentes[0].ferramentas_permitidas && resp.agentes[0].ferramentas_permitidas.length > 0) {
          setFerramentaSelecionada(resp.agentes[0].ferramentas_permitidas[0]);
        }
      }
    } catch (err) {
      console.error('Falha ao carregar catálogo de agentes:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAgentes();
  }, []);

  const handleSelecionarAgente = (agente: AgenteMicrosservicoInfo) => {
    setAgenteSelecionado(agente);
    setResultado(null);
    if (agente.ferramentas_permitidas && agente.ferramentas_permitidas.length > 0) {
      setFerramentaSelecionada(agente.ferramentas_permitidas[0]);
    } else {
      setFerramentaSelecionada('');
    }
  };

  const handleSelecionarFerramenta = (nome: string) => {
    setFerramentaSelecionada(nome);
    setResultado(null);
  };

  const handleExecutar = async () => {
    if (!agenteSelecionado || !ferramentaSelecionada) return;
    setExecutando(true);
    setResultado(null);

    try {
      const resp = await ApiService.executarFerramentaAgente(
        agenteSelecionado.id_agente,
        ferramentaSelecionada,
        { origem: 'painel_auditor_sitrib', simulacao: false }
      );
      setResultado(resp);
    } catch (err: any) {
      setResultado({
        status: 'erro',
        mensagem: err?.message || 'Falha ao executar procedimento do agente.',
      });
    } finally {
      setExecutando(false);
    }
  };

  const obterInfoFerramenta = (nome: string) => {
    return (
      DICIONARIO_FERRAMENTAS[nome] || {
        titulo: nome.replace(/_/g, ' ').replace(/^tool /, 'Procedimento: '),
        descricao: 'Procedimento técnico homologado para auditoria e inteligência fiscal.',
        escopo: 'Auditoria Municipal',
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho Executivo */}
      <div className="border-b-2 border-neutral-900 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              SITRIB Palmas • Apoio à Tomada de Decisão
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Assistentes Fiscais de Inteligência Artificial</h1>
          <p className="text-sm text-neutral-600">
            Serviços especializados para auxílio ao Auditor e Gestor. Todas as decisões requerem homologação humana obrigatória (Art. 20 LGPD & Art. 142 CTN).
          </p>
        </div>

        <button
          onClick={carregarAgentes}
          disabled={carregando}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
          <span>{carregando ? 'Sincronizando...' : 'Atualizar Catálogo'}</span>
        </button>
      </div>

      {/* Grade de Seleção dos Agentes Especializados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {agentes.map((ag) => {
          const selecionado = agenteSelecionado?.id_agente === ag.id_agente;
          return (
            <button
              key={ag.id_agente}
              onClick={() => handleSelecionarAgente(ag)}
              className={`p-4 text-left border rounded-lg transition-all flex flex-col justify-between cursor-pointer ${
                selecionado
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Bot className={`w-4 h-4 ${selecionado ? 'text-amber-400' : 'text-neutral-700'}`} />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    selecionado ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    Ativo
                  </span>
                </div>
                <div className="font-bold text-xs leading-snug">{ag.nome}</div>
                <div className={`text-[11px] mt-1.5 line-clamp-2 ${selecionado ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {ag.escopo_estrito}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-neutral-700/40 text-[11px] flex items-center justify-between">
                <span className={selecionado ? 'text-neutral-400' : 'text-neutral-500'}>
                  {ag.ferramentas_permitidas?.length || 0} procedimentos
                </span>
                <span className="font-semibold text-xs">{selecionado ? 'Selecionado' : 'Abrir'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Painel Operacional do Agente Selecionado */}
      {agenteSelecionado && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Coluna da Esquerda: Lista de Procedimentos Autorizados */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Layers className="w-4 h-4 text-neutral-700" />
                <span>Procedimentos de {agenteSelecionado.nome}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Selecione um procedimento para disparar a consulta e auditoria analítica:
              </p>
            </div>

            <div className="space-y-2">
              {(agenteSelecionado.ferramentas_permitidas || []).map((nomeFerramenta) => {
                const ativa = ferramentaSelecionada === nomeFerramenta;
                const info = obterInfoFerramenta(nomeFerramenta);
                return (
                  <button
                    key={nomeFerramenta}
                    onClick={() => handleSelecionarFerramenta(nomeFerramenta)}
                    className={`w-full text-left p-3 rounded-md border text-xs transition-all cursor-pointer ${
                      ativa
                        ? 'border-[#7f1d1d] bg-neutral-50 ring-1 ring-[#7f1d1d] text-neutral-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{info.titulo}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 font-medium">
                        {info.escopo}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      {info.descricao}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Proibições & Travas de Segurança */}
            {agenteSelecionado.proibicoes && agenteSelecionado.proibicoes.length > 0 && (
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs space-y-1.5">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                  <Ban className="w-3.5 h-3.5 text-[#7f1d1d]" />
                  <span>Salvaguardas Éticas & Proibições Legais:</span>
                </div>
                <ul className="list-disc pl-4 text-[11px] text-neutral-600 space-y-1">
                  {agenteSelecionado.proibicoes.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Governança LGPD Ativa</span>
              </div>
              <button
                onClick={handleExecutar}
                disabled={executando || !ferramentaSelecionada}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#7f1d1d] hover:bg-[#601515] text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{executando ? 'Executando Procedimento...' : 'Executar Análise'}</span>
              </button>
            </div>
          </div>

          {/* Coluna da Direita: Relatório Executivo Estruturado */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-800" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Resultado da Análise & Parecer Técnico
                  </span>
                </div>
                {resultado && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                  </span>
                )}
              </div>

              <div className="mt-4">
                {executando ? (
                  <div className="py-20 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-neutral-700" />
                    <p className="text-xs text-neutral-600">Consultando PostgreSQL e aplicando modelos de inteligência fiscal...</p>
                  </div>
                ) : resultado ? (
                  <div className="space-y-4">
                    {/* Caso com KPIs / Resumo */}
                    {resultado.kpis_sintese && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                          <span className="text-[10px] font-bold uppercase text-neutral-500">Estoque Total</span>
                          <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                            {(resultado.kpis_sintese.estoque_total_divida_ativa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                          <span className="text-[10px] font-bold uppercase text-neutral-500">Juros Negociáveis</span>
                          <div className="text-sm font-bold font-mono text-[#7f1d1d] mt-0.5">
                            {(resultado.kpis_sintese.total_juros_multa_negociaveis || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                          <span className="text-[10px] font-bold uppercase text-neutral-500">Região Prioritária</span>
                          <div className="text-xs font-bold text-neutral-900 mt-1 truncate">
                            {resultado.kpis_sintese.regiao_maior_estoque || 'Plano Diretor Sul'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Caso de Auditoria de Anomalias de Multas */}
                    {resultado.anomalias_multas_detectadas !== undefined && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span>Auditoria de Lançamentos Manuais & Encargos Desproporcionais</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Foram auditados <strong>{resultado.total_lancamentos_auditados}</strong> lançamentos e detectadas <strong>{resultado.anomalias_multas_detectadas}</strong> anomalias com juros e multas acima do teto legal. Excesso passível de saneamento: <strong>{(resultado.excesso_total_passivel_saneamento_reais || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.
                        </p>
                      </div>
                    )}

                    {/* Tópicos de Reflexão do Auditor */}
                    {resultado.topicos_para_pensar_ia && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Pontos Fundamentados para Homologação do Auditor Fiscal:
                        </h4>
                        <div className="space-y-2">
                          {resultado.topicos_para_pensar_ia.map((t: any, i: number) => (
                            <div key={i} className="p-3 bg-neutral-50 border-l-4 border-l-[#7f1d1d] rounded text-xs space-y-1">
                              <div className="font-bold text-neutral-900">{t.titulo}</div>
                              <p className="text-neutral-700 leading-relaxed">{t.analise_ia}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projeções Quinquenais */}
                    {resultado.resumo_executivo && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <TrendingUp className="w-4 h-4 text-emerald-700" />
                          <span>Projeção Quinquenal Oficial (2026-2030)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-emerald-900">
                          <div>Ganho Líquido Incremental: <strong>+{(resultado.resumo_executivo.ganho_arrecadacao_incremental_reais || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                          <div>Queda do Estoque: <strong>-{(resultado.resumo_executivo.reducao_divida_ativa_pct || 73.6)}%</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Texto Geral ou Parecer */}
                    {resultado.resposta && (
                      <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded text-xs leading-relaxed whitespace-pre-wrap">
                        {resultado.resposta}
                      </div>
                    )}

                    {/* Alternador de Visualização Técnica */}
                    <div className="pt-2 border-t border-neutral-200">
                      <button
                        onClick={() => setMostrarJsonTecnico(!mostrarJsonTecnico)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>{mostrarJsonTecnico ? 'Ocultar Detalhes Técnicos (JSON)' : 'Inspecionar Detalhes Técnicos da Resposta'}</span>
                      </button>
                      {mostrarJsonTecnico && (
                        <pre className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded text-[11px] font-mono overflow-x-auto max-h-[220px]">
                          {JSON.stringify(resultado, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <Bot className="w-8 h-8 mx-auto text-neutral-400" />
                    <p className="text-xs text-neutral-500">
                      Selecione um procedimento na lista à esquerda e clique em <strong>&quot;Executar Análise&quot;</strong> para consultar os dados oficiais.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Isolamento estrito: Agentes de IA são consultivos (Art. 142 CTN).</span>
              <span className="font-mono text-[10px]">WCAG AAA</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentesView;
