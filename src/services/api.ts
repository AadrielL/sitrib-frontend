import type {
  Contribuinte,
  Imovel,
  Divida,
  Processo,
  DossieImovel,
  ItemFilaCobranca,
  CenarioSimulacao,
  TipoTributo,
} from '../types/tributario';
import {
  MOCK_CONTRIBUINTES,
  MOCK_IMOVEIS,
  MOCK_DIVIDAS,
  MOCK_PROCESSOS,
  MOCK_FILA_COBRANCA,
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

/**
 * Wrapper sobre fetch que:
 *  1. Anexa o BASE_URL automaticamente
 *  2. Serializa/deserializa JSON
 *  3. Lança erro legível para respostas não-2xx
 */
async function http<T>(endpoint: string, options: HttpOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, config);

  // Trata respostas de erro do servidor
  if (!response.ok) {
    let mensagemErro = `Erro ${response.status}: ${response.statusText}`;

    try {
      const errorBody = await response.json();
      // FastAPI retorna { "detail": "mensagem" } por padrão
      if (errorBody.detail) {
        mensagemErro = typeof errorBody.detail === 'string'
          ? errorBody.detail
          : JSON.stringify(errorBody.detail);
      }
    } catch {
      // Corpo não era JSON, usa a mensagem padrão
    }

    throw new Error(mensagemErro);
  }

  // 204 No Content — retorna objeto vazio
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// Função para simular delay de rede (modo mock)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// 📡 ApiService — Camada unificada de acesso a dados
// =============================================================================

export class ApiService {
  // ---------------------------------------------------------------------------
  // 1. Busca de Contribuinte por CPF/CNPJ
  //    Backend: GET /api/v1/contribuintes/{cpf_cnpj}
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

    // ──── MODO API REAL ────
    if (USAR_BACKEND_REAL) {
      return http<{
        contribuinte: Contribuinte;
        imoveis: Imovel[];
        dividas: Divida[];
        processos: Processo[];
      }>(`/contribuintes/${encodeURIComponent(docLimpo)}`);
    }

    // ──── MODO MOCK ────
    await delay(300);

    const contribuinte = MOCK_CONTRIBUINTES.find(
      (c) => c.cpf_cnpj.replace(/\D/g, '') === docLimpo
    );

    if (!contribuinte) {
      throw new Error(`Contribuinte com documento '${documento}' não foi localizado no cadastro tributário de Palmas.`);
    }

    const imoveis = MOCK_IMOVEIS.filter(
      (im) => im.cpf_cnpj_proprietario === contribuinte.cpf_cnpj
    );

    const dividas = MOCK_DIVIDAS.filter(
      (d) => d.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj
    );

    const processos = MOCK_PROCESSOS.filter(
      (p) => p.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj
    );

    return { contribuinte, imoveis, dividas, processos };
  }

  // ---------------------------------------------------------------------------
  // 2. Dossiê Fiscal de um Imóvel (CCI)
  //    Backend: GET /api/v1/imoveis/{inscricao_cci}/dossie
  // ---------------------------------------------------------------------------
  static async obterDossieImovel(inscricaoCci: string): Promise<DossieImovel> {
    // ──── MODO API REAL ────
    if (USAR_BACKEND_REAL) {
      return http<DossieImovel>(`/imoveis/${encodeURIComponent(inscricaoCci.trim())}/dossie`);
    }

    // ──── MODO MOCK ────
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
  // 3. Fila de Cobrança (Max-Heap ordenada por score de risco)
  //    Backend: GET /api/v1/cobranca/fila-prioridade
  // ---------------------------------------------------------------------------
  static async listarFilaCobranca(): Promise<ItemFilaCobranca[]> {
    // ──── MODO API REAL ────
    if (USAR_BACKEND_REAL) {
      return http<ItemFilaCobranca[]>('/cobranca/fila-prioridade');
    }

    // ──── MODO MOCK ────
    await delay(200);
    return [...MOCK_FILA_COBRANCA].sort((a, b) => b.score - a.score);
  }

  // ---------------------------------------------------------------------------
  // 4. Simulador de Reajuste Tributário
  //    Backend: POST /api/v1/tributos/simular-reajuste
  // ---------------------------------------------------------------------------
  static async simularReajuste(
    tributo: TipoTributo,
    aliquotaAtual: number,
    aliquotaProposta: number,
    baseCalculoEstimada: number
  ): Promise<CenarioSimulacao> {
    // ──── MODO API REAL ────
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

    // ──── MODO MOCK ────
    await delay(150);

    const valorAtual = Math.round((baseCalculoEstimada * (aliquotaAtual / 100)) * 100) / 100;
    const valorProjetado = Math.round((baseCalculoEstimada * (aliquotaProposta / 100)) * 100) / 100;
    const diferenca = Math.round((valorProjetado - valorAtual) * 100) / 100;
    const variacaoPercentual = aliquotaAtual > 0
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
}
