import React, { useEffect, useState } from "react";
import "../styles/Normas.css"; 
import "../styles/Home.css";
import { salvarPecas, carregarPecas, type Peca } from "../helpers/pecas";

import { 
  type Norma, 
  NORMAS_BASE, 
  ORG_ORIGENS, 
  CAT_ICONES, 
  PdfViewer, 
  ModalConfirmacao,
  ImageLightbox,
  ModalDetalhesNorma
} from "./Normas";

type CategoriaRaiz = "Peça" | "Conjunto" | "Instalação" | "Geral";

const CATEGORIAS_DEF: Record<CategoriaRaiz, { icone: string, tema: string }> = {
  "Peça": { icone: CAT_ICONES["Peça"] || "fa-gear", tema: "theme-cat-peça" },
  "Conjunto": { icone: CAT_ICONES["Conjunto"] || "fa-gears", tema: "theme-cat-conjunto" },
  "Instalação": { icone: CAT_ICONES["Instalação"] || "fa-screwdriver-wrench", tema: "theme-cat-instalação" },
  "Geral": { icone: CAT_ICONES["Geral"] || "fa-layer-group", tema: "theme-cat-geral" },
};

const ESTRUTURA_PASTAS_BASE: Record<CategoriaRaiz, string[]> = {
  "Peça": ["Metálica", "Não Metálica"],
  "Conjunto": ["Instalação de Acessórios", "União de Peças", "Cablagem"],
  "Instalação": ["Estrutura", "Hidromecânicos", "Elétrica", "Geral", "Teste"],
  "Geral": ["Basic Notes", "Identificação"],
};

