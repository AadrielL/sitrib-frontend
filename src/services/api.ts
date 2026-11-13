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
  UsuarioLogado,
  UsuarioTeste,
  PredicaoInadimplenciaResponse,
} from '../types/tributario';

// URL da API Backend FastAPI conectada ao SQLite (sitrib.db)
const API_BASE_URL = 'http://localhost:8000/api/v1';
const CHAVE_TOKEN = 'sitrib_auth_token';
const CHAVE_USUARIO = 'sitrib_auth_user';

export class ApiService {
  /**
   * Gerenciamento de Sessão / Token Local
   */
  static obterToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  static obterUsuarioSalvo(): UsuarioLogado | null {
    const dados = localStorage.getItem(CHAVE_USUARIO);
    if (!dados) return null;
    try {
      return JSON.parse(dados);
    } catch {
      return null;
    }
  }

  static salvarSessao(token: string, usuario: UsuarioLogado) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  }

  static encerrarSessao() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
  }

  private static obterHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = ApiService.obterToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Autenticação / Login
   */
  static async login(email: string, senha: string): Promise<{ usuario: UsuarioLogado; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Falha no login. Verifique suas credenciais.');
    }

    const data = await response.json();
    ApiService.salvarSessao(data.token, data.usuario);
    return data;
  }

  /**
   * Retorna os usuários de demonstração da SEFIN
   */
  static async listarUsuariosTeste(): Promise<UsuarioTeste[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/usuarios-teste`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Executa a inferência de Machine Learning e o Score de Recuperabilidade (Sprint 4)
   */
  static async predizerInadimplencia(
    valorDebito: number,
    diasAtraso: number,
    rendaMediaRegiao: number = 3200,
    bairro: string = 'Centro'
  ): Promise<PredicaoInadimplenciaResponse> {
    const response = await fetch(`${API_BASE_URL}/predicao/inadimplencia`, {
      method: 'POST',
      headers: ApiService.obterHeaders(),
      body: JSON.stringify({
        valor_debito: valorDebito,
        dias_atraso: diasAtraso,
        renda_media_regiao: rendaMediaRegiao,
        bairro,
      }),
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Falha ao executar predição de inadimplência.');
    }

    return await response.json();
  }

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
      const response = await fetch(`${API_BASE_URL}/contribuintes/${encodeURIComponent(documento)}`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 403) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Acesso negado: Você não possui autorização para consultar este documento.');
      }
      if (response.status === 404) {
        throw new Error(`Contribuinte com documento '${documento}' não foi localizado no cadastro tributário de Palmas.`);
      }
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.detail || 'Erro ao consultar contribuinte na API.');
    } catch (err: any) {
      if (err.message && (err.message.includes('não foi localizado') || err.message.includes('Acesso negado') || err.message.includes('Informe um CPF'))) {
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
      const response = await fetch(`${API_BASE_URL}/imoveis/${encodeURIComponent(cci)}/dossie`, {
        headers: ApiService.obterHeaders(),
      });
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
      const response = await fetch(`${API_BASE_URL}/cobranca/fila-prioridade`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 403) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Acesso negado: Fila de cobrança restrita a auditores fiscais.');
      }
      throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    } catch (err: any) {
      throw err;
    }
  }

  /**
   * Retorna os indicadores do dashboard calculados pela API a partir do SQLite e IBGE
   */
  static async obterIndicadores(): Promise<IndicadoresDashboard> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/indicadores`, {
        headers: ApiService.obterHeaders(),
      });
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
        headers: ApiService.obterHeaders(),
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
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 403) {
        throw new Error('Acesso negado: Sincronização restrita a administradores.');
      }
      throw new Error(`Erro na API (${response.status}) ao persistir no banco.`);
    } catch (err: any) {
      throw new Error(err.message || 'Falha ao conectar à API para persistência no SQLite.');
    }
  }
}
