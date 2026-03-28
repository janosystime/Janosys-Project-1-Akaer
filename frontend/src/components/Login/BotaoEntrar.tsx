interface PropriedadesBotao {
  texto: string;
  aoClicar?: () => void;
  tipo?: 'button' | 'submit';
}

function Botao({ texto, aoClicar, tipo = 'button' }: PropriedadesBotao) {
  return (
    <button type={tipo} className="botao-login" onClick={aoClicar}>
      {texto}
    </button>
  );
}

export default Botao;
