import type { Contribuinte, Imovel, Divida, Processo, ItemFilaCobranca } from '../types/tributario';

export const MOCK_CONTRIBUINTES: Contribuinte[] = [
  {
    nome: 'Carlos Eduardo Siqueira',
    cpf_cnpj: '123.456.789-01',
    email: 'carlos.siqueira@email.com',
    telefone: '(63) 98111-2030',
    tipo_pessoa: 'FISICA',
  },
  {
    nome: 'Maria Auxiliadora Fernandes',
    cpf_cnpj: '987.654.321-09',
    email: 'maria.fernandes@email.com',
    telefone: '(63) 99222-3040',
    tipo_pessoa: 'FISICA',
  },
  {
    nome: 'Tocantins Engenharia e Serviços Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    email: 'contato@toengenharia.com.br',
    telefone: '(63) 3215-4000',
    tipo_pessoa: 'JURIDICA',
  },
  {
    nome: 'Araguaia Comércio de Alimentos Eireli',
    cpf_cnpj: '98.765.432/0001-10',
    email: 'financeiro@araguaiaalimentos.com.br',
    telefone: '(63) 3218-9900',
    tipo_pessoa: 'JURIDICA',
  },
  {
    nome: 'Juliana Ribeiro Prado',
    cpf_cnpj: '456.789.012-34',
    email: 'juliana.prado@email.com',
    telefone: '(63) 98455-1234',
    tipo_pessoa: 'FISICA',
  },
];

export const MOCK_IMOVEIS: Imovel[] = [
  {
    inscricao_cci: 'CCI-104-NORTE-01',
    endereco: 'Quadra 104 Norte, Alameda 02, Lote 15',
    tipo_imovel: 'RESIDENCIAL',
    valor_venal: 280000.0,
    cpf_cnpj_proprietario: '123.456.789-01',
    bairro: 'Plano Diretor Norte',
    cep: '77006-020',
  },
  {
    inscricao_cci: 'CCI-208-SUL-42',
    endereco: 'Quadra 208 Sul, Avenida LO-05, Lote 08',
    tipo_imovel: 'RESIDENCIAL',
    valor_venal: 395000.0,
    cpf_cnpj_proprietario: '123.456.789-01',
    bairro: 'Plano Diretor Sul',
    cep: '77020-510',
  },
  {
    inscricao_cci: 'CCI-COMERCIAL-JK-10',
    endereco: 'Avenida JK, Quadra 103 Sul, Bloco AC, Sala 204',
    tipo_imovel: 'COMERCIAL',
    valor_venal: 750000.0,
    cpf_cnpj_proprietario: '12.345.678/0001-90',
    bairro: 'Centro Comercial',
    cep: '77015-012',
  },
  {
    inscricao_cci: 'CCI-LOTE-INDUSTRIAL-07',
    endereco: 'Distrito Industrial de Palmas, Quadra 04, Módulo 12',
    tipo_imovel: 'TERRENO',
    valor_venal: 520000.0,
    cpf_cnpj_proprietario: '98.765.432/0001-10',
    bairro: 'Distrito Industrial',
    cep: '77060-100',
  },
  {
    inscricao_cci: 'CCI-GRACIOSA-LAGO-88',
    endereco: 'Orla 14, Alameda dos Ipês, Lote 22',
    tipo_imovel: 'RESIDENCIAL',
    valor_venal: 640000.0,
    cpf_cnpj_proprietario: '987.654.321-09',
    bairro: 'Graciosa',
    cep: '77001-140',
  },
];

