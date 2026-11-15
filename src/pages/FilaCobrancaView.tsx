import React, { useState, useEffect, useCallback } from 'react';
import {
  ListOrdered,
  ShieldAlert,
  Cpu,
  Filter,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type {
  ItemFilaCobranca,
  OpcoesFiltrosAuditoria,
  ConsultaDebitosAuditoriaResponse,
} from '../types/tributario';

interface FilaCobrancaViewProps {
  fila: ItemFilaCobranca[];
  aoConsultarCpf: (cpf: string) => void;
}

const MESES_LABEL: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};

export const FilaCobrancaView: React.FC<FilaCobrancaViewProps> = ({ fila, aoConsultarCpf }) => {
  const [opcoes, setOpcoes] = useState<OpcoesFiltrosAuditoria | null>(null);
  const [auditoria, setAuditoria] = useState<ConsultaDebitosAuditoriaResponse | null>(null);
  const [carregandoAuditoria, setCarregandoAuditoria] = useState(false);
  const [erroAuditoria, setErroAuditoria] = useState<string | null>(null);
  const [executandoColeta, setExecutandoColeta] = useState(false);
  const [statusColeta, setStatusColeta] = useState<string | null>(null);

  // Estado dos filtros dinâmicos + paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [origemApi, setOrigemApi] = useState<string>('dual');
  const [exercicioAno, setExercicioAno] = useState<string>('');
  const [mesVencimento, setMesVencimento] = useState<string>('');
  const [tipoTributo, setTipoTributo] = useState<string>('');
  const [statusDivida, setStatusDivida] = useState<string>('');
  const [bairro, setBairro] = useState<string>('');
  const [tipoPessoa, setTipoPessoa] = useState<string>('');
  const [temProcesso, setTemProcesso] = useState<string>('');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('valor_atualizado_desc');

  const carregarOpcoes = useCallback(async () => {
    try {
      const dados = await ApiService.obterOpcoesFiltrosAuditoria();
      setOpcoes(dados);
    } catch (err: any) {
      console.warn('Filtros dinâmicos indisponíveis:', err?.message);
    }
  }, []);

  const consultarAuditoria = useCallback(
    async (paginaAlvo: number = page) => {
      setCarregandoAuditoria(true);
      setErroAuditoria(null);
      try {
        const resposta = await ApiService.consultarDebitosAuditoria({
          page: paginaAlvo,
          page_size: pageSize,
          origem_api: origemApi !== 'dual' ? origemApi : undefined,
          exercicio_ano: exercicioAno || undefined,
          mes_vencimento: mesVencimento || undefined,
          tipo_tributo: tipoTributo || undefined,
          status_divida: statusDivida || undefined,
          bairro: bairro || undefined,
          tipo_pessoa: tipoPessoa || undefined,
          tem_processo: temProcesso !== '' ? temProcesso : undefined,
          busca_texto: buscaTexto.trim() || undefined,
          ordenar_por: ordenarPor,
        });
        setAuditoria(resposta);
      } catch (err: any) {
        setErroAuditoria(err.message || 'Não foi possível carregar os débitos categorizados.');
      } finally {
        setCarregandoAuditoria(false);
      }
    },
    [
      page,
      pageSize,
      origemApi,
      exercicioAno,
      mesVencimento,
      tipoTributo,
      statusDivida,
      bairro,
      tipoPessoa,
      temProcesso,
      buscaTexto,
      ordenarPor,
    ]
  );

  useEffect(() => {
    carregarOpcoes();
  }, [carregarOpcoes]);

  useEffect(() => {
    consultarAuditoria(page);
  }, [page, pageSize, origemApi, exercicioAno, mesVencimento, tipoTributo, statusDivida, bairro, tipoPessoa, temProcesso, ordenarPor, consultarAuditoria]);

  const handleExecutarColeta = async (origem: 'dual' | 'portal_novo' | 'api_antiga') => {
    setExecutandoColeta(true);
    setStatusColeta(null);
    try {
      const res = await ApiService.executarColetaMunicipal(origem);
      setStatusColeta(`${res.mensagem} (${res.registros_obtidos} registro(s) • Banco: ${res.banco_ativo})`);
      await carregarOpcoes();
      await consultarAuditoria(1);
    } catch (err: any) {
      setStatusColeta(`Erro na coleta: ${err.message}`);
    } finally {
      setExecutandoColeta(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Auditoria Paginada & Fila de Cobrança</h2>
          <p className="text-sm text-slate-500">
            Consulte débitos por coluna, maiores devedores do mês/ano, índice 2026 e fontes da Prefeitura (Portal Novo & API Antiga).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Max-Heap + Paginação REST</span>
        </div>
      </div>

      {/* Painel de Auditoria Categorizada e Paginada */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Filtros Dinâmicos do Banco ({auditoria?.banco_ativo || 'PostgreSQL / SQLite'})
              </h3>
              <p className="text-xs text-slate-500">
                Cruzamento direto com todas as categorias das tabelas contribuinte, imovel, divida e processo.
              </p>
            </div>
          </div>

          {/* Disparo de Coleta nas duas APIs da Prefeitura */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={executandoColeta}
              onClick={() => handleExecutarColeta('dual')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${executandoColeta ? 'animate-spin' : ''}`} />
              <span>Sincronizar Dual (Antiga + Nova)</span>
            </button>
            <button
              type="button"
              disabled={executandoColeta}
              onClick={() => handleExecutarColeta('portal_novo')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 disabled:opacity-50"
            >
              Portal Novo
            </button>
            <button
              type="button"
              disabled={executandoColeta}
              onClick={() => handleExecutarColeta('api_antiga')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 disabled:opacity-50"
            >
              API Antiga
            </button>
          </div>
        </div>

        {statusColeta && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <Database className="w-4 h-4 shrink-0" />
            <span>{statusColeta}</span>
          </div>
        )}

        {/* Grade de Seletores por Coluna */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Origem API Prefeitura</label>
            <select
              value={origemApi}
              onChange={(e) => {
                setOrigemApi(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="dual">Todas (Dual: Portal Novo + API Antiga)</option>
              <option value="portal_novo">Portal Novo (Nucleogov - POST)</option>
              <option value="api_antiga">API Antiga (REST Legada - GET)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Exercício (Ano / Índice 2026)</label>
            <select
              value={exercicioAno}
              onChange={(e) => {
                setExercicioAno(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">Todos os anos</option>
              {(opcoes?.exercicios_ano || [2026, 2024, 2023, 2022, 2021]).map((ano) => (
                <option key={ano} value={ano}>
                  Exercício {ano} {ano === 2026 ? '(Índice Vigente)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Mês de Vencimento</label>
            <select
              value={mesVencimento}
              onChange={(e) => {
                setMesVencimento(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">Todos os meses</option>
              {Object.entries(MESES_LABEL).map(([num, nome]) => (
                <option key={num} value={num}>
                  {num.padStart(2, '0')} - {nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Tipo de Tributo</label>
            <select
              value={tipoTributo}
              onChange={(e) => {
                setTipoTributo(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">Todos os tributos</option>
              {(opcoes?.tipos_tributo || ['IPTU', 'ISS', 'TAXA_LIXO']).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status da Dívida</label>
            <select
              value={statusDivida}
              onChange={(e) => {
                setStatusDivida(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">Todos os status</option>
              {(opcoes?.status_divida || ['ATIVO', 'AJUIZADO', 'EM_ABERTO']).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Bairro / Setor</label>
            <select
              value={bairro}
              onChange={(e) => {
                setBairro(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="">Todos os bairros</option>
              {(opcoes?.bairros || []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Perfil & Execução</label>
            <div className="flex gap-1.5">
              <select
                value={tipoPessoa}
                onChange={(e) => {
                  setTipoPessoa(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="">PF/PJ</option>
                {(opcoes?.tipos_pessoa || ['FISICA', 'JURIDICA']).map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
              <select
                value={temProcesso}
                onChange={(e) => {
                  setTemProcesso(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="">Judicial: Todos</option>
                <option value="true">Com Processo</option>
                <option value="false">Sem Processo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Ordenação / Itens por Página</label>
            <div className="flex gap-1.5">
              <select
                value={ordenarPor}
                onChange={(e) => {
                  setOrdenarPor(e.target.value);
                  setPage(1);
                }}
                className="w-2/3 px-2 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="valor_atualizado_desc">Maiores Devedores (↓)</option>
                <option value="valor_atualizado_asc">Menores Valores (↑)</option>
                <option value="exercicio_ano_desc">Ano mais recente</option>
                <option value="data_vencimento_asc">Vencimento mais antigo</option>
              </select>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="w-1/3 px-2 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value={5}>5/pág</option>
                <option value={10}>10/pág</option>
                <option value={25}>25/pág</option>
              </select>
            </div>
          </div>
        </div>

        {/* Busca Textual Rápida */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            consultarAuditoria(1);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por nome do contribuinte, CPF/CNPJ ou inscrição CCI..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Filtrar
          </button>
        </form>

        {/* Índice 2026 e Maiores Devedores do Filtro */}
        {auditoria && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Índice Exercício {auditoria.resumo_categoria.indice_exercicio_2026.ano_referencia}
              </div>
              <div className="space-y-1 text-slate-600">
                <div>
                  UFIP Palmas 2026: <strong>{auditoria.resumo_categoria.indice_exercicio_2026.ufip_palmas_2026}</strong>
                </div>
                <div>
                  IPCA Acumulado: <strong>{auditoria.resumo_categoria.indice_exercicio_2026.ipca_acumulado_aplicado}</strong>
                </div>
                <div>
                  Meta Recuperação: <strong>{auditoria.resumo_categoria.indice_exercicio_2026.meta_recuperacao_divida_ativa_2026}</strong>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-bold text-slate-800">
                  Maiores Devedores no Filtro ({auditoria.resumo_categoria.quantidade_debitos} débitos •{' '}
                  {auditoria.resumo_categoria.soma_valor_atualizado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  )
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {auditoria.resumo_categoria.maiores_devedores_periodo.map((dev, i) => (
                  <div
                    key={dev.cpf_cnpj}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono font-bold text-slate-500 mr-1">#{i + 1}</span>
                      <span className="font-semibold text-slate-800">{dev.nome}</span>
                    </div>
                    <span className="font-bold text-rose-700 shrink-0">
                      {dev.total_devido_filtro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {erroAuditoria && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {erroAuditoria}
          </div>
        )}

        {/* Tabela Paginada de Débitos */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Contribuinte / CPF-CNPJ</th>
                <th className="px-3 py-2.5">Imóvel / Bairro</th>
                <th className="px-3 py-2.5">Tributo / Ano</th>
                <th className="px-3 py-2.5">Origem API</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Valor Atualizado</th>
                <th className="px-3 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregandoAuditoria ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Carregando consulta paginada do banco...
                  </td>
                </tr>
              ) : auditoria?.itens.length ? (
                auditoria.itens.map((d) => (
                  <tr key={d.codigo_debito} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900">{d.nome_contribuinte}</div>
                      <div className="font-mono text-[11px] text-slate-500">{d.cpf_cnpj_contribuinte}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-slate-800">{d.inscricao_cci}</div>
                      <div className="text-[11px] text-slate-500">{d.bairro}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-slate-800">{d.tipo_tributo}</span>
                      <div className="text-[11px] text-slate-500">
                        {d.exercicio_ano} • Mês {String(d.mes_vencimento).padStart(2, '0')}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          d.origem_api === 'portal_novo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.origem_api}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status_divida === 'AJUIZADO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {d.status_divida}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {d.valor_atualizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => aoConsultarCpf(d.cpf_cnpj_contribuinte)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold"
                      >
                        Dossiê
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Nenhum débito encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        {auditoria && (
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span>
              Página <strong>{auditoria.paginacao.pagina_atual}</strong> de{' '}
              <strong>{auditoria.paginacao.total_paginas}</strong> ({auditoria.paginacao.total_registros} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!auditoria.paginacao.tem_anterior || carregandoAuditoria}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                type="button"
                disabled={!auditoria.paginacao.tem_proxima || carregandoAuditoria}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
              >
                Próxima <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explicação da Estrutura */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-start gap-4">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
          <ListOrdered className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">Como a Fila de Cobrança (Max-Heap) Opera</h4>
          <p className="leading-relaxed">
            A estrutura armazena tuplas ordenadas pelo score de inadimplência (valor da dívida, tempo de atraso e processos judiciais). O contribuinte com maior severidade ocupa o topo da fila para cobrança prioritária.
          </p>
        </div>
      </div>

      {/* Listagem Completa da Fila Heap */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Ranking de Criticidade ({fila.length} Contribuintes Priorizados)
          </span>
          <span className="text-xs text-slate-400">Ordem decrescente de Score</span>
        </div>

        <div className="divide-y divide-slate-100">
          {fila.map((item, index) => (
            <div
              key={item.cpf_cnpj}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm font-mono shrink-0">
                  #{index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.nome}</span>
                    {item.tem_processo_judicial && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Execução Ajuizada
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {item.cpf_cnpj} • {item.quantidade_debitos} débito(s) registrado(s)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Valor Devido</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="w-24 text-right">
                  <div className="text-xs text-slate-400 font-medium">Score</div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 80 ? 'bg-rose-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-700">{item.score}</span>
                  </div>
                </div>

                <button
                  onClick={() => aoConsultarCpf(item.cpf_cnpj)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Abrir Dossiê
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