export default function Home() {
  const [normas] = useState<Norma[]>(() => {
    const normasSalvas = localStorage.getItem("biblioteca_normas");
    return normasSalvas ? JSON.parse(normasSalvas) : NORMAS_BASE;
  });

  const [pecas, setPecas] = useState<Peca[]>(() => carregarPecas());
  const [estruturaPastas, setEstruturaPastas] = useState<Record<string, string[]>>(ESTRUTURA_PASTAS_BASE);
  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);
  const [normaDetalheVisualizar, setNormaDetalheVisualizar] = useState<Norma | null>(null);
  const [pdfVisualizar, setPdfVisualizar] = useState<{url: string, nome: string} | null>(null);
  
  const [imagensAbertas, setImagensAbertas] = useState<string[] | null>(null);
  const [indiceImagemAberta, setIndiceImagemAberta] = useState<number | null>(null);

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

  useEffect(() => {
    salvarPecas(pecas);
  }, [pecas]);

  const pecasDaSubcategoria = pecas.filter(
    (pecaAtual) => pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === navSubcategoria
  );

  const resetNavegacao = () => {
    setNavCategoria(null);
    setNavSubcategoria(null);
  };

  const handleAddSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaSubcategoria.trim() || !navCategoria) return;
    setEstruturaPastas(prev => ({ ...prev, [navCategoria]: [...prev[navCategoria], nomeNovaSubcategoria.trim()] }));
    setNomeNovaSubcategoria("");
    setShowAddSubcategoria(false);
  };

  const handleEditSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoSubcategoria.trim() || !navCategoria || !subcategoriaEditando) return;
    const novoNome = nomeEditadoSubcategoria.trim();
    
    setEstruturaPastas(prev => {
      const novasPastas = prev[navCategoria].map(subcategoriaAtual => subcategoriaAtual === subcategoriaEditando ? novoNome : subcategoriaAtual);
      return { ...prev, [navCategoria]: novasPastas };
    });

    setPecas(prev => prev.map(pecaAtual => (pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === subcategoriaEditando) ? { ...pecaAtual, subcategoria: novoNome } : pecaAtual));
    if (navSubcategoria === subcategoriaEditando) setNavSubcategoria(novoNome);
    setSubcategoriaEditando(null);
  };

  const handleDeleteSubcategoria = () => {
    if (!navCategoria || !subcategoriaExcluindo) return;
    setEstruturaPastas(prev => ({ ...prev, [navCategoria]: prev[navCategoria].filter(subcategoriaAtual => subcategoriaAtual !== subcategoriaExcluindo) }));
    setPecas(prev => prev.filter(pecaAtual => !(pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === subcategoriaExcluindo)));
    if (navSubcategoria === subcategoriaExcluindo) setNavSubcategoria(null);
    setSubcategoriaExcluindo(null);
  };

  const handleAddPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaPeca.trim() || !navCategoria || !navSubcategoria) return;
    setPecas(prev => [...prev, { nome: nomeNovaPeca.trim(), categoria: navCategoria, subcategoria: navSubcategoria, normasVinculadas: normasNovaPeca }]);
    setNomeNovaPeca("");
    setNormasNovaPeca([]);
    setShowAddPeca(false);
  };

  const handleEditPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoPeca.trim() || !pecaEditando) return;
    setPecas(prev => prev.map(pecaAtual => pecaAtual === pecaEditando ? { ...pecaAtual, nome: nomeEditadoPeca.trim(), normasVinculadas: normasEditadasPeca } : pecaAtual));
    setPecaEditando(null);
  };

  const handleDeletePeca = () => {
    if (!pecaExcluindo) return;
    setPecas(prev => prev.filter(pecaAtual => pecaAtual !== pecaExcluindo));
    setPecaExcluindo(null);
  };

  const renderPecaCard = (pecaAtual: Peca, indicePeca: number) => {
    const configCategoria = CATEGORIAS_DEF[pecaAtual.categoria as CategoriaRaiz];
    return (
      <div key={`peca-${indicePeca}`} className={`peca-card ${configCategoria.tema}`} onClick={() => setPecaVisualizar(pecaAtual)}>
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${configCategoria.tema}`}>
            <i className={`fas ${configCategoria.icone}`}></i>
          </div>
          <div className="peca-info"><h3>{pecaAtual.nome}</h3></div>
        </div>
        <div className="peca-card-footer">
          <span className="normas-count"><i className="fas fa-file-shield"></i> {pecaAtual.normasVinculadas.length} Normas</span>
          <div className="card-actions inline">
            <button className="btn btn-warning btn-icon" onClick={(evento) => { evento.stopPropagation(); setPecaEditando(pecaAtual); setNomeEditadoPeca(pecaAtual.nome); setNormasEditadasPeca(pecaAtual.normasVinculadas); }} title="Editar Peça"><i className="fas fa-pen"></i></button>
            <button className="btn btn-danger btn-icon" onClick={(evento) => { evento.stopPropagation(); setPecaExcluindo(pecaAtual); }} title="Excluir Peça"><i className="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <main className="page">
        <div className="page-header pecas-header">
          <h1 className="page-title"><i className="fas fa-book-bookmark"></i> Catálogo de Componentes</h1>
        </div>

        <div className="breadcrumbs">
          <div className={`breadcrumb-item ${!navCategoria ? "active" : ""}`} onClick={resetNavegacao}><i className="fas fa-home"></i> Início</div>
          {navCategoria && (
            <>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <div className={`breadcrumb-item ${!navSubcategoria ? "active" : ""}`} onClick={() => setNavSubcategoria(null)}>
                <i className={`fas ${CATEGORIAS_DEF[navCategoria].icone}`}></i> {navCategoria}
              </div>
            </>
          )}
          {navSubcategoria && (
            <>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <div className="breadcrumb-item active"><i className="fas fa-folder-open breadcrumb-folder-icon"></i> {navSubcategoria}</div>
            </>
          )}
        </div>

        <div className="conteudo-dinamico">
          {!navCategoria && (
            <div className="folder-grid">
              {(Object.keys(CATEGORIAS_DEF) as CategoriaRaiz[]).map((categoriaRaiz) => (
                <div key={categoriaRaiz} className={`folder-card ${CATEGORIAS_DEF[categoriaRaiz].tema}`} onClick={() => setNavCategoria(categoriaRaiz)}>
                  <div className="folder-icon"><i className={`fas ${CATEGORIAS_DEF[categoriaRaiz].icone}`}></i></div>
                  <div className="folder-info">
                    <span className="folder-title">{categoriaRaiz}</span>
                    <span className="folder-subtitle">{estruturaPastas[categoriaRaiz]?.length || 0} subcategorias</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {navCategoria && !navSubcategoria && (
            <div className="category-view-container">
              <div className="category-header-actions">
                <h2 className="category-title"><i className={`fas ${CATEGORIAS_DEF[navCategoria].icone}`}></i> {navCategoria}</h2>
                <button className="btn btn-ghost" onClick={() => setShowManageSubcategorias(true)}><i className="fas fa-sliders"></i> Gerenciar Pastas</button>
              </div>

              <div className="folder-grid">
                {(estruturaPastas[navCategoria] || []).map((subcategoriaAtual) => {
                  const qtdItens = pecas.filter((pecaAtual) => pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === subcategoriaAtual).length;
                  return (
                    <div key={subcategoriaAtual} className={`folder-card ${CATEGORIAS_DEF[navCategoria].tema}`} onClick={() => setNavSubcategoria(subcategoriaAtual)}>
                      <div className="folder-icon"><i className={`fas ${qtdItens > 0 ? "fa-folder-open" : "fa-folder"}`}></i></div>
                      <div className="folder-info">
                        <span className="folder-title" title={subcategoriaAtual}>{subcategoriaAtual}</span>
                        <span className="folder-subtitle">{qtdItens === 0 ? "Vazia" : `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}`}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="folder-card add-card" onClick={() => setShowAddSubcategoria(true)}>
                  <div className="folder-icon"><i className="fas fa-plus"></i></div>
                  <div className="folder-info"><span className="folder-title">Nova Subcategoria</span></div>
                </div>
              </div>
            </div>
          )}

          {navCategoria && navSubcategoria && (
            <div className="subcategory-view">
              <div className="subcategory-header-simple">
                <h2 className="subcategory-title"><i className="fas fa-folder-open"></i> {navSubcategoria}</h2>
              </div>
              <div className="pecas-lista">
                {pecasDaSubcategoria.map((pecaAtual, indicePeca) => renderPecaCard(pecaAtual, indicePeca))}
                <div className="peca-card add-card" onClick={() => { setNomeNovaPeca(""); setNormasNovaPeca([]); setShowAddPeca(true); }}>
                  <div className="peca-card-header centralizado">
                    <div className="peca-icon-wrapper ghost-icon"><i className="fas fa-plus"></i></div>
                    <div className="peca-info"><h3>Novo Item</h3></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {pdfVisualizar && <PdfViewer url={pdfVisualizar.url} nome={pdfVisualizar.nome} onClose={() => setPdfVisualizar(null)} />}
        
        {indiceImagemAberta !== null && imagensAbertas && (
          <ImageLightbox imagens={imagensAbertas} indiceInicial={indiceImagemAberta} onClose={() => { setIndiceImagemAberta(null); setImagensAbertas(null); }} />
        )}
        
        {subcategoriaExcluindo && (
          <ModalConfirmacao titulo="Excluir Subcategoria" mensagem={`Tem certeza que deseja excluir a subcategoria ${subcategoriaExcluindo}? Todas as peças cadastradas nela serão deletadas.`} onConfirmar={handleDeleteSubcategoria} onCancelar={() => setSubcategoriaExcluindo(null)} />
        )}
        
        {pecaExcluindo && (
           <ModalConfirmacao titulo="Excluir Item" mensagem={`Tem certeza que deseja excluir o item ${pecaExcluindo.nome}?`} onConfirmar={handleDeletePeca} onCancelar={() => setPecaExcluindo(null)} />
        )}

        {pecaVisualizar && (
          <div className="modal-overlay" onClick={() => setPecaVisualizar(null)}>
            <div className="modal modal-large modal-componente-detalhes" onClick={(evento) => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-cube"></i> Detalhes do Componente</h2>
                <button type="button" className="btn-close" onClick={() => setPecaVisualizar(null)}><i className="fas fa-xmark"></i></button>
              </div>

              <div className="view-details form-body-scroll">
                <div className="view-item">
                  <span className="view-label"><i className="fas fa-heading"></i> Especificação</span>
                  <span className="view-value view-value-large">{pecaVisualizar.nome}</span>
                </div>
                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-sitemap"></i> Categoria Raiz</span>
                    <div className="view-badges"><span className={`badge ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].tema}`}><i className={`fas ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].icone} badge-icon`}></i> {pecaVisualizar.categoria}</span></div>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-folder-open"></i> Subcategoria</span>
                    <span className="view-value">{pecaVisualizar.subcategoria}</span>
                  </div>
                </div>

                <div className="vinculos-section">
                  <div className="vinculos-header">
                    <div className="vinculos-header-icon"><i className="fas fa-file-shield"></i></div>
                    <div className="vinculos-header-text">
                      <h4>Normativas Aplicáveis</h4>
                      <p>{pecaVisualizar.normasVinculadas.length} norma(s) vinculada(s) a este item</p>
                    </div>
                  </div>

                  {pecaVisualizar.normasVinculadas.length > 0 ? (
                    <div className="vinculos-lista">
                      {pecaVisualizar.normasVinculadas.map((normaId) => {
                        const normaDetalhes = normas.find((n) => n.id === normaId);
                        if (!normaDetalhes) return null;
                        
                        const temaCatNorma = `theme-cat-${normaDetalhes.categoria.toLowerCase()}`;

                        return (
                          <div 
                            key={normaId} 
                            className={`vinculo-norma-card ${temaCatNorma} clicavel`}
                            onClick={() => setNormaDetalheVisualizar(normaDetalhes)}
                          >
                            <div className={`vinculo-lateral-icon ${temaCatNorma}`}>
                              <i className={`fas ${CAT_ICONES[normaDetalhes.categoria] || "fa-file-lines"}`}></i>
                            </div>

                            <div className="vinculo-norma-content">
                              <div className="vinculo-norma-header-row">
                                <div className="vinculo-norma-header-text">
                                  <span className="vinculo-norma-id">{normaDetalhes.id}</span>
                                  <span className="vinculo-norma-titulo compact">{normaDetalhes.titulo}</span>
                                </div>

                                <div className="vinculo-norma-actions">
                                  {normaDetalhes.urlPdf && (
                                    <button
                                      type="button"
                                      className="btn btn-info btn-icon"
                                      onClick={(evento) => {
                                        evento.stopPropagation();
                                        setPdfVisualizar({
                                          url: normaDetalhes.urlPdf!,
                                          nome: normaDetalhes.nomePdf || `${normaDetalhes.id.replace(" ", "_")}.pdf`
                                        });
                                      }}
                                      title="Visualizar PDF"
                                    >
                                      <i className="fas fa-file-pdf"></i>
                                    </button>
                                  )}
                                  
                                  {normaDetalhes.imagens && normaDetalhes.imagens.length > 0 && (
                                    <button
                                      type="button"
                                      className="btn btn-info btn-icon"
                                      onClick={(evento) => {
                                        evento.stopPropagation();
                                        setImagensAbertas(normaDetalhes.imagens!);
                                        setIndiceImagemAberta(0);
                                      }}
                                      title="Visualizar Imagens"
                                    >
                                      <i className="fas fa-images"></i>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="vinculo-norma-badges spaced">
                                <span className={`badge badge-sm theme-org-${normaDetalhes.organizacao.toLowerCase()}`}><span className="badge-origin large">{ORG_ORIGENS[normaDetalhes.organizacao] || "🌐"}</span>{normaDetalhes.organizacao}</span>
                                <span className={`badge badge-sm ${temaCatNorma}`}><i className={`fas ${CAT_ICONES[normaDetalhes.categoria] || 'fa-tag'} badge-icon`}></i>{normaDetalhes.categoria}</span>
                                <span className={`badge badge-sm ${normaDetalhes.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}><i className={`fas ${normaDetalhes.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}></i>{normaDetalhes.tipo}</span>
                                <span className={`badge badge-sm badge-status ${normaDetalhes.status.toLowerCase()}`}><i className={`fas ${normaDetalhes.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}></i>{normaDetalhes.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state compact"><i className="fas fa-link-slash"></i><p>Nenhuma normativa vinculada a este item.</p></div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setPecaVisualizar(null)}><i className="fas fa-check"></i> Fechar</button>
              </div>
            </div>
          </div>
        )}

        {normaDetalheVisualizar && (
          <ModalDetalhesNorma 
            norma={normaDetalheVisualizar} 
            onClose={() => setNormaDetalheVisualizar(null)} 
            onViewPdf={(urlVisualizada, nomePdfVisualizado) => setPdfVisualizar({ url: urlVisualizada, nome: nomePdfVisualizado })}
            onViewImages={(imagensParaVisualizar, indiceImagemSelecionada) => {
              setImagensAbertas(imagensParaVisualizar);
              setIndiceImagemAberta(indiceImagemSelecionada);
            }}
          />
        )}

        {showManageSubcategorias && navCategoria && (
          <div className="modal-overlay" onClick={() => setShowManageSubcategorias(false)}>
            <div className="modal modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-sliders"></i> Gerenciar Subcategorias</h2>
                <button type="button" className="btn-close" onClick={() => setShowManageSubcategorias(false)}><i className="fas fa-xmark"></i></button>
              </div>
              <div className="view-details modal-pad manage-modal-body form-body-scroll">
                {(estruturaPastas[navCategoria] || []).length > 0 ? (
                  <div className="manage-list">
                    {estruturaPastas[navCategoria].map((subcategoriaAtual) => (
                      <div key={`manage-${subcategoriaAtual}`} className="manage-row">
                        <div className="manage-row-info"><i className="fas fa-folder manage-row-icon"></i> <span className="manage-row-name">{subcategoriaAtual}</span></div>
                        <div className="card-actions inline">
                          <button className="btn btn-warning btn-icon" onClick={() => { setSubcategoriaEditando(subcategoriaAtual); setNomeEditadoSubcategoria(subcategoriaAtual); setShowManageSubcategorias(false); }} title="Editar"><i className="fas fa-pen"></i></button>
                          <button className="btn btn-danger btn-icon" onClick={() => { setSubcategoriaExcluindo(subcategoriaAtual); setShowManageSubcategorias(false); }} title="Excluir"><i className="fas fa-trash"></i></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state compact"><i className="fas fa-folder-open"></i><p>Nenhuma subcategoria para gerenciar.</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddSubcategoria && (
          <div className="modal-overlay" onClick={() => setShowAddSubcategoria(false)}>
            <div className="modal modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleAddSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-folder-plus"></i> Nova Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddSubcategoria(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome da Subcategoria em {navCategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaSubcategoria} onChange={evento => setNomeNovaSubcategoria(evento.target.value)} />
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Criar</button></div>
              </form>
            </div>
          </div>
        )}

        {showAddPeca && (
          <div className="modal-overlay" onClick={() => setShowAddPeca(false)}>
            <div className="modal modal-large modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleAddPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-plus-circle"></i> Novo Item</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddPeca(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome do componente em {navSubcategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaPeca} onChange={evento => setNomeNovaPeca(evento.target.value)} />
                  
                  <label className="view-label margem-top"><i className="fas fa-link"></i> Vincular Normativas</label>
                  <div className="checkbox-list">
                    {normas.map(norma => {
                      const isChecked = normasNovaPeca.includes(norma.id);
                      const temaCatNorma = `theme-cat-${norma.categoria.toLowerCase()}`;
                      return (
                        <label key={norma.id} className={`checkbox-card ${isChecked ? `checked ${temaCatNorma}` : ''}`}>
                          <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={isChecked}
                            onChange={(evento) => {
                              if (evento.target.checked) setNormasNovaPeca(prev => [...prev, norma.id]);
                              else setNormasNovaPeca(prev => prev.filter(id => id !== norma.id));
                            }}
                          />
                          <div className="checkbox-content">
                            <span className="checkbox-title">{norma.id}</span>
                            <span className="checkbox-desc">{norma.titulo}</span>
                          </div>
                          <div className={`checkbox-icon ${temaCatNorma}`}>
                            <i className={`fas ${CAT_ICONES[norma.categoria] || "fa-file-lines"}`}></i>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Salvar</button></div>
              </form>
            </div>
          </div>
        )}

        {subcategoriaEditando && (
          <div className="modal-overlay" onClick={() => setSubcategoriaEditando(null)}>
            <div className="modal modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleEditSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setSubcategoriaEditando(null)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
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

        {pecaEditando && (
          <div className="modal-overlay" onClick={() => setPecaEditando(null)}>
            <div className="modal modal-large modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleEditPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Item</h2>
                  <button type="button" className="btn-close" onClick={() => setPecaEditando(null)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Renomear Componente</label>
                  <input type="text" className="form-input" autoFocus value={nomeEditadoPeca} onChange={evento => setNomeEditadoPeca(evento.target.value)} />
                  
                  <label className="view-label margem-top"><i className="fas fa-link"></i> Normativas Vinculadas</label>
                  <div className="checkbox-list">
                    {normas.map(norma => {
                      const isChecked = normasEditadasPeca.includes(norma.id);
                      const temaCatNorma = `theme-cat-${norma.categoria.toLowerCase()}`;
                      return (
                        <label key={norma.id} className={`checkbox-card ${isChecked ? `checked ${temaCatNorma}` : ''}`}>
                          <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={isChecked}
                            onChange={(evento) => {
                              if (evento.target.checked) setNormasEditadasPeca(prev => [...prev, norma.id]);
                              else setNormasEditadasPeca(prev => prev.filter(id => id !== norma.id));
                            }}
                          />
                          <div className="checkbox-content">
                            <span className="checkbox-title">{norma.id}</span>
                            <span className="checkbox-desc">{norma.titulo}</span>
                          </div>
                          <div className={`checkbox-icon ${temaCatNorma}`}>
                            <i className={`fas ${CAT_ICONES[norma.categoria] || "fa-file-lines"}`}></i>
                          </div>
                        </label>
                      );
                    })}
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

      </main>
    </div>
  );
}