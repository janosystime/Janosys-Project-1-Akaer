import logoJanosys from '../../assets/janosys.png';

function Rodape() {
  return (
    <footer className="rodape-login">
      <span className="texto-rodape">Desenvolvido por</span>
      <img src={logoJanosys} alt="Janosys" className="logo-janosys" />
    </footer>
  );
}

export default Rodape;
