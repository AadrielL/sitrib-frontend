import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
  User,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import type { ItemFilaCobranca } from '../types/tributario';
import { ApiService } from '../services/api';

interface FilaCobrancaViewProps {
  fila: ItemFilaCobranca[];
  aoConsultarCpf: (cpf: string) => void;
  aoRecarregarDados?: () => void;
}

export const FilaCobrancaView: React.FC<FilaCobrancaViewProps> = ({
  fila,
  aoConsultarCpf,
  aoRecarregarDados,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroFaixa, setFiltroFaixa] = useState<'todos' | 'grande' | 'medio' | 'pequeno'>('todos');
  const [filtroTributo, setFiltroTributo] = useState<string>('todos');
  const [filtroBairro, setFiltroBairro] = useState<string>('todos');
  const [apenasAjuizados, setApenasAjuizados] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState<'score' | 'valor'>('score');
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState<string | null>(null);

  const listaBairros = useMemo(() => {
    const bairrosSet = new Set<string>();
    fila.forEach((item) => {
      if (item.bairros) item.bairros.forEach((b) => bairrosSet.add(b));
      else if (item.bairro_principal) bairrosSet.add(item.bairro_principal);
    });
    return Array.from(bairrosSet).sort();
  }, [fila]);

  const listaTributos = useMemo(() => {
    const tribSet = new Set<string>();
    fila.forEach((item) => {
      if (item.tipos_tributo) item.tipos_tributo.forEach((t) => tribSet.add(t));
      else if (item.tipo_tributo_str) tribSet.add(item.tipo_tributo_str);
    });
    return Array.from(tribSet).sort();
  }, [fila]);

  const filaFiltrada = useMemo(() => {
    let resultado = [...fila];

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      const digitos = busca.replace(/\D/g, '');
      resultado = resultado.filter((item) => {
        const nomeMatch = item.nome.toLowerCase().includes(termo);
        const cpfMatch = digitos ? item.cpf_cnpj.replace(/\D/g, '').includes(digitos) : false;
        return nomeMatch || cpfMatch;
      });
    }

    if (filtroFaixa !== 'todos') {
      resultado = resultado.filter((item) => {
        const faixa = (item.faixa_devedor || '').toLowerCase();
        if (filtroFaixa === 'grande') return faixa.includes('grande') || item.valor_total >= 50000;
        if (filtroFaixa === 'medio') return faixa.includes('médio') || faixa.includes('medio') || (item.valor_total >= 10000 && item.valor_total < 50000);
        if (filtroFaixa === 'pequeno') return faixa.includes('pequeno') || item.valor_total < 10000;
        return true;
      });
    }

    if (filtroTributo !== 'todos') {
      resultado = resultado.filter((item) => {
        if (item.tipos_tributo) return item.tipos_tributo.includes(filtroTributo);
        if (item.tipo_tributo_str) return item.tipo_tributo_str.includes(filtroTributo);
        return true;
      });
    }

    if (filtroBairro !== 'todos') {
      resultado = resultado.filter((item) => {
        if (item.bairros) return item.bairros.includes(filtroBairro);
        if (item.bairro_principal) return item.bairro_principal === filtroBairro;
        return true;
      });
    }

    if (apenasAjuizados) {
      resultado = resultado.filter((item) => item.tem_processo_judicial);
    }

    resultado.sort((a, b) => {
      if (ordenarPor === 'valor') {
        return b.valor_total - a.valor_total;
      }
      return b.score - a.score;
    });

    return resultado;
  }, [fila, busca, filtroFaixa, filtroTributo, filtroBairro, apenasAjuizados, ordenarPor]);

  const totais = useMemo(() => {
    const totalRegistros = filaFiltrada.length;
    const montanteTotal = filaFiltrada.reduce((acc, cur) => acc + cur.valor_total, 0);
    const totalAjuizados = filaFiltrada.filter((cur) => cur.tem_processo_judicial).length;
    return { totalRegistros, montanteTotal, totalAjuizados };
  }, [filaFiltrada]);

  const handleSincronizarBanco = async () => {
    setSincronizando(true);
    setMensagemAviso(null);
    try {
      const resp = await ApiService.sincronizarBanco();
      setMensagemAviso(`Sincronização concluída: ${resp.mensagem}`);
      if (aoRecarregarDados) aoRecarregarDados();
    } catch {
      setMensagemAviso('Falha na sincronização direta. Operando com dados em cache local.');
    } finally {
      setSincronizando(false);
    }
  };

  const exportarCSV = () => {
    const cabecalho = 'Posição,Nome,Documento,Score,Débito Total,Bairro,Ajuizados\n';
    const linhas = filaFiltrada.map((item, idx) => {
      const doc = item.cpf_cnpj;
      const nome = `"${item.nome.replace(/"/g, '""')}"`;
      const bairro = `"${(item.bairro_principal || '').replace(/"/g, '""')}"`;
      return `${idx + 1},${nome},${doc},${item.score},${item.valor_total.toFixed(2)},${bairro},${item.tem_processo_judicial ? 'Sim' : 'Não'}`;
    }).join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fila_cobranca_sitrib_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho da Área Auditoria */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f1d1d]">
              Auditoria Fiscal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Fila Prioritária de Cobrança & Conciliação</h1>
          <p className="text-sm text-neutral-600">
            Classificação estratégica de contribuintes por potencial de recuperação fiscal, tempo de mora e capacidade de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleSincronizarBanco}
            disabled={sincronizando}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#7f1d1d] text-white rounded hover:bg-[#991b1b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
            <span>{sincronizando ? 'Atualizando...' : 'Atualizar Fila'}</span>
          </button>
        </div>
      </div>

      {mensagemAviso && (
        <div className="p-3 bg-neutral-100 border-l-4 border-neutral-600 text-xs text-neutral-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-neutral-700" />
          <span>{mensagemAviso}</span>
        </div>
      )}

      {/* Resumo Métrico Sóbrio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded">
          <div className="text-xs text-neutral-500 font-medium">Contribuintes na Fila</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{totais.totalRegistros}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Filtrados do estoque ativo</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded">
          <div className="text-xs text-neutral-500 font-medium">Montante em Cobrança</div>
          <div className="text-2xl font-bold text-[#7f1d1d] mt-1 font-mono">
            R$ {totais.montanteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Dívida ativa e administrativa</div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded">
          <div className="text-xs text-neutral-500 font-medium">Execuções Ajuizadas</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{totais.totalAjuizados}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Processos judiciais em trâmite</div>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-white border border-neutral-200 rounded p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar contribuinte por Razão Social, Nome ou CPF/CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#7f1d1d] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>Faixa:</span>
            </div>
            <select
              value={filtroFaixa}
              onChange={(e) => setFiltroFaixa(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
            >
              <option value="todos">Todas as Faixas</option>
              <option value="grande">Grandes Devedores (&gt; R$ 50k)</option>
              <option value="medio">Médios Devedores (R$ 10k a 50k)</option>
              <option value="pequeno">Pequenos Devedores (&lt; R$ 10k)</option>
            </select>

            <select
              value={filtroTributo}
              onChange={(e) => setFiltroTributo(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white"
            >
              <option value="todos">Todos os Tributos</option>
              {listaTributos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filtroBairro}
              onChange={(e) => setFiltroBairro(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white max-w-[180px] truncate"
            >
              <option value="todos">Todos os Bairros</option>
              {listaBairros.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <button
              onClick={() => setOrdenarPor(ordenarPor === 'score' ? 'valor' : 'score')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
              title="Alternar critério de ordenação"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span>Ord: {ordenarPor === 'score' ? 'Score' : 'Valor'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-neutral-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
            <input
              type="checkbox"
              checked={apenasAjuizados}
              onChange={(e) => setApenasAjuizados(e.target.checked)}
              className="rounded border-neutral-300 text-[#7f1d1d] focus:ring-0"
            />
            <span>Apenas com dívidas ajuizadas (Execução Fiscal em trâmite)</span>
          </label>
        </div>
      </div>

      {/* Tabela de Contribuintes Sóbria */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold">
                <th className="py-2.5 px-3 w-16 text-center">Score</th>
                <th className="py-2.5 px-4">Contribuinte / Razão Social</th>
                <th className="py-2.5 px-3">CPF / CNPJ</th>
                <th className="py-2.5 px-3">Bairro</th>
                <th className="py-2.5 px-3 text-right">Débito Total</th>
                <th className="py-2.5 px-3 text-center">Situação</th>
                <th className="py-2.5 px-3 text-center w-24">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Nenhum contribuinte encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filaFiltrada.map((item) => {
                  const isPJ = item.cpf_cnpj.replace(/\D/g, '').length > 11;
                  return (
                    <tr key={item.cpf_cnpj} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          item.score >= 80
                            ? 'bg-neutral-900 text-white'
                            : item.score >= 50
                            ? 'bg-[#7f1d1d] text-white'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}>
                          {item.score} pts
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isPJ ? (
                            <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          )}
                          <span className="font-semibold text-neutral-900">{item.nome}</span>
                        </div>
                        {item.tipos_tributo && item.tipos_tributo.length > 0 && (
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Tributos: {item.tipos_tributo.join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-neutral-600">
                        {item.cpf_cnpj}
                      </td>

                      <td className="py-3 px-3 text-neutral-700">
                        {item.bairro_principal || 'Palmas - TO'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                        R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {item.tem_processo_judicial ? (
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-neutral-200 text-[#7f1d1d] rounded">
                            {item.processos_numeros?.length ? `${item.processos_numeros.length} Ajuizado(s)` : 'Ajuizado'}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] text-neutral-500">
                            Administrativo
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => aoConsultarCpf(item.cpf_cnpj)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-900 border border-neutral-300 rounded hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
                        >
                          Dossiê
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
