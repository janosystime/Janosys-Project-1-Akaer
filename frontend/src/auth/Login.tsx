import CartaoLogin from '../components/Login/CardLogin';
import Logotipo from '../components/Login/Logotipo';
import Rodape from '../components/Login/Rodape';

import imgBlindado from '../assets/blindado.png';
import imgAviao1   from '../assets/aviao1.png';
import imgAviao2   from '../assets/aviao2.png';
import imgCamera   from '../assets/camera.png';

function PaginaLogin() {
  return (
    <div className="pagina-login">

      <div className="fundo-colagem" aria-hidden="true">

        <img src={imgAviao1}   alt="" className="fundo-img fundo-tr" />
        <img src={imgCamera}   alt="" className="fundo-img fundo-br" />
        <img src={imgBlindado} alt="" className="fundo-img fundo-tl" />
        <img src={imgAviao2}   alt="" className="fundo-img fundo-bl" />
      </div>

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