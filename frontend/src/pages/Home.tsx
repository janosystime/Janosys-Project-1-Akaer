import { useState } from "react";
import "../styles/Normativas.css";
import "../styles/Home.css";

interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  organizacao: string;
  categoria: string;
  subcategoria: string;
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
    categoria: "INSTALAÇÃO",
    subcategoria: "ELÉTRICA",
    tipo: "Pública",
    revisao: "Emenda 09",
    status: "Vigente",
    notas: ["Norma principal de safety."],
    referencias: ["SAE ARP4761"],
    nomePdf: "RBAC_25_1309.pdf",
    urlPdf: "#",
  },
  {
    id: "FAR 25.571",
    codigo: "25.571",
    titulo: "Damage Tolerance and Fatigue Evaluation",
    organizacao: "FAA",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    tipo: "Pública",
    revisao: "Amendment 27",
    status: "Vigente",
    notas: [],
    referencias: [],
  },
  {
    id: "ISO 9001:2015",
    codigo: "9001",
    titulo: "Quality management systems",
    organizacao: "ISO",
    categoria: "GERAL",
    subcategoria: "BASIC NOTES",
    tipo: "Privada",
    revisao: "2015",
    status: "Vigente",
    notas: ["Requisitos gerais para o sistema de gestão da qualidade."],
    referencias: ["ISO 9000:2015"],
  },
];

interface Peca {
  nome: string;
  categoria: string;
  subcategoria: string;
  normasVinculadas: string[];
}

const ESTRUTURA_PASTAS: Record<CategoriaRaiz, string[]> = {
  PEÇA: ["METÁLICA", "NÃO METÁLICA"],
  CONJUNTO: ["INSTALAÇÃO DE ACESSÓRIOS", "UNIÃO DE PEÇAS", "CABLAGEM"],
  INSTALAÇÃO: ["ESTRUTURA", "HIDROMECÂNICOS", "ELÉTRICA", "GERAL", "TESTE"],
  GERAL: ["BASIC NOTES", "IDENTIFICAÇÃO"],
};

const PECAS_BASE: Peca[] = [
  {
    nome: "Tubo",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Usinado",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Chapa",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: [],
  },
  {
    nome: "Extrudado",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Fundido",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["FAR 25.571", "ISO 9001:2015"],
  },
  {
    nome: "Tratamento Superficial",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Teste",
    categoria: "PEÇA",
    subcategoria: "METÁLICA",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Material Composto",
    categoria: "PEÇA",
    subcategoria: "NÃO METÁLICA",
    normasVinculadas: ["FAR 25.571", "ISO 9001:2015"],
  },
  {
    nome: "Tubo com Acessório",
    categoria: "CONJUNTO",
    subcategoria: "INSTALAÇÃO DE ACESSÓRIOS",
    normasVinculadas: ["RBAC 25.1309"],
  },
  {
    nome: "Soldagem",
    categoria: "CONJUNTO",
    subcategoria: "UNIÃO DE PEÇAS",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Proteção",
    categoria: "CONJUNTO",
    subcategoria: "CABLAGEM",
    normasVinculadas: ["RBAC 25.1309"],
  },
  {
    nome: "Bota",
    categoria: "CONJUNTO",
    subcategoria: "CABLAGEM",
    normasVinculadas: [],
  },
  {
    nome: "Conector",
    categoria: "CONJUNTO",
    subcategoria: "CABLAGEM",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Conjunto Estrutural",
    categoria: "INSTALAÇÃO",
    subcategoria: "ESTRUTURA",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Válvula Hidromecânica",
    categoria: "INSTALAÇÃO",
    subcategoria: "HIDROMECÂNICOS",
    normasVinculadas: ["RBAC 25.1309"],
  },
  {
    nome: "Chicote Elétrico Principal",
    categoria: "INSTALAÇÃO",
    subcategoria: "ELÉTRICA",
    normasVinculadas: ["RBAC 25.1309"],
  },
  {
    nome: "Selante",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Metalização",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: [],
  },
  {
    nome: "Rebite",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Parafuso",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Arruela",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: [],
  },
  {
    nome: "Inserto",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: [],
  },
  {
    nome: "Frenagem",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Shim",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Primer",
    categoria: "INSTALAÇÃO",
    subcategoria: "GERAL",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Corpo de Prova de Vibração",
    categoria: "INSTALAÇÃO",
    subcategoria: "TESTE",
    normasVinculadas: ["FAR 25.571"],
  },
  {
    nome: "Nota de Desenho Padrão",
    categoria: "GERAL",
    subcategoria: "BASIC NOTES",
    normasVinculadas: ["ISO 9001:2015"],
  },
  {
    nome: "Plaqueta de Identificação",
    categoria: "GERAL",
    subcategoria: "IDENTIFICAÇÃO",
    normasVinculadas: ["ISO 9001:2015"],
  },
];

