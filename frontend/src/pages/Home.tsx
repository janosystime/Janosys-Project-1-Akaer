import React, { useEffect, useState, useCallback } from "react";
import "../styles/Normas.css";
import "../styles/Home.css";
import { type Peca } from "../utils/pecas";
import { obterUsuarioAtual } from '../auth/session'
import { API_BASE_URL } from "../config/api";

import type { Norma } from "../components/Normas/NormasViewModel";
import { CAT_ICONES, ORG_ORIGENS } from "../components/Normas/NormasViewModel";
import VisualizadorPdf from "../components/Normas/VisualizadorPdf";
import ModalConfirmacao from "../components/Normas/ModalConfirmacao";
import LightboxImagens from "../components/Normas/LightboxImagens";
import ModalDetalhesNorma from "../components/Normas/ModalDetalhesNorma";

// Categoria/Subcategoria agora vêm do backend (antes eram hardcoded).
interface Subcategoria {
  id: number;
  nome: string;
}
interface Categoria {
  id: number;
  nome: string;
  icone: string;
  tema: string;
  padrao: boolean;
  subcategorias: Subcategoria[];
}

// Ícones sugeridos ao criar uma categoria nova.
const ICONES_CATEGORIA = [
  "fa-folder", "fa-gear", "fa-gears", "fa-screwdriver-wrench", "fa-layer-group",
  "fa-microchip", "fa-bolt", "fa-plane", "fa-flask", "fa-cube",
];

