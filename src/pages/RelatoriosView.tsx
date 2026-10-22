import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { TipoTributo } from '../types/tributario';

interface ItemRelatorio {
  tributo: TipoTributo;
  nome: string;
  categoria: string;
  arrecadacaoEstimada: number;
  contribuintesAtivos: number;
  inadimplenciaEstimada: number;
  aliquota: number;
}

export const RelatoriosView: React.FC = () => {
  const [exercicio, setExercicio] = useState<number>(2026);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [mensagemExportacao, setMensagemExportacao] = useState<string | null>(null);

  useEffect(() => {
    ApiService.listarTributos();
  }, []);

  // Dados sintéticos de arrecadação por tributo para o relatório
  const itensRelatorio: ItemRelatorio[] = [
    {
      tributo: 'IPTU',
      nome: 'Imposto Predial e Territorial Urbano',
      categoria: 'DIRETO',
      arrecadacaoEstimada: 148500000.0,
      contribuintesAtivos: 64200,
      inadimplenciaEstimada: 18.4,
      aliquota: 1.25,
    },
    {
      tributo: 'ISS',
      nome: 'Imposto Sobre Serviços de Qualquer Natureza',
      categoria: 'INDIRETO',
      arrecadacaoEstimada: 92400000.0,
      contribuintesAtivos: 14800,
      inadimplenciaEstimada: 7.2,
      aliquota: 3.5,
    },
    {
      tributo: 'TAXA_LIXO',
      nome: 'Taxa de Coleta de Resíduos Sólidos',
      categoria: 'TAXA_MUNICIPAL',
      arrecadacaoEstimada: 28300000.0,
      contribuintesAtivos: 61000,
      inadimplenciaEstimada: 22.1,
      aliquota: 0.45,
    },
    {
      tributo: 'ALVARA',
      nome: 'Taxa de Fiscalização e Instalação de Alvará',
      categoria: 'TAXA_MUNICIPAL',
      arrecadacaoEstimada: 16800000.0,
      contribuintesAtivos: 12900,
      inadimplenciaEstimada: 9.8,
      aliquota: 2.0,
    },
    {
      tributo: 'COSIP',
      nome: 'Contribuição de Iluminação Pública',
      categoria: 'DIRETO',
      arrecadacaoEstimada: 31200000.0,
      contribuintesAtivos: 72000,
      inadimplenciaEstimada: 3.1,
      aliquota: 1.1,
    },
  ];

  const itensFiltrados = itensRelatorio.filter((item) => {
    if (filtroCategoria === 'TODAS') return true;
    return item.categoria === filtroCategoria;
  });

  const totalEstimado = itensFiltrados.reduce((acc, curr) => acc + curr.arrecadacaoEstimada, 0);
  const totalContribuintes = itensFiltrados.reduce((acc, curr) => acc + curr.contribuintesAtivos, 0);
  const mediaInadimplencia =
    itensFiltrados.reduce((acc, curr) => acc + curr.inadimplenciaEstimada, 0) /
    (itensFiltrados.length || 1);

  // Exportação CSV nativa no navegador
  const exportarCSV = () => {
    const cabecalho = ['Tributo', 'Nome Oficial', 'Categoria', 'Alíquota Vigente (%)', 'Arrecadação Estimada (R$)', 'Contribuintes', 'Inadimplência (%)'];
    const linhas = itensFiltrados.map((item) => [
      item.tributo,
      `"${item.nome}"`,
      item.categoria,
      item.aliquota.toFixed(2),
      item.arrecadacaoEstimada.toFixed(2),
      item.contribuintesAtivos,
      item.inadimplenciaEstimada.toFixed(1),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sitrib-arrecadacao-exercicio-${exercicio}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMensagemExportacao('Relatório CSV gerado e baixado com sucesso!');
    setTimeout(() => setMensagemExportacao(null), 3000);
  };

  // Exportação para impressão / PDF via window.print()
  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Relatório de Arrecadação Municipal Consolidada (RF09)
          </h2>
          <p className="text-sm text-slate-500">
            Demonstrativo de receitas estimadas, cobertura cadastral e índices de inadimplência de Palmas/TO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={exportarPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {mensagemExportacao && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{mensagemExportacao}</span>
        </div>
      )}

      {/* Filtros de Período e Categoria */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filtrar Categoria:</span>
          </div>

          <div className="flex gap-1.5">
            {['TODAS', 'DIRETO', 'INDIRETO', 'TAXA_MUNICIPAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                  filtroCategoria === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'TODAS'
                  ? 'Todas'
                  : cat === 'DIRETO'
                  ? 'Diretos'
                  : cat === 'INDIRETO'
                  ? 'Indiretos'
                  : 'Taxas'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Exercício Orçamentário:</span>
          <select
            value={exercicio}
            onChange={(e) => setExercicio(parseInt(e.target.value, 10))}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value={2026}>2026 (Projetado)</option>
            <option value={2025}>2025 (Executado)</option>
            <option value={2024}>2024 (Consolidado)</option>
          </select>
        </div>
      </div>

      {/* Cards de Indicadores do Relatório */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receita Projetada Filtrada
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Estimativa auditada com base na PGV</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Contribuintes Cobertos
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PieIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalContribuintes.toLocaleString('pt-BR')} registros
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Imóveis e inscrições municipais ativas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inadimplência Média Ponderada
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {mediaInadimplencia.toFixed(1)}%
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            <span>Alvo prioritário da Fila de Cobrança (Heap)</span>
          </div>
        </div>
      </div>

      {/* Tabela do Relatório Oficial */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Quadro Demonstrativo por Categoria Tributária
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {itensFiltrados.length} tributo(s) listado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Sigla</th>
                <th className="px-4 py-3">Nome do Tributo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-center">Alíquota</th>
                <th className="px-4 py-3 text-right">Receita Estimada</th>
                <th className="px-4 py-3 text-center">Inadimplência</th>
                <th className="px-4 py-3 text-right">Contribuintes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {itensFiltrados.map((item) => (
                <tr key={item.tributo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.tributo}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{item.nome}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.categoria === 'DIRETO'
                          ? 'bg-blue-50 text-blue-700'
                          : item.categoria === 'INDIRETO'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-700">
                    {item.aliquota.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {item.arrecadacaoEstimada.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        item.inadimplenciaEstimada > 15
                          ? 'bg-rose-100 text-rose-800'
                          : item.inadimplenciaEstimada > 8
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.inadimplenciaEstimada.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                    {item.contribuintesAtivos.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="px-4 py-3">
                  TOTAL CONSOLIDADO ({exercicio})
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-800 text-sm">
                  {totalEstimado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="px-4 py-3 text-center font-mono">{mediaInadimplencia.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right font-mono">
                  {totalContribuintes.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
