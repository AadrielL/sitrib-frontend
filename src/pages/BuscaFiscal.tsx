import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import type { Contribuinte, Imovel, Divida, Processo, DossieImovel } from '../types/tributario';

interface BuscaFiscalProps {
  cpfInicial?: string;
}

export const BuscaFiscal: React.FC<BuscaFiscalProps> = ({ cpfInicial = '' }) => {
  const [modoBusca, setModoBusca] = useState<'cpf' | 'cci'>('cpf');
  const [termo, setTermo] = useState(cpfInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [resultadoCpf, setResultadoCpf] = useState<{
    contribuinte: Contribuinte;
    imoveis: Imovel[];
    dividas: Divida[];
    processos: Processo[];
  } | null>(null);

  const [resultadoCci, setResultadoCci] = useState<DossieImovel | null>(null);

  const executarBusca = async (valorBusca?: string, modoOverride?: 'cpf' | 'cci') => {
    const alvo = (valorBusca ?? termo).trim();
    const modoAtual = modoOverride ?? modoBusca;
    if (!alvo) return;

    setCarregando(true);
    setErro(null);
    try {
      if (modoAtual === 'cpf') {
        const res = await ApiService.buscarContribuinte(alvo);
        setResultadoCpf(res);
        setResultadoCci(null);
      } else {
        const res = await ApiService.obterDossieImovel(alvo);
        setResultadoCci(res);
        setResultadoCpf(null);
      }
    } catch (err: any) {
      setErro(err.message || 'Registro não localizado.');
      setResultadoCpf(null);
      setResultadoCci(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (cpfInicial) {
      setTermo(cpfInicial);
      setModoBusca('cpf');
      executarBusca(cpfInicial, 'cpf');
    }
  }, [cpfInicial]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho — Área: Auditoria (Vinho) */}
      <div className="border-b-2 border-[#7f1d1d] pb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#7f1d1d]">
          Auditoria Cadastral & Trava LGPD (Art. 198 CTN)
        </span>
        <h2 className="text-xl font-bold text-neutral-950 mt-0.5">
          Dossiê Fiscal por CPF/CNPJ ou Inscrição Imobiliária (CCI)
        </h2>
        <p className="text-xs text-neutral-500">
          Consulta unificada de cadastro, imóveis, débitos ativos/ajuizados e processos de execução fiscal de Palmas.
        </p>
      </div>

      {/* Controles de Busca */}
      <div className="bg-white border border-neutral-300 rounded p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex border border-neutral-300 rounded overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setModoBusca('cpf');
                setTermo('123.456.789-01');
              }}
              className={`px-4 py-2 ${
                modoBusca === 'cpf'
                  ? 'bg-[#7f1d1d] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Por CPF / CNPJ
            </button>
            <button
              type="button"
              onClick={() => {
                setModoBusca('cci');
                setTermo('CCI-104-NORTE-01');
              }}
              className={`px-4 py-2 border-l border-neutral-300 ${
                modoBusca === 'cci'
                  ? 'bg-[#7f1d1d] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Por Inscrição Imóvel (CCI)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-neutral-500 font-semibold">Exemplos rápidos:</span>
            <button
              onClick={() => {
                setModoBusca('cpf');
                setTermo('123.456.789-01');
                executarBusca('123.456.789-01', 'cpf');
              }}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded font-mono"
            >
              123.456.789-01
            </button>
            <button
              onClick={() => {
                setModoBusca('cpf');
                setTermo('01.234.567/0001-89');
                executarBusca('01.234.567/0001-89', 'cpf');
              }}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded font-mono"
            >
              01.234.567/0001-89
            </button>
            <button
              onClick={() => {
                setModoBusca('cci');
                setTermo('CCI-104-NORTE-01');
                executarBusca('CCI-104-NORTE-01', 'cci');
              }}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded font-mono"
            >
              CCI-104-NORTE-01
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executarBusca();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={
                modoBusca === 'cpf'
                  ? 'Digite o CPF (11 dígitos) ou CNPJ (14 dígitos)...'
                  : 'Digite a Inscrição Imobiliária (ex: CCI-104-NORTE-01)...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded font-mono focus:outline-none focus:border-[#7f1d1d]"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="px-5 py-2 bg-[#7f1d1d] hover:bg-[#601515] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            {carregando ? 'Consultando...' : 'Consultar Dossiê'}
          </button>
        </form>

        {erro && (
          <div className="p-3 bg-red-50 border-l-4 border-[#7f1d1d] text-[#7f1d1d] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </div>

      {/* RESULTADO MODO CPF / CNPJ */}
      {resultadoCpf && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-300 border-l-4 border-l-[#7f1d1d] rounded p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase text-neutral-500">Contribuinte</div>
              <div className="font-bold text-neutral-950 text-sm mt-0.5">
                {resultadoCpf.contribuinte.nome}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-neutral-500">CPF / CNPJ</div>
              <div className="font-mono font-bold text-neutral-800 mt-0.5">
                {resultadoCpf.contribuinte.cpf_cnpj} ({resultadoCpf.contribuinte.tipo_pessoa})
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-neutral-500">E-mail / Telefone</div>
              <div className="text-neutral-700 mt-0.5">
                {resultadoCpf.contribuinte.email} • {resultadoCpf.contribuinte.telefone}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-neutral-500">Total Devido</div>
              <div className="font-mono font-bold text-[#7f1d1d] text-sm mt-0.5">
                {resultadoCpf.dividas
                  .reduce((acc, d) => acc + d.valor_original + d.juros_multa, 0)
                  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>

          {/* Imóveis */}
          <div className="bg-white border border-neutral-300 rounded overflow-hidden">
            <div className="px-4 py-2.5 bg-neutral-100 border-b border-neutral-300 text-xs font-bold text-neutral-900">
              Imóveis Vinculados (CCI) — {resultadoCpf.imoveis.length} registro(s)
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2">Inscrição CCI</th>
                  <th className="px-4 py-2">Endereço</th>
                  <th className="px-4 py-2">Bairro</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2 text-right">Valor Venal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {resultadoCpf.imoveis.map((im) => (
                  <tr key={im.inscricao_cci}>
                    <td className="px-4 py-2 font-mono font-bold text-[#7f1d1d]">
                      {im.inscricao_cci}
                    </td>
                    <td className="px-4 py-2 text-neutral-800">{im.endereco}</td>
                    <td className="px-4 py-2 text-neutral-600">{im.bairro}</td>
                    <td className="px-4 py-2 text-neutral-600">{im.tipo_imovel}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">
                      {Number(im.valor_venal).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dívidas */}
          <div className="bg-white border border-neutral-300 rounded overflow-hidden">
            <div className="px-4 py-2.5 bg-neutral-100 border-b border-neutral-300 text-xs font-bold text-neutral-900">
              Débitos Tributários — {resultadoCpf.dividas.length} título(s)
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2">Código</th>
                  <th className="px-4 py-2">Exercício</th>
                  <th className="px-4 py-2">Tributo</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Principal</th>
                  <th className="px-4 py-2 text-right">Juros/Multa</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {resultadoCpf.dividas.map((d) => (
                  <tr key={d.codigo_debito}>
                    <td className="px-4 py-2 font-mono">{d.codigo_debito}</td>
                    <td className="px-4 py-2 font-mono">{d.ano_exercicio}</td>
                    <td className="px-4 py-2 font-semibold">{d.tipo_tributo}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-bold text-[10px]">
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {d.valor_original.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[#7f1d1d]">
                      {d.juros_multa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {(d.valor_original + d.juros_multa).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESULTADO MODO INSCRIÇÃO IMOBILIÁRIA (CCI) */}
      {resultadoCci && (
        <div className="bg-white border border-neutral-300 rounded p-5 space-y-4 text-xs">
          <div className="border-b border-neutral-200 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#7f1d1d]">
                Dossiê Imobiliário Consolidado
              </span>
              <h3 className="text-sm font-bold text-neutral-950">
                {resultadoCci.imovel.inscricao_cci} — {resultadoCci.imovel.endereco} ({resultadoCci.imovel.bairro})
              </h3>
            </div>
            <div className="text-right font-mono">
              <div className="text-[10px] text-neutral-500">Valor Total Devido</div>
              <div className="text-sm font-bold text-[#7f1d1d]">
                {resultadoCci.valor_total_devido.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
          </div>

          <div className="text-neutral-700">
            <strong>Proprietário (CPF/CNPJ):</strong> {resultadoCci.imovel.cpf_cnpj_proprietario} •{' '}
            <strong>Tipo:</strong> {resultadoCci.imovel.tipo_imovel} • <strong>Valor Venal:</strong>{' '}
            {Number(resultadoCci.imovel.valor_venal).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
        </div>
      )}
    </div>
  );
};
