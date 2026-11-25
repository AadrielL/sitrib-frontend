import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Flame,
  MapPin,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface CoordenadaRegiao {
  codigo: string;
  nome: string;
  centro: [number, number];
  raioMetros: number;
  pontosPoligono: [number, number][];
  scoreCalor: number;
  corTermica: string;
  debitoConcentrado: number;
  inadimplentes: number;
  valorVenalMedio: number;
  rendaIBGE: number;
  vulnerabilidade: 'ALTA' | 'MEDIA_ALTA' | 'MEDIA' | 'BAIXA' | 'MUITO_BAIXA';
  tributoTop: string;
  razaoDividaVenalPct: number;
  diretrizIA: string;
}

// Coordenadas geográficas reais das 7 Macrorregiões Fiscais de Palmas - TO
const DADOS_REGIOES_PALMAS: CoordenadaRegiao[] = [
  {
    codigo: 'PLANO_DIRETOR_SUL',
    nome: 'Plano Diretor Sul',
    centro: [-10.218, -48.331],
    raioMetros: 2800,
    pontosPoligono: [
      [-10.188, -48.348],
      [-10.188, -48.318],
      [-10.245, -48.315],
      [-10.248, -48.345],
    ],
    scoreCalor: 100,
    corTermica: '#7f1d1d', // Vinho Fazendário / Calor Máximo
    debitoConcentrado: 571930.75,
    inadimplentes: 8,
    valorVenalMedio: 3745000.0,
    rendaIBGE: 5400.0,
    vulnerabilidade: 'MUITO_BAIXA',
    tributoTop: 'IPTU',
    razaoDividaVenalPct: 1.9,
    diretrizIA: 'Câmara de Conciliação com entrada de 20% e protesto extrajudicial de CDA em cartório.',
  },
  {
    codigo: 'PLANO_DIRETOR_NORTE',
    nome: 'Plano Diretor Norte',
    centro: [-10.165, -48.332],
    raioMetros: 2500,
    pontosPoligono: [
      [-10.145, -48.346],
      [-10.145, -48.318],
      [-10.188, -48.318],
      [-10.188, -48.348],
    ],
    scoreCalor: 78,
    corTermica: '#991b1b', // Vermelho Escuro
    debitoConcentrado: 112500.0,
    inadimplentes: 3,
    valorVenalMedio: 2150000.0,
    rendaIBGE: 4850.0,
    vulnerabilidade: 'BAIXA',
    tributoTop: 'IPTU',
    razaoDividaVenalPct: 1.7,
    diretrizIA: 'Adesão ao REFIS Digital (PIX no Portal) com desconto de 75% nos juros moratórios.',
  },
  {
    codigo: 'ORLA_14_GRACIOSA',
    nome: 'Orla 14 Graciosa',
    centro: [-10.198, -48.375],
    raioMetros: 2200,
    pontosPoligono: [
      [-10.175, -48.388],
      [-10.175, -48.358],
      [-10.225, -48.362],
      [-10.225, -48.390],
    ],
    scoreCalor: 85,
    corTermica: '#b91c1c', // Vermelho Forte
    debitoConcentrado: 145000.0,
    inadimplentes: 2,
    valorVenalMedio: 4200000.0,
    rendaIBGE: 6800.0,
    vulnerabilidade: 'MUITO_BAIXA',
    tributoTop: 'IPTU',
    razaoDividaVenalPct: 1.7,
    diretrizIA: 'Cobrança Contenciosa Prioritária para imóveis de altíssimo padrão com entrada de 20%.',
  },
  {
    codigo: 'DISTRITO_INDUSTRIAL',
    nome: 'Distrito Industrial',
    centro: [-10.285, -48.355],
    raioMetros: 2400,
    pontosPoligono: [
      [-10.265, -48.372],
      [-10.265, -48.338],
      [-10.305, -48.342],
      [-10.305, -48.375],
    ],
    scoreCalor: 62,
    corTermica: '#c2410c', // Laranja Escuro
    debitoConcentrado: 98000.0,
    inadimplentes: 2,
    valorVenalMedio: 1850000.0,
    rendaIBGE: 4200.0,
    vulnerabilidade: 'MEDIA',
    tributoTop: 'ISS',
    razaoDividaVenalPct: 2.6,
    diretrizIA: 'Transação Tributária PJ com compensação de créditos e parcelamento setorial.',
  },
  {
    codigo: 'JARDINS_AURENY',
    nome: 'Jardins Aureny (I a IV)',
    centro: [-10.278, -48.310],
    raioMetros: 2300,
    pontosPoligono: [
      [-10.258, -48.328],
      [-10.258, -48.295],
      [-10.298, -48.298],
      [-10.298, -48.330],
    ],
    scoreCalor: 45,
    corTermica: '#d97706', // Âmbar / Protegido
    debitoConcentrado: 38450.0,
    inadimplentes: 3,
    valorVenalMedio: 185000.0,
    rendaIBGE: 2150.0,
    vulnerabilidade: 'ALTA',
    tributoTop: 'IPTU',
    razaoDividaVenalPct: 6.9,
    diretrizIA: 'REFIS Social: 95% de isenção de juros e parcelamento em 60x travado em 10% da renda.',
  },
  {
    codigo: 'TAQUARALTO',
    nome: 'Taquaralto Comercial',
    centro: [-10.315, -48.305],
    raioMetros: 2200,
    pontosPoligono: [
      [-10.298, -48.322],
      [-10.298, -48.288],
      [-10.332, -48.292],
      [-10.332, -48.325],
    ],
    scoreCalor: 40,
    corTermica: '#eab308', // Amarelo
    debitoConcentrado: 26800.0,
    inadimplentes: 2,
    valorVenalMedio: 210000.0,
    rendaIBGE: 2350.0,
    vulnerabilidade: 'MEDIA_ALTA',
    tributoTop: 'ISS',
    razaoDividaVenalPct: 6.4,
    diretrizIA: 'Mutirão no Resolve Palmas com conciliação simplificada e anistia de encargos moratórios.',
  },
  {
    codigo: 'EXPANSAO_SUL_TAQUARI',
    nome: 'Expansão Sul & Taquari',
    centro: [-10.338, -48.280],
    raioMetros: 2400,
    pontosPoligono: [
      [-10.318, -48.298],
      [-10.318, -48.260],
      [-10.358, -48.265],
      [-10.358, -48.302],
    ],
    scoreCalor: 25,
    corTermica: '#059669', // Verde Esmeralda / Social
    debitoConcentrado: 14200.5,
    inadimplentes: 1,
    valorVenalMedio: 95000.0,
    rendaIBGE: 1980.0,
    vulnerabilidade: 'ALTA',
    tributoTop: 'IPTU',
    razaoDividaVenalPct: 7.5,
    diretrizIA: 'Guardrail de Fairness: Bloqueio de execução judicial e remissão social do IPTU.',
  },
];

