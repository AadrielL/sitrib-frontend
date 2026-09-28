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

// Função para simular delay de rede de API
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiService {
  /**
   * Busca contribuinte por CPF ou CNPJ (com ou sem pontuação)
   */
  static async buscarContribuinte(documento: string): Promise<{
    contribuinte: Contribuinte;
    imoveis: Imovel[];
    dividas: Divida[];
    processos: Processo[];
  }> {
    await delay(300);

    const docLimpo = documento.replace(/\D/g, '');
    if (!docLimpo || (docLimpo.length !== 11 && docLimpo.length !== 14)) {
      throw new Error('Informe um CPF válido (11 dígitos) ou CNPJ válido (14 dígitos).');
    }

    const contribuinte = MOCK_CONTRIBUINTES.find(
      (c) => c.cpf_cnpj.replace(/\D/g, '') === docLimpo
    );

    if (!contribuinte) {
      throw new Error(`Contribuinte com documento '${documento}' não foi localizado no cadastro tributário de Palmas.`);
    }

    // Busca imóveis vinculados (Relação Contribuinte -> Imóvel)
    const imoveis = MOCK_IMOVEIS.filter(
      (im) => im.cpf_cnpj_proprietario === contribuinte.cpf_cnpj
    );

    // Busca dívidas vinculadas
    const dividas = MOCK_DIVIDAS.filter(
      (d) => d.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj
    );

    // Busca processos judiciais de execução fiscal
    const processos = MOCK_PROCESSOS.filter(
      (p) => p.cpf_cnpj_contribuinte === contribuinte.cpf_cnpj
    );

    return {
      contribuinte,
      imoveis,
      dividas,
      processos,
    };
  }

  /**
   * Retorna o dossiê fiscal consolidado de um imóvel específico (CCI)
   */
  static async obterDossieImovel(inscricaoCci: string): Promise<DossieImovel> {
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

  /**
   * Retorna a fila de cobrança ordenada por Max-Heap (score de prioridade)
   */
  static async listarFilaCobranca(): Promise<ItemFilaCobranca[]> {
    await delay(200);
    // Ordena decrescente por score (simulando extração do Max-Heap)
    return [...MOCK_FILA_COBRANCA].sort((a, b) => b.score - a.score);
  }

  /**
   * Simula reajuste de alíquota e cálculo de impacto na arrecadação (RF06 / RF07)
   */
  static simularReajuste(
    tributo: TipoTributo,
    aliquotaAtual: number,
    aliquotaProposta: number,
    baseCalculoEstimada: number
  ): CenarioSimulacao {
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
