import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RegistroImovel {
  codigo_debito: string;
  contribuinte_anonimizado?: string;
  cpf_cnpj_mascarado?: string;
  cpf_cnpj_anonimizado?: string;
  tipo_pessoa?: string;
  tipo_imovel?: string;
  bairro?: string;
  macrorregiao_nome?: string;
  valor_venal_imovel?: number;
  valor_original?: number;
  valor_atualizado?: number;
  valor_total?: number;
  juros_multa?: number;
  dias_atraso?: number;
  renda_media_ibge?: number;
  renda_media_regiao?: number;
  razao_divida_venal_pct?: number;
  comprometimento_renda_pct?: number;
  status_capacidade?: string;
  faixa_valor_imovel?: string;
  estrategia_ia?: string;
  solucao_proposta_ia?: string;
}

interface Props {
  registros: RegistroImovel[];
  aoConsultarNoChatbot?: (pergunta: string) => void;
}

export const CardsImoveisAnalitico: React.FC<Props> = ({
  registros,
  aoConsultarNoChatbot,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [filtroRegiao, setFiltroRegiao] = useState<string>('TODAS');
  const [filtroFaixa, setFiltroFaixa] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [ordenacao, setOrdenacao] = useState<'debito_desc' | 'debito_asc' | 'venal_desc' | 'comprometimento_desc'>('debito_desc');
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [cardExpandidoId, setCardExpandidoId] = useState<string | null>(null);

  const ITENS_POR_PAGINA = 6;

  const obterValorDebito = (r: any) => Number(r.valor_total ?? r.valor_atualizado ?? 0);
  const obterValorVenal = (r: any) => Number(r.valor_venal_imovel ?? 0);
  const obterComprometimento = (r: any) => Number(r.comprometimento_renda_pct ?? 0);

  // Filtragem e ordenação
  const registrosFiltrados = useMemo(() => {
    return registros
      .filter((r) => {
        if (filtroRegiao !== 'TODAS' && r.macrorregiao_nome !== filtroRegiao) return false;
        if (filtroFaixa !== 'TODAS' && r.faixa_valor_imovel !== filtroFaixa) return false;
        if (filtroStatus !== 'TODOS' && r.status_capacidade !== filtroStatus) return false;
        if (busca.trim()) {
          const termo = busca.toLowerCase();
          const matchBairro = (r.bairro || '').toLowerCase().includes(termo);
          const matchCod = (r.codigo_debito || '').toLowerCase().includes(termo);
          const matchReg = (r.macrorregiao_nome || '').toLowerCase().includes(termo);
          if (!matchBairro && !matchCod && !matchReg) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (ordenacao === 'debito_desc') return obterValorDebito(b) - obterValorDebito(a);
        if (ordenacao === 'debito_asc') return obterValorDebito(a) - obterValorDebito(b);
        if (ordenacao === 'venal_desc') return obterValorVenal(b) - obterValorVenal(a);
        if (ordenacao === 'comprometimento_desc') return obterComprometimento(b) - obterComprometimento(a);
        return 0;
      });
  }, [registros, busca, filtroRegiao, filtroFaixa, filtroStatus, ordenacao]);

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / ITENS_POR_PAGINA));
  const inicioIndice = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const registrosPagina = registrosFiltrados.slice(inicioIndice, inicioIndice + ITENS_POR_PAGINA);

  const mudarPagina = (nova: number) => {
    if (nova >= 1 && nova <= totalPaginas) {
      setPaginaAtual(nova);
    }
  };

  const regioesDisponiveis = useMemo(() => {
    const s = new Set<string>();
    registros.forEach((r) => r.macrorregiao_nome && s.add(r.macrorregiao_nome));
    return Array.from(s);
  }, [registros]);

  return (
    <div className="space-y-4">
      {/* PAINEL DE CONTROLE DE FILTROS & INDICADORES */}
      <div className="bg-white border border-neutral-300 rounded-lg p-4 shadow-sm space-y-3">
        {/* Linha 1: Busca e Ordenação */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              placeholder="Filtrar por bairro de Palmas, código ou macrorregião..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 bg-neutral-50"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar:
            </span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white font-medium text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              <option value="debito_desc">Maior Débito (R$)</option>
              <option value="debito_asc">Menor Débito (R$)</option>
              <option value="venal_desc">Maior Valor Venal</option>
              <option value="comprometimento_desc">Maior Comprometimento (%)</option>
            </select>
          </div>
        </div>

        {/* Linha 2: Pills de Filtro Rápido */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 text-xs">
          <span className="text-neutral-500 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" /> Região:
          </span>
          <button
            onClick={() => {
              setFiltroRegiao('TODAS');
              setPaginaAtual(1);
            }}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              filtroRegiao === 'TODAS'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
            }`}
          >
            Todas ({registros.length})
          </button>
          {regioesDisponiveis.map((reg) => (
            <button
              key={reg}
              onClick={() => {
                setFiltroRegiao(reg);
                setPaginaAtual(1);
              }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                filtroRegiao === reg
                  ? 'bg-[#7f1d1d] text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* Linha 3: Filtro por Perfil e Faixa */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-semibold">Perfil:</span>
            {['TODOS', 'VULNERABILIDADE_PROTEGIDA', 'ALTA_CAPACIDADE', 'CAPACIDADE_MODERADA_REFIS'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFiltroStatus(st);
                  setPaginaAtual(1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  filtroStatus === st
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-300'
                }`}
              >
                {st === 'TODOS'
                  ? 'Todos'
                  : st === 'VULNERABILIDADE_PROTEGIDA'
                  ? '🛡️ Vulnerável'
                  : st === 'ALTA_CAPACIDADE'
                  ? '💎 Alta Capacidade'
                  : '⚖️ Moderado'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-semibold">Faixa Venal:</span>
            {['TODAS', 'Popular (Até R$ 150k)', 'Médio Padrão (R$ 150k a 700k)', 'Alto Padrão / Luxo (> R$ 700k)'].map((fx) => (
              <button
                key={fx}
                onClick={() => {
                  setFiltroFaixa(fx);
                  setPaginaAtual(1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  filtroFaixa === fx
                    ? 'bg-[#7f1d1d] text-white'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-300'
                }`}
              >
                {fx === 'TODAS'
                  ? 'Todas'
                  : fx.startsWith('Popular')
                  ? 'Popular'
                  : fx.startsWith('Médio')
                  ? 'Médio'
                  : 'Alto Padrão'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SÍNTESE QUANTITATIVA DOS RESULTADOS FILTRADOS */}
      <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
        <span>
          Encontrados <strong>{registrosFiltrados.length}</strong> imóveis/débitos com base saneada de Palmas.
        </span>
        <span className="text-[11px]">
          Página <strong>{paginaAtual}</strong> de <strong>{totalPaginas}</strong>
        </span>
      </div>

      {/* GRID DE CARDS MODERNOS E INFORMATIVOS */}
      {registrosPagina.length === 0 ? (
        <div className="p-8 text-center bg-white border border-neutral-300 rounded-lg text-neutral-500 text-xs">
          Nenhum imóvel ou débito encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrosPagina.map((item) => {
            const isExpandido = cardExpandidoId === item.codigo_debito;
            const isVulneravel = item.status_capacidade === 'VULNERABILIDADE_PROTEGIDA';
            const isAltaCap = item.status_capacidade === 'ALTA_CAPACIDADE';

            const debitoVal = Number(item.valor_total ?? item.valor_atualizado ?? 0);
            const jurosVal = Number(item.juros_multa ?? 0);
            const venalVal = Number(item.valor_venal_imovel ?? 0);
            const originalVal = Number(item.valor_original ?? 0);
            const rendaVal = Number(item.renda_media_regiao ?? item.renda_media_ibge ?? 0);
            const razaoVenal = Number(item.razao_divida_venal_pct ?? 0);
            const compRenda = Number(item.comprometimento_renda_pct ?? 0);
            const solucaoIA = item.solucao_proposta_ia || item.estrategia_ia || 'Solução do Agente de IA';

            return (
              <div
                key={item.codigo_debito}
                className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow transition-all flex flex-col justify-between ${
                  isVulneravel
                    ? 'border-emerald-300 ring-1 ring-emerald-100'
                    : isAltaCap
                    ? 'border-[#7f1d1d]/40 ring-1 ring-red-50'
                    : 'border-neutral-300'
                }`}
              >
                {/* Header do Card */}
                <div className="p-3.5 bg-neutral-50/70 border-b border-neutral-200">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {item.codigo_debito}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isVulneravel
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isAltaCap
                          ? 'bg-[#7f1d1d] text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isVulneravel
                        ? '🛡️ Vulnerabilidade Protegida'
                        : isAltaCap
                        ? '💎 Alta Capacidade'
                        : '⚖️ Moderada (REFIS)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{item.bairro}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {item.macrorregiao_nome}
                    </span>
                  </div>
                </div>

                {/* Corpo do Card: 4 Indicadores Fazendários */}
                <div className="p-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Indicador 1: Débito Total */}
                    <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 block">Débito Atualizado</span>
                      <span className="font-mono font-bold text-sm text-neutral-900 block">
                        R$ {debitoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-neutral-500 block truncate">
                        Juros: R$ {jurosVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Indicador 2: Valor Venal */}
                    <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 block">Valor Venal Imóvel</span>
                      <span className="font-mono font-bold text-sm text-neutral-900 block">
                        R$ {venalVal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-[9px] text-neutral-500 block truncate">
                        Tipo: {item.tipo_imovel || 'RESIDENCIAL'}
                      </span>
                    </div>

                    {/* Indicador 3: Razão Dívida / Venal */}
                    <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span>Dívida / Venal</span>
                        <strong className="text-neutral-800">{razaoVenal}%</strong>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            razaoVenal > 5
                              ? 'bg-amber-500'
                              : razaoVenal > 15
                              ? 'bg-red-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(razaoVenal * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-0.5 block">
                        {razaoVenal < 5 ? 'Solvência garantida' : 'Exige atenção'}
                      </span>
                    </div>

                    {/* Indicador 4: Comprometimento de Renda */}
                    <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span>Impacto Renda IBGE</span>
                        <strong
                          className={
                            compRenda > 10 ? 'text-[#7f1d1d]' : 'text-emerald-700'
                          }
                        >
                          {compRenda}%
                        </strong>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            compRenda > 10 ? 'bg-[#7f1d1d]' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(compRenda * 3.5, 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-0.5 block">
                        Renda: R$ {rendaVal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Diagnóstico da IA */}
                  <div className="p-2.5 bg-neutral-50 border-l-2 border-[#7f1d1d] rounded text-[11px] text-neutral-700">
                    <strong className="text-neutral-900 block text-[10px] uppercase tracking-wider mb-0.5">
                      Diretriz da IA:
                    </strong>
                    <p className="leading-snug">{solucaoIA}</p>
                  </div>

                  {/* Detalhes Expansíveis */}
                  {isExpandido && (
                    <div className="p-2.5 bg-neutral-100 rounded text-[11px] space-y-1.5 border border-neutral-200">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Valor Original:</span>
                        <span className="font-mono font-medium">
                          R$ {originalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Dias em Atraso:</span>
                        <span className="font-mono font-medium">{item.dias_atraso || 0} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Tipo de Pessoa:</span>
                        <span className="font-semibold text-neutral-800">{item.tipo_pessoa || 'FISICA'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">
                        🛡️ Dados protegidos por Blind Inference (Art. 6º LGPD).
                      </div>
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="p-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setCardExpandidoId(isExpandido ? null : item.codigo_debito)}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>{isExpandido ? 'Menos Detalhes' : 'Ver Ficha Completa'}</span>
                    {isExpandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() =>
                      aoConsultarNoChatbot?.(
                        `Analise o débito ${item.codigo_debito} no bairro ${item.bairro} (Valor Venal R$ ${venalVal}, Débito R$ ${debitoVal}) com o ciclo ReAct.`
                      )
                    }
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auditar no ReAct</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTROLE DE PAGINAÇÃO LIMPO E COMPLETO */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between bg-white border border-neutral-300 rounded-lg p-3 text-xs">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual <= 1}
            className="px-3 py-1.5 border border-neutral-300 rounded font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => mudarPagina(pg)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  paginaAtual === pg
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>

          <button
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual >= totalPaginas}
            className="px-3 py-1.5 border border-neutral-300 rounded font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <span>Próxima</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