export const MOCK_DIVIDAS: Divida[] = [
  {
    codigo_debito: 'DEB-2023-IPTU-104',
    ano_exercicio: 2023,
    valor_original: 2450.0,
    juros_multa: 380.5,
    status: 'ATIVO',
    inscricao_cci: 'CCI-104-NORTE-01',
    cpf_cnpj_contribuinte: '123.456.789-01',
    tipo_tributo: 'IPTU',
  },
  {
    codigo_debito: 'DEB-2022-IPTU-104',
    ano_exercicio: 2022,
    valor_original: 2200.0,
    juros_multa: 650.0,
    status: 'AJUIZADO',
    inscricao_cci: 'CCI-104-NORTE-01',
    cpf_cnpj_contribuinte: '123.456.789-01',
    tipo_tributo: 'IPTU',
  },
  {
    codigo_debito: 'DEB-2024-ISS-JK10',
    ano_exercicio: 2024,
    valor_original: 14800.0,
    juros_multa: 1250.75,
    status: 'ATIVO',
    inscricao_cci: 'CCI-COMERCIAL-JK-10',
    cpf_cnpj_contribuinte: '12.345.678/0001-90',
    tipo_tributo: 'ISS',
  },
  {
    codigo_debito: 'DEB-2021-TX-IND07',
    ano_exercicio: 2021,
    valor_original: 8300.0,
    juros_multa: 2400.0,
    status: 'AJUIZADO',
    inscricao_cci: 'CCI-LOTE-INDUSTRIAL-07',
    cpf_cnpj_contribuinte: '98.765.432/0001-10',
    tipo_tributo: 'TAXA_LIXO',
  },
];

export const MOCK_PROCESSOS: Processo[] = [
  {
    numero_processo: '0012345-67.2023.8.27.2729',
    vara: '1ª Vara de Execução Fiscal e Tributária de Palmas',
    data_autuacao: '2023-04-18',
    codigo_debito: 'DEB-2022-IPTU-104',
    cpf_cnpj_contribuinte: '123.456.789-01',
    status_processo: 'EM_ANDAMENTO',
  },
  {
    numero_processo: '0098765-43.2022.8.27.2729',
    vara: '2ª Vara de Execução Fiscal de Palmas',
    data_autuacao: '2022-11-05',
    codigo_debito: 'DEB-2021-TX-IND07',
    cpf_cnpj_contribuinte: '98.765.432/0001-10',
    status_processo: 'EM_ANDAMENTO',
  },
];

export const MOCK_FILA_COBRANCA: ItemFilaCobranca[] = [
  {
    score: 95,
    cpf_cnpj: '98.765.432/0001-10',
    nome: 'Araguaia Comércio de Alimentos Eireli',
    valor_total: 10700.0,
    quantidade_debitos: 1,
    tem_processo_judicial: true,
  },
  {
    score: 88,
    cpf_cnpj: '12.345.678/0001-90',
    nome: 'Tocantins Engenharia e Serviços Ltda',
    valor_total: 16050.75,
    quantidade_debitos: 1,
    tem_processo_judicial: false,
  },
  {
    score: 75,
    cpf_cnpj: '123.456.789-01',
    nome: 'Carlos Eduardo Siqueira',
    valor_total: 5680.5,
    quantidade_debitos: 2,
    tem_processo_judicial: true,
  },
  {
    score: 42,
    cpf_cnpj: '987.654.321-09',
    nome: 'Maria Auxiliadora Fernandes',
    valor_total: 0.0,
    quantidade_debitos: 0,
    tem_processo_judicial: false,
  },
  {
    score: 15,
    cpf_cnpj: '456.789.012-34',
    nome: 'Juliana Ribeiro Prado',
    valor_total: 0.0,
    quantidade_debitos: 0,
    tem_processo_judicial: false,
  },
];


// -----------------------------------------------------------------------------
// Mock de Tributos Cadastrados (RF04 e RF08)
// -----------------------------------------------------------------------------
import type { TributoConfig, LogOperacao } from '../types/tributario';

