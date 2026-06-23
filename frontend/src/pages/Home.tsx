import React, { useState } from "react";
import "../styles/Normas.css";
import "../styles/Home.css";
import { obterUsuarioAtual } from '../auth/session';
import { normasDb, subcategoriasDb } from "../utils/storage";
import { carregarPecas, salvarPecas, type Peca } from "../utils/pecas";
import { CATEGORIAS, SUBCATEGORIAS, CAT_ICONES, ORG_ORIGENS } from "../components/Normas/NormasViewModel";
import type { Norma } from "../components/Normas/NormasViewModel";
import VisualizadorPdf from "../components/Normas/VisualizadorPdf";
import ModalConfirmacao from "../components/Normas/ModalConfirmacao";
import LightboxImagens from "../components/Normas/LightboxImagens";
import ModalDetalhesNorma from "../components/Normas/ModalDetalhesNorma";

interface Subcategoria { id: number; nome: string; }
interface Categoria { id: number; nome: string; icone: string; tema: string; padrao: boolean; subcategorias: Subcategoria[]; }

const ICONES_CATEGORIA = [
  "fa-folder", "fa-gear", "fa-gears", "fa-screwdriver-wrench", "fa-layer-group",
  "fa-microchip", "fa-bolt", "fa-plane", "fa-flask", "fa-cube",
];

const TEMAS_CAT: Record<string, string> = {
  Peça: "theme-cat-peça", Conjunto: "theme-cat-conjunto",
  Instalação: "theme-cat-instalação", Geral: "theme-cat-geral",
};

const ICONES_CAT: Record<string, string> = {
  Peça: "fa-gear", Conjunto: "fa-gears",
  Instalação: "fa-screwdriver-wrench", Geral: "fa-layer-group",
};

function montarCategorias(): Categoria[] {
  return CATEGORIAS.map((nome, idx) => {
    const subs = subcategoriasDb.byCategoriaId(idx + 1);
    const subsBase = (SUBCATEGORIAS[nome] ?? []).map((s, i) => ({ id: i + 1, nome: s }));
    return {
      id: idx + 1, nome, padrao: true,
      icone: ICONES_CAT[nome] ?? "fa-folder",
      tema: TEMAS_CAT[nome] ?? "theme-cat-geral",
      subcategorias: subs.length > 0 ? subs : subsBase,
    };
  });
}

