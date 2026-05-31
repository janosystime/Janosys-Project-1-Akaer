import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoEntrada from './CamposDeTexto';
import Botao from './BotaoEntrar';
import { salvarSessao } from '../../auth/session';

function CartaoLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

const aoEnviar = async (e: React.FormEvent) => {
  e.preventDefault();
  setErro('');

  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login: usuario, senha }),
    });

    if (response.ok) {
      const dados = await response.json();
      salvarSessao({ nome: dados.nome, perfil: dados.perfil });
      navigate('/home');
    } else {
      const erroDados = await response.json();
      setErro(erroDados.error || 'Login ou senha inválidos.');
    }
  } catch (err) {
    console.error('Erro de conexão:', err);
    setErro('Não foi possível conectar ao servidor.');
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