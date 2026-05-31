import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  CATEGORIAS,
  ITENS_POR_SUBCATEGORIA,
  ORGANIZACOES,
  ORG_ORIGENS,
  SUBCATEGORIAS,
  type Norma,
} from "./NormasViewModel";
import { safeParseArray } from "../../utils/NormasUtils";

type PropsFormularioNorma = {
  visivel: boolean;
  idEmEdicao: string | null;
  etapaModal: number;
  setEtapaModal: Dispatch<SetStateAction<number>>;
  erroCampos: Partial<Record<keyof Norma, string>>;
  form: Partial<Norma>;
  updateForm: (campoParaAtualizar: keyof Norma, valorNovo: unknown) => void;
  arquivoPdf: File | null;
  setArquivoPdf: Dispatch<SetStateAction<File | null>>;
  arquivosImagens: File[];
  setArquivosImagens: Dispatch<SetStateAction<File[]>>;
  onFechar: () => void;
  onProximoPasso: () => void;
  onSalvar: () => void;
  handlePdfChange: (eventoMudanca: ChangeEvent<HTMLInputElement>) => void;
  handleImgChange: (eventoMudanca: ChangeEvent<HTMLInputElement>) => void;
};

export default function FormularioNorma({
  visivel,
  idEmEdicao,
  etapaModal,
  setEtapaModal,
  erroCampos,
  form,
  updateForm,
  arquivoPdf,
  setArquivoPdf,
  arquivosImagens,
  setArquivosImagens,
  onFechar,
  onProximoPasso,
  onSalvar,
  handlePdfChange,
  handleImgChange,
}: PropsFormularioNorma) {
  if (!visivel) return null;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div
        className="modal modal-large"
        onClick={(eventoClique) => eventoClique.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <i className="fas fa-file-circle-plus"></i>{" "}
            {idEmEdicao ? "Editar Norma" : "Registar Nova Norma"}
          </h2>
          <button
            type="button"
            className="btn-close"
            onClick={onFechar}
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="stepper-container">
          {[
            { label: "Identificação", step: 1 },
            { label: "Classificação", step: 2 },
            { label: "Anexos", step: 3 },
          ].map(({ label, step }) => (
            <div
              key={step}
              className={`stepper-step ${etapaModal >= step ? "active" : ""} ${etapaModal > step ? "completed" : ""}`}
            >
              <span className="stepper-number">
                {etapaModal > step ? (
                  <i className="fas fa-check"></i>
                ) : (
                  step
                )}
              </span>
              {label}
            </div>
          ))}
        </div>

        <form
          onSubmit={(eventoSubmissao) => {
            eventoSubmissao.preventDefault();
            if (etapaModal < 3) {
              onProximoPasso();
            } else {
              onSalvar();
            }
          }}
        >
          {etapaModal === 1 && (
            <div className="form-grid">
              <div
                className={`form-group ${erroCampos.id ? "has-error" : ""}`}
              >
                <label className="form-label">
                  <i className="fas fa-id-card"></i> Identificador{" "}
                  <span className="campo-obrigatorio">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.id}
                  disabled={!!idEmEdicao}
                  onChange={(eventoMudanca) =>
                    updateForm("id", eventoMudanca.target.value)
                  }
                  placeholder="Ex: RBAC 25.1309"
                />
                {erroCampos.id && (
                  <span className="form-erro">
                    <i className="fas fa-circle-exclamation"></i>{" "}
                    {erroCampos.id}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-hashtag"></i> Código
                </label>
                <input
                  className="form-input"
                  value={form.codigo}
                  onChange={(eventoMudanca) =>
                    updateForm("codigo", eventoMudanca.target.value)
                  }
                  placeholder="Ex: 25.1309"
                />
              </div>

              <div
                className={`form-group full-width ${erroCampos.titulo ? "has-error" : ""}`}
              >
                <label className="form-label">
                  <i className="fas fa-heading"></i> Título{" "}
                  <span className="campo-obrigatorio">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.titulo}
                  onChange={(eventoMudanca) =>
                    updateForm("titulo", eventoMudanca.target.value)
                  }
                  placeholder="Nome completo"
                />
                {erroCampos.titulo && (
                  <span className="form-erro">
                    <i className="fas fa-circle-exclamation"></i>{" "}
                    {erroCampos.titulo}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-building"></i> Órgão
                </label>
                <select
                  className="form-select"
                  value={form.organizacao}
                  onChange={(eventoMudanca) =>
                    updateForm("organizacao", eventoMudanca.target.value)
                  }
                >
                  {ORGANIZACOES.map((nomeOrganizacaoAtual) => (
                    <option key={nomeOrganizacaoAtual} value={nomeOrganizacaoAtual}>
                      {ORG_ORIGENS[nomeOrganizacaoAtual]} {nomeOrganizacaoAtual}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-code-branch"></i> Revisão
                </label>
                <input
                  className="form-input"
                  value={form.revisao}
                  onChange={(eventoMudanca) =>
                    updateForm("revisao", eventoMudanca.target.value)
                  }
                  placeholder="Ex: Rev. A"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-tags"></i> Categoria
                </label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(eventoMudanca) => {
                    const novaCategoria = eventoMudanca.target.value;
                    updateForm("categoria", novaCategoria);

                    const subcategoriasDaCategoria =
                      SUBCATEGORIAS[novaCategoria] || [];
                    const novaSubcategoria =
                      subcategoriasDaCategoria.length > 0
                        ? subcategoriasDaCategoria[0]
                        : "";
                    updateForm("subcategoria", novaSubcategoria);

                    updateForm("item", "");
                  }}
                >
                  {CATEGORIAS.map((nomeCategoriaAtual) => (
                    <option key={nomeCategoriaAtual} value={nomeCategoriaAtual}>
                      {nomeCategoriaAtual}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-layer-group"></i> Subcategoria
                </label>
                <select
                  className="form-select"
                  value={form.subcategoria}
                  onChange={(eventoMudanca) => {
                    const novaSubcategoria = eventoMudanca.target.value;
                    updateForm("subcategoria", novaSubcategoria);
                    updateForm("item", "");
                  }}
                >
                  {(SUBCATEGORIAS[form.categoria ?? ""] ?? []).map(
                    (nomeSubcategoriaAtual) => (
                      <option key={nomeSubcategoriaAtual} value={nomeSubcategoriaAtual}>
                        {nomeSubcategoriaAtual}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-cube"></i> Item
                </label>
                <select
                  className="form-select"
                  value={form.item}
                  onChange={(eventoMudanca) =>
                    updateForm("item", eventoMudanca.target.value)
                  }
                  disabled={
                    !form.subcategoria ||
                    !(
                      ITENS_POR_SUBCATEGORIA[form.subcategoria]?.length >
                      0
                    )
                  }
                >
                  <option value="" disabled hidden>
                    {form.subcategoria &&
                      ITENS_POR_SUBCATEGORIA[form.subcategoria]?.length > 0
                      ? "Selecione um item"
                      : "Sem itens aplicáveis"}
                  </option>
                  {(
                    ITENS_POR_SUBCATEGORIA[form.subcategoria ?? ""] ?? []
                  ).map((nomeItemAtual) => (
                    <option key={nomeItemAtual} value={nomeItemAtual}>
                      {nomeItemAtual}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {etapaModal === 2 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-circle-dot"></i> Status
                  </label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(eventoMudanca) =>
                      updateForm("status", eventoMudanca.target.value)
                    }
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Revogada">Revogada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-globe"></i> Tipo
                  </label>
                  <select
                    className="form-select"
                    value={form.tipo}
                    onChange={(eventoMudanca) =>
                      updateForm("tipo", eventoMudanca.target.value)
                    }
                  >
                    <option value="Pública">Pública</option>
                    <option value="Privada">Privada</option>
                  </select>
                </div>
              </div>

              <hr className="divider" />

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-key"></i> Palavras-chave
                </label>
                <div className="dynamic-list">
                  {safeParseArray(form.palavrasChave).map(
                    (palavraAtual, indicePalavraAtual) => (
                      <div key={indicePalavraAtual} className="dynamic-row">
                        <input
                          className="form-input"
                          value={palavraAtual}
                          onChange={(eventoMudanca) => {
                            const novasPalavras = [
                              ...safeParseArray(form.palavrasChave),
                            ];
                            novasPalavras[indicePalavraAtual] =
                              eventoMudanca.target.value;
                            updateForm("palavrasChave", novasPalavras);
                          }}
                          placeholder="Palavra-chave..."
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-icon"
                          onClick={() =>
                            updateForm(
                              "palavrasChave",
                              safeParseArray(form.palavrasChave).filter(
                                (_palavraIgnorada, indiceAtualCopia) =>
                                  indiceAtualCopia !== indicePalavraAtual,
                              ),
                            )
                          }
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ),
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-add-more"
                    onClick={() =>
                      updateForm("palavrasChave", [
                        ...safeParseArray(form.palavrasChave),
                        "",
                      ])
                    }
                  >
                    <i className="fas fa-plus"></i> Nova palavra-chave
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-pen-to-square"></i> Notas Técnicas
                </label>
                <div className="dynamic-list">
                  {safeParseArray(form.notas).map((notaAtual, indiceNotaAtual) => (
                    <div key={indiceNotaAtual} className="dynamic-row">
                      <input
                        className="form-input"
                        value={notaAtual}
                        onChange={(eventoMudanca) => {
                          const novasNotas = [...safeParseArray(form.notas)];
                          novasNotas[indiceNotaAtual] = eventoMudanca.target.value;
                          updateForm("notas", novasNotas);
                        }}
                        placeholder="Nota..."
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() =>
                          updateForm(
                            "notas",
                            safeParseArray(form.notas).filter(
                              (_notaIgnorada, indiceAtualCopia) =>
                                indiceAtualCopia !== indiceNotaAtual,
                            ),
                          )
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-add-more"
                    onClick={() =>
                      updateForm("notas", [...safeParseArray(form.notas), ""])
                    }
                  >
                    <i className="fas fa-plus"></i> Nova nota
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-link"></i> Referências
                </label>
                <div className="dynamic-list">
                  {safeParseArray(form.referencias).map(
                    (referenciaAtual, indiceReferenciaAtual) => (
                      <div key={indiceReferenciaAtual} className="dynamic-row">
                        <input
                          className="form-input"
                          value={referenciaAtual}
                          onChange={(eventoMudanca) => {
                            const novasReferencias = [
                              ...safeParseArray(form.referencias),
                            ];
                            novasReferencias[indiceReferenciaAtual] =
                              eventoMudanca.target.value;
                            updateForm("referencias", novasReferencias);
                          }}
                          placeholder="Referência..."
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-icon"
                          onClick={() =>
                            updateForm(
                              "referencias",
                              safeParseArray(form.referencias).filter(
                                (_referenciaIgnorada, indiceAtualCopia) =>
                                  indiceAtualCopia !== indiceReferenciaAtual,
                              ),
                            )
                          }
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ),
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-add-more"
                    onClick={() =>
                      updateForm("referencias", [
                        ...safeParseArray(form.referencias),
                        "",
                      ])
                    }
                  >
                    <i className="fas fa-plus"></i> Nova referência
                  </button>
                </div>
              </div>
            </>
          )}

          {etapaModal === 3 && (
            <div className="form-grid">
              <div className="file-upload-group">
                <label className="form-label">
                  <i className="fas fa-file-pdf"></i> Arquivo PDF
                </label>
                {form.urlPdf && !arquivoPdf ? (
                  <div className="attachment-pdf">
                    <i className="fas fa-file-pdf"></i>
                    <span className="attachment-pdf-name">{form.nomePdf}</span>
                    <button type="button" className="btn-remove-file" onClick={() => { updateForm("urlPdf", undefined); updateForm("nomePdf", undefined); }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ) : (
                  <label
                    className={`file-upload-zone ${arquivoPdf ? "has-file" : ""}`}
                  >
                    <div className="file-icon">
                      <i
                        className={`fas ${arquivoPdf ? "fa-check" : "fa-upload"}`}
                      ></i>
                    </div>
                    <div className="file-info">
                      <span className="file-name">
                        {arquivoPdf
                          ? arquivoPdf.name
                          : "Anexar arquivo PDF"}
                      </span>
                      <span className="file-hint">Máximo 3MB (.pdf)</span>
                    </div>
                    {arquivoPdf && (
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={(eventoClique) => {
                          eventoClique.preventDefault();
                          setArquivoPdf(null);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden-input"
                      onChange={handlePdfChange}
                    />
                  </label>
                )}
              </div>

              <div className="file-upload-group">
                <label className="form-label">
                  <i className="fas fa-images"></i> Imagens
                </label>
                <label className="file-upload-zone">
                  <div className="file-icon">
                    <i className="fas fa-image"></i>
                  </div>
                  <div className="file-info">
                    <span className="file-name">Adicionar imagens</span>
                    <span className="file-hint">JPG, PNG, WebP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden-input"
                    onChange={handleImgChange}
                  />
                </label>

                {safeParseArray(form.imagens).length > 0 && (
                  <div className="image-preview-list">
                    {safeParseArray(form.imagens).map((urlImagemExistente, indiceImagemExistente) => (
                      <div key={`existente-${indiceImagemExistente}`} className="image-preview-item">
                        <img src={urlImagemExistente} alt="Preview" />
                        <button type="button" className="btn-remove-preview" onClick={() => {
                          const novasImagensFormulario = [...safeParseArray(form.imagens)];
                          novasImagensFormulario.splice(indiceImagemExistente, 1);
                          updateForm("imagens", novasImagensFormulario);
                        }}>
                          <i className="fas fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {arquivosImagens.length > 0 && (
                  <div className="image-preview-list">
                    {arquivosImagens.map(
                      (arquivoImagemNovo, indiceImagemNovo) => (
                        <div
                          key={`nova-${indiceImagemNovo}`}
                          className="image-preview-item"
                        >
                          <img
                            src={URL.createObjectURL(arquivoImagemNovo)}
                            alt="Preview"
                          />
                          <button
                            type="button"
                            className="btn-remove-preview"
                            onClick={() =>
                              setArquivosImagens((imagensAnteriores) =>
                                imagensAnteriores.filter(
                                  (_imagemIgnorada, indiceAtualParaFiltro) =>
                                    indiceAtualParaFiltro !== indiceImagemNovo,
                                ),
                              )
                            }
                          >
                            <i className="fas fa-xmark"></i>
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <div>
              {etapaModal > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setEtapaModal((etapaAnterior) => etapaAnterior - 1)
                  }
                >
                  Voltar
                </button>
              )}
            </div>
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onFechar}
              >
                Cancelar
              </button>
              {etapaModal < 3 ? (
                <button type="submit" className="btn btn-primary">
                  Avançar{" "}
                  <i className="fas fa-arrow-right icon-right"></i>
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check"></i> Salvar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
