import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { AbaNavegacao } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { BuscaFiscal } from './pages/BuscaFiscal';
import { FilaCobrancaView } from './pages/FilaCobrancaView';
import { SimuladorTributario } from './pages/SimuladorTributario';
import { ApiService } from './services/api';
import type { ItemFilaCobranca } from './types/tributario';

export const App: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('dashboard');
  const [fila, setFila] = useState<ItemFilaCobranca[]>([]);
  const [cpfParaConsulta, setCpfParaConsulta] = useState<string>('');

  useEffect(() => {
    // Carrega a fila ordenada por prioridade (Max-Heap)
    ApiService.listarFilaCobranca().then((dados) => {
      setFila(dados);
    });
  }, []);

  const handleConsultarCpf = (cpf: string) => {
    setCpfParaConsulta(cpf);
    setAbaAtiva('busca');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar abaAtiva={abaAtiva} aoMudarAba={setAbaAtiva} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {abaAtiva === 'dashboard' && (
          <Dashboard
            fila={fila}
            aoVerFila={() => setAbaAtiva('fila')}
            aoConsultarCpf={handleConsultarCpf}
          />
        )}

        {abaAtiva === 'busca' && <BuscaFiscal cpfInicial={cpfParaConsulta} />}

        {abaAtiva === 'fila' && (
          <FilaCobrancaView fila={fila} aoConsultarCpf={handleConsultarCpf} />
        )}

        {abaAtiva === 'simulador' && <SimuladorTributario />}
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            <strong>SITRIB</strong> • Sistema Integrado de Gestão Tributária Municipal
          </div>
          <div>
            Projeto Integrador UFT • Ciência da Computação • 2026
          </div>
          <div className="text-slate-400">
            Frontend desacoplado • React 19 + TypeScript + Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
