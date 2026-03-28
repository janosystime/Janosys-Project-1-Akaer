import logoAkaer from '../../assets/akaer30.png';

function Logotipo() {
  return (
    <div className="container-logotipo">
      <div className="cabecalho-logotipo">
        <img src={logoAkaer} alt="Akaer" className="logo-akaer" />
        <div className="emblema-signa">SIGNA</div>
      </div>
      <p className="subtitulo-logotipo">Sistema Integrado de Gestão de Normativas Aeronáuticas</p>
    </div>
  );
}

export default Logotipo;
