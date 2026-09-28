# Guia Detalhado de Componentes e Páginas

Este documento explica em detalhes a responsabilidade, props, estados internos e funcionamento de cada arquivo `.tsx` do frontend.

---

## 1. `src/components/Navbar.tsx`

* **Papel:** Cabeçalho institucional superior e barra de abas.
* **Elementos visuais:**
  * Brasão e marca **SITRIB (Sprint 2)**.
  * Tag de conformidade de segurança (**LGPD & TLS 1.3 Ativos**).
  * Indicação do Product Owner (**Adriel Morais**).
  * 4 botões de navegação: *Dashboard Geral*, *Consulta Fiscal*, *Fila de Cobrança*, *Simulador de Tributos*.
* **Props:**
  * `abaAtiva: AbaNavegacao`: qual aba está selecionada no momento.
  * `aoMudarAba: (aba: AbaNavegacao) => void`: função de callback chamada ao clicar em uma aba.

---

## 2. `src/pages/Dashboard.tsx`

* **Papel:** Painel executivo gerencial da Secretaria de Finanças (atende ao requisito **RF10**).
* **Seções principais:**
  1. **Cards de KPIs:**
     * Arrecadação Estimada (`R$ 2.450.000,00`, com indicador de crescimento).
     * Dívida Ativa Registrada (`R$ 32.431,25`, soma dos débitos em aberto).
     * Processos de Execução Fiscal (`2 Ações` em andamento nas Varas de Palmas).
     * Contribuintes Mapeados (`5 Titulares` com imóveis vinculados).
  2. **Tabela de Destaque da Fila de Cobrança:**
     * Exibe os 4 contribuintes de maior risco calculados pelo algoritmo Max-Heap.
     * Permite clicar em "Consultar" para pular direto para a ficha do devedor.
  3. **Painel Técnico da Engenharia da Sprint 2:**
     * Explica as complexidades assintóticas implementadas: $O(1)$ da Tabela Hash, $O(\log n)$ do Max-Heap e a modelagem do Grafo.
* **Props:**
  * `fila: ItemFilaCobranca[]`: lista ordenada dos contribuintes em risco.
  * `aoVerFila: () => void`: redireciona para a tela de fila completa.
  * `aoConsultarCpf: (cpf: string) => void`: abre a consulta unificada do CPF clicado.

---

## 3. `src/pages/BuscaFiscal.tsx`

* **Papel:** Consulta unificada de contribuintes e dossiê fiscal de imóveis (atende aos requisitos **RF06** e **RF01**).
* **Estados internos:**
  * `documento`: valor digitado no campo de busca (CPF ou CNPJ).
  * `carregando`: booleano que ativa o spinner enquanto simula a consulta.
  * `erro`: mensagem clara caso o documento seja inválido ou o contribuinte não exista.
  * `resultado`: objeto contendo o contribuinte, seus imóveis, dívidas e processos.
* **Funcionalidades:**
  * **Validação de Documento:** Rejeita textos vazios ou com quantidade inválida de dígitos (espera 11 para CPF ou 14 para CNPJ).
  * **Atalhos Rápidos:** Botões que preenchem automaticamente exemplos reais da massa de dados (ex: Carlos com dívidas, Maria Auxiliadora adimplente, Tocantins Eng. empresa).
  * **Ficha do Contribuinte:** Nome, tipo de pessoa, situação regular/irregular, e-mail e telefone institucional.
  * **Imóveis Vinculados (Grafo):** Lista de imóveis com Inscrição Municipal (CCI), bairro de Palmas, valor venal e endereço.
  * **Pendências Tributárias:** Exibição de débitos por exercício, valor principal, juros/multas e status (`ATIVO` ou `AJUIZADO`).
  * **Ações Judiciais:** Detalha número do processo CNJ, Vara de Execução Fiscal e data de autuação.

---

## 4. `src/pages/FilaCobrancaView.tsx`

* **Papel:** Gestão visual da fila de prioridade de cobrança (espelha `src/fila_cobranca.py`).
* **Seções principais:**
  * Explicação teórica do algoritmo de Max-Heap binário ($O(\log n)$).
  * Ranking decrescente de criticidade com badges visuais de risco:
    * Score $\ge 80$: Vermelho (Alto Risco / Ajuizado).
    * Score entre $50$ e $79$: Amarelo (Médio Risco).
    * Score $< 50$: Verde (Baixo Risco / Regular).
  * Barra de progresso visual do score (0 a 100).
  * Botão "Abrir Dossiê" para inspecionar os débitos do devedor selecionado.

---

## 5. `src/pages/SimuladorTributario.tsx`

* **Papel:** Modelagem de cenários e simulação de reajustes de alíquotas (atende aos requisitos **RF05**, **RF06** e **RF07**).
* **Campos configuráveis:**
  * Tributo: IPTU, ISS, Taxa de Resíduos Sólidos ou Taxa de Alvará.
  * Alíquota Atual (%) e Alíquota Proposta (%).
  * Base de Cálculo Venal Total do Município.
* **Cálculo em Tempo Real:**
  * Determina o valor arrecadado antes e depois.
  * Apresenta o impacto financeiro líquido em reais ($R\$) e a variação percentual ($\pm \%$).
  * Permite acumular múltiplos cenários na tela para **comparação lado a lado**.
