/**
 * Tipagens do Domínio Tributário Municipal (SITRIB).
 * Espelha fielmente as entidades e DTOs do backend em Python.
 */

export type TipoPessoa = 'FISICA' | 'JURIDICA';
export type TipoImovel = 'RESIDENCIAL' | 'COMERCIAL' | 'TERRENO' | 'MISTO';
export type StatusDivida = 'ATIVO' | 'AJUIZADO' | 'QUITADO';
export type TipoTributo = 'IPTU' | 'ISS' | 'TAXA_LIXO' | 'ALVARA';
export type StatusProcesso = 'EM_ANDAMENTO' | 'SUSPENSO' | 'QUITADO';

// Perfis de Acesso (RBAC)
export type PerfilUsuario = 'administrador' | 'gestao' | 'consulta';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  cpf?: string;
  matricula_servidor?: string;
  nivel_govbr?: string;
  vinculo_govbr?: boolean;
  tipo_vinculo?: string;
}

export interface OpcoesFiltrosAuditoria {
  exercicios_ano: number[];
  meses_vencimento_ativos: number[];
  tipos_tributo: string[];
  status_divida: string[];
  bairros: string[];
  tipos_imovel: string[];
  tipos_pessoa: string[];
  status_processo: string[];
  varas_judiciais: string[];
  fontes_coleta: string[];
  colunas_banco: Record<string, string[]>;
}

export interface DebitoAuditoriaItem {
  id_divida: number;
  codigo_debito: string;
  origem_api: string;
  exercicio_ano: number;
  data_vencimento: string;
  mes_vencimento: number;
  valor_original: number;
  juros_multa: number;
  valor_atualizado: number;
  tipo_tributo: string;
  status_divida: string;
  inscricao_cci: string;
  endereco_imovel: string;
  bairro: string;
  cep: string;
  tipo_imovel: string;
  valor_venal: number;
  cpf_cnpj_contribuinte: string;
  nome_contribuinte: string;
  tipo_pessoa: string;
  email_contribuinte?: string;
  telefone_contribuinte?: string;
  tem_processo: boolean;
  numero_processo?: string | null;
  vara_judicial?: string | null;
  status_processo?: string | null;
  data_ajuizamento?: string | null;
}

export interface ConsultaDebitosAuditoriaResponse {
  banco_ativo: string;
  paginacao: {
    pagina_atual: number;
    page_size: number;
    total_registros: number;
    total_paginas: number;
    tem_proxima: boolean;
    tem_anterior: boolean;
  };
  resumo_categoria: {
    soma_valor_original: number;
    soma_juros_multa: number;
    soma_valor_atualizado: number;
    quantidade_debitos: number;
    maiores_devedores_periodo: Array<{
      cpf_cnpj: string;
      nome: string;
      tipo_pessoa: string;
      total_devido_filtro: number;
      quantidade_debitos: number;
    }>;
    indice_exercicio_2026: {
      ano_referencia: number;
      ipca_acumulado_aplicado: string;
      ufip_palmas_2026: string;
      meta_recuperacao_divida_ativa_2026: string;
      status_indice: string;
    };
  };
  itens: DebitoAuditoriaItem[];
}

export interface UsuarioTeste {
  perfil: PerfilUsuario;
  titulo: string;
  email: string;
  senha: string;
  cpf?: string;
  descricao: string;
}

export interface Contribuinte {
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  tipo_pessoa: TipoPessoa;
}

export interface Imovel {
  inscricao_cci: string;
  endereco: string;
  tipo_imovel: TipoImovel;
  valor_venal: number;
  cpf_cnpj_proprietario: string;
  bairro: string;
  cep: string;
}

export interface Divida {
  codigo_debito: string;
  ano_exercicio: number;
  valor_original: number;
  juros_multa: number;
  status: StatusDivida;
  inscricao_cci: string;
  cpf_cnpj_contribuinte: string;
  tipo_tributo: TipoTributo;
}

export interface Processo {
  numero_processo: string;
  vara: string;
  data_autuacao: string;
  codigo_debito: string;
  cpf_cnpj_contribuinte: string;
  status_processo: StatusProcesso;
}

export interface ItemFilaCobranca {
  score: number; // 0 a 100
  cpf_cnpj: string;
  nome: string;
  valor_total: number;
  quantidade_debitos: number;
  tem_processo_judicial: boolean;
}

export interface DossieImovel {
  imovel: Imovel;
  total_dividas: number;
  valor_total_devido: number;
  dividas: Divida[];
  total_processos: number;
  processos: Processo[];
}

export interface CenarioSimulacao {
  id: string;
  nome: string;
  tributo: TipoTributo;
  aliquota_atual: number;
  aliquota_proposta: number;
  base_calculo: number;
  valor_atual: number;
  valor_projetado: number;
  diferenca: number;
  variacao_percentual: number;
}

export interface IndicadoresDashboard {
  total_arrecadado_estimado: number;
  total_divida_ativa: number;
  contribuintes_inadimplentes: number;
  distribuicao_tributos: {
    [key: string]: number;
  };
  indicadores_ibge: {
    municipio: string;
    uf: string;
    renda_media: number;
    populacao: number;
  };
}

export interface PredicaoInadimplenciaResponse {
  valor_debito: number;
  dias_atraso: number;
  renda_media_regiao: number;
  bairro_setor: string;
  probabilidade_inadimplencia: string;
  probabilidade_recuperacao: string;
  faixa_recuperabilidade: string;
  prioridade_execucao: number;
  recomendacao_fiscal: string;
  modelo_utilizado: string;
}
