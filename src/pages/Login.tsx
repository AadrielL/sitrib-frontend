import React, { useState } from 'react';
import { Building2, Shield, UserCheck, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { ApiService } from '../services/api';
import type { UsuarioLogado, UsuarioTeste } from '../types/tributario';

interface LoginProps {
  aoLogar: (usuario: UsuarioLogado) => void;
}

export const Login: React.FC<LoginProps> = ({ aoLogar }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha seu e-mail e senha.');
      return;
    }
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await ApiService.login(email, senha);
      aoLogar(resposta.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha ao autenticar.');
    } finally {
      setCarregando(false);
    }
  };

  const preencherUsuarioTeste = (u: UsuarioTeste) => {
    setEmail(u.email);
    setSenha(u.senha);
    setErro(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
          <Building2 className="w-9 h-9" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
          SITRIB Palmas
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sistema Integrado de Gestão Tributária Municipal • SEFIN
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800 border border-slate-700 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {erro && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                E-mail Institucional ou Contribuinte
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: auditor@sefin.palmas.to.gov.br"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {carregando ? 'Autenticando na SEFIN...' : 'Entrar no Sistema'}
              {!carregando && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Perfis de Demonstração / 1-Click Login */}
          <div className="mt-8 border-t border-slate-700 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Acesso Rápido por Perfil (Homologação)
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  preencherUsuarioTeste({
                    perfil: 'administrador',
                    titulo: 'Auditor Fiscal',
                    email: 'auditor@sefin.palmas.to.gov.br',
                    senha: 'sefin123',
                    descricao: 'Acesso completo',
                  })
                }
                className="w-full p-2.5 text-left bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Auditor Fiscal (SEFIN)
                  </div>
                  <div className="text-[11px] text-slate-400">Busca irrestrita, Fila de devedores e ML</div>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-emerald-400 font-mono">sefin123</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  preencherUsuarioTeste({
                    perfil: 'gestao',
                    titulo: 'Gestor Tributário',
                    email: 'gestor@sefin.palmas.to.gov.br',
                    senha: 'sefin123',
                    descricao: 'Gestão estratégica',
                  })
                }
                className="w-full p-2.5 text-left bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Gestor Tributário
                  </div>
                  <div className="text-[11px] text-slate-400">Dashboards, métricas de fairness e cenários</div>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-indigo-400 font-mono">sefin123</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  preencherUsuarioTeste({
                    perfil: 'consulta',
                    titulo: 'Contribuinte (Carlos)',
                    email: 'carlos.siqueira@email.com',
                    senha: 'cidadao123',
                    cpf: '123.456.789-01',
                    descricao: 'Contribuinte individual',
                  })
                }
                className="w-full p-2.5 text-left bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Contribuinte (Cidadão)
                  </div>
                  <div className="text-[11px] text-slate-400">Consulta restrita apenas ao CPF 123.456.789-01</div>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-sky-400 font-mono">cidadao123</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          SITRIB • Projeto Integrador UFT Ciência da Computação 2026
        </div>
      </div>
    </div>
  );
};
