import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { AbaNavegacao } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { BuscaFiscal } from './pages/BuscaFiscal';
import { FilaCobrancaView } from './pages/FilaCobrancaView';
import { SimuladorTributario } from './pages/SimuladorTributario';
import { PredicaoMLView } from './pages/PredicaoMLView';
import { Login } from './pages/Login';
import { ApiService } from './services/api';
import type { ItemFilaCobranca, UsuarioLogado } from './types/tributario';

export const App: React.FC = () => {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => ApiService.obterUsuarioSalvo());
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('dashboard');
  const [fila, setFila] = useState<ItemFilaCobranca[]>([]);
  const [cpfParaConsulta, setCpfParaConsulta] = useState<string>('');

  const carregarFila = () => {
    if (!usuario || usuario.perfil === 'consulta') return;
    ApiService.listarFilaCobranca()
      .then((dados) => {
        setFila(dados);
      })
      .catch((err) => {
        console.error('Falha ao listar fila de cobrança:', err);
      });
  };

  useEffect(() => {
    if (usuario) {
      if (usuario.perfil === 'consulta') {
        setAbaAtiva('busca');
        setCpfParaConsulta(usuario.cpf || '');
      } else {
        setAbaAtiva('dashboard');
        carregarFila();
      }
    }
  }, [usuario]);

  const handleLogin = (u: UsuarioLogado) => {
    setUsuario(u);
    if (u.perfil === 'consulta') {
      setAbaAtiva('busca');
      setCpfParaConsulta(u.cpf || '');
    } else {
      setAbaAtiva('dashboard');
    }
  };

  const handleLogout = () => {
    ApiService.encerrarSessao();
    setUsuario(null);
    setCpfParaConsulta('');
    setFila([]);
  };

  const handleConsultarCpf = (cpf: string) => {
    setCpfParaConsulta(cpf);
    setAbaAtiva('busca');
  };

  // Se não estiver logado, exibe a tela de login institucional
  if (!usuario) {
    return <Login aoLogar={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        abaAtiva={abaAtiva}
        aoMudarAba={setAbaAtiva}
        usuario={usuario}
        aoSair={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {abaAtiva === 'dashboard' && (
          <Dashboard
            fila={fila}
            aoVerFila={() => setAbaAtiva('fila')}
            aoConsultarCpf={handleConsultarCpf}
            aoRecarregarDados={carregarFila}
          />
        )}

        {abaAtiva === 'busca' && <BuscaFiscal cpfInicial={cpfParaConsulta} />}

        {abaAtiva === 'fila' && (
          <FilaCobrancaView fila={fila} aoConsultarCpf={handleConsultarCpf} />
        )}

        {abaAtiva === 'predicao' && <PredicaoMLView />}

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
            Sessão ativa: <strong className="text-slate-600">{usuario.nome}</strong> ({usuario.perfil.toUpperCase()})
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