export default function Home() {
  const [pecas] = useState<Peca[]>(PECAS_BASE);
  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);

  const [normaDetalheVisualizar, setNormaDetalheVisualizar] =
    useState<Norma | null>(null);

  const [navCategoria, setNavCategoria] = useState<CategoriaRaiz | null>(null);
  const [navSubcategoria, setNavSubcategoria] = useState<string | null>(null);

  const pecasDaSubcategoria = pecas.filter(
    (pecaAtual) =>
      pecaAtual.categoria === navCategoria &&
      pecaAtual.subcategoria === navSubcategoria,
  );

  const resetNavegacao = () => {
    setNavCategoria(null);
    setNavSubcategoria(null);
  };

  const renderPecaCard = (peca: Peca, index: number) => {
    const configCategoria = CATEGORIAS_DEF[peca.categoria as CategoriaRaiz];
    return (
      <div key={`peca-${index}`} className={`peca-card ${configCategoria.tema}`}>
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${configCategoria.tema}`}>
            <i className={`fas ${configCategoria.icone}`}></i>
          </div>
          <div className="peca-info">
            <h3>{peca.nome}</h3>
          </div>
        </div>
        <div className="peca-card-body">
          <div className="peca-badges">
            <span className={`badge ${configCategoria.tema}`}>
              <i className={`fas ${configCategoria.icone} badge-icon`}></i>
              {peca.categoria}
            </span>
            <span className="badge theme-subcategoria">
              <i className="fas fa-folder"></i> {peca.subcategoria}
            </span>
          </div>
        </div>
        <div className="peca-card-footer">
          <span className="normas-count">
            <i className="fas fa-file-shield"></i>{" "}
            {peca.normasVinculadas.length} Normas
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setPecaVisualizar(peca)}
          >
            <i className="fas fa-eye"></i>
          </button>
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
                      <i
                        className={`fas ${CATEGORIAS_DEF[categoriaRaiz].icone}`}
                      ></i>
                    </div>
                    <div className="folder-info">
                      <span className="folder-title">{categoriaRaiz}</span>
                      <span className="folder-subtitle">
                        {ESTRUTURA_PASTAS[categoriaRaiz].length} subcategorias
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {navCategoria && !navSubcategoria && (
            <div className="folder-grid">
              {ESTRUTURA_PASTAS[navCategoria].map((subcategoria) => {
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
                      <i
                        className={`fas ${qtdItens > 0 ? "fa-folder-open" : "fa-folder"}`}
                      ></i>
                    </div>
                    <div className="folder-info">
                      <span className="folder-title">{subcategoria}</span>
                      <span className="folder-subtitle">
                        {qtdItens === 0
                          ? "Vazia"
                          : `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {navCategoria && navSubcategoria && (
            <div className="pecas-lista">
              {pecasDaSubcategoria.length > 0 ? (
                pecasDaSubcategoria.map((peca, index) =>
                  renderPecaCard(peca, index),
                )
              ) : (
                <div className="empty-state empty-state-full">
                  <i className="fas fa-box-open"></i>
                  <p>Nenhuma peça cadastrada nesta subcategoria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {pecaVisualizar && (
          <div
            className="modal-overlay"
            onClick={() => setPecaVisualizar(null)}
          >
            <div
              className="modal modal-large"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-cube"></i> Detalhes do Componente
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPecaVisualizar(null)}
                >
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
                      <span
                        className={`badge ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].tema}`}
                      >
                        <i
                          className={`fas ${CATEGORIAS_DEF[pecaVisualizar.categoria as CategoriaRaiz].icone} badge-icon`}
                        ></i>{" "}
                        {pecaVisualizar.categoria}
                      </span>
                    </div>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-folder-open"></i> Localização
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
                        const normaDetalhes = NORMAS_BASE.find(
                          (normaCadastrada) => normaCadastrada.id === normaId,
                        );

                        if (!normaDetalhes) return null;

                        return (
                          <div key={normaId} className="vinculo-norma-card">
                            <div className="vinculo-norma-header-row">
                              <div className="vinculo-norma-header-text">
                                <span className="vinculo-norma-id">
                                  {normaDetalhes.id}
                                </span>
                                <span className="vinculo-norma-titulo compact">
                                  {normaDetalhes.titulo}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  setNormaDetalheVisualizar(normaDetalhes);
                                }}
                                title="Ver Detalhes da Norma"
                              >
                                <i className="fas fa-arrow-up-right-from-square"></i>
                              </button>
                            </div>

                            <div className="vinculo-norma-badges spaced">
                              <span
                                className={`badge badge-sm theme-org-${normaDetalhes.organizacao.toLowerCase()}`}
                              >
                                <span className="badge-origin large">
                                  {ORG_ORIGENS[normaDetalhes.organizacao] ||
                                    "🌐"}
                                </span>
                                {normaDetalhes.organizacao}
                              </span>

                              <span
                                className={`badge badge-sm ${CATEGORIAS_DEF[normaDetalhes.categoria as CategoriaRaiz]?.tema}`}
                              >
                                <i
                                  className={`fas ${CATEGORIAS_DEF[normaDetalhes.categoria as CategoriaRaiz]?.icone} badge-icon`}
                                ></i>
                                {normaDetalhes.categoria}
                              </span>

                              <span
                                className={`badge badge-sm ${normaDetalhes.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}
                              >
                                <i
                                  className={`fas ${normaDetalhes.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}
                                ></i>
                                {normaDetalhes.tipo}
                              </span>

                              <span
                                className={`badge badge-sm badge-status ${normaDetalhes.status.toLowerCase()}`}
                              >
                                <i
                                  className={`fas ${normaDetalhes.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}
                                ></i>
                                {normaDetalhes.status}
                              </span>

                              {(normaDetalhes.urlPdf ||
                                (normaDetalhes.imagens &&
                                  normaDetalhes.imagens.length > 0)) && (
                                <span className="badge badge-sm theme-subcategoria">
                                  <i className="fas fa-paperclip badge-icon"></i>{" "}
                                  Anexos
                                </span>
                              )}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPecaVisualizar(null)}
                >
                  <i className="fas fa-check"></i> Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {normaDetalheVisualizar && (
          <div
            className="modal-overlay modal-overlay-nested"
            onClick={() => setNormaDetalheVisualizar(null)}
          >
            <div
              className="modal modal-large"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-magnifying-glass-chart"></i> Detalhes da
                  Norma
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNormaDetalheVisualizar(null)}
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details">
                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-id-card"></i> ID
                    </span>
                    <span className="view-value">
                      {normaDetalheVisualizar.id}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-hashtag"></i> Código
                    </span>
                    <span className="view-value">
                      {normaDetalheVisualizar.codigo || "—"}
                    </span>
                  </div>
                </div>
                <div className="view-item">
                  <span className="view-label">
                    <i className="fas fa-heading"></i> Título
                  </span>
                  <span className="view-value">
                    {normaDetalheVisualizar.titulo}
                  </span>
                </div>

                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-building"></i> Órgão
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge theme-org-${normaDetalheVisualizar.organizacao.toLowerCase()}`}
                      >
                        <span className="badge-origin">
                          {ORG_ORIGENS[normaDetalheVisualizar.organizacao] ||
                            "🌐"}
                        </span>
                        {normaDetalheVisualizar.organizacao}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-globe"></i> Tipo
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge ${normaDetalheVisualizar.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}
                      >
                        {normaDetalheVisualizar.tipo || "Pública"}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-code-branch"></i> Revisão
                    </span>
                    <span className="view-value">
                      {normaDetalheVisualizar.revisao || "—"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-circle-dot"></i> Status
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge ${normaDetalheVisualizar.status.toLowerCase()}`}
                      >
                        {normaDetalheVisualizar.status === "Vigente" ? (
                          <i className="fas fa-check-circle badge-icon"></i>
                        ) : (
                          <i className="fas fa-times-circle badge-icon"></i>
                        )}
                        {normaDetalheVisualizar.status}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-tags"></i> Categoria
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge ${CATEGORIAS_DEF[normaDetalheVisualizar.categoria as CategoriaRaiz]?.tema}`}
                      >
                        <i
                          className={`fas ${CATEGORIAS_DEF[normaDetalheVisualizar.categoria as CategoriaRaiz]?.icone} badge-icon`}
                        ></i>
                        {normaDetalheVisualizar.categoria}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-layer-group"></i> Subcategoria
                    </span>
                    <span className="view-value">
                      {normaDetalheVisualizar.subcategoria || "—"}
                    </span>
                  </div>
                </div>

                <hr className="divider" />

                {normaDetalheVisualizar.notas.length > 0 && (
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-pen-to-square"></i> Notas Técnicas
                    </span>
                    <ul className="view-list">
                      {normaDetalheVisualizar.notas.map(
                        (notaAtual, indiceNota) => (
                          <li key={indiceNota}>
                            <i className="fas fa-caret-right view-list-icon"></i>{" "}
                            {notaAtual}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {normaDetalheVisualizar.referencias.length > 0 && (
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-link"></i> Referências
                    </span>
                    <ul className="view-list">
                      {normaDetalheVisualizar.referencias.map(
                        (referenciaAtual, indiceReferencia) => (
                          <li key={indiceReferencia}>
                            <i className="fas fa-caret-right view-list-icon"></i>{" "}
                            {referenciaAtual}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {(normaDetalheVisualizar.urlPdf ||
                  (normaDetalheVisualizar.imagens &&
                    normaDetalheVisualizar.imagens.length > 0)) && (
                  <>
                    <hr className="divider" />
                    <div className="view-item">
                      <span className="view-label">
                        <i className="fas fa-paperclip"></i> Anexos
                      </span>
                      {normaDetalheVisualizar.urlPdf && (
                        <a
                          href={normaDetalheVisualizar.urlPdf}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-pdf attachment-link"
                        >
                          <i className="fas fa-file-pdf icon-pdf-red"></i>
                          <span className="attachment-pdf-name">
                            {normaDetalheVisualizar.nomePdf ||
                              `${normaDetalheVisualizar.id.replace(" ", "_")}.pdf`}
                          </span>
                          <i className="fas fa-external-link-alt attachment-external-icon"></i>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {normaDetalheVisualizar.notas.length === 0 &&
                  normaDetalheVisualizar.referencias.length === 0 &&
                  !normaDetalheVisualizar.urlPdf &&
                  (!normaDetalheVisualizar.imagens ||
                    normaDetalheVisualizar.imagens.length === 0) && (
                    <div className="empty-state compact">
                      <i className="fas fa-folder-open"></i>
                      <p>Nenhuma nota ou anexo.</p>
                    </div>
                  )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setNormaDetalheVisualizar(null)}
                >
                  <i className="fas fa-arrow-left"></i> Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}