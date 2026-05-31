interface PropriedadesCamposDeTexto {
  rotulo: string;
  tipo: string;
  placeholder: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  tamanhoMaximo?: number;
  erro?: boolean;
  icone?: string; // Nova prop para a classe do ícone FontAwesome
}

function CamposDeTexto({ 
  rotulo, 
  tipo, 
  placeholder, 
  valor, 
  aoAlterar, 
  tamanhoMaximo = 100, 
  erro = false,
  icone
}: PropriedadesCamposDeTexto) {
  return (
    <div className="container-campo">
      <label className="rotulo-campo">{rotulo}</label>
      <div className="container-input-icone">
        {icone && <i className={`icone-campo ${icone}`}></i>}
        <input
          type={tipo}
          className={`campo-entrada ${erro ? 'campo-erro' : ''} ${icone ? 'com-icone' : ''}`}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => aoAlterar(e.target.value)}
          maxLength={tamanhoMaximo}
        />
      </div>
    </div>
  );
}

export default CamposDeTexto;