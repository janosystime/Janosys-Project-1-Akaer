import logoJanoSigna from '../../assets/JanoSys.signa.nome.png';

function Logotipo() {
  return (
    <div className="container-logotipo">
      <img src={logoJanoSigna} alt="Jano Signa" className="logo-jano-signa" />
    </div>
  );
}

export default Logotipo;

