import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoEntrada from './CamposDeTexto';
import Botao from './BotaoEntrar';
import { salvarSessao } from '../../auth/session';
import { USUARIOS_MOCK } from './Mocks';

function CartaoLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

const aoEnviar = (e: React.FormEvent) => {
  e.preventDefault();
  setErro('');

  const encontrado = USUARIOS_MOCK.find(
    (u) => u.email === usuario && u.senha === senha
  );

  if (encontrado) {
    salvarSessao({ nome: encontrado.nome, perfil: encontrado.perfil });
    navigate('/home');
  } else {
    setErro('Login ou senha inválidos.');
  }
};


  return (
    <div className="cartao-login">
      <h1 className="titulo-cartao-login">ACESSO AO SISTEMA</h1>
      
      <form className="formulario-login" onSubmit={aoEnviar}>
        {erro && <div className="erro-login"><i className="fa-solid fa-circle-exclamation"></i> {erro}</div>}
        
        <CampoEntrada
          rotulo="LOGIN"
          tipo="text"
          placeholder="admin, checker ou usuario"
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