interface PropriedadesCamposDeTexto {
  rotulo: string;
  tipo: string;
  placeholder: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  tamanhoMaximo?: number;
  erro?: boolean;
}

function CamposDeTexto({ rotulo, tipo, placeholder, valor, aoAlterar, tamanhoMaximo = 100, erro = false }: PropriedadesCamposDeTexto) {
  return (
    <div className="container-campo">
      <label className="rotulo-campo">{rotulo}</label>
      <input
        type={tipo}
        className={`campo-entrada ${erro ? 'campo-erro' : ''}`}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        maxLength={tamanhoMaximo}
      />
    </div>
  );
}

export default CamposDeTexto;
