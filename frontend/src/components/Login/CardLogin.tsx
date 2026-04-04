import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoEntrada from './CamposDeTexto';
import Botao from './BotaoEntrar';
import { salvarSessao } from '../../auth/session';
import { CREDENCIAIS_MOCK, USUARIO_MOCK } from './Mocks';

function CartaoLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (usuario === CREDENCIAIS_MOCK.email && senha === CREDENCIAIS_MOCK.senha) {
      salvarSessao(USUARIO_MOCK);
      navigate('/dashboard');
    } else {
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="cartao-login">
      <h1 className="titulo-cartao-login">ACESSO AO SISTEMA</h1>
      
      <form className="formulario-login" onSubmit={aoEnviar}>
        {erro && <div className="erro-login"><i className="fa-solid fa-circle-exclamation"></i> {erro}</div>}
        
        <CampoEntrada
          rotulo="LOGIN"
          tipo="email"
          placeholder="usuario@janosys.com.br"
          valor={usuario}
          aoAlterar={setUsuario}
          tamanhoMaximo={100}
          erro={!!erro}
          icone="fa-solid fa-envelope"
        />
        
        <CampoEntrada
          rotulo="SENHA"
          tipo="password"
          placeholder="**********"
          valor={senha}
          aoAlterar={setSenha}
          tamanhoMaximo={50}
          erro={!!erro}
          icone="fa-solid fa-lock"
        />
        
        <a href="#" className="link-esqueci-senha">Esqueci minha senha</a>
        
        <div className="container-botao">
          <Botao texto="ENTRAR" tipo="submit" />
        </div>
        
        <p className="acesso-restrito"><i className="fa-solid fa-shield-halved"></i> Acesso restrito a pessoas autorizadas.</p>
      </form>
    </div>
  );
}

export default CartaoLogin;