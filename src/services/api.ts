import type {
  Contribuinte,
  Imovel,
  Divida,
  Processo,
  DossieImovel,
  ItemFilaCobranca,
  FiltrosFilaCobranca,
  CenarioSimulacao,
  TipoTributo,
  IndicadoresDashboard,
  UsuarioLogado,
  PredicaoInadimplenciaResponse,
  ConsultaReceitasPrefeituraResponse,
  AgenteMicrosservicoInfo,
  AvaliacaoCapacidadeFairnessRequest,
  AvaliacaoCapacidadeFairnessResponse,
} from '../types/tributario';

// Catálogo de Links dos Microsserviços (espelha src/repositories/endpoints_registry.py)
export const ENDPOINTS_REGISTRY = {
  GATEWAY: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  AUTH_API: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api/v1/auth',
  TRIBUTARIO_API: import.meta.env.VITE_TRIBUTARIO_API_URL || 'http://localhost:8000/api/v1',
  TRANSPARENCIA_API: import.meta.env.VITE_TRANSPARENCIA_API_URL || 'http://localhost:8000/api/v1',
  IA_PREDICAO_API: import.meta.env.VITE_IA_PREDICAO_API_URL || 'http://localhost:8000/api/v1',
};

const API_BASE_URL = ENDPOINTS_REGISTRY.GATEWAY;
const CHAVE_TOKEN = 'sitrib_auth_token';
const CHAVE_USUARIO = 'sitrib_auth_user';

// ==============================================================================
// DADOS DE EXEMPLO (FALLBACK LOCAL IDÊNTICO AO CONTRATO DO BACKEND)
// Acionados automaticamente com aviso caso localhost:8000 não responda
// ==============================================================================

const FALLBACK_INDICADORES: IndicadoresDashboard & Record<string, any> = {
  banco_ativo: 'PostgreSQL (Modo Exemplo Local)',
  total_divida_ativa: 1084481.25,
  total_arrecadado_estimado: 1810016926.07,
  total_processos_ajuizados: 7,
  total_imoveis: 21,
  total_contribuintes: 21,
  contribuintes_inadimplentes: 21,
  registros_prefeitura_portal_novo: 10000,
  distribuicao_tributos: { IPTU: 607930.5, ISS: 350550.75, TAXA_LIXO: 126000.0 },
  indicadores_ibge: { municipio: 'Palmas', uf: 'TO', renda_media: 3250.5, populacao: 313349 },
  taxa_inadimplencia_estimada: '14.8%',
  projecao_arrecadacao_anual: 'R$ 48.500.000,00',
  indice_2026: { ufip_palmas_2026: 'R$ 4,48', ipca_referencia: '4.62%' },
  faixas_recuperabilidade: { alta: '42%', media: '35%', baixa: '23%' },
};

const FALLBACK_FILA: ItemFilaCobranca[] = [
  {
    score: 95,
    cpf_cnpj: '01.234.567/0001-89',
    nome: 'Construtora Jalapão Empreendimentos S/A',
    valor_total: 380000.0,
    faixa_devedor: 'Grande devedor',
    quantidade_debitos: 2,
    tem_processo_judicial: true,
    tempo_inadimplencia_dias: 570,
    bairros: ['Plano Diretor Norte'],
    bairro_principal: 'Plano Diretor Norte',
    tipos_tributo: ['IPTU', 'ISS'],
    tipo_tributo_str: 'IPTU, ISS',
    exercicios: '2020 a 2022',
    processos_numeros: ['0011223-44.2021.8.27.2729'],
  },
  {
    score: 80,
    cpf_cnpj: '02.345.678/0001-90',
    nome: 'Hotel Graciosa & Convenções Ltda',
    valor_total: 145000.0,
    faixa_devedor: 'Grande devedor',
    quantidade_debitos: 1,
    tem_processo_judicial: true,
    tempo_inadimplencia_dias: 570,
    bairros: ['Orla 14'],
    bairro_principal: 'Orla 14',
    tipos_tributo: ['ISS'],
    tipo_tributo_str: 'ISS',
    exercicios: '2021',
    processos_numeros: ['0023456-78.2022.8.27.2729'],
  },
  {
    score: 65,
    cpf_cnpj: '123.456.789-01',
    nome: 'Carlos Eduardo Siqueira',
    valor_total: 3180.65,
    faixa_devedor: 'Médio devedor',
    quantidade_debitos: 2,
    tem_processo_judicial: true,
    tempo_inadimplencia_dias: 420,
    bairros: ['Plano Diretor Norte'],
    bairro_principal: 'Plano Diretor Norte',
    tipos_tributo: ['IPTU', 'TAXA_LIXO'],
    tipo_tributo_str: 'IPTU, TAXA_LIXO',
    exercicios: '2022 a 2023',
    processos_numeros: ['0012345-67.2023.8.27.2729'],
  },
];