export const MOCK_TRIBUTOS: TributoConfig[] = [
  {
    codigo: 'TRB-IPTU-PALMAS',
    nome: 'Imposto Predial e Territorial Urbano',
    tipo: 'IPTU',
    categoria: 'DIRETO',
    aliquota_padrao: 1.25,
    descricao: 'Tributo incidente sobre a propriedade imobiliária predial e territorial no perímetro urbano de Palmas.',
    ativo: true,
    base_legal: 'Lei Complementar Municipal nº 105/2005 (Código Tributário de Palmas)',
    historico: [
      {
        id: 'HIST-001',
        data_alteracao: '2024-01-01',
        aliquota_anterior: 1.0,
        aliquota_nova: 1.25,
        motivo_decreto: 'Decreto Municipal nº 1.840/2023 - Atualização da Planta Genérica de Valores',
        responsavel: 'Secretaria Municipal de Finanças',
      },
      {
        id: 'HIST-002',
        data_alteracao: '2022-01-01',
        aliquota_anterior: 0.9,
        aliquota_nova: 1.0,
        motivo_decreto: 'Lei Complementar nº 280/2021',
        responsavel: 'Câmara Municipal de Palmas',
      },
    ],
  },
  {
    codigo: 'TRB-ISS-QN-PALMAS',
    nome: 'Imposto Sobre Serviços de Qualquer Natureza',
    tipo: 'ISS',
    categoria: 'INDIRETO',
    aliquota_padrao: 3.5,
    descricao: 'Tributo incidente sobre a prestação onerosa de serviços constantes na lista da Lei Complementar Federal nº 116/2003.',
    ativo: true,
    base_legal: 'Lei Complementar Municipal nº 120/2006',
    historico: [
      {
        id: 'HIST-003',
        data_alteracao: '2023-01-01',
        aliquota_anterior: 3.0,
        aliquota_nova: 3.5,
        motivo_decreto: 'Ajuste fiscal para incentivo de polos tecnológicos de Palmas',
        responsavel: 'Auditoria Tributária',
      },
    ],
  },
  {
    codigo: 'TRB-TAXA-LIXO-2024',
    nome: 'Taxa de Coleta e Destinação de Resíduos Sólidos',
    tipo: 'TAXA_LIXO',
    categoria: 'TAXA_MUNICIPAL',
    aliquota_padrao: 0.45,
    descricao: 'Custeio dos serviços públicos de coleta, remoção e destinação de resíduos domiciliares.',
    ativo: true,
    base_legal: 'Lei Municipal nº 2.450/2019',
    historico: [],
  },
  {
    codigo: 'TRB-ALVARA-FUNC',
    nome: 'Taxa de Fiscalização e Instalação de Alvará',
    tipo: 'ALVARA',
    categoria: 'TAXA_MUNICIPAL',
    aliquota_padrao: 2.0,
    descricao: 'Taxa anual para regularidade do funcionamento de estabelecimentos industriais, comerciais e de serviços.',
    ativo: true,
    base_legal: 'Código de Posturas de Palmas nº 042/1997',
    historico: [],
  },
  {
    codigo: 'TRB-COSIP-URBANA',
    nome: 'Contribuição de Iluminação Pública (COSIP)',
    tipo: 'COSIP',
    categoria: 'DIRETO',
    aliquota_padrao: 1.1,
    descricao: 'Contribuição para expansão e manutenção do sistema de iluminação pública da capital.',
    ativo: true,
    base_legal: 'Emenda Constitucional nº 39/2002 e Lei Municipal nº 1.412',
    historico: [],
  },
];

export const MOCK_LOGS: LogOperacao[] = [
  {
    id: 'LOG-001',
    data_hora: '2026-10-19 14:32:10',
    usuario: 'adriel.morais@mail.uft.edu.br (PO)',
    acao: 'SIMULACAO',
    detalhes: 'Simulação de reajuste de IPTU de 1.25% para 1.50% na base de R$ 200.000.000,00',
    ip_origem: '177.136.240.12',
  },
  {
    id: 'LOG-002',
    data_hora: '2026-10-19 15:10:45',
    usuario: 'gabriel.lopes1@mail.uft.edu.br (SM)',
    acao: 'CALCULO',
    detalhes: 'Cálculo de IPTU para imóvel CCI-104-NORTE-01 (Valor: R$ 280.000,00)',
    ip_origem: '189.40.112.5',
  },
  {
    id: 'LOG-003',
    data_hora: '2026-10-19 16:02:18',
    usuario: 'sistema.integrador@palmas.to.gov.br',
    acao: 'ALTERACAO_ALIQUOTA',
    detalhes: 'Atualização da alíquota padrão de ISS de 3.0% para 3.5%',
    ip_origem: '10.0.4.1 (Servidor Interno)',
  },
];
