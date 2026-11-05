import type {
  Contribuinte,
  Imovel,
  Divida,
  Processo,
  DossieImovel,
  ItemFilaCobranca,
  CenarioSimulacao,
  TipoTributo,
  IndicadoresDashboard,
} from '../types/tributario';

// URL da API Backend FastAPI conectada ao SQLite (sitrib.db)
const API_BASE_URL = 'http://localhost:8000/api/v1';

export class ApiService {
  /**
   * Busca contribuinte por CPF ou CNPJ diretamente da API FastAPI (SQLite)
   */
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

    try {
      const response = await fetch(`${API_BASE_URL}/contribuintes/${encodeURIComponent(documento)}`);
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404) {
        throw new Error(`Contribuinte com documento '${documento}' não foi localizado no cadastro tributário de Palmas.`);
      }
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Erro ao consultar contribuinte na API.');
    } catch (err: any) {
      if (err.message && (err.message.includes('não foi localizado') || err.message.includes('Informe um CPF'))) {
        throw err;
      }
      throw new Error('Não foi possível conectar à API SITRIB (porta 8000). Certifique-se de que o backend FastAPI está em execução.');
    }
  }

  /**
   * Retorna o dossiê fiscal consolidado de um imóvel específico (CCI)
   */
  static async obterDossieImovel(inscricaoCci: string): Promise<DossieImovel> {
    const cci = inscricaoCci.trim();
    try {
      const response = await fetch(`${API_BASE_URL}/imoveis/${encodeURIComponent(cci)}/dossie`);
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404) {
        throw new Error(`Imóvel com inscrição cadastral '${inscricaoCci}' não foi encontrado.`);
      }
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Erro ao consultar dossiê do imóvel na API.');
    } catch (err: any) {
      if (err.message && err.message.includes('não foi encontrado')) {
        throw err;
      }
      throw new Error('Não foi possível conectar à API SITRIB (porta 8000). Certifique-se de que o backend FastAPI está em execução.');
    }
  }

  /**
   * Retorna a fila de cobrança ordenada por Max-Heap diretamente da API
   */
  static async listarFilaCobranca(): Promise<ItemFilaCobranca[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cobranca/fila-prioridade`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    } catch (err: any) {
      console.error('Erro ao buscar fila de cobrança da API:', err);
      throw new Error('Não foi possível conectar à API SITRIB (porta 8000) para listar a fila.');
    }
  }

  /**
   * Retorna os indicadores do dashboard calculados pela API a partir do SQLite e IBGE
   */
  static async obterIndicadores(): Promise<IndicadoresDashboard> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/indicadores`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    } catch (err: any) {
      console.error('Erro ao buscar indicadores da API:', err);
      throw new Error('Não foi possível conectar à API SITRIB (porta 8000) para buscar indicadores.');
    }
  }

  /**
   * Simula reajuste de alíquota e cálculo de impacto na arrecadação (RF06 / RF07) via API
   */
  static async simularReajuste(
    tributo: TipoTributo,
    aliquotaAtual: number,
    aliquotaProposta: number,
    baseCalculoEstimada: number
  ): Promise<CenarioSimulacao> {
    try {
      const response = await fetch(`${API_BASE_URL}/tributos/simular-reajuste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tributo,
          aliquota_atual: aliquotaAtual,
          aliquota_proposta: aliquotaProposta,
          base_calculo: baseCalculoEstimada,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Erro ao simular reajuste na API.');
    } catch (err: any) {
      throw new Error(err.message || 'Falha ao conectar à API SITRIB para simulação.');
    }
  }

  /**
   * Dispara a sincronização e persistência no banco SQLite (sitrib.db)
   */
  static async sincronizarBanco(): Promise<{ status: string; mensagem: string; registros_carregados: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/etl/sincronizar`, {
        method: 'POST',
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Erro na API (${response.status}) ao persistir no banco.`);
    } catch (err: any) {
      throw new Error('Falha ao conectar à API para persistência no SQLite.');
    }
  }
}
