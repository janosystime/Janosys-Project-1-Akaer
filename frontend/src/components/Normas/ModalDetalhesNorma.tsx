import type { Peca } from "../../utils/pecas";
import type { Norma } from "./NormasViewModel";
import { CAT_ICONES, ORG_ORIGENS } from "./NormasViewModel";

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

          {norma.palavrasChave && norma.palavrasChave.length > 0 && (
            <div className="view-item">
              <span className="view-label"><i className="fas fa-key"></i> Palavras-chave</span>
              <div className="view-badges">
                {norma.palavrasChave.map((palavra, i) => (
                  <span key={i} className="badge theme-subcategoria">{palavra}</span>
                ))}
              </div>
            </div>
          )}

          {norma.notas && norma.notas.length > 0 && (
            <div className="view-item"><span className="view-label"><i className="fas fa-pen-to-square"></i> Notas Técnicas</span><ul className="view-list">{norma.notas.map((nota, i) => (<li key={i}><i className="fas fa-caret-right view-list-icon"></i> {nota}</li>))}</ul></div>
          )}

          {norma.referencias && norma.referencias.length > 0 && (
            <div className="view-item"><span className="view-label"><i className="fas fa-link"></i> Referências</span><ul className="view-list">{norma.referencias.map((ref, i) => (<li key={i}><i className="fas fa-caret-right view-list-icon"></i> {ref}</li>))}</ul></div>
          )}

          {(norma.urlPdf || (norma.imagens && norma.imagens.length > 0)) && (
            <>
              <hr className="divider" />
              <div className="view-item">
                <span className="view-label"><i className="fas fa-paperclip"></i> Anexos</span>
                {norma.urlPdf && (
                  <button type="button" className="attachment-pdf attachment-link btn-pdf-view" onClick={() => onViewPdf(norma.urlPdf!, norma.nomePdf || `${norma.id.replace(" ", "_")}.pdf`)}>
                    <i className="fas fa-file-pdf icon-pdf-red"></i><span className="attachment-pdf-name">{norma.nomePdf || `${norma.id.replace(" ", "_")}.pdf`}</span>
                  </button>
                )}

                {norma.imagens && norma.imagens.length > 0 && (
                  <div className="attachment-image-grid" style={{ marginTop: '10px' }}>
                    {norma.imagens.map((urlImg, idxImg) => (
                      <div key={idxImg} className="attachment-image-item" onClick={() => onViewImages(norma.imagens!, idxImg)}>
                        <img src={urlImg} alt={`Anexo ${idxImg + 1}`} />
                        <div className="image-hover-overlay"><i className="fas fa-magnifying-glass-plus"></i></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {(!norma.notas || norma.notas.length === 0) &&
            (!norma.referencias || norma.referencias.length === 0) &&
            (!norma.palavrasChave || norma.palavrasChave.length === 0) &&
            !norma.urlPdf && (!norma.imagens || norma.imagens.length === 0) && (
              <div className="empty-state compact">
                <i className="fas fa-folder-open"></i>
                <p>Nenhuma nota ou anexo.</p>
              </div>
            )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}><i className="fas fa-arrow-left"></i> Voltar</button>
        </div>
      </div>
    </div>
  );
}
