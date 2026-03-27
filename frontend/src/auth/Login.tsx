/**
 * Login — implementação a cargo do Vini dev.
 *
 * Contrato com o restante do projeto (para integrar sem quebrar):
 * - Esta tela é montada na rota `/login` (ver App.tsx).
 * - Após autenticação com sucesso (API futura): gravar sessão com `salvarSessao` em `./session`
 *   e redirecionar, por exemplo, para `/dashboard` (ex.: `useNavigate` do react-router-dom).
 *
 * Enquanto estiver em branco: as rotas internas continuam exigindo sessão; sem login real,
 * use `salvarSessao` no console ou peça ao responsável pela tela para um fluxo temporário de teste.
 */
function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>Tela em construção.</p>
    </div>
  )
}

export default Login
