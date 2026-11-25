import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Bot,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lock,
  Sparkles,
  MapPin,
  Handshake,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type {
  ConsultaReceitasPrefeituraResponse,
  AgenteMicrosservicoInfo,
  AvaliacaoCapacidadeFairnessResponse,
} from '../types/tributario';

export const TransparenciaAgentesView: React.FC = () => {
  // Estado do Painel 1: Receitas Reais da Prefeitura no PostgreSQL (182.808+ registros)
  const [dadosReceitas, setDadosReceitas] = useState<ConsultaReceitasPrefeituraResponse | null>(null);
  const [carregandoReceitas, setCarregandoReceitas] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [buscaTributo, setBuscaTributo] = useState<string>('');
  const [nivelHierarquico, setNivelHierarquico] = useState<number | undefined>(undefined);
  const [apenasRaiz, setApenasRaiz] = useState<boolean>(false);

  // Estado do Painel 2: Catálogo dos 4 Agentes Estritos por Microsserviço
  const [agentes, setAgentes] = useState<AgenteMicrosservicoInfo[]>([]);
  const [resultadoAgente, setResultadoAgente] = useState<any>(null);
  const [agenteExecutando, setAgenteExecutando] = useState<string | null>(null);

  // Estado do Painel 3: Avaliador "Quem Pode vs. Quem Não Pode Pagar" + Anti-Viés (Fairness & LGPD)
  const [valorDebito, setValorDebito] = useState<number>(2800);
  const [diasAtraso, setDiasAtraso] = useState<number>(480);
  const [tipoTributo, setTipoTributo] = useState<'IPTU' | 'ISS' | 'TAXA_LIXO'>('IPTU');
  const [tipoPessoa, setTipoPessoa] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const [bairro, setBairro] = useState<string>('Jardim Aureny III');
  const [qtdImoveis, setQtdImoveis] = useState<number>(1);
  const [avaliacaoFairness, setAvaliacaoFairness] = useState<AvaliacaoCapacidadeFairnessResponse | null>(null);
  const [avaliandoFairness, setAvaliandoFairness] = useState(false);

  // Estado do Painel Regional & Melhores Formas de Negociação em Palmas
  const [analiseRegional, setAnaliseRegional] = useState<any>(null);
  const [tributoRegional, setTributoRegional] = useState<string>('TODOS');
  const [auditoriaMultasPerfis, setAuditoriaMultasPerfis] = useState<any>(null);
  const [casosHomologados, setCasosHomologados] = useState<Record<string, string>>({});

  const carregarReceitas = async (
    pag = pagina,
    termo = buscaTributo,
    niv = nivelHierarquico,
    raiz = apenasRaiz
  ) => {
    setCarregandoReceitas(true);
    try {
      const resp = await ApiService.consultarReceitasPrefeitura({
        page: pag,
        page_size: 12,
        busca: termo || undefined,
        nivel_hierarquico: niv,
        apenas_raiz_sem_dupla_contagem: raiz,
      });
      setDadosReceitas(resp);
    } catch (err) {
      console.error('Erro ao consultar receitas no PostgreSQL:', err);
    } finally {
      setCarregandoReceitas(false);
    }
  };

  const carregarCatalogoAgentes = async () => {
    try {
      const cat = await ApiService.obterCatalogoAgentes();
      setAgentes(cat.agentes);
    } catch (err) {
      console.error('Erro ao carregar catálogo de agentes:', err);
    }
  };

  const executarAvaliacaoFairness = async (
    override?: Partial<{
      valor_debito: number;
      dias_atraso: number;
      tipo_tributo: 'IPTU' | 'ISS' | 'TAXA_LIXO';
      tipo_pessoa: 'FISICA' | 'JURIDICA';
      bairro: string;
      quantidade_imoveis: number;
    }>
  ) => {
    setAvaliandoFairness(true);
    try {
      const payload = {
        valor_debito: override?.valor_debito ?? valorDebito,
        dias_atraso: override?.dias_atraso ?? diasAtraso,
        tipo_tributo: override?.tipo_tributo ?? tipoTributo,
        tipo_pessoa: override?.tipo_pessoa ?? tipoPessoa,
        bairro: override?.bairro ?? bairro,
        quantidade_imoveis: override?.quantidade_imoveis ?? qtdImoveis,
      };
      const resp = await ApiService.avaliarCapacidadeFairness(payload);
      setAvaliacaoFairness(resp);
    } catch (err) {
      console.error('Erro na avaliação de capacidade/fairness:', err);
    } finally {
      setAvaliandoFairness(false);
    }
  };

  useEffect(() => {
    carregarReceitas(1, buscaTributo, nivelHierarquico, apenasRaiz);
  }, [buscaTributo, nivelHierarquico, apenasRaiz]);

  useEffect(() => {
    carregarCatalogoAgentes();
    executarAvaliacaoFairness();
    ApiService.obterAnaliseRegionalPalmas('TODOS').then(setAnaliseRegional).catch(console.error);
    ApiService.obterAuditoriaMultasEPerfis().then(setAuditoriaMultasPerfis).catch(console.error);
  }, []);

  const handleFiltrarTributoRegional = async (trib: string) => {
    setTributoRegional(trib);
    try {
      const res = await ApiService.obterAnaliseRegionalPalmas(trib);
      setAnaliseRegional(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMudarPagina = (novaPag: number) => {
    setPagina(novaPag);
    carregarReceitas(novaPag, buscaTributo, nivelHierarquico, apenasRaiz);
  };

  const handleDispararFerramentaAgente = async (id_agente: string, ferramenta: string) => {
    setAgenteExecutando(`${id_agente}:${ferramenta}`);
    try {
      let params: Record<string, any> = {};
      if (ferramenta === 'tool_extrair_prioridades_heap') {
        params = { tipo_tributo: 'TODOS', faixa_devedor: 'todos', limite: 5, mascarar_dados_lgpd: true };
      } else if (ferramenta === 'tool_auditar_arrecadacao_real_prefeitura') {
        params = { termo_tributo: 'ISS', limite: 5 };
      } else if (ferramenta === 'tool_avaliar_quem_pode_pagar_com_fairness') {
        params = {
          valor_debito: valorDebito,
          dias_atraso: diasAtraso,
          tipo_tributo: tipoTributo,
          tipo_pessoa: tipoPessoa,
          bairro,
          quantidade_imoveis: qtdImoveis,
        };
      }
      const res = await ApiService.executarFerramentaAgente(id_agente, ferramenta, params);
      setResultadoAgente(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAgenteExecutando(null);
    }
  };

  const aplicarCenarioPreset = (cenario: 'vulneravel' | 'grande_devedor' | 'moderado') => {
    if (cenario === 'vulneravel') {
      setValorDebito(2400);
      setDiasAtraso(490);
      setTipoTributo('IPTU');
      setTipoPessoa('FISICA');
      setBairro('Jardim Aureny III');
      setQtdImoveis(1);
      executarAvaliacaoFairness({
        valor_debito: 2400,
        dias_atraso: 490,
        tipo_tributo: 'IPTU',
        tipo_pessoa: 'FISICA',
        bairro: 'Jardim Aureny III',
        quantidade_imoveis: 1,
      });
    } else if (cenario === 'grande_devedor') {
      setValorDebito(185000);
      setDiasAtraso(720);
      setTipoTributo('ISS');
      setTipoPessoa('JURIDICA');
      setBairro('Plano Diretor Sul');
      setQtdImoveis(4);
      executarAvaliacaoFairness({
        valor_debito: 185000,
        dias_atraso: 720,
        tipo_tributo: 'ISS',
        tipo_pessoa: 'JURIDICA',
        bairro: 'Plano Diretor Sul',
        quantidade_imoveis: 4,
      });
    } else {
      setValorDebito(6800);
      setDiasAtraso(210);
      setTipoTributo('IPTU');
      setTipoPessoa('FISICA');
      setBairro('Plano Diretor Norte');
      setQtdImoveis(1);
      executarAvaliacaoFairness({
        valor_debito: 6800,
        dias_atraso: 210,
        tipo_tributo: 'IPTU',
        tipo_pessoa: 'FISICA',
        bairro: 'Plano Diretor Norte',
        quantidade_imoveis: 1,
      });
    }
  };

  const audit54 = dadosReceitas?.auditoria_hierarquia_armadilha_5_4;

  return (
    <div className="space-y-8">
      {/* Cabeçalho Institucional da Nova Aba */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PostgreSQL 16+ Oficial
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                API Prefeitura Palmas (182.808+ Registros)
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                4 Microsserviços & Agentes Estritos (LGPD + Fairness)
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Central de Transparência Tributária, Capacidade Contributiva & Agentes IA
            </h2>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              Concilia a base real de arrecadação pública da Prefeitura de Palmas (<strong>IPTU, ISSQN, ITBI e FPM</strong> no PostgreSQL sem CPF por proteção da LGPD) com o <strong>Modelo de Capacidade Contributiva (&ldquo;Quem Pode vs. Quem Não Pode Pagar&rdquo;)</strong> e os <strong>4 Agentes Estritos por Microsserviço</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================
          PAINEL 1: AVALIADOR "QUEM PODE VS. QUEM NÃO PODE PAGAR" + FAIRNESS & LGPD
         ======================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Microsserviço 4 (src/apis/ia_predicao_api) • Agente de Capacidade Contributiva & Fairness</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Diagnóstico Fiscal: Quem Pode Pagar vs. Quem Não Pode Pagar (Com Mitigação de Viés e LGPD)
            </h3>
            <p className="text-xs text-slate-500">
              Opera com <strong>Inferência Cega a Dados Pessoais (Blind Inference — zero CPF/Nome)</strong> e cruza o modelo Random Forest com a renda média do setor no IBGE Palmas para evitar execuções judiciais injustas contra famílias vulneráveis.
            </p>
          </div>

          {/* Botões rápidos de cenário para demonstração na apresentação da banca */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => aplicarCenarioPreset('vulneravel')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
            >
              🟢 Cenário 1: Família Vulnerável (Fairness)
            </button>
            <button
              onClick={() => aplicarCenarioPreset('moderado')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
            >
              🟡 Cenário 2: Contribuinte Médio (REFIS)
            </button>
            <button
              onClick={() => aplicarCenarioPreset('grande_devedor')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition"
            >
              🔴 Cenário 3: Grande Devedor ISSQN (Ajuizar)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Estrito (Sem CPF/Nome - Blind Inference) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Parâmetros Estritos do Agente (Zero PII)
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                CPF/Nome Bloqueados na IA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tributo Municipal</label>
                <select
                  value={tipoTributo}
                  onChange={(e: any) => setTipoTributo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="IPTU">IPTU (Patrimonial Urbano)</option>
                  <option value="ISS">ISSQN (Prestação de Serviços)</option>
                  <option value="TAXA_LIXO">Taxa de Coleta de Lixo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Natureza Jurídica</label>
                <select
                  value={tipoPessoa}
                  onChange={(e: any) => setTipoPessoa(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="FISICA">Pessoa Física (Cidadão)</option>
                  <option value="JURIDICA">Pessoa Jurídica (Empresa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Valor do Débito (R$)</label>
                <input
                  type="number"
                  value={valorDebito}
                  onChange={(e) => setValorDebito(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Dias em Atraso</label>
                <input
                  type="number"
                  value={diasAtraso}
                  onChange={(e) => setDiasAtraso(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Setor / Bairro (IBGE)</label>
                <select
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Jardim Aureny III">Jardim Aureny III (Renda R$ 2.050)</option>
                  <option value="Taquaralto">Taquaralto (Renda R$ 2.350)</option>
                  <option value="Morada do Sol">Morada do Sol (Renda R$ 1.980)</option>
                  <option value="Plano Diretor Norte">Plano Diretor Norte (Renda R$ 4.800)</option>
                  <option value="Plano Diretor Sul">Plano Diretor Sul (Renda R$ 5.400)</option>
                  <option value="Orla 14">Orla 14 / Graciosa (Renda R$ 6.800)</option>
                  <option value="Distrito Industrial">Distrito Industrial (Renda R$ 5.900)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Qtd. Imóveis (CCI)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={qtdImoveis}
                  onChange={(e) => setQtdImoveis(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => executarAvaliacaoFairness()}
              disabled={avaliandoFairness}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {avaliandoFairness ? 'Consultando Agente & Modelo...' : 'Executar Diagnóstico de Capacidade & Fairness'}
            </button>
          </div>

          {/* Resultado do Diagnóstico + Parecer Ético de Viés e LGPD */}
          <div className="lg:col-span-7 space-y-4">
            {avaliacaoFairness && (
              <>
                <div
                  className={`p-5 rounded-xl border-2 ${
                    avaliacaoFairness.diagnostico_capacidade_contributiva.status_codigo === 'VULNERABILIDADE_PROTEGIDA'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : avaliacaoFairness.diagnostico_capacidade_contributiva.status_codigo === 'ALTA_CAPACIDADE'
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Parecer do Agente 4 ({avaliacaoFairness.microsservico})
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        avaliacaoFairness.diagnostico_capacidade_contributiva.pode_pagar
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                      }`}
                    >
                      {avaliacaoFairness.diagnostico_capacidade_contributiva.pode_pagar ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Possui Capacidade Contributiva
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> Vulnerabilidade Protegida (Fairness)
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">
                    {avaliacaoFairness.diagnostico_capacidade_contributiva.classificacao}
                  </h4>

                  <p className="mt-2 text-xs text-slate-800 font-medium bg-white/80 p-3 rounded-lg border border-slate-200">
                    <strong>Ação Recomendada à SEFIN:</strong>{' '}
                    {avaliacaoFairness.diagnostico_capacidade_contributiva.instrumento_fiscal_recomendado}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-500">Renda Média Setor (IBGE)</div>
                      <div className="font-bold font-mono text-slate-900">
                        {avaliacaoFairness.diagnostico_capacidade_contributiva.renda_media_setor_ibge.toLocaleString(
                          'pt-BR',
                          { style: 'currency', currency: 'BRL' }
                        )}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-500">Comprometimento Renda (12x)</div>
                      <div className="font-bold font-mono text-slate-900">
                        {avaliacaoFairness.diagnostico_capacidade_contributiva.indice_comprometimento_renda_12x_pct}% / mês
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-500">Recuperabilidade (ML)</div>
                      <div className="font-bold text-slate-900">
                        {avaliacaoFairness.predicao_machine_learning?.faixa_recuperabilidade || 'Média'} (
                        {avaliacaoFairness.predicao_machine_learning?.probabilidade_recuperacao || '50%'})
                      </div>
                    </div>
                  </div>

                  {/* Proposta Ótima de Negociação Calculada pela IA + Texto para Pensar */}
                  {(avaliacaoFairness as any).plano_negociacao_recomendado && (
                    <div className="mt-3 bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <Handshake className="w-4 h-4 text-emerald-600" />
                          Melhor Forma de Negociação Calculada pela IA:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          Desconto Juros/Multa: {(avaliacaoFairness as any).plano_negociacao_recomendado.desconto_juros_multa_recomendado_pct}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Valor Final Acordo</div>
                          <div className="font-bold font-mono text-slate-900">
                            {Number((avaliacaoFairness as any).plano_negociacao_recomendado.valor_final_acordo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Entrada Sugerida</div>
                          <div className="font-bold font-mono text-slate-900">
                            {Number((avaliacaoFairness as any).plano_negociacao_recomendado.valor_entrada).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({(avaliacaoFairness as any).plano_negociacao_recomendado.entrada_sugerida_pct}%)
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Plano de Parcelas</div>
                          <div className="font-bold font-mono text-emerald-700">
                            {(avaliacaoFairness as any).plano_negociacao_recomendado.numero_parcelas_recomendado}x de {Number((avaliacaoFairness as any).plano_negociacao_recomendado.valor_parcela_mensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Teto Ético Regional</div>
                          <div className="font-bold font-mono text-slate-700">
                            Até {Number((avaliacaoFairness as any).plano_negociacao_recomendado.teto_parcela_etica_regiao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                          </div>
                        </div>
                      </div>
                      {(avaliacaoFairness as any).texto_reflexao_auditor_ia && (
                        <p className="text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 leading-relaxed">
                          {(avaliacaoFairness as any).texto_reflexao_auditor_ia}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bloco de Auditoria de Viés Algorítmico (Fairness) e LGPD */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Relatório de Impacto Algorítmico (Fairness) & Conformidade LGPD
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      Blind Inference: Ativo
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {avaliacaoFairness.auditoria_vies_e_lgpd.parecer_etico_fairness}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>
                      <strong>PII Exposto:</strong> {avaliacaoFairness.auditoria_vies_e_lgpd.dados_pessoais_expostos}
                    </span>
                    <span>
                      <strong>Base Legal:</strong> {avaliacaoFairness.auditoria_vies_e_lgpd.fundamento_legal}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================
          PAINEL 1.5: CATEGORIZAÇÃO POR MACRORREGIÃO DE PALMAS & MELHORES NEGOCIAÇÕES
         ======================================================================== */}
      {analiseRegional && analiseRegional.regioes && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Inteligência Geográfica & Negociação • 7 Macrorregiões Fiscais de Palmas/TO</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Soluções por Região, Cruzamento de Colunas Fiscais e Melhor Forma de Negociação
              </h3>
              <p className="text-xs text-slate-500">
                Cruza <code>imovel.bairro</code>, <code>imovel.valor_venal</code>, <code>divida.valor_original</code>, <code>divida.juros_multa</code> e <code>ibge.renda_media</code> para recomendar o acordo ideal e gerar insights estratégicos para o auditor.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {['TODOS', 'IPTU', 'ISS', 'TAXA_LIXO'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleFiltrarTributoRegional(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    tributoRegional === t
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {t === 'TODOS' ? 'Todos Tributos' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analiseRegional.regioes
              .filter((reg: any) => reg.quantidade_debitos > 0)
              .map((reg: any) => {
                const isVulneravel = reg.vulnerabilidade === 'ALTA' || reg.vulnerabilidade === 'MEDIA_ALTA';
                return (
                  <div
                    key={reg.codigo_regiao}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isVulneravel
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-indigo-700">
                          {reg.perfil_socioeconomico}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{reg.nome_regiao}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVulneravel
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        Renda IBGE: R$ {Number(reg.renda_media_ibge).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {/* Métricas cruzadas das colunas do banco */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Estoque Dívida</div>
                        <div className="font-bold font-mono text-slate-900">
                          {Number(reg.soma_valor_atualizado).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Dívida / Valor Venal</div>
                        <div className="font-bold font-mono text-slate-900">
                          {reg.relacao_divida_valor_venal_pct}% ({reg.tributo_predominante})
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Peso Juros/Multa</div>
                        <div className="font-bold font-mono text-amber-700">
                          {reg.peso_juros_na_divida_pct}% do total
                        </div>
                      </div>
                    </div>

                    {/* Melhor Forma de Negociação da Região */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>🤝 {reg.melhor_estrategia_negociacao.modalidade_negociacao}</span>
                        <span className="text-emerald-700 font-mono">
                          -{reg.melhor_estrategia_negociacao.desconto_juros_multa_recomendado_pct}% Juros
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Acordo Padrão:</strong> Entrada de{' '}
                        {reg.melhor_estrategia_negociacao.entrada_sugerida_pct}% +{' '}
                        <strong>
                          {reg.melhor_estrategia_negociacao.numero_parcelas_recomendado}x de{' '}
                          {Number(reg.melhor_estrategia_negociacao.valor_parcela_mensal).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </strong>{' '}
                        • Canal: {reg.melhor_estrategia_negociacao.canal_abordagem_recomendado}
                      </div>
                    </div>

                    {/* Texto para Pensar da IA específico daquela Região */}
                    <div className="text-xs text-slate-700 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 leading-relaxed">
                      <strong>🧠 Reflexão da IA para o Auditor:</strong> {reg.texto_pensamento_ia_regiao}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================
          PAINEL 1.8: AUDITORIA DE ERROS HUMANOS EM MULTAS (REVISÃO HUMANA) & PERFIS DE CONTORNO
         ======================================================================== */}
      {auditoriaMultasPerfis && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Human-in-the-Loop (Art. 20 LGPD & Art. 142 CTN) • Saneamento de Multas & Perfis de Inadimplência</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Auditoria de Multas Tributárias Desproporcionais / Erros Humanos de Cálculo & Perfis que Mais Devem
            </h3>
            <p className="text-xs text-slate-500">
              {auditoriaMultasPerfis.auditoria_multas?.governanca_human_in_the_loop}
            </p>
          </div>

          {/* 1. Perfis que Tendem a Dever Mais e Maneiras de Contornar */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Perfis que Tendem a Dever Mais em Palmas & Maneiras Práticas de Contornar (Saída Fiscal):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(auditoriaMultasPerfis.perfis_e_contorno?.perfis_inadimplencia || []).map((p: any) => (
                <div
                  key={p.perfil_id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                      {p.participacao_estoque_divida}
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-sm">{p.titulo}</h5>
                    <p className="text-slate-600">
                      <strong>Causa Raiz:</strong> {p.causa_raiz_identificada}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <strong>✅ Saída / Como Contornar:</strong> {p.estrategia_contorno_e_saida}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Tabela de Lançamentos com Multas Elevadas / Erro Humano para Revisão Humana do Auditor */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Fila de Revisão Humana — Multas Desproporcionais ou Erros de Cálculo Detectados pela IA ({auditoriaMultasPerfis.auditoria_multas?.anomalias_multas_detectadas || 0} casos):
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Excesso Passível de Saneamento: R${' '}
                {Number(auditoriaMultasPerfis.auditoria_multas?.excesso_total_passivel_saneamento_reais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Débito / Bairro</th>
                    <th className="px-3 py-2.5">Doc (LGPD)</th>
                    <th className="px-3 py-2.5 text-right">Principal (R$)</th>
                    <th className="px-3 py-2.5 text-right">Multa/Juros Lançado</th>
                    <th className="px-3 py-2.5">Diagnóstico de Erro Humano / Excesso</th>
                    <th className="px-3 py-2.5 text-right">Valor Saneado (IA)</th>
                    <th className="px-3 py-2.5 text-center">Revisão Humana (Auditor)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(auditoriaMultasPerfis.auditoria_multas?.casos_para_revisao_humana || []).map((c: any) => {
                    const statusDecisao = casosHomologados[c.codigo_debito];
                    return (
                      <tr key={c.codigo_debito} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-900">{c.codigo_debito}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.tributo} • {c.bairro} ({c.exercicio_ano})
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-500">{c.cpf_cnpj_anonimizado_lgpd}</td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {Number(c.valor_original).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700 font-bold">
                          {Number(c.juros_multa_lancado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({c.percentual_encargo_lancado})
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 max-w-xs">{c.diagnostico_erro_humano_ou_excesso}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                          {Number(c.valor_saneado_sugerido_ia).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {statusDecisao ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                statusDecisao === 'HOMOLOGADO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {statusDecisao === 'HOMOLOGADO' ? '✔ Recálculo Homologado' : '✖ Mantido Original'}
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setCasosHomologados((prev) => ({ ...prev, [c.codigo_debito]: 'HOMOLOGADO' }))
                                }
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                              >
                                Aprovar Recálculo
                              </button>
                              <button
                                onClick={() =>
                                  setCasosHomologados((prev) => ({ ...prev, [c.codigo_debito]: 'MANTIDO' }))
                                }
                                className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[11px]"
                              >
                                Manter
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          PAINEL 2: EXPLORADOR POSTGRESQL DAS RECEITAS REAIS DA PREFEITURA (182k+)
         ======================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Microsserviço 3 (src/apis/transparencia_coleta_api) • Tabela PostgreSQL: prefeitura_receitas</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Base Real de Arrecadação da Prefeitura de Palmas (Portal Novo NUCLEOGOV — 182.808+ Registros)
            </h3>
            <p className="text-xs text-slate-500">
              Consulte as rubricas reais de <strong>IPTU, ISSQN, ITBI, Taxas e FPM</strong> persistidas em lote no PostgreSQL com proteção contra a <strong>Armadilha 5.4 (Dupla Contagem Contábil)</strong>.
            </p>
          </div>

          {/* Botões de Filtro Rápido por Tributo */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'Todas as Rubricas', termo: '', raiz: false },
              { label: '🏛️ ISS / ISSQN (Serviços)', termo: 'ISS', raiz: false },
              { label: '🏠 IPTU / Patrimonial', termo: 'IMPOSTO', raiz: false },
              { label: '📑 Taxas Municipais', termo: 'TAXA', raiz: false },
              { label: '💰 FPM / Transferências', termo: 'FPM', raiz: false },
              { label: '✅ Apenas Raiz (Sem Dupla Contagem)', termo: '', raiz: true },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => {
                  setPagina(1);
                  setBuscaTributo(btn.termo);
                  setApenasRaiz(btn.raiz);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  buscaTributo === btn.termo && apenasRaiz === btn.raiz
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card de Auditoria da Armadilha 5.4 do Manual do Professor */}
        {audit54 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Soma Ingênua (Todos os Níveis — Com Dupla Contagem)</span>
              </div>
              <div className="text-lg font-extrabold font-mono text-rose-700 mt-1">
                {audit54.soma_ingenua_com_dupla_contagem.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
              <div className="text-[11px] text-amber-700">
                Fator de multiplicação detectado: <strong>{audit54.fator_multiplicacao_detectado}</strong>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Soma Real Correta (Apenas Raiz Contábil — Nível 1)</span>
              </div>
              <div className="text-lg font-extrabold font-mono text-emerald-700 mt-1">
                {audit54.soma_correta_sem_dupla_contagem_raiz.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
              <div className="text-[11px] text-emerald-700">
                Soma Nível 3 (Composição):{' '}
                {audit54.soma_composicao_nivel_3.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-lg border border-amber-200">
              <strong>Armadilha 5.4 Tratada no PostgreSQL:</strong> {audit54.explicacao}
            </div>
          </div>
        )}

        {/* Barra de Busca e Filtro por Nível Hierárquico */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={buscaTributo}
              onChange={(e) => {
                setPagina(1);
                setBuscaTributo(e.target.value);
              }}
              placeholder="Pesquisar por código contábil (ex: 1.1.1.4) ou descrição da receita..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Nível Hierárquico:</span>
            <select
              value={nivelHierarquico ?? ''}
              onChange={(e) => {
                setPagina(1);
                setNivelHierarquico(e.target.value ? Number(e.target.value) : undefined);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="">Todos os Níveis (1 a 7)</option>
              <option value="1">Nível 1 (Raiz Contábil)</option>
              <option value="2">Nível 2 (Origem)</option>
              <option value="3">Nível 3 (Espécie)</option>
              <option value="4">Nível 4 (Rubrica)</option>
              <option value="5">Nível 5 (Alínea)</option>
              <option value="6">Nível 6 (Subalínea Analítica)</option>
            </select>
          </div>
        </div>

        {/* Tabela Paginada do PostgreSQL */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Ano/Mês</th>
                <th className="px-3 py-2.5">Código Contábil</th>
                <th className="px-3 py-2.5">Nível</th>
                <th className="px-3 py-2.5">Descrição da Receita (Portal Novo Palmas)</th>
                <th className="px-3 py-2.5">Unidade Gestora</th>
                <th className="px-3 py-2.5 text-right">Orçado (R$)</th>
                <th className="px-3 py-2.5 text-right">Arrecadado Mês (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregandoReceitas ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Consultando PostgreSQL...
                  </td>
                </tr>
              ) : (dadosReceitas?.itens || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                dadosReceitas?.itens.map((r) => (
                  <tr key={r.id_receita} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-700">
                      {r.ano}/{String(r.mes).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">{r.codigo}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.eh_raiz_contabil
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Nível {r.nivel_hierarquico} {r.eh_raiz_contabil ? '(RAIZ)' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{r.descricao}</td>
                    <td className="px-3 py-2.5 text-slate-500 truncate max-w-[200px]">{r.unidade_nome}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                      {r.valor_orcado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                      {r.valor_arrecado_mes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação SQL */}
        {dadosReceitas && (
          <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
            <span>
              Exibindo página <strong>{dadosReceitas.paginacao.pagina_atual}</strong> de{' '}
              <strong>{dadosReceitas.paginacao.total_paginas}</strong> (Total no filtro:{' '}
              <strong>{dadosReceitas.paginacao.total_registros.toLocaleString('pt-BR')}</strong> registros no PostgreSQL)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={!dadosReceitas.paginacao.tem_anterior}
                onClick={() => handleMudarPagina(pagina - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                disabled={!dadosReceitas.paginacao.tem_proxima}
                onClick={() => handleMudarPagina(pagina + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 font-semibold"
              >
                Próxima <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================
          PAINEL 3: ARQUITETURA DOS 4 AGENTES ESTRITOS POR PASTA DE MICROSSERVIÇO
         ======================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Arquitetura de Microsserviços (src/apis/*) & Least Privilege Tool-Calling</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Catálogo dos 4 Agentes Especializados (Acesso Estrito por Pasta de Microsserviço)
          </h3>
          <p className="text-xs text-slate-500">
            Cada agente só pode executar as ferramentas homologadas do seu próprio microsserviço. Clique em uma ferramenta para testar a execução estrita ao vivo:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentes.map((ag) => (
            <div
              key={ag.id_agente}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {ag.microsservico_pasta}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{ag.url_servico}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{ag.nome}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ag.escopo_estrito}</p>

                <div className="pt-1">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">
                    Ferramentas Estritas Autorizadas (Clique para Executar):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ag.ferramentas_permitidas.map((tool) => (
                      <button
                        key={tool}
                        onClick={() => handleDispararFerramentaAgente(ag.id_agente, tool)}
                        disabled={agenteExecutando === `${ag.id_agente}:${tool}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm transition"
                      >
                        ▶ {tool}()
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Trava:</strong> {ag.proibicoes.join(' • ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Console de Saída do Agente Executado */}
        {resultadoAgente && (
          <div className="bg-slate-950 text-emerald-300 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>
                Resposta Auditada do Agente: <strong className="text-white">{resultadoAgente.agente}</strong> (
                {resultadoAgente.ferramenta_executada})
              </span>
              <button
                onClick={() => setResultadoAgente(null)}
                className="text-xs text-rose-400 hover:underline font-sans"
              >
                Fechar Console
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(resultadoAgente, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
