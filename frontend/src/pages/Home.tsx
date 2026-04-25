import React, { useState } from "react";
import "../styles/Normas.css"; 
import "../styles/Home.css";

interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  organizacao: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tipo: string;
  revisao: string;
  status: string;
  notas: string[];
  referencias: string[];
  nomePdf?: string;
  urlPdf?: string;
  imagens?: string[];
}

const ORG_ORIGENS: Record<string, string> = {
  ANAC: "🇧🇷",
  FAA: "🇺🇸",
  EASA: "🇪🇺",
  ICAO: "🌐",
  DoD: "🇺🇸",
  SAE: "🇺🇸",
  ISO: "🌐",
  AKAER: "🇧🇷",
};

const CATEGORIAS_DEF = {
  PEÇA: { icone: "fa-gear", tema: "theme-tipo-peca" },
  CONJUNTO: { icone: "fa-wrench", tema: "theme-tipo-conjunto" },
  INSTALAÇÃO: { icone: "fa-screwdriver-wrench", tema: "theme-tipo-instalacao" },
  GERAL: { icone: "fa-circle-notch", tema: "theme-tipo-geral" },
} as const;

type CategoriaRaiz = keyof typeof CATEGORIAS_DEF;

const NORMAS_BASE: Norma[] = [
  {
    id: "RBAC 25.1309",
    codigo: "25.1309",
    titulo: "Análise de Segurança de Sistemas",
    organizacao: "ANAC",
    categoria: "Instalação",
    subcategoria: "Geral",
    item: "Parafuso",
    tipo: "Pública",
    revisao: "Emenda 09",
    status: "Vigente",
    notas: ["Norma principal de safety."],
    referencias: ["SAE ARP4761"],
    nomePdf: "rbac-25-1309.pdf",
    urlPdf: "/rbac-25-1309.pdf", 
  },
  {
    id: "FAR 25.571",
    codigo: "25.571",
    titulo: "Damage Tolerance and Fatigue Evaluation",
    organizacao: "FAA",
    categoria: "Conjunto",
    subcategoria: "União de Peças",
    item: "Soldagem",
    tipo: "Pública",
    revisao: "Amendment 27",
    status: "Vigente",
    notas: [],
    referencias: [],
    nomePdf: "far-25-571.pdf",
    urlPdf: "/far-25-571.pdf",
  },
  {
    id: "ISO 9001:2015",
    codigo: "9001",
    titulo: "Quality management systems — Requirements",
    organizacao: "ISO",
    categoria: "Peça",
    subcategoria: "Metálica",
    item: "Usinado",
    tipo: "Pública",
    revisao: "2015",
    status: "Vigente",
    notas: [
      "Requisitos gerais para o sistema de gestão da qualidade nas plantas de manufatura.",
    ],
    referencias: ["ISO 9000:2015"],
  },
  {
    id: "CS-25",
    codigo: "CS-25",
    titulo: "Certification Specifications for Large Aeroplanes",
    organizacao: "EASA",
    categoria: "Conjunto",
    subcategoria: "Cablagem",
    item: "Conector",
    tipo: "Privada",
    revisao: "Amendment 27",
    status: "Vigente",
    notas: [
      "Especificações essenciais para certificação EASA em aeronaves de grande porte.",
    ],
    referencias: ["FAR 25"],
  },
];

interface Peca {
  nome: string;
  categoria: string;
  subcategoria: string;
  normasVinculadas: string[];
}

const ESTRUTURA_PASTAS_BASE: Record<CategoriaRaiz, string[]> = {
  PEÇA: ["METÁLICA", "NÃO METÁLICA"],
  CONJUNTO: ["INSTALAÇÃO DE ACESSÓRIOS", "UNIÃO DE PEÇAS", "CABLAGEM"],
  INSTALAÇÃO: ["ESTRUTURA", "HIDROMECÂNICOS", "ELÉTRICA", "GERAL", "TESTE"],
  GERAL: ["BASIC NOTES", "IDENTIFICAÇÃO"],
};

