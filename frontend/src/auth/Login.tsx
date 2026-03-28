/**
 * Login — página de login do sistema SIGNA.
 *
 * Contrato com o restante do projeto (para integrar sem quebrar):
 * - Esta tela é montada na rota `/login` (ver App.tsx).
 * - Após autenticação com sucesso (API futura): gravar sessão com `salvarSessao` em `./session`
 *   e redirecionar, por exemplo, para `/dashboard` (ex.: `useNavigate` do react-router-dom).
 */
import { CartaoLogin, Logotipo, Rodape } from '../components/Login';

function Login() {
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

export default Login
