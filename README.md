# SITRIB — Frontend (Sistema Integrado de Gestão Tributária)

Interface web moderna, responsiva e institucional para o sistema de tributação municipal de Palmas / TO.

Desenvolvido para o **Projeto Integrador UFT (Ciência da Computação)** por **Adriel Morais**.

---

## 🌟 Principais Recursos

1. **Dashboard Geral de Arrecadação (RF10):**
   * Indicadores-chave de desempenho (KPIs) com total arrecadado, dívida ativa, processos judiciais e contribuintes mapeados.
   * Destaques de inteligência tributária e acompanhamento em tempo real.
2. **Consulta Cadastral e Fiscal Unificada (RF06 / RF01):**
   * Busca rápida por CPF ou CNPJ com máscara e validação estrutural.
   * Visualização da ficha cadastral completa, imóveis vinculados (Inscrições CCI), dívidas ativas e processos ajuizados na Vara de Execução Fiscal (espelhando a modelagem do Grafo).
3. **Fila de Prioridade de Cobrança (Sprint 2 - Max-Heap):**
   * Ranking decrescente por score de risco de inadimplência (0 a 100).
   * Visualização da ordenação assintótica em $O(\log n)$ com badges semânticos de criticidade.
4. **Simulador de Cenários Tributários (RF05 / RF06 / RF07):**
   * Projeção interativa do impacto de reajustes de alíquotas (IPTU, ISS, taxas) sobre a receita municipal.
   * Comparação lado a lado de cenários conservadores e otimistas.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React 19 + TypeScript (tipagem estrita com `verbatimModuleSyntax`)
* **Build Tool:** Vite 8 (Hot Module Replacement instantâneo)
* **Estilização:** Tailwind CSS v4 (Design System institucional)
* **Ícones:** Lucide React
* **Arquitetura:** Componentes funcionais, camadas de serviços desacopladas e isolamento de DTOs

---

## 🚀 Como Executar

```powershell
# 1. Acesse o diretório
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Compilar para produção
npm run build
```

O aplicativo estará disponível em: `http://localhost:5173`.

---

## 📚 Documentação Técnica Completa

Uma pasta exclusiva de documentação foi criada em [`docs/`](docs/README.md) detalhando cada aspecto da aplicação:

* 📄 **[docs/README.md](docs/README.md):** Visão geral e mapa da documentação.
* 🏛️ **[docs/arquitetura_e_fluxo.md](docs/arquitetura_e_fluxo.md):** Arquitetura em camadas e ciclo de vida dos dados.
* 🧩 **[docs/guia_componentes_e_paginas.md](docs/guia_componentes_e_paginas.md):** Explicação de cada página e componente.
* 🔌 **[docs/integracao_com_backend.md](docs/integracao_com_backend.md):** Mapeamento com o backend Python e contrato de endpoints REST da Sprint 3.
* 🎨 **[docs/guia_estilizacao_e_design.md](docs/guia_estilizacao_e_design.md):** Identidade visual, cores institucionais e acessibilidade.

---

## 📦 Repositório Independente

Este projeto está pronto para ser enviado para um repositório isolado no GitHub (ex: `https://github.com/AadrielL/sitrib-frontend.git`).