const PECAS_BASE: Peca[] = [
  { nome: "Tubo", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Usinado", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Chapa", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: [] },
  { nome: "Extrudado", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Fundido", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tratamento Superficial", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Teste", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Material Composto", categoria: "PEÇA", subcategoria: "NÃO METÁLICA", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tubo com Acessório", categoria: "CONJUNTO", subcategoria: "INSTALAÇÃO DE ACESSÓRIOS", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Soldagem", categoria: "CONJUNTO", subcategoria: "UNIÃO DE PEÇAS", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Proteção", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Bota", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: [] },
  { nome: "Conector", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Conjunto Estrutural", categoria: "INSTALAÇÃO", subcategoria: "ESTRUTURA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Válvula Hidromecânica", categoria: "INSTALAÇÃO", subcategoria: "HIDROMECÂNICOS", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Chicote Elétrico Principal", categoria: "INSTALAÇÃO", subcategoria: "ELÉTRICA", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Selante", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Metalização", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Rebite", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Parafuso", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Arruela", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Inserto", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Frenagem", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Shim", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["FAR 25.571"] },
  { nome: "Primer", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Corpo de Prova de Vibração", categoria: "INSTALAÇÃO", subcategoria: "TESTE", normasVinculadas: ["FAR 25.571"] },
  { nome: "Nota de Desenho Padrão", categoria: "GERAL", subcategoria: "BASIC NOTES", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Plaqueta de Identificação", categoria: "GERAL", subcategoria: "IDENTIFICAÇÃO", normasVinculadas: ["ISO 9001:2015"] },
];

export default function Home() {
  const [pecas, setPecas] = useState<Peca[]>(PECAS_BASE);
  const [estruturaPastas, setEstruturaPastas] = useState<Record<CategoriaRaiz, string[]>>(ESTRUTURA_PASTAS_BASE);
  
  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);
  const [normaDetalheVisualizar, setNormaDetalheVisualizar] = useState<Norma | null>(null);
  const [pdfVisualizar, setPdfVisualizar] = useState<string | null>(null);

  const [navCategoria, setNavCategoria] = useState<CategoriaRaiz | null>(null);
  const [navSubcategoria, setNavSubcategoria] = useState<string | null>(null);

  const [showManageSubcategorias, setShowManageSubcategorias] = useState(false);

  const [showAddSubcategoria, setShowAddSubcategoria] = useState(false);
  const [nomeNovaSubcategoria, setNomeNovaSubcategoria] = useState("");
  
  const [showAddPeca, setShowAddPeca] = useState(false);
  const [nomeNovaPeca, setNomeNovaPeca] = useState("");
  const [normasNovaPeca, setNormasNovaPeca] = useState<string[]>([]);

  const [subcategoriaEditando, setSubcategoriaEditando] = useState<string | null>(null);
  const [nomeEditadoSubcategoria, setNomeEditadoSubcategoria] = useState("");
  const [subcategoriaExcluindo, setSubcategoriaExcluindo] = useState<string | null>(null);

  const [pecaEditando, setPecaEditando] = useState<Peca | null>(null);
  const [nomeEditadoPeca, setNomeEditadoPeca] = useState("");
  const [normasEditadasPeca, setNormasEditadasPeca] = useState<string[]>([]);
  const [pecaExcluindo, setPecaExcluindo] = useState<Peca | null>(null);

  const pecasDaSubcategoria = pecas.filter(
    (pecaAtual) =>
      pecaAtual.categoria === navCategoria &&
      pecaAtual.subcategoria === navSubcategoria,
  );

  const resetNavegacao = () => {
    setNavCategoria(null);
    setNavSubcategoria(null);
  };

  const handleAddSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaSubcategoria.trim() || !navCategoria) return;
    
    setEstruturaPastas(prev => ({
      ...prev,
      [navCategoria]: [...prev[navCategoria], nomeNovaSubcategoria.trim().toUpperCase()]
    }));
    
    setNomeNovaSubcategoria("");
    setShowAddSubcategoria(false);
  };

  const handleEditSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoSubcategoria.trim() || !navCategoria || !subcategoriaEditando) return;
    
    const novoNome = nomeEditadoSubcategoria.trim().toUpperCase();
    
    setEstruturaPastas(prev => {
      const novasPastas = prev[navCategoria].map(sub => 
        sub === subcategoriaEditando ? novoNome : sub
      );
      return { ...prev, [navCategoria]: novasPastas };
    });

    setPecas(prev => prev.map(p => 
      (p.categoria === navCategoria && p.subcategoria === subcategoriaEditando) 
        ? { ...p, subcategoria: novoNome } 
        : p
    ));

    if (navSubcategoria === subcategoriaEditando) {
      setNavSubcategoria(novoNome);
    }

    setSubcategoriaEditando(null);
  };

  const handleDeleteSubcategoria = () => {
    if (!navCategoria || !subcategoriaExcluindo) return;
    
    setEstruturaPastas(prev => ({
      ...prev,
      [navCategoria]: prev[navCategoria].filter(sub => sub !== subcategoriaExcluindo)
    }));

    setPecas(prev => prev.filter(p => !(p.categoria === navCategoria && p.subcategoria === subcategoriaExcluindo)));
    
    if (navSubcategoria === subcategoriaExcluindo) {
      setNavSubcategoria(null);
    }

    setSubcategoriaExcluindo(null);
  };

  const handleAddPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaPeca.trim() || !navCategoria || !navSubcategoria) return;
    
    const novaPeca: Peca = {
      nome: nomeNovaPeca.trim(),
      categoria: navCategoria,
      subcategoria: navSubcategoria,
      normasVinculadas: normasNovaPeca
    };
    
    setPecas(prev => [...prev, novaPeca]);
    setNomeNovaPeca("");
    setNormasNovaPeca([]);
    setShowAddPeca(false);
  };

  const handleEditPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoPeca.trim() || !pecaEditando) return;

    setPecas(prev => prev.map(p => 
      p === pecaEditando ? { ...p, nome: nomeEditadoPeca.trim(), normasVinculadas: normasEditadasPeca } : p
    ));

    setPecaEditando(null);
  };

  const handleDeletePeca = () => {
    if (!pecaExcluindo) return;
    setPecas(prev => prev.filter(p => p !== pecaExcluindo));
    setPecaExcluindo(null);
  };

  const renderPecaCard = (peca: Peca, index: number) => {
    const configCategoria = CATEGORIAS_DEF[peca.categoria as CategoriaRaiz];
    return (
      <div 
        key={`peca-${index}`} 
        className={`peca-card ${configCategoria.tema}`}
        onClick={() => setPecaVisualizar(peca)}
      >
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${configCategoria.tema}`}>
            <i className={`fas ${configCategoria.icone}`}></i>
          </div>
          <div className="peca-info">
            <h3>{peca.nome}</h3>
          </div>
        </div>
        
        <div className="peca-card-footer">
          <span className="normas-count">
            <i className="fas fa-file-shield"></i>{" "}
            {peca.normasVinculadas.length} Normas
          </span>
          <div className="card-actions inline">
            <button 
              className="btn btn-ghost btn-icon action-btn-edit" 
              onClick={(evento) => { 
                evento.stopPropagation(); 
                setPecaEditando(peca); 
                setNomeEditadoPeca(peca.nome); 
                setNormasEditadasPeca(peca.normasVinculadas);
              }}
              title="Editar Peça"
            >
              <i className="fas fa-pen"></i>
            </button>
            <button 
              className="btn btn-ghost btn-icon action-btn-delete" 
              onClick={(evento) => { 
                evento.stopPropagation(); 
                setPecaExcluindo(peca); 
              }}
              title="Excluir Peça"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <main className="page">
        <div className="page-header pecas-header">
          <h1 className="page-title">
            <i className="fas fa-book-bookmark"></i> Catálogo de Componentes
          </h1>
        </div>

        <div className="breadcrumbs">
          <div
            className={`breadcrumb-item ${!navCategoria ? "active" : ""}`}
            onClick={resetNavegacao}
          >
            <i className="fas fa-home"></i> Início
          </div>

          {navCategoria && (
            <>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <div
                className={`breadcrumb-item ${!navSubcategoria ? "active" : ""}`}
                onClick={() => setNavSubcategoria(null)}
              >
                <i className={`fas ${CATEGORIAS_DEF[navCategoria].icone}`}></i>{" "}
                {navCategoria}
              </div>
            </>
          )}

          {navSubcategoria && (
            <>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <div className="breadcrumb-item active">
                <i className="fas fa-folder-open breadcrumb-folder-icon"></i>
                {navSubcategoria}
              </div>
            </>
          )}
        </div>

        <div className="conteudo-dinamico">
          {!navCategoria && (
            <div className="folder-grid">
              {(Object.keys(CATEGORIAS_DEF) as CategoriaRaiz[]).map(
                (categoriaRaiz) => (
                  <div
                    key={categoriaRaiz}
                    className={`folder-card ${CATEGORIAS_DEF[categoriaRaiz].tema}`}
                    onClick={() => setNavCategoria(categoriaRaiz)}
                  >
                    <div className="folder-icon">
                      <i className={`fas ${CATEGORIAS_DEF[categoriaRaiz].icone}`}></i>
                    </div>
                    <div className="folder-info">
                      <span className="folder-title">{categoriaRaiz}</span>
                      <span className="folder-subtitle">
                        {estruturaPastas[categoriaRaiz].length} subcategorias
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {navCategoria && !navSubcategoria && (
            <div className="category-view-container">
              <div className="category-header-actions">
                <h2 className="category-title">
                  <i className={`fas ${CATEGORIAS_DEF[navCategoria].icone}`}></i> {navCategoria}
                </h2>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowManageSubcategorias(true)}
                >
                  <i className="fas fa-sliders"></i> Gerenciar Pastas
                </button>
              </div>

              <div className="folder-grid">
                {estruturaPastas[navCategoria].map((subcategoria) => {
                  const qtdItens = pecas.filter(
                    (pecaAtual) =>
                      pecaAtual.categoria === navCategoria &&
                      pecaAtual.subcategoria === subcategoria,
                  ).length;
                  return (
                    <div
                      key={subcategoria}
                      className={`folder-card ${CATEGORIAS_DEF[navCategoria].tema}`}
                      onClick={() => setNavSubcategoria(subcategoria)}
                    >
                      <div className="folder-icon">
                        <i className={`fas ${qtdItens > 0 ? "fa-folder-open" : "fa-folder"}`}></i>
                      </div>
                      <div className="folder-info">
                        <span className="folder-title" title={subcategoria}>{subcategoria}</span>
                        <span className="folder-subtitle">
                          {qtdItens === 0 ? "Vazia" : `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                <div 
                  className="folder-card add-card" 
                  onClick={() => setShowAddSubcategoria(true)}
                >
                  <div className="folder-icon">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="folder-info">
                    <span className="folder-title">Nova Subcategoria</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {navCategoria && navSubcategoria && (
            <div className="subcategory-view">
              <div className="subcategory-header-simple">
                <h2 className="subcategory-title">
                  <i className="fas fa-folder-open"></i> {navSubcategoria}
                </h2>
              </div>

              <div className="pecas-lista">
                {pecasDaSubcategoria.map((peca, index) => renderPecaCard(peca, index))}
                
                <div className="peca-card add-card" onClick={() => { setNomeNovaPeca(""); setNormasNovaPeca([]); setShowAddPeca(true); }}>
                  <div className="peca-card-header centralizado">
                    <div className="peca-icon-wrapper ghost-icon">
                      <i className="fas fa-plus"></i>
                    </div>
                    <div className="peca-info">
                      <h3>Novo Item</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {pecaVisualizar && (
          <div className="modal-overlay" onClick={() => setPecaVisualizar(null)}>
            <div className="modal modal-large" onClick={(evento) => evento.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-cube"></i> Detalhes do Componente
                </h2>
                <button type="button" className="btn-close" onClick={() => setPecaVisualizar(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div className="view-details">
                <div className="view-item">
                  <span className="view-label">
                    <i className="fas fa-heading"></i> Especificação
                  </span>
                  <span className="view-value view-value-large">
                    {pecaVisualizar.nome}
                  </span>
                </div>

                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-sitemap"></i> Categoria Raiz
                    </span>
                    <div className="view-badges">
                      <span className={`badge ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].tema}`}>
                        <i className={`fas ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].icone} badge-icon`}></i>{" "}
                        {pecaVisualizar.categoria}
                      </span>
                    </div>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-folder-open"></i> Subcategoria
                    </span>
                    <span className="view-value">
                      {pecaVisualizar.subcategoria}
                    </span>
                  </div>
                </div>

                <div className="vinculos-section">
                  <h4 className="vinculos-header">
                    <i className="fas fa-file-shield"></i> Normativas Aplicáveis
                  </h4>

                  {pecaVisualizar.normasVinculadas.length > 0 ? (
                    <div className="vinculos-lista">
                      {pecaVisualizar.normasVinculadas.map((normaId) => {
                        const normaDetalhes = NORMAS_BASE.find((normaCadastrada) => normaCadastrada.id === normaId);
                        if (!normaDetalhes) return null;

                        return (
                          <div key={normaId} className="vinculo-norma-card">
                            <div className="vinculo-norma-header-row">
                              <div className="vinculo-norma-header-text">
                                <span className="vinculo-norma-id">{normaDetalhes.id}</span>
                                <span className="vinculo-norma-titulo compact">{normaDetalhes.titulo}</span>
                              </div>

                              <div className="vinculo-norma-actions">
                                {normaDetalhes.urlPdf && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-icon"
                                    onClick={(evento) => {
                                      evento.stopPropagation();
                                      setPdfVisualizar(normaDetalhes.urlPdf!);
                                    }}
                                    title="Visualizar PDF"
                                  >
                                    <i className="fas fa-file-pdf icon-pdf-red icon-large"></i>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-icon"
                                  onClick={(evento) => {
                                    evento.stopPropagation();
                                    setNormaDetalheVisualizar(normaDetalhes);
                                  }}
                                  title="Ver Detalhes da Norma"
                                >
                                  <i className="fas fa-arrow-up-right-from-square icon-md"></i>
                                </button>
                              </div>
                            </div>

                            <div className="vinculo-norma-badges spaced">
                              <span className={`badge badge-sm theme-org-${normaDetalhes.organizacao.toLowerCase()}`}>
                                <span className="badge-origin large">
                                  {ORG_ORIGENS[normaDetalhes.organizacao] || "🌐"}
                                </span>
                                {normaDetalhes.organizacao}
                              </span>

                              <span className={`badge badge-sm ${CATEGORIAS_DEF[normaDetalhes.categoria as CategoriaRaiz]?.tema}`}>
                                <i className={`fas ${CATEGORIAS_DEF[normaDetalhes.categoria as CategoriaRaiz]?.icone} badge-icon`}></i>
                                {normaDetalhes.categoria}
                              </span>

                              <span className={`badge badge-sm ${normaDetalhes.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}>
                                <i className={`fas ${normaDetalhes.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}></i>
                                {normaDetalhes.tipo}
                              </span>

                              <span className={`badge badge-sm badge-status ${normaDetalhes.status.toLowerCase()}`}>
                                <i className={`fas ${normaDetalhes.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}></i>
                                {normaDetalhes.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <i className="fas fa-link-slash"></i>
                      <p>Nenhuma normativa vinculada a este item.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setPecaVisualizar(null)}>
                  <i className="fas fa-check"></i> Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {normaDetalheVisualizar && (
          <div className="modal-overlay modal-overlay-nested" onClick={() => setNormaDetalheVisualizar(null)}>
            <div className="modal modal-large" onClick={(evento) => evento.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-magnifying-glass-chart"></i> Detalhes da Norma
                </h2>
                <button type="button" className="btn-close" onClick={() => setNormaDetalheVisualizar(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details">
                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-id-card"></i> ID</span>
                    <span className="view-value">{normaDetalheVisualizar.id}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-hashtag"></i> Código</span>
                    <span className="view-value">{normaDetalheVisualizar.codigo || "—"}</span>
                  </div>
                </div>
                <div className="view-item">
                  <span className="view-label"><i className="fas fa-heading"></i> Título</span>
                  <span className="view-value">{normaDetalheVisualizar.titulo}</span>
                </div>

                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-building"></i> Órgão</span>
                    <span className="view-value view-badges">
                      <span className={`badge theme-org-${normaDetalheVisualizar.organizacao.toLowerCase()}`}>
                        <span className="badge-origin large">
                          {ORG_ORIGENS[normaDetalheVisualizar.organizacao] || "🌐"}
                        </span>
                        {normaDetalheVisualizar.organizacao}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-globe"></i> Tipo</span>
                    <span className="view-value view-badges">
                      <span className={`badge ${normaDetalheVisualizar.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}>
                        <i className={`fas ${normaDetalheVisualizar.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}></i>
                        {normaDetalheVisualizar.tipo || "Pública"}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-code-branch"></i> Revisão</span>
                    <span className="view-value">{normaDetalheVisualizar.revisao || "—"}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-circle-dot"></i> Status</span>
                    <span className="view-value view-badges">
                      <span className={`badge ${normaDetalheVisualizar.status.toLowerCase()}`}>
                        <i className={`fas ${normaDetalheVisualizar.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}></i>
                        {normaDetalheVisualizar.status}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-tags"></i> Categoria</span>
                    <span className="view-value view-badges">
                      <span className={`badge ${CATEGORIAS_DEF[normaDetalheVisualizar.categoria as CategoriaRaiz]?.tema}`}>
                        <i className={`fas ${CATEGORIAS_DEF[normaDetalheVisualizar.categoria as CategoriaRaiz]?.icone} badge-icon`}></i>
                        {normaDetalheVisualizar.categoria}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-layer-group"></i> Subcategoria</span>
                    <span className="view-value">{normaDetalheVisualizar.subcategoria || "—"}</span>
                  </div>
                  
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-cube"></i> Item</span>
                    <span className="view-value">{normaDetalheVisualizar.item || "—"}</span>
                  </div>
                </div>

                <hr className="divider" />

                {normaDetalheVisualizar.notas.length > 0 && (
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-pen-to-square"></i> Notas Técnicas</span>
                    <ul className="view-list">
                      {normaDetalheVisualizar.notas.map((notaAtual, indiceNota) => (
                        <li key={indiceNota}>
                          <i className="fas fa-caret-right view-list-icon"></i> {notaAtual}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {normaDetalheVisualizar.referencias.length > 0 && (
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-link"></i> Referências</span>
                    <ul className="view-list">
                      {normaDetalheVisualizar.referencias.map((referenciaAtual, indiceReferencia) => (
                        <li key={indiceReferencia}>
                          <i className="fas fa-caret-right view-list-icon"></i> {referenciaAtual}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(normaDetalheVisualizar.urlPdf || (normaDetalheVisualizar.imagens && normaDetalheVisualizar.imagens.length > 0)) && (
                  <>
                    <hr className="divider" />
                    <div className="view-item">
                      <span className="view-label"><i className="fas fa-paperclip"></i> Anexos</span>
                      {normaDetalheVisualizar.urlPdf && (
                        <button 
                          type="button" 
                          className="attachment-pdf attachment-link btn-pdf-view" 
                          onClick={() => setPdfVisualizar(normaDetalheVisualizar.urlPdf!)}
                        >
                          <i className="fas fa-file-pdf icon-pdf-red"></i>
                          <span className="attachment-pdf-name">
                            {normaDetalheVisualizar.nomePdf || `${normaDetalheVisualizar.id.replace(" ", "_")}.pdf`}
                          </span>
                          <i className="fas fa-eye attachment-external-icon"></i>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {normaDetalheVisualizar.notas.length === 0 &&
                  normaDetalheVisualizar.referencias.length === 0 &&
                  !normaDetalheVisualizar.urlPdf &&
                  (!normaDetalheVisualizar.imagens || normaDetalheVisualizar.imagens.length === 0) && (
                    <div className="empty-state compact">
                      <i className="fas fa-folder-open"></i>
                      <p>Nenhuma nota ou anexo.</p>
                    </div>
                  )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setNormaDetalheVisualizar(null)}>
                  <i className="fas fa-arrow-left"></i> Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {pdfVisualizar && (
          <div className="modal-overlay modal-overlay-pdf" onClick={() => setPdfVisualizar(null)}>
            <div className="modal modal-pdf" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-file-pdf icon-pdf-red"></i> Visualizador de Documento</h2>
                <button type="button" className="btn-close" onClick={() => setPdfVisualizar(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="pdf-container">
                <iframe 
                  src={pdfVisualizar} 
                  className="pdf-viewer" 
                  title="PDF Viewer"
                />
              </div>
            </div>
          </div>
        )}

        {showManageSubcategorias && navCategoria && (
          <div className="modal-overlay" onClick={() => setShowManageSubcategorias(false)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-sliders"></i> Gerenciar Subcategorias</h2>
                <button type="button" className="btn-close" onClick={() => setShowManageSubcategorias(false)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details modal-pad manage-modal-body">
                {estruturaPastas[navCategoria].length > 0 ? (
                  <div className="manage-list">
                    {estruturaPastas[navCategoria].map((subcategoria) => (
                      <div key={`manage-${subcategoria}`} className="manage-row">
                        <div className="manage-row-info">
                          <i className="fas fa-folder manage-row-icon"></i>
                          <span className="manage-row-name">{subcategoria}</span>
                        </div>
                        <div className="card-actions inline">
                          <button 
                            className="btn btn-ghost btn-icon action-btn-edit" 
                            onClick={() => { 
                              setSubcategoriaEditando(subcategoria); 
                              setNomeEditadoSubcategoria(subcategoria); 
                              setShowManageSubcategorias(false); 
                            }}
                            title="Editar Subcategoria"
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button 
                            className="btn btn-ghost btn-icon action-btn-delete" 
                            onClick={() => {
                              setSubcategoriaExcluindo(subcategoria);
                              setShowManageSubcategorias(false);
                            }}
                            title="Excluir Subcategoria"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state compact">
                    <i className="fas fa-folder-open"></i>
                    <p>Nenhuma subcategoria para gerenciar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddSubcategoria && (
          <div className="modal-overlay" onClick={() => setShowAddSubcategoria(false)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleAddSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-folder-plus"></i> Nova Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddSubcategoria(false)}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
                <div className="view-details modal-pad">
                  <label className="view-label">Nome da Subcategoria em {navCategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaSubcategoria} onChange={evento => setNomeNovaSubcategoria(evento.target.value)} />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Criar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddPeca && (
          <div className="modal-overlay" onClick={() => setShowAddPeca(false)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleAddPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-plus-circle"></i> Novo Item</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddPeca(false)}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
                <div className="view-details modal-pad">
                  <label className="view-label">Nome do componente em {navSubcategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaPeca} onChange={evento => setNomeNovaPeca(evento.target.value)} />
                  
                  <label className="view-label mt-20">Vincular Normas</label>
                  <div className="checkbox-list">
                    {NORMAS_BASE.map(norma => (
                      <label key={norma.id} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={normasNovaPeca.includes(norma.id)}
                          onChange={(evento) => {
                            if (evento.target.checked) {
                              setNormasNovaPeca(prev => [...prev, norma.id]);
                            } else {
                              setNormasNovaPeca(prev => prev.filter(id => id !== norma.id));
                            }
                          }}
                        />
                        <span className="checkbox-text"><strong>{norma.id}</strong> - {norma.titulo}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {subcategoriaEditando && (
          <div className="modal-overlay" onClick={() => setSubcategoriaEditando(null)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleEditSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setSubcategoriaEditando(null)}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
                <div className="view-details modal-pad">
                  <label className="view-label">Renomear Subcategoria</label>
                  <input type="text" className="form-input" autoFocus value={nomeEditadoSubcategoria} onChange={evento => setNomeEditadoSubcategoria(evento.target.value)} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setSubcategoriaEditando(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {subcategoriaExcluindo && (
          <div className="modal-overlay" onClick={() => setSubcategoriaExcluindo(null)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-triangle-exclamation text-danger"></i> Excluir Subcategoria</h2>
                <button type="button" className="btn-close" onClick={() => setSubcategoriaExcluindo(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details modal-pad text-center">
                <p className="modal-text-confirm">Tem certeza que deseja excluir a subcategoria <strong>{subcategoriaExcluindo}</strong>?</p>
                <p className="modal-text-danger">
                  <i className="fas fa-circle-info"></i> Atenção: Todas as peças cadastradas dentro dela também serão deletadas.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSubcategoriaExcluindo(null)}>Cancelar</button>
                <button type="button" className="btn btn-primary btn-danger-fill" onClick={handleDeleteSubcategoria}>Excluir</button>
              </div>
            </div>
          </div>
        )}

        {pecaEditando && (
          <div className="modal-overlay" onClick={() => setPecaEditando(null)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleEditPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Item</h2>
                  <button type="button" className="btn-close" onClick={() => setPecaEditando(null)}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
                <div className="view-details modal-pad">
                  <label className="view-label">Renomear Componente</label>
                  <input type="text" className="form-input" autoFocus value={nomeEditadoPeca} onChange={evento => setNomeEditadoPeca(evento.target.value)} />
                  
                  <label className="view-label mt-20">Normas Vinculadas</label>
                  <div className="checkbox-list">
                    {NORMAS_BASE.map(norma => (
                      <label key={norma.id} className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={normasEditadasPeca.includes(norma.id)}
                          onChange={(evento) => {
                            if (evento.target.checked) {
                              setNormasEditadasPeca(prev => [...prev, norma.id]);
                            } else {
                              setNormasEditadasPeca(prev => prev.filter(id => id !== norma.id));
                            }
                          }}
                        />
                        <span className="checkbox-text"><strong>{norma.id}</strong> - {norma.titulo}</span>
                      </label>
                    ))}
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setPecaEditando(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {pecaExcluindo && (
          <div className="modal-overlay" onClick={() => setPecaExcluindo(null)}>
            <div className="modal" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-triangle-exclamation text-danger"></i> Excluir Item</h2>
                <button type="button" className="btn-close" onClick={() => setPecaExcluindo(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details modal-pad text-center">
                <p className="modal-text-confirm-no-margin">Tem certeza que deseja excluir o item <strong>{pecaExcluindo.nome}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPecaExcluindo(null)}>Cancelar</button>
                <button type="button" className="btn btn-primary btn-danger-fill" onClick={handleDeletePeca}>Excluir</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}