export default function Home() {
  const usuario = obterUsuarioAtual();
  const podeEditar = usuario?.perfil === 'administrador';

  const [normas ] = useState<Norma[]>(() => normasDb.list());
  const [pecas, setPecas] = useState<Peca[]>(() => carregarPecas());
  const [categorias, setCategorias] = useState<Categoria[]>(() => montarCategorias());

  const recarregarCategorias = () => setCategorias(montarCategorias());
  const recarregarPecas = () => setPecas(carregarPecas());

  const catPorNome = (nome: string | null) => categorias.find((c) => c.nome === nome);
  const iconeDe = (nome: string | null) => catPorNome(nome)?.icone || "fa-folder";
  const temaDe = (nome: string | null) => catPorNome(nome)?.tema || "theme-cat-geral";
  const subsDe = (nome: string | null) => catPorNome(nome)?.subcategorias || [];

  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);
  const [normaDetalheVisualizar, setNormaDetalheVisualizar] = useState<Norma | null>(null);
  const [pdfVisualizar, setPdfVisualizar] = useState<{ url: string; nome: string } | null>(null);
  const [imagensAbertas, setImagensAbertas] = useState<string[] | null>(null);
  const [indiceImagemAberta, setIndiceImagemAberta] = useState<number | null>(null);

  const [navCategoria, setNavCategoria] = useState<string | null>(null);
  const [navSubcategoria, setNavSubcategoria] = useState<string | null>(null);

  const [showManageSubcategorias, setShowManageSubcategorias] = useState(false);
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState("");
  const [iconeNovaCategoria, setIconeNovaCategoria] = useState(ICONES_CATEGORIA[0]);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState<Categoria | null>(null);

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
    (p) => p.categoria === navCategoria && p.subcategoria === navSubcategoria
  );

  const resetNavegacao = () => { setNavCategoria(null); setNavSubcategoria(null); };

  const handleAddCategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    const nome = nomeNovaCategoria.trim();
    if (!nome) return;
    setNomeNovaCategoria("");
    setIconeNovaCategoria(ICONES_CATEGORIA[0]);
    setShowAddCategoria(false);
  };

  const handleDeleteCategoria = () => {
    if (!categoriaExcluindo) return;
    if (navCategoria === categoriaExcluindo.nome) resetNavegacao();
    setCategoriaExcluindo(null);
  };

  const handleAddSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    const cat = catPorNome(navCategoria);
    if (!nomeNovaSubcategoria.trim() || !cat) return;
    subcategoriasDb.create(nomeNovaSubcategoria.trim(), cat.id);
    recarregarCategorias();
    setNomeNovaSubcategoria("");
    setShowAddSubcategoria(false);
  };

  const handleEditSubcategoria = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoSubcategoria.trim() || !navCategoria || !subcategoriaEditando) return;
    const subs = subcategoriasDb.list();
    const entrada = subs.find(s => s.nome === subcategoriaEditando && s.categoriaId === catPorNome(navCategoria)?.id);
    if (!entrada) return;
    const atualizadas = subs.map(s => s.id === entrada.id ? { ...s, nome: nomeEditadoSubcategoria.trim() } : s);
    localStorage.setItem("signa:subcategorias", JSON.stringify(atualizadas));
    if (navSubcategoria === subcategoriaEditando) setNavSubcategoria(nomeEditadoSubcategoria.trim());
    recarregarCategorias();
    setSubcategoriaEditando(null);
  };

  const handleDeleteSubcategoria = () => {
    if (!navCategoria || !subcategoriaExcluindo) return;
    const cat = catPorNome(navCategoria);
    const atualizadas = subcategoriasDb.list().filter(
      s => !(s.nome === subcategoriaExcluindo && s.categoriaId === cat?.id)
    );
    localStorage.setItem("signa:subcategorias", JSON.stringify(atualizadas));
    salvarPecas(pecas.filter(p => !(p.categoria === navCategoria && p.subcategoria === subcategoriaExcluindo)));
    if (navSubcategoria === subcategoriaExcluindo) setNavSubcategoria(null);
    recarregarCategorias();
    recarregarPecas();
    setSubcategoriaExcluindo(null);
  };

  const handleAddPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaPeca.trim() || !navCategoria || !navSubcategoria) return;
    salvarPecas([...pecas, { nome: nomeNovaPeca.trim(), categoria: navCategoria, subcategoria: navSubcategoria, normasVinculadas: normasNovaPeca }]);
    recarregarPecas();
    setNomeNovaPeca(""); setNormasNovaPeca([]); setShowAddPeca(false);
  };

  const handleEditPeca = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoPeca.trim() || !pecaEditando) return;
    salvarPecas(pecas.map(p => p === pecaEditando ? { ...p, nome: nomeEditadoPeca.trim(), normasVinculadas: normasEditadasPeca } : p));
    recarregarPecas();
    setPecaEditando(null);
  };

  const handleDeletePeca = () => {
    if (!pecaExcluindo) { setPecaExcluindo(null); return; }
    salvarPecas(pecas.filter(p => p !== pecaExcluindo));
    recarregarPecas();
    setPecaExcluindo(null);
  };

  const renderPecaCard = (pecaAtual: Peca) => {
    const tema = temaDe(pecaAtual.categoria);
    const icone = iconeDe(pecaAtual.categoria);
    return (
      <div key={`peca-${pecaAtual.id}`} className={`peca-card ${tema}`} onClick={() => setPecaVisualizar(pecaAtual)}>
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${tema}`}><i className={`fas ${icone}`}></i></div>
          <div className="peca-info"><h3>{pecaAtual.nome}</h3></div>
        </div>
        <div className="peca-card-footer">
          <span className="normas-count"><i className="fas fa-file-shield"></i> {pecaAtual.normasVinculadas.length} Normas</span>
          {podeEditar && (
            <div className="card-actions inline">
              <button className="btn btn-warning btn-icon" onClick={(e) => { e.stopPropagation(); setPecaEditando(pecaAtual); setNomeEditadoPeca(pecaAtual.nome); setNormasEditadasPeca(pecaAtual.normasVinculadas); }} title="Editar"><i className="fas fa-pen"></i></button>
              <button className="btn btn-danger btn-icon" onClick={(e) => { e.stopPropagation(); setPecaExcluindo(pecaAtual); }} title="Excluir"><i className="fas fa-trash"></i></button>
            </div>
          )}
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
                <i className={`fas ${iconeDe(navCategoria)}`}></i> {navCategoria}
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
              {categorias.map((cat) => (
                <div key={cat.id} className={`folder-card ${cat.tema}`} onClick={() => setNavCategoria(cat.nome)}>
                  <div className="folder-icon"><i className={`fas ${cat.icone}`}></i></div>
                  <div className="folder-info">
                    <span className="folder-title">{cat.nome}</span>
                    <span className="folder-subtitle">{cat.subcategorias.length} subcategorias</span>
                  </div>
                  {podeEditar && !cat.padrao && (
                    <button className="btn btn-danger btn-icon folder-delete-btn" onClick={(e) => { e.stopPropagation(); setCategoriaExcluindo(cat); }} title="Excluir categoria">
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              {podeEditar && (
                <div className="folder-card add-card" onClick={() => { setNomeNovaCategoria(""); setIconeNovaCategoria(ICONES_CATEGORIA[0]); setShowAddCategoria(true); }}>
                  <div className="folder-icon"><i className="fas fa-plus"></i></div>
                  <div className="folder-info"><span className="folder-title">Nova Categoria</span></div>
                </div>
              )}
            </div>
          )}

          {navCategoria && !navSubcategoria && (
            <div className="category-view-container">
              <div className="category-header-actions">
                <h2 className="category-title"><i className={`fas ${iconeDe(navCategoria)}`}></i> {navCategoria}</h2>
                {podeEditar && (
                  <button className="btn btn-ghost" onClick={() => setShowManageSubcategorias(true)}>
                    <i className="fas fa-sliders"></i> Gerenciar Pastas
                  </button>
                )}
              </div>
              <div className="folder-grid">
                {subsDe(navCategoria).map((sub) => {
                  const qtd = pecas.filter(p => p.categoria === navCategoria && p.subcategoria === sub.nome).length;
                  return (
                    <div key={sub.id} className={`folder-card ${temaDe(navCategoria)}`} onClick={() => setNavSubcategoria(sub.nome)}>
                      <div className="folder-icon"><i className={`fas ${qtd > 0 ? "fa-folder-open" : "fa-folder"}`}></i></div>
                      <div className="folder-info">
                        <span className="folder-title" title={sub.nome}>{sub.nome}</span>
                        <span className="folder-subtitle">{qtd === 0 ? "Vazia" : `${qtd} ${qtd === 1 ? "item" : "itens"}`}</span>
                      </div>
                    </div>
                  );
                })}
                {podeEditar && (
                  <div className="folder-card add-card" onClick={() => setShowAddSubcategoria(true)}>
                    <div className="folder-icon"><i className="fas fa-plus"></i></div>
                    <div className="folder-info"><span className="folder-title">Nova Subcategoria</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {navCategoria && navSubcategoria && (
            <div className="subcategory-view">
              <div className="subcategory-header-simple">
                <h2 className="subcategory-title"><i className="fas fa-folder-open"></i> {navSubcategoria}</h2>
              </div>
              <div className="pecas-lista">
                {pecasDaSubcategoria.map((p) => renderPecaCard(p))}
                {podeEditar && (
                  <div className="peca-card add-card" onClick={() => { setNomeNovaPeca(""); setNormasNovaPeca([]); setShowAddPeca(true); }}>
                    <div className="peca-card-header centralizado">
                      <div className="peca-icon-wrapper ghost-icon"><i className="fas fa-plus"></i></div>
                      <div className="peca-info"><h3>Novo Item</h3></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {pdfVisualizar && <VisualizadorPdf url={pdfVisualizar.url} nome={pdfVisualizar.nome} onClose={() => setPdfVisualizar(null)} />}

        {indiceImagemAberta !== null && imagensAbertas && (
          <LightboxImagens imagens={imagensAbertas} indiceInicial={indiceImagemAberta} onClose={() => { setIndiceImagemAberta(null); setImagensAbertas(null); }} />
        )}

        {categoriaExcluindo && (
          <ModalConfirmacao titulo="Excluir Categoria" mensagem={`Excluir "${categoriaExcluindo.nome}"? Todas as subcategorias e peças serão deletadas.`} onConfirmar={handleDeleteCategoria} onCancelar={() => setCategoriaExcluindo(null)} />
        )}
        {subcategoriaExcluindo && (
          <ModalConfirmacao titulo="Excluir Subcategoria" mensagem={`Excluir "${subcategoriaExcluindo}"? Todas as peças cadastradas nela serão deletadas.`} onConfirmar={handleDeleteSubcategoria} onCancelar={() => setSubcategoriaExcluindo(null)} />
        )}
        {pecaExcluindo && (
          <ModalConfirmacao titulo="Excluir Item" mensagem={`Excluir "${pecaExcluindo.nome}"?`} onConfirmar={handleDeletePeca} onCancelar={() => setPecaExcluindo(null)} />
        )}

        {pecaVisualizar && (
          <div className="modal-overlay" onClick={() => setPecaVisualizar(null)}>
            <div className="modal modal-large modal-componente-detalhes" onClick={(e) => e.stopPropagation()}>
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
                    <div className="view-badges"><span className={`badge ${temaDe(pecaVisualizar.categoria)}`}><i className={`fas ${iconeDe(pecaVisualizar.categoria)} badge-icon`}></i> {pecaVisualizar.categoria}</span></div>
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
                        const n = normas.find((x) => x.id === normaId);
                        if (!n) return null;
                        const tema = `theme-cat-${n.categoria.toLowerCase()}`;
                        return (
                          <div key={normaId} className={`vinculo-norma-card ${tema} clicavel`} onClick={() => setNormaDetalheVisualizar(n)}>
                            <div className={`vinculo-lateral-icon ${tema}`}><i className={`fas ${CAT_ICONES[n.categoria] || "fa-file-lines"}`}></i></div>
                            <div className="vinculo-norma-content">
                              <div className="vinculo-norma-header-row">
                                <div className="vinculo-norma-header-text">
                                  <span className="vinculo-norma-id">{n.id}</span>
                                  <span className="vinculo-norma-titulo compact">{n.titulo}</span>
                                </div>
                                <div className="vinculo-norma-actions">
                                  {n.nomePdf && (
                                    <button type="button" className="btn btn-info btn-icon" onClick={(e) => { e.stopPropagation(); setPdfVisualizar({ url: `/pdf/${n.nomePdf}`, nome: n.nomePdf! }); }} title="Visualizar PDF">
                                      <i className="fas fa-file-pdf"></i>
                                    </button>
                                  )}
                                  {n.imagens && n.imagens.length > 0 && (
                                    <button type="button" className="btn btn-info btn-icon" onClick={(e) => { e.stopPropagation(); setImagensAbertas(n.imagens!); setIndiceImagemAberta(0); }} title="Visualizar Imagens">
                                      <i className="fas fa-images"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="vinculo-norma-badges spaced">
                                <span className={`badge badge-sm theme-org-${n.organizacao.toLowerCase()}`}><span className="badge-origin large">{ORG_ORIGENS[n.organizacao] || "🌐"}</span>{n.organizacao}</span>
                                <span className={`badge badge-sm ${tema}`}><i className={`fas ${CAT_ICONES[n.categoria] || 'fa-tag'} badge-icon`}></i>{n.categoria}</span>
                                <span className={`badge badge-sm ${n.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}><i className={`fas ${n.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}></i>{n.tipo}</span>
                                <span className={`badge badge-sm badge-status ${n.status.toLowerCase()}`}><i className={`fas ${n.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}></i>{n.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state compact"><i className="fas fa-link-slash"></i><p>Nenhuma normativa vinculada.</p></div>
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
            onViewPdf={(url, nome) => setPdfVisualizar({ url, nome })}
            onViewImages={(imgs, idx) => { setImagensAbertas(imgs); setIndiceImagemAberta(idx); }}
          />
        )}

        {showAddCategoria && (
          <div className="modal-overlay" onClick={() => setShowAddCategoria(false)}>
            <div className="modal modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleAddCategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-folder-plus"></i> Nova Categoria</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddCategoria(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome da Categoria</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaCategoria} onChange={e => setNomeNovaCategoria(e.target.value)} placeholder="Ex: Eletrônica" />
                  <label className="view-label margem-top"><i className="fas fa-icons"></i> Ícone</label>
                  <div className="checkbox-list" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ICONES_CATEGORIA.map((ic) => (
                      <button type="button" key={ic} className={`btn btn-icon ${iconeNovaCategoria === ic ? "btn-primary" : "btn-ghost"}`} onClick={() => setIconeNovaCategoria(ic)} title={ic}>
                        <i className={`fas ${ic}`}></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Criar</button></div>
              </form>
            </div>
          </div>
        )}

        {showManageSubcategorias && navCategoria && (
          <div className="modal-overlay" onClick={() => setShowManageSubcategorias(false)}>
            <div className="modal modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-sliders"></i> Gerenciar Subcategorias</h2>
                <button type="button" className="btn-close" onClick={() => setShowManageSubcategorias(false)}><i className="fas fa-xmark"></i></button>
              </div>
              <div className="view-details modal-pad manage-modal-body form-body-scroll">
                {subsDe(navCategoria).length > 0 ? (
                  <div className="manage-list">
                    {subsDe(navCategoria).map((sub) => (
                      <div key={`manage-${sub.id}`} className="manage-row">
                        <div className="manage-row-info"><i className="fas fa-folder manage-row-icon"></i> <span className="manage-row-name">{sub.nome}</span></div>
                        <div className="card-actions inline">
                          <button className="btn btn-warning btn-icon" onClick={() => { setSubcategoriaEditando(sub.nome); setNomeEditadoSubcategoria(sub.nome); setShowManageSubcategorias(false); }} title="Editar"><i className="fas fa-pen"></i></button>
                          <button className="btn btn-danger btn-icon" onClick={() => { setSubcategoriaExcluindo(sub.nome); setShowManageSubcategorias(false); }} title="Excluir"><i className="fas fa-trash"></i></button>
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
            <div className="modal modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleAddSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-folder-plus"></i> Nova Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddSubcategoria(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome da Subcategoria em {navCategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaSubcategoria} onChange={e => setNomeNovaSubcategoria(e.target.value)} />
                </div>
                <div className="modal-footer"><button type="submit" className="btn btn-primary"><i className="fas fa-check"></i> Criar</button></div>
              </form>
            </div>
          </div>
        )}

        {showAddPeca && (
          <div className="modal-overlay" onClick={() => setShowAddPeca(false)}>
            <div className="modal modal-large modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleAddPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-plus-circle"></i> Novo Item</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddPeca(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome do componente em {navSubcategoria}</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaPeca} onChange={e => setNomeNovaPeca(e.target.value)} />
                  <label className="view-label margem-top"><i className="fas fa-link"></i> Vincular Normativas</label>
                  <div className="checkbox-list">
                    {normas.map(n => {
                      const checked = normasNovaPeca.includes(n.id);
                      const tema = `theme-cat-${n.categoria.toLowerCase()}`;
                      return (
                        <label key={n.id} className={`checkbox-card ${checked ? `checked ${tema}` : ''}`}>
                          <input type="checkbox" className="custom-checkbox" checked={checked} onChange={(e) => { if (e.target.checked) setNormasNovaPeca(prev => [...prev, n.id]); else setNormasNovaPeca(prev => prev.filter(id => id !== n.id)); }} />
                          <div className="checkbox-content"><span className="checkbox-title">{n.id}</span><span className="checkbox-desc">{n.titulo}</span></div>
                          <div className={`checkbox-icon ${tema}`}><i className={`fas ${CAT_ICONES[n.categoria] || "fa-file-lines"}`}></i></div>
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
            <div className="modal modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleEditSubcategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Subcategoria</h2>
                  <button type="button" className="btn-close" onClick={() => setSubcategoriaEditando(null)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Renomear Subcategoria</label>
                  <input type="text" className="form-input" autoFocus value={nomeEditadoSubcategoria} onChange={e => setNomeEditadoSubcategoria(e.target.value)} />
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
            <div className="modal modal-large modal-scroll-fit" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleEditPeca}>
                <div className="modal-header">
                  <h2><i className="fas fa-pen"></i> Editar Item</h2>
                  <button type="button" className="btn-close" onClick={() => setPecaEditando(null)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Renomear Componente</label>
                  <input type="text" className="form-input" autoFocus value={nomeEditadoPeca} onChange={e => setNomeEditadoPeca(e.target.value)} />
                  <label className="view-label margem-top"><i className="fas fa-link"></i> Normativas Vinculadas</label>
                  <div className="checkbox-list">
                    {normas.map(n => {
                      const checked = normasEditadasPeca.includes(n.id);
                      const tema = `theme-cat-${n.categoria.toLowerCase()}`;
                      return (
                        <label key={n.id} className={`checkbox-card ${checked ? `checked ${tema}` : ''}`}>
                          <input type="checkbox" className="custom-checkbox" checked={checked} onChange={(e) => { if (e.target.checked) setNormasEditadasPeca(prev => [...prev, n.id]); else setNormasEditadasPeca(prev => prev.filter(id => id !== n.id)); }} />
                          <div className="checkbox-content"><span className="checkbox-title">{n.id}</span><span className="checkbox-desc">{n.titulo}</span></div>
                          <div className={`checkbox-icon ${tema}`}><i className={`fas ${CAT_ICONES[n.categoria] || "fa-file-lines"}`}></i></div>
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