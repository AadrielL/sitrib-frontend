/**
 * Tipagens do Domínio Tributário Municipal (SITRIB).
 * Espelha fielmente as entidades e DTOs do backend em Python.
 */

export type TipoPessoa = 'FISICA' | 'JURIDICA';
export type TipoImovel = 'RESIDENCIAL' | 'COMERCIAL' | 'TERRENO' | 'MISTO';
export type StatusDivida = 'ATIVO' | 'AJUIZADO' | 'QUITADO';
export type TipoTributo = 'IPTU' | 'ISS' | 'TAXA_LIXO' | 'ALVARA' | 'COSIP';
export type StatusProcesso = 'EM_ANDAMENTO' | 'SUSPENSO' | 'QUITADO';
export type CategoriaTributo = 'DIRETO' | 'INDIRETO' | 'TAXA_MUNICIPAL';

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

// -------------------------------------------------------------
// Novas Entidades da Sprint (RF04, RF05, RF08, RF11)
// -------------------------------------------------------------

export interface HistoricoTarifa {
  id: string;
  data_alteracao: string;
  aliquota_anterior: number;
  aliquota_nova: number;
  motivo_decreto: string;
  responsavel: string;
}

export interface TributoConfig {
  codigo: string;
  nome: string;
  tipo: TipoTributo;
  categoria: CategoriaTributo;
  aliquota_padrao: number; // percentual, ex: 1.25 para 1.25%
  descricao: string;
  ativo: boolean;
  base_legal: string;
  historico?: HistoricoTarifa[];
}

export interface SolicitacaoCalculo {
  tipo_tributo: TipoTributo;
  base_calculo: number;
  aliquota_personalizada?: number;
  deducoes?: number;
  isencao_percentual?: number;
  documento_contribuinte?: string;
}

export interface ResultadoCalculo {
  id_calculo: string;
  data_execucao: string;
  tributo: TipoTributo;
  base_calculo: number;
  aliquota_aplicada: number;
  valor_bruto: number;
  deducoes_aplicadas: number;
  isencao_aplicada: number;
  valor_liquido_devido: number;
  memoria_calculo: string[];
}

export interface LogOperacao {
  id: string;
  data_hora: string;
  usuario: string;
  acao: 'CALCULO' | 'SIMULACAO' | 'ALTERACAO_ALIQUOTA' | 'CADASTRO_TRIBUTO';
  detalhes: string;
  ip_origem: string;
}
