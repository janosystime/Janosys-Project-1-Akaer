import { CartaoLogin, Logotipo, Rodape } from '../components/Login';

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
