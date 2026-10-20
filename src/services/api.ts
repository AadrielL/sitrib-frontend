import type {
  Contribuinte,
  Imovel,
  Divida,
  Processo,
  DossieImovel,
  ItemFilaCobranca,
  CenarioSimulacao,
  TipoTributo,
  TributoConfig,
  SolicitacaoCalculo,
  ResultadoCalculo,
  LogOperacao,
} from '../types/tributario';
import {
  MOCK_CONTRIBUINTES,
  MOCK_IMOVEIS,
  MOCK_DIVIDAS,
  MOCK_PROCESSOS,
  MOCK_FILA_COBRANCA,
  MOCK_TRIBUTOS,
  MOCK_LOGS,
} from './mockData';

// =============================================================================
// ⚙️ Configuração de Ambiente (Mock local ↔ Backend FastAPI real)
// =============================================================================

/** Flag que ativa as chamadas HTTP reais ao backend Python */
const USAR_BACKEND_REAL = import.meta.env.VITE_USAR_API === 'true';

/** URL base da API FastAPI. Ex: http://localhost:8000/api/v1 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// =============================================================================
// 🔧 Cliente HTTP genérico (fetch nativo — zero dependências extras)
// =============================================================================

interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function http<T>(endpoint: string, options: HttpOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  if (!response.ok) {
    let mensagemErro = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        mensagemErro =
          typeof errorBody.detail === 'string'
            ? errorBody.detail
            : JSON.stringify(errorBody.detail);
      }
    } catch {
      // Retorna erro padrão
    }
    throw new Error(mensagemErro);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// 📡 ApiService — Camada unificada de acesso a dados
// =============================================================================

export class ApiService {
  // ---------------------------------------------------------------------------
  // 1. Busca de Contribuinte por CPF/CNPJ
  // ---------------------------------------------------------------------------
  static async buscarContribuinte(documento: string): Promise<{
    contribuinte: Contribuinte;
    imoveis: Imovel[];
    dividas: Divida[];
    processos: Processo[];
  }> {
    const docLimpo = documento.replace(/\D/g, '');

    if (!docLimpo || (docLimpo.length !== 11 && docLimpo.length !== 14)) {
      throw new Error('Informe um CPF válido (11 dígitos) ou CNPJ válido (14 dígitos).');
    }

    if (USAR_BACKEND_REAL) {
      return http<{
        contribuinte: Contribuinte;
        imoveis: Imovel[];
        dividas: Divida[];
        processos: Processo[];
      }>(`/contribuintes/${encodeURIComponent(docLimpo)}`);
    }

    await delay(300);
    const contribuinte = MOCK_CONTRIBUINTES.find(
      (c) => c.cpf_cnpj.replace(/\D/g, '') === docLimpo
    );

    if (!contribuinte) {
      throw new Error(`Contribuinte com documento '${documento}' não foi localizado no cadastro tributário de Palmas.`);
    }

    const imoveis = MOCK_IMOVEIS.filter((im) => im.cpf_cnpj_proprietario === contribuinte.cpf_cnpj);
    const dividas = MOCK_DIVIDAS.filter((d) => d.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj);
    const processos = MOCK_PROCESSOS.filter((p) => p.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj);

    return { contribuinte, imoveis, dividas, processos };
  }

  // ---------------------------------------------------------------------------
  // 2. Dossiê Fiscal de um Imóvel (CCI)
  // ---------------------------------------------------------------------------
  static async obterDossieImovel(inscricaoCci: string): Promise<DossieImovel> {
    if (USAR_BACKEND_REAL) {
      return http<DossieImovel>(`/imoveis/${encodeURIComponent(inscricaoCci.trim())}/dossie`);
    }

    await delay(200);
    const imovel = MOCK_IMOVEIS.find((im) => im.inscricao_cci === inscricaoCci.trim());
    if (!imovel) {
      throw new Error(`Imóvel com inscrição cadastral '${inscricaoCci}' não foi encontrado.`);
    }

    const dividas = MOCK_DIVIDAS.filter((d) => d.inscricao_cci === imovel.inscricao_cci);
    const codigosDebito = new Set(dividas.map((d) => d.codigo_debito));
    const processos = MOCK_PROCESSOS.filter((p) => codigosDebito.has(p.codigo_debito));

    const valorTotalDevido = dividas.reduce(
      (acc, curr) => acc + curr.valor_original + curr.juros_multa,
      0
    );

    return {
      imovel,
      total_dividas: dividas.length,
      valor_total_devido: Math.round(valorTotalDevido * 100) / 100,
      dividas,
      total_processos: processos.length,
      processos,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Fila de Cobrança (Max-Heap)
  // ---------------------------------------------------------------------------
  static async listarFilaCobranca(): Promise<ItemFilaCobranca[]> {
    if (USAR_BACKEND_REAL) {
      return http<ItemFilaCobranca[]>('/cobranca/fila-prioridade');
    }

    await delay(200);
    return [...MOCK_FILA_COBRANCA].sort((a, b) => b.score - a.score);
  }

  // ---------------------------------------------------------------------------
  // 4. Simulador de Reajuste Tributário (RF06 / RF07)
  // ---------------------------------------------------------------------------
  static async simularReajuste(
    tributo: TipoTributo,
    aliquotaAtual: number,
    aliquotaProposta: number,
    baseCalculoEstimada: number
  ): Promise<CenarioSimulacao> {
    if (USAR_BACKEND_REAL) {
      return http<CenarioSimulacao>('/tributos/simular-reajuste', {
        method: 'POST',
        body: {
          tributo,
          aliquota_atual: aliquotaAtual,
          aliquota_proposta: aliquotaProposta,
          base_calculo: baseCalculoEstimada,
        },
      });
    }

    await delay(150);
    const valorAtual = Math.round((baseCalculoEstimada * (aliquotaAtual / 100)) * 100) / 100;
    const valorProjetado = Math.round((baseCalculoEstimada * (aliquotaProposta / 100)) * 100) / 100;
    const diferenca = Math.round((valorProjetado - valorAtual) * 100) / 100;
    const variacaoPercentual =
      aliquotaAtual > 0
        ? Math.round(((aliquotaProposta - aliquotaAtual) / aliquotaAtual) * 10000) / 100
        : 0;

    return {
      id: `SIM-${Date.now()}`,
      nome: `Simulação de ${tributo} (${aliquotaAtual}% → ${aliquotaProposta}%)`,
      tributo,
      aliquota_atual: aliquotaAtual,
      aliquota_proposta: aliquotaProposta,
      base_calculo: baseCalculoEstimada,
      valor_atual: valorAtual,
      valor_projetado: valorProjetado,
      diferenca,
      variacao_percentual: variacaoPercentual,
    };
  }

  // ---------------------------------------------------------------------------
  // 5. Gestão de Tributos e Alíquotas (RF04 & RF08)
  // ---------------------------------------------------------------------------
  static async listarTributos(): Promise<TributoConfig[]> {
    if (USAR_BACKEND_REAL) {
      return http<TributoConfig[]>('/tributos');
    }
    await delay(200);
    return [...MOCK_TRIBUTOS];
  }

  static async atualizarAliquota(
    codigoTributo: string,
    novaAliquota: number,
    motivo: string,
    responsavel: string
  ): Promise<TributoConfig> {
    if (USAR_BACKEND_REAL) {
      return http<TributoConfig>(`/tributos/${encodeURIComponent(codigoTributo)}/aliquota`, {
        method: 'PUT',
        body: {
          aliquota: novaAliquota,
          motivo,
          responsavel,
        },
      });
    }

    await delay(250);
    const tributo = MOCK_TRIBUTOS.find((t) => t.codigo === codigoTributo);
    if (!tributo) {
      throw new Error(`Tributo com código '${codigoTributo}' não encontrado.`);
    }

    const histItem = {
      id: `HIST-${Date.now()}`,
      data_alteracao: new Date().toISOString().split('T')[0],
      aliquota_anterior: tributo.aliquota_padrao,
      aliquota_nova: novaAliquota,
      motivo_decreto: motivo,
      responsavel,
    };

    tributo.aliquota_padrao = novaAliquota;
    if (!tributo.historico) tributo.historico = [];
    tributo.historico.unshift(histItem);

    // Registra log da alteração
    MOCK_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      data_hora: new Date().toLocaleString('pt-BR'),
      usuario: responsavel,
      acao: 'ALTERACAO_ALIQUOTA',
      detalhes: `Alíquota de ${tributo.nome} alterada para ${novaAliquota}%. Motivo: ${motivo}`,
      ip_origem: '127.0.0.1 (Frontend)',
    });

    return { ...tributo };
  }

  // ---------------------------------------------------------------------------
  // 6. Motor Oficial de Cálculo de Tributo (RF05)
  // ---------------------------------------------------------------------------
  static async calcularTributo(dados: SolicitacaoCalculo): Promise<ResultadoCalculo> {
    if (USAR_BACKEND_REAL) {
      return http<ResultadoCalculo>('/calculos/executar', {
        method: 'POST',
        body: dados,
      });
    }

    await delay(250);

    const tributoConfig = MOCK_TRIBUTOS.find((t) => t.tipo === dados.tipo_tributo);
    const aliquota = dados.aliquota_personalizada ?? tributoConfig?.aliquota_padrao ?? 1.0;
    const base = dados.base_calculo;
    const deducoes = dados.deducoes ?? 0;
    const isencaoPct = dados.isencao_percentual ?? 0;

    const baseTributavel = Math.max(0, base - deducoes);
    const valorBruto = Math.round((baseTributavel * (aliquota / 100)) * 100) / 100;
    const valorIsencao = Math.round((valorBruto * (isencaoPct / 100)) * 100) / 100;
    const valorLiquido = Math.max(0, Math.round((valorBruto - valorIsencao) * 100) / 100);

    const memoria = [
      `1. Base de Cálculo informada: ${base.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      deducoes > 0 ? `2. Deduções legais: - ${deducoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `2. Deduções legais: Nenhuma dedução aplicada`,
      `3. Base Tributável Efetiva: ${baseTributavel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `4. Alíquota municipal aplicada: ${aliquota}%`,
      `5. Valor Bruto Apurado: ${valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      isencaoPct > 0 ? `6. Isenção/Desconto Fiscal (${isencaoPct}%): - ${valorIsencao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `6. Isenções fiscais: 0%`,
      `7. Total Líquido Devido ao Município: ${valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    ];

    // Registra auditoria
    MOCK_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      data_hora: new Date().toLocaleString('pt-BR'),
      usuario: 'auditor.fiscal@palmas.to.gov.br',
      acao: 'CALCULO',
      detalhes: `Cálculo realizado para ${dados.tipo_tributo}. Base: R$ ${base} → Devido: R$ ${valorLiquido}`,
      ip_origem: '127.0.0.1 (Frontend)',
    });

    return {
      id_calculo: `CALC-${Date.now()}`,
      data_execucao: new Date().toLocaleString('pt-BR'),
      tributo: dados.tipo_tributo,
      base_calculo: base,
      aliquota_aplicada: aliquota,
      valor_bruto: valorBruto,
      deducoes_aplicadas: deducoes,
      isencao_aplicada: valorIsencao,
      valor_liquido_devido: valorLiquido,
      memoria_calculo: memoria,
    };
  }

  // ---------------------------------------------------------------------------
  // 7. Logs de Auditoria e Operações (RF11 / RNF03)
  // ---------------------------------------------------------------------------
  static async listarLogs(): Promise<LogOperacao[]> {
    if (USAR_BACKEND_REAL) {
      return http<LogOperacao[]>('/auditoria/logs');
    }
    await delay(150);
    return [...MOCK_LOGS];
  }
}
