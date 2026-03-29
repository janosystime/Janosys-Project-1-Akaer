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
        {erro && <p className="erro-login">{erro}</p>}
        <CampoEntrada
          rotulo="LOGIN"
          tipo="email"
          placeholder="usuario@akaer.com.br"
          valor={usuario}
          aoAlterar={setUsuario}
          tamanhoMaximo={100}
          erro={!!erro}
        />
        
        <CampoEntrada
          rotulo="SENHA"
          tipo="password"
          placeholder="**********"
          valor={senha}
          aoAlterar={setSenha}
          tamanhoMaximo={50}
        />
        
        <a href="#" className="link-esqueci-senha">Esqueci minha senha.</a>
        
        <div className="container-botao">
          <Botao texto="ENTRAR" tipo="submit" />
        </div>
        
        <p className="acesso-restrito">Acesso restrito a colaboradores AKAER</p>
      </form>
    </div>
  );
}

export default CartaoLogin;