export default function Home() {
  const usuario = obterUsuarioAtual()
  const podeEditar = usuario?.perfil === 'administrador'

  const cabecalhoJson = {
    "Content-Type": "application/json",
    "x-usuario-nome": usuario?.nome || "Administrador",
  };

  // ── Dados do backend ────────────────────────────────────────────────────
  const [normas, setNormas] = useState<Norma[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregarCategorias = useCallback(async () => {
    const resp = await fetch(`${API_BASE_URL}/categorias`);
    if (resp.ok) setCategorias(await resp.json());
  }, []);

  const recarregarPecas = useCallback(async () => {
    const resp = await fetch(`${API_BASE_URL}/pecas`);
    if (resp.ok) setPecas(await resp.json());
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        const [rc, rp, rn] = await Promise.all([
          fetch(`${API_BASE_URL}/categorias`),
          fetch(`${API_BASE_URL}/pecas`),
          fetch(`${API_BASE_URL}/normas`),
        ]);
        if (rc.ok) setCategorias(await rc.json());
        if (rp.ok) setPecas(await rp.json());
        if (rn.ok) setNormas(await rn.json());
      } catch {
        // silencioso: a UI mostra estado vazio
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  // ── Helpers derivados das categorias ────────────────────────────────────
  const catPorNome = (nome: string | null) => categorias.find((c) => c.nome === nome);
  const iconeDe = (nome: string | null) => catPorNome(nome)?.icone || "fa-folder";
  const temaDe = (nome: string | null) => catPorNome(nome)?.tema || "theme-cat-geral";
  const subsDe = (nome: string | null) => catPorNome(nome)?.subcategorias || [];
  const subIdDe = (catNome: string | null, subNome: string) =>
    subsDe(catNome).find((s) => s.nome === subNome)?.id;

  // ── Estado de navegação / modais ────────────────────────────────────────
  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);
  const [normaDetalheVisualizar, setNormaDetalheVisualizar] = useState<Norma | null>(null);
  const [pdfVisualizar, setPdfVisualizar] = useState<{ id: string, nome: string } | null>(null);

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
    (pecaAtual) => pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === navSubcategoria
  );

  const resetNavegacao = () => {
    setNavCategoria(null);
    setNavSubcategoria(null);
  };

  // ── Handlers (API) ──────────────────────────────────────────────────────
  const handleAddCategoria = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const nome = nomeNovaCategoria.trim();
    if (!nome) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias`, {
        method: "POST",
        headers: cabecalhoJson,
        body: JSON.stringify({ nome, icone: iconeNovaCategoria, tema: "theme-cat-geral" }),
      });
      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        alert(erro.error || "Erro ao criar categoria.");
        return;
      }
      await recarregarCategorias();
      setNomeNovaCategoria("");
      setIconeNovaCategoria(ICONES_CATEGORIA[0]);
      setShowAddCategoria(false);
    } catch {
      alert("Erro de conexão ao criar categoria.");
    }
  };

  const handleDeleteCategoria = async () => {
    if (!categoriaExcluindo) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/categorias/${categoriaExcluindo.id}`, {
        method: "DELETE",
        headers: cabecalhoJson,
      });
      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        alert(erro.error || "Erro ao excluir categoria.");
        return;
      }
      await Promise.all([recarregarCategorias(), recarregarPecas()]);
      if (navCategoria === categoriaExcluindo.nome) resetNavegacao();
    } catch {
      alert("Erro de conexão ao excluir categoria.");
    } finally {
      setCategoriaExcluindo(null);
    }
  };

  const handleAddSubcategoria = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const cat = catPorNome(navCategoria);
    if (!nomeNovaSubcategoria.trim() || !cat) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/subcategorias`, {
        method: "POST",
        headers: cabecalhoJson,
        body: JSON.stringify({ categoriaId: cat.id, nome: nomeNovaSubcategoria.trim() }),
      });
      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        alert(erro.error || "Erro ao criar subcategoria.");
        return;
      }
      await recarregarCategorias();
      setNomeNovaSubcategoria("");
      setShowAddSubcategoria(false);
    } catch {
      alert("Erro de conexão ao criar subcategoria.");
    }
  };

  const handleEditSubcategoria = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoSubcategoria.trim() || !navCategoria || !subcategoriaEditando) return;
    const id = subIdDe(navCategoria, subcategoriaEditando);
    if (!id) return;
    const novoNome = nomeEditadoSubcategoria.trim();
    try {
      const resp = await fetch(`${API_BASE_URL}/subcategorias/${id}`, {
        method: "PUT",
        headers: cabecalhoJson,
        body: JSON.stringify({ nome: novoNome }),
      });
      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        alert(erro.error || "Erro ao renomear subcategoria.");
        return;
      }
      await Promise.all([recarregarCategorias(), recarregarPecas()]);
      if (navSubcategoria === subcategoriaEditando) setNavSubcategoria(novoNome);
      setSubcategoriaEditando(null);
    } catch {
      alert("Erro de conexão ao renomear subcategoria.");
    }
  };

  const handleDeleteSubcategoria = async () => {
    if (!navCategoria || !subcategoriaExcluindo) return;
    const id = subIdDe(navCategoria, subcategoriaExcluindo);
    if (!id) { setSubcategoriaExcluindo(null); return; }
    try {
      await fetch(`${API_BASE_URL}/subcategorias/${id}`, { method: "DELETE", headers: cabecalhoJson });
      await Promise.all([recarregarCategorias(), recarregarPecas()]);
      if (navSubcategoria === subcategoriaExcluindo) setNavSubcategoria(null);
    } catch {
      alert("Erro de conexão ao excluir subcategoria.");
    } finally {
      setSubcategoriaExcluindo(null);
    }
  };

  const handleAddPeca = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeNovaPeca.trim() || !navCategoria || !navSubcategoria) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/pecas`, {
        method: "POST",
        headers: cabecalhoJson,
        body: JSON.stringify({
          nome: nomeNovaPeca.trim(),
          categoria: navCategoria,
          subcategoria: navSubcategoria,
          normasVinculadas: normasNovaPeca,
        }),
      });
      if (!resp.ok) { alert("Erro ao criar item."); return; }
      await recarregarPecas();
      setNomeNovaPeca("");
      setNormasNovaPeca([]);
      setShowAddPeca(false);
    } catch {
      alert("Erro de conexão ao criar item.");
    }
  };

  const handleEditPeca = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nomeEditadoPeca.trim() || !pecaEditando?.id) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/pecas/${pecaEditando.id}`, {
        method: "PUT",
        headers: cabecalhoJson,
        body: JSON.stringify({ nome: nomeEditadoPeca.trim(), normasVinculadas: normasEditadasPeca }),
      });
      if (!resp.ok) { alert("Erro ao editar item."); return; }
      await recarregarPecas();
      setPecaEditando(null);
    } catch {
      alert("Erro de conexão ao editar item.");
    }
  };

  const handleDeletePeca = async () => {
    if (!pecaExcluindo?.id) { setPecaExcluindo(null); return; }
    try {
      await fetch(`${API_BASE_URL}/pecas/${pecaExcluindo.id}`, { method: "DELETE", headers: cabecalhoJson });
      await recarregarPecas();
    } catch {
      alert("Erro de conexão ao excluir item.");
    } finally {
      setPecaExcluindo(null);
    }
  };

  const renderPecaCard = (pecaAtual: Peca) => {
    const tema = temaDe(pecaAtual.categoria);
    const icone = iconeDe(pecaAtual.categoria);
    return (
      <div key={`peca-${pecaAtual.id}`} className={`peca-card ${tema}`} onClick={() => setPecaVisualizar(pecaAtual)}>
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${tema}`}>
            <i className={`fas ${icone}`}></i>
          </div>
          <div className="peca-info"><h3>{pecaAtual.nome}</h3></div>
        </div>
        <div className="peca-card-footer">
          <span className="normas-count"><i className="fas fa-file-shield"></i> {pecaAtual.normasVinculadas.length} Normas</span>
          {podeEditar && (
            <div className="card-actions inline">
              <button className="btn btn-warning btn-icon" onClick={(evento) => { evento.stopPropagation(); setPecaEditando(pecaAtual); setNomeEditadoPeca(pecaAtual.nome); setNormasEditadasPeca(pecaAtual.normasVinculadas); }} title="Editar Peça"><i className="fas fa-pen"></i></button>
              <button className="btn btn-danger btn-icon" onClick={(evento) => { evento.stopPropagation(); setPecaExcluindo(pecaAtual); }} title="Excluir Peça"><i className="fas fa-trash"></i></button>
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
          {carregando ? (
            <div className="empty-state"><i className="fas fa-spinner fa-spin"></i><p>Carregando catálogo...</p></div>
          ) : (
          <>
          {!navCategoria && (
            <div className="folder-grid">
              {categorias.map((categoriaAtual) => (
                <div key={categoriaAtual.id} className={`folder-card ${categoriaAtual.tema}`} onClick={() => setNavCategoria(categoriaAtual.nome)}>
                  <div className="folder-icon"><i className={`fas ${categoriaAtual.icone}`}></i></div>
                  <div className="folder-info">
                    <span className="folder-title">{categoriaAtual.nome}</span>
                    <span className="folder-subtitle">{categoriaAtual.subcategorias.length} subcategorias</span>
                  </div>
                  {podeEditar && !categoriaAtual.padrao && (
                    <button
                      className="btn btn-danger btn-icon folder-delete-btn"
                      onClick={(evento) => { evento.stopPropagation(); setCategoriaExcluindo(categoriaAtual); }}
                      title="Excluir categoria"
                    >
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
                    <i className="fas fa-sliders"></i> Gerenciar Pastas</button>
                )}
              </div>

              <div className="folder-grid">
                {subsDe(navCategoria).map((subcategoriaAtual) => {
                  const qtdItens = pecas.filter((pecaAtual) => pecaAtual.categoria === navCategoria && pecaAtual.subcategoria === subcategoriaAtual.nome).length;
                  return (
                    <div key={subcategoriaAtual.id} className={`folder-card ${temaDe(navCategoria)}`} onClick={() => setNavSubcategoria(subcategoriaAtual.nome)}>
                      <div className="folder-icon"><i className={`fas ${qtdItens > 0 ? "fa-folder-open" : "fa-folder"}`}></i></div>
                      <div className="folder-info">
                        <span className="folder-title" title={subcategoriaAtual.nome}>{subcategoriaAtual.nome}</span>
                        <span className="folder-subtitle">{qtdItens === 0 ? "Vazia" : `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}`}</span>
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
                {pecasDaSubcategoria.map((pecaAtual) => renderPecaCard(pecaAtual))}
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
          </>
          )}
        </div>

        {pdfVisualizar && <VisualizadorPdf id={pdfVisualizar.id} nome={pdfVisualizar.nome} onClose={() => setPdfVisualizar(null)} />}

        {indiceImagemAberta !== null && imagensAbertas && (
          <LightboxImagens imagens={imagensAbertas} indiceInicial={indiceImagemAberta} onClose={() => { setIndiceImagemAberta(null); setImagensAbertas(null); }} />
        )}

        {categoriaExcluindo && (
          <ModalConfirmacao titulo="Excluir Categoria" mensagem={`Tem certeza que deseja excluir a categoria ${categoriaExcluindo.nome}? Todas as subcategorias e peças dentro dela serão deletadas.`} onConfirmar={handleDeleteCategoria} onCancelar={() => setCategoriaExcluindo(null)} />
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
                                  {normaDetalhes.temPdf && (
                                    <button
                                      type="button"
                                      className="btn btn-info btn-icon"
                                      onClick={(evento) => {
                                        evento.stopPropagation();
                                        setPdfVisualizar({
                                          id: normaDetalhes.id,
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
            onViewPdf={(idNorma, nomePdfVisualizado) => setPdfVisualizar({ id: idNorma, nome: nomePdfVisualizado })}
            onViewImages={(imagensParaVisualizar, indiceImagemSelecionada) => {
              setImagensAbertas(imagensParaVisualizar);
              setIndiceImagemAberta(indiceImagemSelecionada);
            }}
          />
        )}

        {showAddCategoria && (
          <div className="modal-overlay" onClick={() => setShowAddCategoria(false)}>
            <div className="modal modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <form onSubmit={handleAddCategoria}>
                <div className="modal-header">
                  <h2><i className="fas fa-folder-plus"></i> Nova Categoria</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAddCategoria(false)}><i className="fas fa-xmark"></i></button>
                </div>
                <div className="view-details modal-pad form-body-scroll">
                  <label className="view-label">Nome da Categoria</label>
                  <input type="text" className="form-input" autoFocus value={nomeNovaCategoria} onChange={evento => setNomeNovaCategoria(evento.target.value)} placeholder="Ex: Eletrônica" />

                  <label className="view-label margem-top"><i className="fas fa-icons"></i> Ícone</label>
                  <div className="checkbox-list" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {ICONES_CATEGORIA.map((ic) => (
                      <button
                        type="button"
                        key={ic}
                        className={`btn btn-icon ${iconeNovaCategoria === ic ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setIconeNovaCategoria(ic)}
                        title={ic}
                      >
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
            <div className="modal modal-scroll-fit" onClick={evento => evento.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-sliders"></i> Gerenciar Subcategorias</h2>
                <button type="button" className="btn-close" onClick={() => setShowManageSubcategorias(false)}><i className="fas fa-xmark"></i></button>
              </div>
              <div className="view-details modal-pad manage-modal-body form-body-scroll">
                {subsDe(navCategoria).length > 0 ? (
                  <div className="manage-list">
                    {subsDe(navCategoria).map((subcategoriaAtual) => (
                      <div key={`manage-${subcategoriaAtual.id}`} className="manage-row">
                        <div className="manage-row-info"><i className="fas fa-folder manage-row-icon"></i> <span className="manage-row-name">{subcategoriaAtual.nome}</span></div>
                        <div className="card-actions inline">
                          <button className="btn btn-warning btn-icon" onClick={() => { setSubcategoriaEditando(subcategoriaAtual.nome); setNomeEditadoSubcategoria(subcategoriaAtual.nome); setShowManageSubcategorias(false); }} title="Editar"><i className="fas fa-pen"></i></button>
                          <button className="btn btn-danger btn-icon" onClick={() => { setSubcategoriaExcluindo(subcategoriaAtual.nome); setShowManageSubcategorias(false); }} title="Excluir"><i className="fas fa-trash"></i></button>
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