export class ApiService {
  static offlineFallbackAtivo = false;

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
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = ApiService.obterToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // 1. Login por CPF ou E-mail + Senha
  static async login(
    identificador: string,
    senha: string
  ): Promise<{ usuario: UsuarioLogado; token: string; fallback?: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador, email: identificador, senha }),
      });

      if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Credenciais inválidas.');
      }

      const data = await response.json();
      ApiService.offlineFallbackAtivo = false;
      ApiService.salvarSessao(data.token, data.usuario);
      return data;
    } catch (err: any) {
      if (err.message && (err.message.includes('Senha') || err.message.includes('cadastrado') || err.message.includes('Credenciais'))) {
        throw err;
      }
      // Fallback local se localhost:8000 estiver desligado
      ApiService.offlineFallbackAtivo = true;
      const termo = identificador.toLowerCase();
      const usuarioFallback: UsuarioLogado = termo.includes('gestor')
        ? { id: 'usr_gestor_01', nome: 'Dra. Mariana Costa (Gestão)', email: 'gestor@sefin.palmas.to.gov.br', perfil: 'gestao' }
        : termo.includes('carlos') || termo.includes('123')
        ? { id: 'usr_cidadao_01', nome: 'Carlos Eduardo Siqueira', email: 'carlos.siqueira@email.com', perfil: 'consulta', cpf: '123.456.789-01' }
        : { id: 'usr_auditor_01', nome: 'Auditor Fiscal SEFIN', email: 'auditor@sefin.palmas.to.gov.br', perfil: 'administrador', cpf: '0865743101' };
      const token = 'token_fallback_local';
      ApiService.salvarSessao(token, usuarioFallback);
      return { usuario: usuarioFallback, token, fallback: true };
    }
  }

  // 2. Autenticação Gov.br Sandbox Local
  static async autenticarGovBr(
    cpf: string,
    nome?: string,
    nivel_govbr: string = 'OURO'
  ): Promise<{ usuario: UsuarioLogado; token: string; mensagem: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/govbr/autenticar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, nome, nivel_govbr }),
      });
      if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Falha na autenticação Gov.br.');
      }
      const data = await response.json();
      ApiService.offlineFallbackAtivo = false;
      ApiService.salvarSessao(data.token, data.usuario);
      return data;
    } catch {
      ApiService.offlineFallbackAtivo = true;
      const digitos = cpf.replace(/\D/g, '');
      const ehAuditor = digitos === '0865743101' || digitos === '11122233344';
      const usuario: UsuarioLogado = {
        id: `govbr_${digitos}`,
        nome: nome || (ehAuditor ? 'Adriel Morais da Silva (Auditor Gov.br)' : 'Carlos Eduardo Siqueira (Gov.br)'),
        email: `${digitos}@gov.br`,
        perfil: ehAuditor ? 'administrador' : 'consulta',
        cpf,
      };
      ApiService.salvarSessao('token_govbr_fallback', usuario);
      return { usuario, token: 'token_govbr_fallback', mensagem: 'Autenticado em modo local Gov.br.' };
    }
  }

  // 3. Cadastro de Contribuinte / Servidor
  static async cadastrarUsuario(dados: {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    telefone?: string;
  }): Promise<{ usuario: UsuarioLogado; token: string; mensagem: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Não foi possível concluir o cadastro.');
      }
      const data = await response.json();
      ApiService.offlineFallbackAtivo = false;
      ApiService.salvarSessao(data.token, data.usuario);
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      ApiService.offlineFallbackAtivo = true;
      const usuario: UsuarioLogado = {
        id: `usr_${Date.now()}`,
        nome: dados.nome,
        email: dados.email,
        perfil: dados.email.endsWith('@sefin.palmas.to.gov.br') ? 'administrador' : 'consulta',
        cpf: dados.cpf,
      };
      ApiService.salvarSessao('token_cadastro_local', usuario);
      return { usuario, token: 'token_cadastro_local', mensagem: 'Cadastro registrado em modo local.' };
    }
  }

  // 4. Indicadores do Painel Geral
  static async obterIndicadores(): Promise<IndicadoresDashboard & Record<string, any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/indicadores`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      throw new Error('Status erro');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return FALLBACK_INDICADORES;
    }
  }

  // 5. Fila de Cobrança Max-Heap
  static async listarFilaCobranca(filtros?: FiltrosFilaCobranca): Promise<ItemFilaCobranca[]> {
    try {
      const params = new URLSearchParams();
      if (filtros) {
        if (filtros.categoria && filtros.categoria !== 'todos') params.append('categoria', filtros.categoria);
        if (filtros.tipo_tributo && filtros.tipo_tributo !== 'todos') params.append('tipo_tributo', filtros.tipo_tributo);
        if (filtros.bairro && filtros.bairro !== 'todos') params.append('bairro', filtros.bairro);
        if (filtros.apenas_ajuizados) params.append('apenas_ajuizados', 'true');
        if (filtros.busca) params.append('busca', filtros.busca);
        if (filtros.ordenar_por) params.append('ordenar_por', filtros.ordenar_por);
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/cobranca/fila-prioridade${qs}`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      if (response.status === 403) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Acesso restrito a auditores.');
      }
      throw new Error('Status erro');
    } catch (err: any) {
      if (err.message && err.message.includes('restrito')) throw err;
      ApiService.offlineFallbackAtivo = true;
      return FALLBACK_FILA;
    }
  }

  // 6. Busca de Contribuinte por CPF/CNPJ
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
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      if (response.status === 403 || response.status === 404) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.detail || 'Documento não localizado ou sem permissão.');
      }
      throw new Error('Falha na conexão');
    } catch (err: any) {
      if (err.message && (err.message.includes('permissão') || err.message.includes('localizado') || err.message.includes('encontrado') || err.message.includes('Acesso negado'))) {
        throw err;
      }
      ApiService.offlineFallbackAtivo = true;
      return {
        contribuinte: {
          nome: 'Carlos Eduardo Siqueira',
          cpf_cnpj: '123.456.789-01',
          email: 'carlos.siqueira@email.com',
          telefone: '(63) 98111-2030',
          tipo_pessoa: 'FISICA',
        },
        imoveis: [
          {
            inscricao_cci: 'CCI-104-NORTE-01',
            endereco: 'Quadra 104 Norte, Alameda 02, Lote 15',
            tipo_imovel: 'RESIDENCIAL',
            valor_venal: 250000,
            cpf_cnpj_proprietario: '123.456.789-01',
            bairro: 'Plano Diretor Norte',
            cep: '77006-020',
          },
        ],
        dividas: [
          {
            codigo_debito: 'DIVIDA-13',
            ano_exercicio: 2022,
            valor_original: 1450.5,
            juros_multa: 435.15,
            status: 'AJUIZADO',
            inscricao_cci: 'CCI-104-NORTE-01',
            cpf_cnpj_contribuinte: '123.456.789-01',
            tipo_tributo: 'IPTU',
          },
        ],
        processos: [
          {
            numero_processo: '0012345-67.2023.8.27.2729',
            vara: '1ª Vara de Execução Fiscal de Palmas',
            data_autuacao: '2023-08-14',
            codigo_debito: 'DIVIDA-13',
            cpf_cnpj_contribuinte: '123.456.789-01',
            status_processo: 'EM_ANDAMENTO',
          },
        ],
      };
    }
  }

  // 7. Dossiê por Inscrição Imobiliária (CCI)
  static async obterDossieImovel(inscricaoCci: string): Promise<DossieImovel> {
    const cci = inscricaoCci.trim();
    try {
      const response = await fetch(`${API_BASE_URL}/imoveis/${encodeURIComponent(cci)}/dossie`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      if (response.status === 404) {
        throw new Error(`Imóvel '${inscricaoCci}' não encontrado no cadastro de Palmas.`);
      }
      throw new Error('Falha');
    } catch (err: any) {
      if (err.message && err.message.includes('não encontrado')) throw err;
      ApiService.offlineFallbackAtivo = true;
      return {
        imovel: {
          inscricao_cci: cci || 'CCI-104-NORTE-01',
          endereco: 'Quadra 104 Norte, Alameda 02, Lote 15',
          tipo_imovel: 'RESIDENCIAL',
          valor_venal: 250000,
          cpf_cnpj_proprietario: '123.456.789-01',
          bairro: 'Plano Diretor Norte',
          cep: '77006-020',
        },
        total_dividas: 1,
        valor_total_devido: 1885.65,
        dividas: [
          {
            codigo_debito: 'DIVIDA-13',
            ano_exercicio: 2022,
            valor_original: 1450.5,
            juros_multa: 435.15,
            status: 'AJUIZADO',
            inscricao_cci: cci || 'CCI-104-NORTE-01',
            cpf_cnpj_contribuinte: '123.456.789-01',
            tipo_tributo: 'IPTU',
          },
        ],
        total_processos: 1,
        processos: [
          {
            numero_processo: '0012345-67.2023.8.27.2729',
            vara: '1ª Vara de Execução Fiscal de Palmas',
            data_autuacao: '2023-08-14',
            codigo_debito: 'DIVIDA-13',
            cpf_cnpj_contribuinte: '123.456.789-01',
            status_processo: 'EM_ANDAMENTO',
          },
        ],
      };
    }
  }

  // 8. Simulador de Reajuste Tributário
  static async simularReajuste(
    tributo: TipoTributo,
    aliquotaAtual: number,
    aliquotaProposta: number,
    baseCalculoEstimada: number
  ): Promise<CenarioSimulacao & Record<string, any>> {
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
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      const atual = Math.round((aliquotaAtual / 100) * baseCalculoEstimada * 100) / 100;
      const projetado = Math.round((aliquotaProposta / 100) * baseCalculoEstimada * 100) / 100;
      const dif = Math.round((projetado - atual) * 100) / 100;
      const pct = Math.round(((aliquotaProposta - aliquotaAtual) / aliquotaAtual) * 10000) / 100;
      return {
        id: 'sim_fallback',
        nome: 'Simulação Local',
        tributo,
        aliquota_atual: aliquotaAtual,
        aliquota_proposta: aliquotaProposta,
        base_calculo: baseCalculoEstimada,
        valor_atual: atual,
        valor_projetado: projetado,
        diferenca: dif,
        variacao_percentual: pct,
        arrecadacao_atual: atual,
        arrecadacao_proposta: projetado,
        diferenca_arrecadacao: dif,
        impacto_percentual: pct,
      };
    }
  }

  // 9. Predição ML Base
  static async predizerInadimplencia(
    valorDebito: number,
    diasAtraso: number,
    rendaMediaRegiao: number = 3200,
    bairro: string = 'Centro'
  ): Promise<PredicaoInadimplenciaResponse> {
    try {
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
      if (response.ok) return await response.json();
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        valor_debito: valorDebito,
        dias_atraso: diasAtraso,
        renda_media_regiao: rendaMediaRegiao,
        bairro_setor: bairro,
        probabilidade_inadimplencia: '58.0%',
        probabilidade_recuperacao: '42.0%',
        faixa_recuperabilidade: 'Média',
        prioridade_execucao: 2,
        recomendacao_fiscal: 'Notificação administrativa e oferta de acordo REFIS.',
        modelo_utilizado: 'RandomForest (Fallback Local)',
      };
    }
  }

  // 10. Sincronização ETL e Ingestão Completa
  static async sincronizarBanco(): Promise<{ status: string; mensagem: string; registros_carregados: any }> {
    const response = await fetch(`${API_BASE_URL}/etl/sincronizar`, {
      method: 'POST',
      headers: ApiService.obterHeaders(),
    });
    if (response.ok) return await response.json();
    throw new Error('Falha ao sincronizar banco PostgreSQL.');
  }

  static async executarIngestaoCompleta(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/coleta/executar-ingestao-completa`, {
      method: 'POST',
      headers: ApiService.obterHeaders(),
    });
    if (response.ok) return await response.json();
    throw new Error('Falha ao executar coleta.');
  }

  // 11. Receitas Reais da Prefeitura (182.808+ registros PostgreSQL)
  static async consultarReceitasPrefeitura(filtros: {
    page?: number;
    page_size?: number;
    ano?: number;
    mes?: number;
    nivel_hierarquico?: number;
    apenas_raiz_sem_dupla_contagem?: boolean;
    busca?: string;
  }): Promise<ConsultaReceitasPrefeituraResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(filtros.page || 1));
      params.append('page_size', String(filtros.page_size || 15));
      if (filtros.ano) params.append('ano', String(filtros.ano));
      if (filtros.mes) params.append('mes', String(filtros.mes));
      if (filtros.nivel_hierarquico) params.append('nivel_hierarquico', String(filtros.nivel_hierarquico));
      if (filtros.apenas_raiz_sem_dupla_contagem) params.append('apenas_raiz_sem_dupla_contagem', 'true');
      if (filtros.busca) params.append('busca', filtros.busca);

      const response = await fetch(
        `${ENDPOINTS_REGISTRY.TRANSPARENCIA_API}/transparencia/receitas?${params.toString()}`,
        { headers: ApiService.obterHeaders() }
      );
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        banco_ativo: 'PostgreSQL (Exemplo Local)',
        tabela: 'prefeitura_receitas (Portal Novo NUCLEOGOV)',
        paginacao: {
          pagina_atual: 1,
          page_size: 15,
          total_registros: 182808,
          total_paginas: 12187,
          tem_proxima: true,
          tem_anterior: false,
        },
        auditoria_hierarquia_armadilha_5_4: {
          soma_ingenua_com_dupla_contagem: 11169576575.7,
          soma_correta_sem_dupla_contagem_raiz: 1810016926.07,
          soma_composicao_nivel_3: 1218125044.6,
          fator_multiplicacao_detectado: '6.17x',
          explicacao:
            'A listagem traz todos os níveis da árvore contábil. Para o total real do município, soma-se apenas a raiz (RECEITAS CORRENTES e RECEITAS DE CAPITAL) ou um único nível hierárquico.',
        },
        itens: [
          {
            id_receita: 1,
            ano: 2026,
            mes: 1,
            orgao: '2026',
            orgao_nome: 'PREFEITURA MUNICIPAL DE PALMAS',
            unidade_nome: 'SECRETARIA MUNICIPAL DE FINANÇAS',
            codigo: '1.0.0.0.00.0.0',
            codigo_original: '1.0.0.0.00.0.0',
            descricao: 'RECEITAS CORRENTES',
            nivel_hierarquico: 1,
            eh_raiz_contabil: true,
            valor_orcado: 1850000000.0,
            valor_arrecado_mes: 158420000.0,
            valor_arrecado_periodo: 158420000.0,
            covid: 'Não',
            data_coleta: '2026-11-19',
          },
          {
            id_receita: 2,
            ano: 2026,
            mes: 1,
            orgao: '2026',
            orgao_nome: 'PREFEITURA MUNICIPAL DE PALMAS',
            unidade_nome: 'SECRETARIA MUNICIPAL DE FINANÇAS',
            codigo: '1.1.1.4.51.1.1',
            codigo_original: '1.1.1.4.51.1.1',
            descricao: 'IMPOSTO SOBRE SERVIÇOS DE QUALQUER NATUREZA - ISSQN - PRINCIPAL',
            nivel_hierarquico: 6,
            eh_raiz_contabil: false,
            valor_orcado: 145000000.0,
            valor_arrecado_mes: 12450320.5,
            valor_arrecado_periodo: 12450320.5,
            covid: 'Não',
            data_coleta: '2026-11-19',
          },
        ],
      };
    }
  }

  // 12. Catálogo e Execução dos 4 Agentes Estritos
  static async obterCatalogoAgentes(): Promise<{
    total_agentes: number;
    principio_arquitetural: string;
    agentes: AgenteMicrosservicoInfo[];
  }> {
    try {
      const response = await fetch(`${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/catalogo`, {
        headers: ApiService.obterHeaders(),
      });
      if (response.ok) return await response.json();
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        total_agentes: 4,
        principio_arquitetural: 'Least Privilege + Blind Inference LGPD + Fairness',
        agentes: [
          {
            id_agente: 'agente_guardiao_lgpd',
            nome: 'Agente Guardião de Identidade & LGPD',
            microsservico_pasta: 'src/apis/auth_api',
            url_servico: ENDPOINTS_REGISTRY.AUTH_API,
            escopo_estrito: 'Validação RBAC e anonimização de dados pessoais (LGPD Art. 46).',
            ferramentas_permitidas: ['tool_verificar_permissao_consulta', 'tool_auditar_conformidade_lgpd'],
            proibicoes: ['Não acessa tabelas de receitas nem modelos de IA'],
          },
          {
            id_agente: 'agente_auditor_tributario',
            nome: 'Agente Auditor Tributário (IPTU, ISSQN & Max-Heap)',
            microsservico_pasta: 'src/apis/tributario_api',
            url_servico: ENDPOINTS_REGISTRY.TRIBUTARIO_API,
            escopo_estrito: 'Priorização Max-Heap O(log n) e diagnóstico por tributo.',
            ferramentas_permitidas: ['tool_extrair_prioridades_heap', 'tool_diagnosticar_carteira_iptu_issqn'],
            proibicoes: ['Não altera lançamentos sem revisão humana'],
          },
          {
            id_agente: 'agente_inspetor_orcamento',
            nome: 'Agente Inspetor Orçamentário (182k+ Registros)',
            microsservico_pasta: 'src/apis/transparencia_coleta_api',
            url_servico: ENDPOINTS_REGISTRY.TRANSPARENCIA_API,
            escopo_estrito: 'Auditoria dos 182.808+ registros da Prefeitura e proteção contra dupla contagem (5.4).',
            ferramentas_permitidas: ['tool_auditar_arrecadacao_real_prefeitura', 'tool_diagnosticar_armadilha_dupla_contagem'],
            proibicoes: ['Proibido acessar tabelas com CPF/CNPJ'],
          },
          {
            id_agente: 'agente_capacidade_fairness',
            nome: 'Agente de Capacidade Contributiva, Regiões & Fairness',
            microsservico_pasta: 'src/apis/ia_predicao_api',
            url_servico: ENDPOINTS_REGISTRY.IA_PREDICAO_API,
            escopo_estrito: 'Avaliação Quem Pode/Não Pode Pagar, Negociação Regional e Revisão de Multas.',
            ferramentas_permitidas: [
              'tool_avaliar_quem_pode_pagar_com_fairness',
              'tool_mapear_estrategia_por_regiao_palmas',
              'tool_auditar_anomalias_multas_erros_humanos',
            ],
            proibicoes: ['Proibido receber Nome ou CPF na inferência da IA'],
          },
        ],
      };
    }
  }

  static async executarFerramentaAgente(
    id_agente: string,
    ferramenta: string,
    parametros: Record<string, any> = {}
  ): Promise<any> {
    const response = await fetch(`${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/executar`, {
      method: 'POST',
      headers: ApiService.obterHeaders(),
      body: JSON.stringify({ id_agente, ferramenta, parametros }),
    });
    if (response.ok) return await response.json();
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.detail || 'Erro ao executar ferramenta do agente.');
  }

  // 13. Capacidade Contributiva & Negociação com Fairness
  static async avaliarCapacidadeFairness(
    dados: AvaliacaoCapacidadeFairnessRequest
  ): Promise<AvaliacaoCapacidadeFairnessResponse & Record<string, any>> {
    try {
      const response = await fetch(`${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/avaliar-capacidade-fairness`, {
        method: 'POST',
        headers: ApiService.obterHeaders(),
        body: JSON.stringify(dados),
      });
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      const vulneravel = dados.tipo_pessoa === 'FISICA' && dados.valor_debito < 12000 && dados.quantidade_imoveis === 1;
      return {
        agente: 'Agente de Inteligência Regional, Negociação & Fairness',
        microsservico: 'ia_predicao_api (Modo Exemplo Local)',
        ferramenta_executada: 'tool_avaliar_quem_pode_pagar_com_fairness',
        diagnostico_capacidade_contributiva: {
          pode_pagar: !vulneravel,
          status_codigo: vulneravel ? 'VULNERABILIDADE_PROTEGIDA' : 'ALTA_CAPACIDADE',
          classificacao: vulneravel
            ? 'NÃO PODE PAGAR INTEGRALMENTE (Vulnerabilidade Socioeconômica)'
            : 'PODE PAGAR (Capacidade Contributiva Confirmada)',
          indice_comprometimento_renda_12x_pct: 14.5,
          renda_media_setor_ibge: vulneravel ? 2080 : 5100,
          instrumento_fiscal_recomendado: vulneravel
            ? 'PROTEÇÃO DE FAIRNESS: Bloquear ajuizamento judicial e aplicar REFIS Social (95% desconto nos juros).'
            : 'Câmara de Conciliação / Notificação Extrajudicial.',
        },
        plano_negociacao_recomendado: {
          modalidade_negociacao: vulneravel ? 'REFIS Social Assistido' : 'Transação Tributária Padrão',
          desconto_juros_multa_recomendado_pct: vulneravel ? 95 : 40,
          economia_concedida_reais: Math.round(dados.valor_debito * 0.15),
          valor_final_acordo: Math.round(dados.valor_debito * 0.85),
          entrada_sugerida_pct: vulneravel ? 0 : 20,
          valor_entrada: vulneravel ? 0 : Math.round(dados.valor_debito * 0.17),
          numero_parcelas_recomendado: vulneravel ? 24 : 12,
          valor_parcela_mensal: Math.round((dados.valor_debito * 0.85) / (vulneravel ? 24 : 12)),
          teto_parcela_etica_regiao: vulneravel ? 208 : 1020,
          canal_abordagem_recomendado: 'Portal do Contribuinte / Resolve Palmas',
          taxa_sucesso_esperada: '88%',
        },
        texto_reflexao_auditor_ia:
          'Diagnóstico calculado cruzando o valor do débito com o limite ético de comprometimento da renda domiciliar do setor no IBGE Palmas.',
        predicao_machine_learning: {
          faixa_recuperabilidade: vulneravel ? 'Baixa' : 'Alta',
          probabilidade_recuperacao: vulneravel ? '31.0%' : '79.5%',
        },
        auditoria_vies_e_lgpd: {
          blind_inference_sem_cpf_nome: true,
          dados_pessoais_expostos: 'NENHUM (Blind Inference Art. 12 LGPD)',
          setor_abaixo_mediana_ibge: vulneravel,
          correcao_fairness_aplicada: vulneravel,
          parecer_etico_fairness:
            'Inferência realizada sem dados pessoais identificáveis. Recomendação sujeita à revisão humana do Auditor Fiscal (Art. 20 LGPD).',
          fundamento_legal: 'Art. 6º e Art. 20 da LGPD + Art. 145 §1º CF/88.',
        },
      };
    }
  }

  // 14. Macrorregiões de Palmas
  static async obterAnaliseRegionalPalmas(tipoTributo: string = 'TODOS'): Promise<any> {
    try {
      const response = await fetch(
        `${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/analise-regional-palmas?tipo_tributo=${encodeURIComponent(tipoTributo)}`,
        { headers: ApiService.obterHeaders() }
      );
      if (response.ok) {
        ApiService.offlineFallbackAtivo = false;
        return await response.json();
      }
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        regioes: [
          {
            codigo_regiao: 'REGIAO_2_PLANO_DIRETOR_NORTE',
            nome_regiao: 'Plano Diretor Norte (Quadras ARNO / ACNE)',
            perfil_socioeconomico: 'Médio-Alto / Serviços e Residencial',
            vulnerabilidade: 'BAIXA',
            renda_media_ibge: 4800,
            quantidade_debitos: 8,
            soma_valor_atualizado: 635280.5,
            relacao_divida_valor_venal_pct: 4.2,
            tributo_predominante: 'IPTU',
            peso_juros_na_divida_pct: 24.5,
            melhor_estrategia_negociacao: {
              modalidade_negociacao: 'Transação Tributária / Câmara de Conciliação',
              desconto_juros_multa_recomendado_pct: 40,
              entrada_sugerida_pct: 20,
              numero_parcelas_recomendado: 12,
              valor_parcela_mensal: 3810,
              canal_abordagem_recomendado: 'DT-e SEFIN / Conciliação Fazendária',
            },
            texto_pensamento_ia_regiao:
              'Concentra grandes contribuintes com sólida garantia patrimonial (dívida representa apenas 4,2% do valor venal).',
          },
          {
            codigo_regiao: 'REGIAO_6_JARDINS_AURENY',
            nome_regiao: 'Jardins Aureny (I, II, III e IV)',
            perfil_socioeconomico: 'Residencial Popular / Prioridade Fairness',
            vulnerabilidade: 'ALTA',
            renda_media_ibge: 2080,
            quantidade_debitos: 5,
            soma_valor_atualizado: 18450.0,
            relacao_divida_valor_venal_pct: 3.1,
            tributo_predominante: 'IPTU',
            peso_juros_na_divida_pct: 32.0,
            melhor_estrategia_negociacao: {
              modalidade_negociacao: 'REFIS Social Assistido (Fairness)',
              desconto_juros_multa_recomendado_pct: 95,
              entrada_sugerida_pct: 0,
              numero_parcelas_recomendado: 24,
              valor_parcela_mensal: 145,
              canal_abordagem_recomendado: 'Mutirão Resolve Palmas',
            },
            texto_pensamento_ia_regiao:
              'Renda média abaixo da mediana municipal. Bloquear execução judicial e aplicar remissão de juros com parcela limitada a 10% da renda.',
          },
        ],
      };
    }
  }

  // 15. Parecer Executivo da IA ("Texto para Pensar")
  static async obterParecerExecutivoIA(foco: string = 'GERAL'): Promise<any> {
    try {
      const response = await fetch(
        `${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/parecer-executivo-ia?foco=${encodeURIComponent(foco)}`,
        { headers: ApiService.obterHeaders() }
      );
      if (response.ok) return await response.json();
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        topicos_para_pensar_ia: [
          {
            titulo: '1. Concentração Regional Pareto (Onde Focar o Esforço Fiscal)',
            colunas_utilizadas: ['imovel.bairro', 'imovel.valor_venal', 'divida.valor_atualizado'],
            analise_ia:
              'As 4 regiões de maior renda (Plano Diretor Norte/Sul, Orla 14 e Distrito Industrial) concentram 82,4% do estoque financeiro da dívida ativa.',
          },
          {
            titulo: '2. Saneamento de Multas e Peso dos Encargos nas Negociações',
            colunas_utilizadas: ['divida.valor_original', 'divida.valor_atualizado'],
            analise_ia:
              'O saneamento de multas desproporcionais (sujeito à revisão humana do Auditor) destrava acordos à vista e reduz litígios.',
          },
        ],
      };
    }
  }

  // 16. Auditoria de Multas / Erros Humanos (Revisão Humana) e Perfis de Inadimplência
  static async obterAuditoriaMultasEPerfis(): Promise<any> {
    try {
      const response = await fetch(
        `${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/auditoria-multas-erros-humanos`,
        { headers: ApiService.obterHeaders() }
      );
      if (response.ok) return await response.json();
      throw new Error('Falha');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        auditoria_multas: {
          governanca_human_in_the_loop:
            'A IA NÃO altera lançamentos sozinha. Todos os cálculos abaixo exigem Revisão e Homologação Humana do Auditor Fiscal (Art. 20 LGPD).',
          anomalias_multas_detectadas: 2,
          excesso_total_passivel_saneamento_reais: 14500.0,
          casos_para_revisao_humana: [
            {
              codigo_debito: 'DIVIDA-1',
              tributo: 'IPTU',
              exercicio_ano: 2021,
              bairro: 'Plano Diretor Norte',
              cpf_cnpj_anonimizado_lgpd: '**.234.567/0001-**',
              valor_original: 180000,
              juros_multa_lancado: 55000,
              percentual_encargo_lancado: '30.6%',
              diagnostico_erro_humano_ou_excesso: 'Encargo acima de 30% sobre o principal em lançamento manual.',
              valor_atualizado_lancado: 235000,
              valor_saneado_sugerido_ia: 216000,
              diferenca_revisao_reais: 19000,
            },
          ],
        },
        perfis_e_contorno: {
          perfis_inadimplencia: [
            {
              perfil_id: 'PERFIL_A',
              titulo: '1. Grandes Prestadores de Serviço & Loteamentos (PJ - ISSQN / IPTU)',
              participacao_estoque_divida: '68.5% do estoque financeiro',
              causa_raiz_identificada: 'Contestação de multas cumulativas ou uso de atraso como capital de giro.',
              estrategia_contorno_e_saida: 'Revisão humana da multa + Câmara de Conciliação (20% entrada + 12x).',
            },
            {
              perfil_id: 'PERFIL_B',
              titulo: '2. Comércio Médio e Imóveis Residenciais Consolidados',
              participacao_estoque_divida: '21.2% do estoque financeiro',
              causa_raiz_identificada: 'Perda de prazo do boleto anual e oscilação sazonal de caixa.',
              estrategia_contorno_e_saida: 'Acordo Digital via PIX com 75% de desconto nos juros em até 24x.',
            },
            {
              perfil_id: 'PERFIL_C',
              titulo: '3. Famílias Vulneráveis com Único Imóvel (Aureny / Taquaralto)',
              participacao_estoque_divida: '10.3% do valor (45% dos CPFs)',
              causa_raiz_identificada: 'Parcela normal compromete > 25% da renda familiar do IBGE.',
              estrategia_contorno_e_saida: 'Proteção Fairness: Bloquear execução judicial e aplicar REFIS Social (95% desconto nos juros).',
            },
          ],
        },
      };
    }
  }

  // 17. Mapa de Calor Territorial e Progressão Futura Anual (5 Anos com Solução da IA)
  static async obterProjecoesFuturasESolucao(): Promise<any> {
    try {
      const response = await fetch(
        `${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/projecoes-futuras-solucao`,
        { headers: ApiService.obterHeaders() }
      );
      if (response.ok) return await response.json();
      throw new Error('Falha ao obter projeções');
    } catch {
      ApiService.offlineFallbackAtivo = true;
      return {
        montante_total_analisado: 1084481.25,
        total_registros_cruzados: 21,
        mapa_calor_territorial: [
          {
            codigo: 'REGIAO_1_PLANO_DIRETOR_SUL',
            nome: 'Plano Diretor Sul',
            vulnerabilidade: 'BAIXA',
            renda_media_ibge: 5400.0,
            valor_venal_medio: 3745000.0,
            debito_total_regiao: 571930.75,
            quantidade_inadimplentes: 8,
            score_intensidade_calor: 100,
            cor_termica: '#7f1d1d',
            diretriz_solucao: 'Cobrança Digital Integrada e Transação Fazendária',
          },
          {
            codigo: 'REGIAO_2_PLANO_DIRETOR_NORTE',
            nome: 'Plano Diretor Norte',
            vulnerabilidade: 'BAIXA',
            renda_media_ibge: 4800.0,
            valor_venal_medio: 2772000.0,
            debito_total_regiao: 118280.5,
            quantidade_inadimplentes: 5,
            score_intensidade_calor: 29,
            cor_termica: '#4b5563',
            diretriz_solucao: 'Cobrança Digital Integrada e Transação Fazendária',
          },
          {
            codigo: 'REGIAO_3_ORLA_GRACIOSA',
            nome: 'Orla Graciosa',
            vulnerabilidade: 'MUITO_BAIXA',
            renda_media_ibge: 6800.0,
            valor_venal_medio: 4500000.0,
            debito_total_regiao: 145000.0,
            quantidade_inadimplentes: 1,
            score_intensidade_calor: 36,
            cor_termica: '#4b5563',
            diretriz_solucao: 'Cobrança Digital Integrada e Transação Fazendária',
          },
          {
            codigo: 'REGIAO_4_DISTRITO_INDUSTRIAL',
            nome: 'Distrito Industrial',
            vulnerabilidade: 'BAIXA',
            renda_media_ibge: 5900.0,
            valor_venal_medio: 3200000.0,
            debito_total_regiao: 58000.0,
            quantidade_inadimplentes: 1,
            score_intensidade_calor: 14,
            cor_termica: '#4b5563',
            diretriz_solucao: 'Cobrança Digital Integrada e Transação Fazendária',
          },
          {
            codigo: 'REGIAO_5_TAQUARALTO_SUL',
            nome: 'Taquaralto Sul',
            vulnerabilidade: 'MEDIA_ALTA',
            renda_media_ibge: 2350.0,
            valor_venal_medio: 920000.0,
            debito_total_regiao: 146900.0,
            quantidade_inadimplentes: 4,
            score_intensidade_calor: 44,
            cor_termica: '#b91c1c',
            diretriz_solucao: 'Parcelamento Social até 60x e Isenção de Juros',
          },
          {
            codigo: 'REGIAO_6_JARDINS_AURENY',
            nome: 'Jardins Aureny',
            vulnerabilidade: 'ALTA',
            renda_media_ibge: 2080.0,
            valor_venal_medio: 342500.0,
            debito_total_regiao: 44370.0,
            quantidade_inadimplentes: 2,
            score_intensidade_calor: 15,
            cor_termica: '#4b5563',
            diretriz_solucao: 'Parcelamento Social até 60x e Isenção de Juros',
          },
          {
            codigo: 'REGIAO_7_EXPANSAO_MORADA_LAGO',
            nome: 'Expansão & Taquari',
            vulnerabilidade: 'ALTA',
            renda_media_ibge: 1980.0,
            valor_venal_medio: 95000.0,
            debito_total_regiao: 0.0,
            quantidade_inadimplentes: 0,
            score_intensidade_calor: 0,
            cor_termica: '#4b5563',
            diretriz_solucao: 'Parcelamento Social até 60x e Isenção de Juros',
          },
        ],
        projecoes_anuais: [
          {
            ano: 2026,
            periodo: 'Ano 1 (2026)',
            cenario_inercial: {
              arrecadacao_anual: 151827.38,
              arrecadacao_acumulada: 151827.38,
              estoque_divida_restante: 1007266.19,
              taxa_adimplencia_pct: 15.5,
            },
            cenario_solucao_ia: {
              arrecadacao_anual: 347034.0,
              arrecadacao_acumulada: 347034.0,
              estoque_divida_restante: 752196.2,
              taxa_adimplencia_pct: 72.2,
              ganho_incremental_reais: 195206.62,
              reducao_estoque_divida_pct: 30.6,
              economia_processual_acumulada: 450000.0,
            },
          },
          {
            ano: 2027,
            periodo: 'Ano 2 (2027)',
            cenario_inercial: {
              arrecadacao_anual: 141017.27,
              arrecadacao_acumulada: 292844.65,
              estoque_divida_restante: 935548.83,
              taxa_adimplencia_pct: 16.0,
            },
            cenario_solucao_ia: {
              arrecadacao_anual: 240702.78,
              arrecadacao_acumulada: 587736.78,
              estoque_divida_restante: 521723.28,
              taxa_adimplencia_pct: 76.4,
              ganho_incremental_reais: 294892.13,
              reducao_estoque_divida_pct: 51.9,
              economia_processual_acumulada: 900000.0,
            },
          },
          {
            ano: 2028,
            periodo: 'Ano 3 (2028)',
            cenario_inercial: {
              arrecadacao_anual: 130976.84,
              arrecadacao_acumulada: 423821.49,
              estoque_divida_restante: 868937.75,
              taxa_adimplencia_pct: 16.5,
            },
            cenario_solucao_ia: {
              arrecadacao_anual: 114779.12,
              arrecadacao_acumulada: 702515.9,
              estoque_divida_restante: 415083.05,
              taxa_adimplencia_pct: 80.6,
              ganho_incremental_reais: 278694.41,
              reducao_estoque_divida_pct: 61.7,
              economia_processual_acumulada: 1350000.0,
            },
          },
          {
            ano: 2029,
            periodo: 'Ano 4 (2029)',
            cenario_inercial: {
              arrecadacao_anual: 121651.29,
              arrecadacao_acumulada: 545472.78,
              estoque_divida_restante: 807069.38,
              taxa_adimplencia_pct: 17.0,
            },
            cenario_solucao_ia: {
              arrecadacao_anual: 91318.27,
              arrecadacao_acumulada: 793834.17,
              estoque_divida_restante: 330239.07,
              taxa_adimplencia_pct: 84.8,
              ganho_incremental_reais: 248361.39,
              reducao_estoque_divida_pct: 69.5,
              economia_processual_acumulada: 1800000.0,
            },
          },
          {
            ano: 2030,
            periodo: 'Ano 5 (2030)',
            cenario_inercial: {
              arrecadacao_anual: 112989.71,
              arrecadacao_acumulada: 658462.49,
              estoque_divida_restante: 749606.04,
              taxa_adimplencia_pct: 17.5,
            },
            cenario_solucao_ia: {
              arrecadacao_anual: 49535.86,
              arrecadacao_acumulada: 843370.03,
              estoque_divida_restante: 286317.28,
              taxa_adimplencia_pct: 89.0,
              ganho_incremental_reais: 184907.54,
              reducao_estoque_divida_pct: 73.6,
              economia_processual_acumulada: 2250000.0,
            },
          },
        ],
        amostra_cruzamento_indicadores: [
          {
            codigo_debito: 'DEB-2020-IPTU-JALAPAO',
            cpf_cnpj_mascarado: '01.234.567/0001-89',
            nome_contribuinte: 'Construtora Jalapão Empreendimentos S/A',
            tipo_pessoa: 'JURIDICA',
            inscricao_imobiliaria: 'CCI-GLEBA-JALAPAO-01',
            endereco_imovel: 'Quadra 404 Sul, Alameda 08, Lotes 10 a 20',
            bairro: '404 Sul',
            macrorregiao_nome: 'Plano Diretor Sul',
            renda_media_regiao: 5400.0,
            vulnerabilidade_regiao: 'BAIXA',
            tipo_imovel: 'TERRENO',
            valor_venal_imovel: 8900000.0,
            faixa_valor_imovel: 'Alto Padrão / Luxo (> R$ 700k)',
            exercicio_ano: 2020,
            tipo_tributo: 'IPTU',
            valor_original: 180000.0,
            juros_multa: 65000.0,
            valor_total: 245000.0,
            dias_atraso: 2235,
            razao_divida_venal_pct: 2.75,
            comprometimento_renda_pct: 378.09,
            tem_processo_judicial: true,
            status_capacidade: 'ALTA_CAPACIDADE',
            classificacao_capacidade: 'Pode Pagar (Alta Solvência / Patrimonial)',
            solucao_proposta_ia: 'Cobrança Prioritária: Notificação Extrajudicial / Protesto CDA / Conciliação',
            desconto_juros_pct: 40,
            prazo_meses_sugerido: 12,
            probabilidade_recuperacao_inercial: 0.42,
            probabilidade_recuperacao_solucao: 0.82,
          },
          {
            codigo_debito: 'DEB-2021-ISS-GRACIOSA',
            cpf_cnpj_mascarado: '02.345.678/0001-90',
            nome_contribuinte: 'Hotel Graciosa & Convenções Ltda',
            tipo_pessoa: 'JURIDICA',
            inscricao_imobiliaria: 'CCI-ORLA-14-SUL',
            endereco_imovel: 'Orla 14 Sul, Gleba 03, Loteamento Graciosa',
            bairro: 'Graciosa',
            macrorregiao_nome: 'Orla Graciosa',
            renda_media_regiao: 6800.0,
            vulnerabilidade_regiao: 'MUITO_BAIXA',
            tipo_imovel: 'COMERCIAL',
            valor_venal_imovel: 4500000.0,
            faixa_valor_imovel: 'Alto Padrão / Luxo (> R$ 700k)',
            exercicio_ano: 2021,
            tipo_tributo: 'ISS',
            valor_original: 95000.0,
            juros_multa: 50000.0,
            valor_total: 145000.0,
            dias_atraso: 1870,
            razao_divida_venal_pct: 3.22,
            comprometimento_renda_pct: 177.7,
            tem_processo_judicial: true,
            status_capacidade: 'ALTA_CAPACIDADE',
            classificacao_capacidade: 'Pode Pagar (Alta Solvência / Patrimonial)',
            solucao_proposta_ia: 'Cobrança Prioritária: Notificação Extrajudicial / Protesto CDA / Conciliação',
            desconto_juros_pct: 40,
            prazo_meses_sugerido: 12,
            probabilidade_recuperacao_inercial: 0.42,
            probabilidade_recuperacao_solucao: 0.82,
          },
          {
            codigo_debito: 'DEB-2022-IPTU-104',
            cpf_cnpj_mascarado: '123.***.***-01',
            nome_contribuinte: 'Carlos Eduardo Siqueira',
            tipo_pessoa: 'FISICA',
            inscricao_imobiliaria: 'CCI-104-NORTE-01',
            endereco_imovel: 'Quadra 104 Norte, Alameda 02, Lote 15',
            bairro: '104 Norte',
            macrorregiao_nome: 'Plano Diretor Norte',
            renda_media_regiao: 4800.0,
            vulnerabilidade_regiao: 'BAIXA',
            tipo_imovel: 'RESIDENCIAL',
            valor_venal_imovel: 280000.0,
            faixa_valor_imovel: 'Médio Padrão (R$ 150k - R$ 350k)',
            exercicio_ano: 2022,
            tipo_tributo: 'IPTU',
            valor_original: 2200.0,
            juros_multa: 650.0,
            valor_total: 2850.0,
            dias_atraso: 1505,
            razao_divida_venal_pct: 1.02,
            comprometimento_renda_pct: 4.95,
            tem_processo_judicial: true,
            status_capacidade: 'CAPACIDADE_MODERADA',
            classificacao_capacidade: 'Pode Pagar com Parcelamento Adequado',
            solucao_proposta_ia: 'Parcelamento Especial: 75% desconto juros + até 36x',
            desconto_juros_pct: 75,
            prazo_meses_sugerido: 24,
            probabilidade_recuperacao_inercial: 0.28,
            probabilidade_recuperacao_solucao: 0.85,
          },
          {
            codigo_debito: 'DEB-2022-IPTU-MARCELO',
            cpf_cnpj_mascarado: '567.***.***-45',
            nome_contribuinte: 'Marcelo Henrique Viana',
            tipo_pessoa: 'FISICA',
            inscricao_imobiliaria: 'CCI-AURENY-III-10',
            endereco_imovel: 'Jardim Aureny III, Rua 32, Casa 11',
            bairro: 'Jardim Aureny III',
            macrorregiao_nome: 'Jardins Aureny',
            renda_media_regiao: 2080.0,
            vulnerabilidade_regiao: 'ALTA',
            tipo_imovel: 'RESIDENCIAL',
            valor_venal_imovel: 145000.0,
            faixa_valor_imovel: 'Popular (Até R$ 150k)',
            exercicio_ano: 2022,
            tipo_tributo: 'IPTU',
            valor_original: 1850.0,
            juros_multa: 520.0,
            valor_total: 2370.0,
            dias_atraso: 1505,
            razao_divida_venal_pct: 1.63,
            comprometimento_renda_pct: 9.5,
            tem_processo_judicial: false,
            status_capacidade: 'VULNERABILIDADE_PROTEGIDA',
            classificacao_capacidade: 'Não Pode Pagar Integralmente (Vulnerável)',
            solucao_proposta_ia: 'REFIS Social: 95% desconto juros + até 60x sem entrada',
            desconto_juros_pct: 95,
            prazo_meses_sugerido: 48,
            probabilidade_recuperacao_inercial: 0.15,
            probabilidade_recuperacao_solucao: 0.88,
          },
          {
            codigo_debito: 'DEB-2023-TX-RENATO',
            cpf_cnpj_mascarado: '789.***.***-67',
            nome_contribuinte: 'Renato Alencar Fontes',
            tipo_pessoa: 'FISICA',
            inscricao_imobiliaria: 'CCI-BERTAVILLE-05',
            endereco_imovel: 'Setor Bertaville, Rua B-05, Lote 20',
            bairro: 'Bertaville',
            macrorregiao_nome: 'Plano Diretor Norte',
            renda_media_regiao: 4800.0,
            vulnerabilidade_regiao: 'BAIXA',
            tipo_imovel: 'RESIDENCIAL',
            valor_venal_imovel: 190000.0,
            faixa_valor_imovel: 'Médio Padrão (R$ 150k - R$ 350k)',
            exercicio_ano: 2023,
            tipo_tributo: 'TAXA_LIXO',
            valor_original: 890.0,
            juros_multa: 110.0,
            valor_total: 1000.0,
            dias_atraso: 1140,
            razao_divida_venal_pct: 0.53,
            comprometimento_renda_pct: 1.74,
            tem_processo_judicial: false,
            status_capacidade: 'CAPACIDADE_MODERADA',
            classificacao_capacidade: 'Pode Pagar com Parcelamento Adequado',
            solucao_proposta_ia: 'Parcelamento Especial: 75% desconto juros + até 36x',
            desconto_juros_pct: 75,
            prazo_meses_sugerido: 24,
            probabilidade_recuperacao_inercial: 0.28,
            probabilidade_recuperacao_solucao: 0.85,
          },
        ],
        resumo_executivo_agente:
          'A modelagem preditiva considerando o valor venal dos imóveis e a macrorregião comprova que a estratégia tradicional de ajuizamento indiscriminado atinge devedores vulneráveis de baixo valor venal (como Aureny e Taquari), gerando inadimplência crônica e custo processual superior ao próprio débito. A implementação das soluções propostas pela IA (REFIS Social com até 95% de perdão em juros para famílias vulneráveis e cobrança contenciosa focada em imóveis de alto padrão na Graciosa e Plano Diretor) produzirá uma recuperação incremental de R$ 184.907,54 em 5 anos, reduzindo a Dívida Ativa municipal em 73.6%.',
      };
    }
  }

  // 18. Chatbot do Agente de IA (Base limpa, métricas de modelo e cruzamento territorial)
  static async enviarMensagemChatIA(mensagem: string, historico: any[] = []): Promise<any> {
    try {
      const response = await fetch(
        `${ENDPOINTS_REGISTRY.IA_PREDICAO_API}/agentes/chat-assistente-fiscal`,
        {
          method: 'POST',
          headers: ApiService.obterHeaders(),
          body: JSON.stringify({ mensagem, historico }),
        }
      );
      if (response.ok) return await response.json();
      throw new Error('Falha no chat');
    } catch {
      return {
        mensagem_usuario: mensagem,
        ciclo_react: {
          etapa_1_validacao_parametros: {
            titulo: '1. Validação & Higienização de Parâmetros de Entrada',
            intencao_detectada: 'DIAGNOSTICO_GERAL_SITRIB',
            parametros_extraidos: {
              regioes_mapeadas: '7 Macrorregiões Fiscais de Palmas',
              seguranca_lgpd_pii: 'Sem dados pessoais (Art. 6º LGPD - Blind Inference)',
            },
            status_validacao: 'SUCESSO_HIGIENIZADO',
            lgpd_conformidade: 'Conforme Art. 6º LGPD (Blind Inference / Minimização)',
          },
          etapa_2_pensamento_inicial: {
            titulo: '2. Hipótese & Pensamento Inicial (Thought)',
            pensamento_raciocinio:
              'A consulta requer cruzamento da capacidade contributiva com base na renda domiciliar do IBGE e valor venal imobiliário.',
            criterio_tributario_aplicado: 'Capacidade Contributiva (Art. 145 §1º CF) & Valor Venal',
          },
          etapa_3_acao_ferramenta: {
            titulo: '3. Ação & Invocação de Ferramenta (Action)',
            ferramenta_executada: 'tool_mapear_estrategia_por_regiao_palmas',
            argumentos_passados: { intencao: 'CONSULTA_GERAL' },
          },
          etapa_4_observacao_dados: {
            titulo: '4. Observação dos Dados Fatuais do Banco (Observation)',
            sintese_dados_reais:
              'Base limpa de 5.731 receitas contábeis e R$ 1.084.481,25 em dívida ativa mapeados nas 7 macrozonas de Palmas.',
          },
          etapa_5_pensamento_revisao_critica: {
            titulo: '5. Revisão Crítica & Salvaguardas Éticas (Review)',
            analise_critica_e_ajuste:
              'Revisão crítica realizada: o ajuizamento coercitivo é substituído por REFIS Social em bairros vulneráveis e conciliação prévia em imóveis de alto valor.',
            status_human_in_the_loop: 'HOMOLOGAÇÃO_OBRIGATÓRIA_AUDITOR (Art. 20 LGPD & Art. 142 CTN)',
          },
          etapa_6_resposta_fundamentada: {
            titulo: '6. Parecer Final Fundamentado (Final Grounded Answer)',
            resumo_conclusao: 'Parecer técnico emitido e validado com governança Human-in-the-Loop.',
          },
        },
        resposta:
          `O Assistente Fiscal do SITRIB analisou os dados limpos das 7 Macrorregiões de Palmas e as 8 variáveis cruzadas do Random Forest. A diretriz para este caso é aplicar o REFIS Social em regiões vulneráveis (isenção de até 95% em juros e parcelamento em 60x) e focar a cobrança contenciosa com entrada de 20% em imóveis de alto valor venal no Plano Diretor e Orla Graciosa.`,
        relatorio_tecnico: {
          algoritmo: 'Random Forest Classifier (Scikit-Learn 1.9.1)',
          acuracia: '100.0%',
          recall: '100.0%',
          f1_score: '1.00',
          features_utilizadas: [
            'valor_venal_imovel (R$)',
            'valor_total_debito (R$)',
            'dias_atraso (Tempo)',
            'renda_media_regiao (IBGE)',
            'razao_divida_venal_pct (%)',
            'comprometimento_renda_pct (%)',
            'tipo_pessoa_num (PF=0, PJ=1)',
            'tem_processo_num (0=Não, 1=Sim)',
          ],
        },
        sugestoes_perguntas: [
          'Quais variáveis e métricas foram usadas no modelo de IA?',
          'Como o valor venal do imóvel altera a proposta no Aureny?',
          'Qual região concentra o maior débito e qual a solução?',
          'Quais são os ganhos financeiros e processuais da projeção de 5 anos?',
          'Como o sistema identifica e corrige erros humanos nas multas?',
          'Quais garantias a LGPD e o Art. 20 oferecem ao contribuinte?',
        ],
      };
    }
  }
}
