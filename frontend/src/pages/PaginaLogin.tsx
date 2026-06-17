import CartaoLogin from '../components/Login/CardLogin';
import Logotipo from '../components/Login/Logotipo';
import Rodape from '../components/Login/Rodape';

function PaginaLogin() {
  return (
    <div className="pagina-login">
      <div className="container-logotipo-wrapper">
        <Logotipo />
      </div>
      <main className="conteudo-login">
        <CartaoLogin />
      </main>
      <Rodape />
    </div>
  );
}

export default PaginaLogin;
