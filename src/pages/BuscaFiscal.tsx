import React, { useState } from 'react';
import {
  Search,
  User,
  Home,
  FileText,
  AlertCircle,
  Building,
  CheckCircle,
  Phone,
  Mail,
  Scale,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { Contribuinte, Imovel, Divida, Processo } from '../types/tributario';

interface BuscaFiscalProps {
  cpfInicial?: string;
}

export const BuscaFiscal: React.FC<BuscaFiscalProps> = ({ cpfInicial = '' }) => {
  const [documento, setDocumento] = useState<string>(cpfInicial);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const [resultado, setResultado] = useState<{
    contribuinte: Contribuinte;
    imoveis: Imovel[];
    dividas: Divida[];
    processos: Processo[];
  } | null>(null);

  const handleBuscar = async (docParaBuscar?: string) => {
    const alvo = docParaBuscar || documento;
    if (!alvo.trim()) {
      setErro('Por favor, informe o CPF ou CNPJ para consulta.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const res = await ApiService.buscarContribuinte(alvo);
      setResultado(res);
    } catch (err: unknown) {
      setResultado(null);
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Ocorreu um erro inesperado ao realizar a busca.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const aplicarDocumentoRapido = (doc: string) => {
    setDocumento(doc);
    handleBuscar(doc);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Consulta Cadastral e Fiscal Unificada</h2>
        <p className="text-sm text-slate-500">
          Módulo de busca inteligente do SITRIB (RF06 / BuscaService). Pesquise por CPF ou CNPJ para extrair o dossiê fiscal.
        </p>
      </div>

      {/* Caixa de Busca */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleBuscar();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Digite o CPF (ex: 123.456.789-01) ou CNPJ (ex: 12.345.678/0001-90)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregando ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Consultar
          </button>
        </form>

        {/* Atalhos com massa de teste do seeds */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Exemplos cadastrados (Seeds):</span>
          <button
            type="button"
            onClick={() => aplicarDocumentoRapido('123.456.789-01')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono transition-colors"
          >
            Carlos (CPF c/ débitos e processo)
          </button>
          <button
            type="button"
            onClick={() => aplicarDocumentoRapido('12.345.678/0001-90')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono transition-colors"
          >
            Tocantins Eng. (CNPJ - ISS)
          </button>
          <button
            type="button"
            onClick={() => aplicarDocumentoRapido('987.654.321-09')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-mono transition-colors"
          >
            Maria Auxiliadora (Adimplente)
          </button>
        </div>
      </div>

      {/* Banner de Erro */}
      {erro && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Não foi possível consultar</div>
            <div className="text-xs mt-0.5">{erro}</div>
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      {resultado && (
        <div className="space-y-6">
          {/* Ficha Cadastral do Contribuinte */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  {resultado.contribuinte.tipo_pessoa === 'FISICA' ? (
                    <User className="w-6 h-6" />
                  ) : (
                    <Building className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{resultado.contribuinte.nome}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                    <span>{resultado.contribuinte.cpf_cnpj}</span>
                    <span>•</span>
                    <span className="uppercase font-sans font-semibold text-slate-600">
                      Pessoa {resultado.contribuinte.tipo_pessoa}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resultado.dividas.length === 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Situação Regular (Sem Débitos)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {resultado.dividas.length} Débito(s) Pendente(s)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>E-mail: <strong>{resultado.contribuinte.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Telefone: <strong>{resultado.contribuinte.telefone}</strong></span>
              </div>
            </div>
          </div>

          {/* Dossiê Imobiliário e Relações (Grafo) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Imóveis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-emerald-600" />
                Imóveis e Lotes Vinculados ({resultado.imoveis.length})
              </h4>

              {resultado.imoveis.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum imóvel registrado para este titular.</p>
              ) : (
                <div className="space-y-3">
                  {resultado.imoveis.map((im) => (
                    <div
                      key={im.inscricao_cci}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {im.inscricao_cci}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {im.valor_venal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-800">{im.endereco}</div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Bairro: {im.bairro} • Tipo: {im.tipo_imovel} • CEP: {im.cep}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dívidas e Ações de Execução Fiscal */}
            <div className="space-y-6">
              {/* Dívidas */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Dívidas e Pendências Tributárias ({resultado.dividas.length})
                </h4>

                {resultado.dividas.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">
                    Certidão Positiva com Efeito de Negativa ou Débito Zero.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {resultado.dividas.map((div) => (
                      <div
                        key={div.codigo_debito}
                        className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            {div.tipo_tributo} • Exercício {div.ano_exercicio}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Cód: {div.codigo_debito}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Original: R$ {div.valor_original.toFixed(2)} | Encargos: R$ {div.juros_multa.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-900">
                            R$ {(div.valor_original + div.juros_multa).toFixed(2)}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                              div.status === 'AJUIZADO'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {div.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Processos Judiciais de Execução Fiscal */}
              {resultado.processos.length > 0 && (
                <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6">
                  <h4 className="text-base font-bold text-rose-900 flex items-center gap-2 mb-3">
                    <Scale className="w-5 h-5 text-rose-600" />
                    Processos de Execução Fiscal Vinculados ({resultado.processos.length})
                  </h4>
                  <div className="space-y-2">
                    {resultado.processos.map((proc) => (
                      <div
                        key={proc.numero_processo}
                        className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs"
                      >
                        <div className="font-mono font-bold text-slate-900">{proc.numero_processo}</div>
                        <div className="text-slate-600 mt-1">{proc.vara}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Autuação: {proc.data_autuacao} • Status: {proc.status_processo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