interface Props {
  regiaoSelecionadaId?: string;
  aoSelecionarRegiao?: (regiao: CoordenadaRegiao) => void;
  aoAbrirChatbot?: (regiaoNome: string) => void;
}

export const MapaPalmasReal: React.FC<Props> = ({
  regiaoSelecionadaId,
  aoSelecionarRegiao,
  aoAbrirChatbot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaInstanceRef = useRef<L.Map | null>(null);
  const camadaPoligonosRef = useRef<L.FeatureGroup | null>(null);
  const camadaCirculosRef = useRef<L.FeatureGroup | null>(null);

  const [regiaoAtiva, setRegiaoAtiva] = useState<CoordenadaRegiao>(DADOS_REGIOES_PALMAS[0]);
  const [mostrarCirculosCalor, setMostrarCirculosCalor] = useState<boolean>(true);

  // Inicialização do Mapa Leaflet com OpenStreetMap / CartoDB
  useEffect(() => {
    if (!containerRef.current || mapaInstanceRef.current) return;

    // Centro geográfico de Palmas - Tocantins
    const mapa = L.map(containerRef.current, {
      center: [-10.235, -48.325],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
    });

    // Tiles cartográficos livres e oficiais do OpenStreetMap (ruas reais de Palmas, Lago e TOs sem restrição de API key)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapa);

    const grupoPoligonos = L.featureGroup().addTo(mapa);
    const grupoCirculos = L.featureGroup().addTo(mapa);

    camadaPoligonosRef.current = grupoPoligonos;
    camadaCirculosRef.current = grupoCirculos;
    mapaInstanceRef.current = mapa;

    // Renderiza cada região
    DADOS_REGIOES_PALMAS.forEach((reg) => {
      // 1. Círculo de calor com raio geográfico real
      const circulo = L.circle(reg.centro, {
        radius: reg.raioMetros,
        color: reg.corTermica,
        fillColor: reg.corTermica,
        fillOpacity: reg.scoreCalor >= 70 ? 0.45 : reg.scoreCalor >= 40 ? 0.35 : 0.25,
        weight: 1.5,
      });

      // 2. Polígono territorial delimitador
      const poligono = L.polygon(reg.pontosPoligono, {
        color: reg.corTermica,
        weight: 2,
        fillColor: reg.corTermica,
        fillOpacity: 0.15,
        dashArray: reg.vulnerabilidade === 'ALTA' ? '4, 4' : undefined,
      });

      // Marcador customizado com HTML e Tailwind
      const iconeCustom = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: ${reg.corTermica}; color: white; border: 2px solid white; border-radius: 9999px; padding: 3px 8px; font-size: 10px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap; cursor: pointer;">
            <span>🔥</span>
            <span>${reg.nome}</span>
            <span style="background: rgba(0,0,0,0.35); padding: 1px 4px; border-radius: 4px;">${reg.scoreCalor} pts</span>
          </div>
        `,
        iconAnchor: [60, 15],
      });

      const marcador = L.marker(reg.centro, { icon: iconeCustom });

      const aoClicarRegiao = () => {
        setRegiaoAtiva(reg);
        aoSelecionarRegiao?.(reg);
        mapa.flyTo(reg.centro, 12, { duration: 0.8 });
      };

      poligono.on('click', aoClicarRegiao);
      circulo.on('click', aoClicarRegiao);
      marcador.on('click', aoClicarRegiao);

      poligono.bindTooltip(
        `<strong>${reg.nome}</strong><br/>Score: ${reg.scoreCalor} pts | Débito: R$ ${reg.debitoConcentrado.toLocaleString('pt-BR')}`,
        { sticky: true }
      );

      grupoPoligonos.addLayer(poligono);
      grupoPoligonos.addLayer(marcador);
      grupoCirculos.addLayer(circulo);
    });

    return () => {
      mapa.remove();
      mapaInstanceRef.current = null;
    };
  }, []);

  // Atualiza destaque quando regiaoSelecionadaId mudar externamente
  useEffect(() => {
    if (regiaoSelecionadaId) {
      const reg = DADOS_REGIOES_PALMAS.find((r) => r.codigo === regiaoSelecionadaId);
      if (reg) {
        setRegiaoAtiva(reg);
        mapaInstanceRef.current?.flyTo(reg.centro, 12, { duration: 0.8 });
      }
    }
  }, [regiaoSelecionadaId]);

  // Alterna visibilidade dos círculos de calor
  const handleAlternarCirculos = () => {
    if (!mapaInstanceRef.current || !camadaCirculosRef.current) return;
    if (mostrarCirculosCalor) {
      mapaInstanceRef.current.removeLayer(camadaCirculosRef.current);
    } else {
      mapaInstanceRef.current.addLayer(camadaCirculosRef.current);
    }
    setMostrarCirculosCalor(!mostrarCirculosCalor);
  };

  const handleResetarVisao = () => {
    mapaInstanceRef.current?.flyTo([-10.235, -48.325], 11, { duration: 0.8 });
  };

  return (
    <div className="relative border border-neutral-300 rounded-lg overflow-hidden bg-neutral-100 shadow-sm flex flex-col lg:flex-row">
      {/* Controles de Mapa Flutuantes */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm border border-neutral-300 rounded shadow-md p-1.5 text-xs">
        <button
          onClick={() => mapaInstanceRef.current?.zoomIn()}
          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-800 transition-colors"
          title="Aproximar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapaInstanceRef.current?.zoomOut()}
          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-800 transition-colors"
          title="Afastar Zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-neutral-200 my-0.5" />
        <button
          onClick={handleResetarVisao}
          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-800 transition-colors"
          title="Recentralizar Palmas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleAlternarCirculos}
          className={`p-1.5 rounded transition-colors ${
            mostrarCirculosCalor ? 'bg-neutral-900 text-amber-400' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
          title="Alternar Círculos de Calor"
        >
          <Flame className="w-4 h-4" />
        </button>
      </div>

      {/* Indicador de Status do Mapa */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-neutral-900/90 text-white px-2.5 py-1.5 rounded text-[11px] backdrop-blur-sm shadow flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>OpenStreetMap Real • Palmas - TO (-10.23°, -48.32°)</span>
        <span className="text-neutral-400">•</span>
        <span className="text-amber-300 font-mono">7 Macrorregiões Ativas</span>
      </div>

      {/* ÁREA DO MAPA LEAFLET */}
      <div className="flex-1 h-[480px] lg:h-[540px] relative">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* PAINEL LATERAL INFORMATIVO DA MACRORREGIÃO EM FOCO */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-neutral-300 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#7f1d1d]" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Região em Foco
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: regiaoAtiva.corTermica }}
            >
              {regiaoAtiva.scoreCalor} pts
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {regiaoAtiva.nome}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Tributo Predominante: <strong className="text-neutral-800">{regiaoAtiva.tributoTop}</strong> • Status:{' '}
              <span className="font-semibold text-neutral-700">{regiaoAtiva.vulnerabilidade}</span>
            </p>
          </div>

          {/* Grid de 4 Indicadores Fazendários Reais */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
              <span className="text-[10px] text-neutral-500 block">Débito Concentrado</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                R$ {regiaoAtiva.debitoConcentrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-neutral-500 block">
                {regiaoAtiva.inadimplentes} casos ativos
              </span>
            </div>

            <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
              <span className="text-[10px] text-neutral-500 block">Valor Venal Médio</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                R$ {regiaoAtiva.valorVenalMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-[9px] text-neutral-500 block">Patrimônio imobiliário</span>
            </div>

            <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
              <span className="text-[10px] text-neutral-500 block">Renda Média (IBGE)</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                R$ {regiaoAtiva.rendaIBGE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-neutral-500 block">Setor censitário</span>
            </div>

            <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
              <span className="text-[10px] text-neutral-500 block">Razão Dívida / Venal</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                {regiaoAtiva.razaoDividaVenalPct}%
              </span>
              <span className="text-[9px] text-neutral-500 block">Solvência patrimonial</span>
            </div>
          </div>

          {/* Diretriz Algorítmica da IA */}
          <div className="p-2.5 bg-neutral-50 border-l-2 border-[#7f1d1d] border border-neutral-200 rounded text-[11px]">
            <strong className="text-neutral-900 block mb-1">
              Diretriz da IA (Fairness & Recuperação):
            </strong>
            <p className="text-neutral-700 leading-relaxed">{regiaoAtiva.diretrizIA}</p>
          </div>
        </div>

        {/* Botão de Integração com o Chatbot ReAct */}
        <div className="pt-3 border-t border-neutral-200">
          <button
            onClick={() => aoAbrirChatbot?.(regiaoAtiva.nome)}
            className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>Auditar {regiaoAtiva.nome} no Chatbot ReAct</span>
            <span className="text-amber-400">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
