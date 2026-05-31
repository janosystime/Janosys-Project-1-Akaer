import { useState, useEffect } from "react";
import type { Peca } from "../../utils/pecas";
import type { Norma } from "./NormasViewModel";
import { CAT_ICONES, ORG_ORIGENS } from "./NormasViewModel";
import { safeParseArray } from "../../utils/NormasUtils";

interface LogHistorico {
  id: number;
  tipoAlteracao: string; // 'CADASTRO' | 'EDICAO' | 'EXCLUSAO'
  usuarioNome: string;
  detalhes: string;
  data: string;
}

type PropsModalDetalhesNorma = {
  norma: Norma;
  pecasRelacionadas?: Peca[];
  onClose: () => void;
  onEdit?: (normaSelecionada: Norma) => void;
  onDelete?: (id: string) => void;
  onViewPdf: (url: string, nome: string) => void;
  onViewImages: (imagens: string[], indice: number) => void;
};

// ==== AQUI: onEdit e onDelete se tornaram OPCIONAIS (?) ====
export default function ModalDetalhesNorma({
  norma,
  pecasRelacionadas,
  onClose,
  onEdit,
  onDelete,
  onViewPdf,
  onViewImages
}: PropsModalDetalhesNorma) {
  const [historico, setHistorico] = useState<LogHistorico[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    async function fetchHistorico() {
      setCarregandoHistorico(true);
      try {
        const response = await fetch(`http://localhost:3001/historico/${norma.id}`);
        if (response.ok) {
          const data = await response.json();
          setHistorico(data);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setCarregandoHistorico(false);
      }
    }
    fetchHistorico();
  }, [norma.id]);

  return (
    <div className="modal-overlay modal-overlay-nested" onClick={onClose}>
      <div className="modal modal-large" onClick={(evento) => evento.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-magnifying-glass-chart"></i> Detalhes da Norma</h2>
          <div className="modal-header-actions">
            {/* O Botão de Editar só aparece se onEdit for passado! */}
            {onEdit && (
              <button
                className="btn btn-warning btn-icon"
                onClick={() => onEdit(norma)}
                title="Editar"
              >
                <i className="fas fa-pen"></i>
              </button>
            )}
            {/* O Botão de Excluir só aparece se onDelete for passado! */}
            {onDelete && (
              <button
                className="btn btn-danger btn-icon"
                onClick={() => onDelete(norma.id)}
                title="Excluir"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
            <button type="button" className="btn-close" onClick={onClose} title="Fechar">
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        </div>
        <div className="view-details">
          <div className="view-grid">
            <div className="view-item"><span className="view-label"><i className="fas fa-id-card"></i> ID</span><span className="view-value">{norma.id}</span></div>
            <div className="view-item"><span className="view-label"><i className="fas fa-hashtag"></i> Código</span><span className="view-value">{norma.codigo || "—"}</span></div>
          </div>
          <div className="view-item"><span className="view-label"><i className="fas fa-heading"></i> Título</span><span className="view-value">{norma.titulo}</span></div>

          <div className="view-grid">
            <div className="view-item">
              <span className="view-label"><i className="fas fa-building"></i> Órgão</span>
              <span className="view-value view-badges">
                <span className={`badge theme-org-${norma.organizacao.toLowerCase()}`}>
                  <span className="badge-origin large">{ORG_ORIGENS[norma.organizacao] || "🌐"}</span>{norma.organizacao}
                </span>
              </span>
            </div>
            <div className="view-item">
              <span className="view-label"><i className="fas fa-globe"></i> Tipo</span>
              <span className="view-value view-badges">
                <span className={`badge ${norma.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}>
                  <i className={`fas ${norma.tipo === "Pública" ? "fa-globe" : "fa-lock"} badge-icon`}></i>{norma.tipo || "Pública"}
                </span>
              </span>
            </div>
            <div className="view-item"><span className="view-label"><i className="fas fa-code-branch"></i> Revisão</span><span className="view-value">{norma.revisao || "—"}</span></div>
            <div className="view-item">
              <span className="view-label"><i className="fas fa-circle-dot"></i> Status</span>
              <span className="view-value view-badges">
                <span className={`badge ${norma.status.toLowerCase()}`}>
                  <i className={`fas ${norma.status === "Vigente" ? "fa-check-circle" : "fa-times-circle"} badge-icon`}></i>{norma.status}
                </span>
              </span>
            </div>
            <div className="view-item">
              <span className="view-label"><i className="fas fa-tags"></i> Categoria</span>
              <span className="view-value view-badges">
                <span className={`badge theme-cat-${norma.categoria.toLowerCase()}`}>
                  <i className={`fas ${CAT_ICONES[norma.categoria] || 'fa-tag'} badge-icon`}></i>{norma.categoria}
                </span>
              </span>
            </div>
            <div className="view-item"><span className="view-label"><i className="fas fa-layer-group"></i> Subcategoria</span><span className="view-value">{norma.subcategoria || "—"}</span></div>
            <div className="view-item"><span className="view-label"><i className="fas fa-cube"></i> Item</span><span className="view-value">{norma.item || "—"}</span></div>
            {norma.criadoPor && (
              <div className="view-item">
                <span className="view-label"><i className="fas fa-user-pen"></i> Criador</span>
                <span className="view-value">{norma.criadoPor}</span>
              </div>
            )}
          </div>

          <div className="view-item">
            <span className="view-label">
              <i className="fas fa-cubes"></i> Peças relacionadas
            </span>
            {pecasRelacionadas && pecasRelacionadas.length > 0 ? (
              <div className="pecas-relacionadas-lista">
                {pecasRelacionadas.map((pecaRelacionada, indicePeca) => (
                  <div
                    key={`${pecaRelacionada.nome}-${pecaRelacionada.categoria}-${pecaRelacionada.subcategoria}-${indicePeca}`}
                    className="peca-relacionada-card"
                  >
                    <span className="peca-relacionada-nome">{pecaRelacionada.nome}</span>
                    <div className="peca-relacionada-badges">
                      <span className="badge theme-subcategoria">{pecaRelacionada.categoria}</span>
                      <span className="badge theme-subcategoria badge-secundario">{pecaRelacionada.subcategoria}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <i className="fas fa-cube"></i>
                <p>Nenhuma peça relacionada.</p>
              </div>
            )}
          </div>

          <hr className="divider" />

          {safeParseArray(norma.palavrasChave).length > 0 && (
            <div className="view-item">
              <span className="view-label"><i className="fas fa-key"></i> Palavras-chave</span>
              <div className="view-badges">
                {safeParseArray(norma.palavrasChave).map((palavra, i) => (
                  <span key={i} className="badge theme-subcategoria">{palavra}</span>
                ))}
              </div>
            </div>
          )}

          {safeParseArray(norma.notas).length > 0 && (
            <div className="view-item"><span className="view-label"><i className="fas fa-pen-to-square"></i> Notas Técnicas</span><ul className="view-list">{safeParseArray(norma.notas).map((nota, i) => (<li key={i}><i className="fas fa-caret-right view-list-icon"></i> {nota}</li>))}</ul></div>
          )}

          {safeParseArray(norma.referencias).length > 0 && (
            <div className="view-item"><span className="view-label"><i className="fas fa-link"></i> Referências</span><ul className="view-list">{safeParseArray(norma.referencias).map((ref, i) => (<li key={i}><i className="fas fa-caret-right view-list-icon"></i> {ref}</li>))}</ul></div>
          )}

          {(norma.urlPdf || (safeParseArray(norma.imagens).length > 0)) && (
            <>
              <hr className="divider" />
              <div className="view-item">
                <span className="view-label"><i className="fas fa-paperclip"></i> Anexos</span>
                {norma.urlPdf && (
                  <button type="button" className="attachment-pdf attachment-link btn-pdf-view" onClick={() => onViewPdf(norma.urlPdf!, norma.nomePdf || `${norma.id.replace(" ", "_")}.pdf`)}>
                    <i className="fas fa-file-pdf icon-pdf-red"></i><span className="attachment-pdf-name">{norma.nomePdf || `${norma.id.replace(" ", "_")}.pdf`}</span>
                  </button>
                )}

                {safeParseArray(norma.imagens).length > 0 && (
                  <div className="attachment-image-grid" style={{ marginTop: '10px' }}>
                    {safeParseArray(norma.imagens).map((urlImg, idxImg) => (
                      <div key={idxImg} className="attachment-image-item" onClick={() => onViewImages(safeParseArray(norma.imagens)!, idxImg)}>
                        <img src={urlImg} alt={`Anexo ${idxImg + 1}`} />
                        <div className="image-hover-overlay"><i className="fas fa-magnifying-glass-plus"></i></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {safeParseArray(norma.notas).length === 0 &&
            safeParseArray(norma.referencias).length === 0 &&
            safeParseArray(norma.palavrasChave).length === 0 &&
            !norma.urlPdf && safeParseArray(norma.imagens).length === 0 && (
              <div className="empty-state compact">
                <i className="fas fa-folder-open"></i>
                <p>Nenhuma nota ou anexo.</p>
              </div>
            )}

          <hr className="divider" />
          <div className="view-item">
            <span className="view-label">
              <i className="fas fa-history"></i> Histórico de Alterações (Auditoria)
            </span>
            {carregandoHistorico ? (
              <div style={{ color: "var(--c-text-muted)", fontSize: "0.9rem" }}>Carregando histórico...</div>
            ) : historico.length > 0 ? (
              <div className="timeline-container" style={{ marginTop: "10px", padding: "10px 0" }}>
                {historico.map((log) => (
                  <div key={log.id} style={{ display: "flex", gap: "10px", marginBottom: "12px", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span className={`badge ${log.tipoAlteracao === 'CADASTRO' ? 'vigente' : log.tipoAlteracao === 'EDICAO' ? 'theme-subcategoria' : 'revogada'}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                        {log.tipoAlteracao}
                      </span>
                      <div style={{ width: "2px", flex: 1, backgroundColor: "var(--c-border)", marginTop: "4px" }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--c-text-1)" }}>
                        {log.usuarioNome} <span style={{ fontWeight: 400, color: "var(--c-text-muted)", float: "right", fontSize: "0.75rem" }}>
                          {new Date(log.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div style={{ color: "var(--c-text-2)", marginTop: "3px", lineHeight: "1.3" }}>
                        {log.detalhes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state compact" style={{ border: "none", background: "none", padding: 0 }}>
                <i className="fas fa-history"></i>
                <p>Nenhuma alteração registrada para esta norma.</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}><i className="fas fa-arrow-left"></i> Voltar</button>
        </div>
      </div>
    </div>
  );
}
