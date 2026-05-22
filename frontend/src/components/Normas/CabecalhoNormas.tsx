type PropsCabecalhoNormas = {
  podeEditar: boolean;
  onNovaNorma: () => void;
};

export default function CabecalhoNormas({
  podeEditar,
  onNovaNorma,
}: PropsCabecalhoNormas) {
  return (
    <div className="page-header">
      <h1 className="page-title">
        <i className="fas fa-book-open"></i> Biblioteca de Normas
      </h1>
      {podeEditar && (
        <button className="btn btn-primary" onClick={onNovaNorma}>
          <i className="fas fa-circle-plus"></i> Nova Norma
        </button>
      )}
    </div>
  );
}
