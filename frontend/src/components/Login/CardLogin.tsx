import { useState } from 'react';
import CampoEntrada from './CamposDeTexto';
import Botao from './BotaoEntrar';

function CartaoLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="cartao-login">
      <h1 className="titulo-cartao-login">ACESSO AO SISTEMA</h1>
      
      <form className="formulario-login" onSubmit={aoEnviar}>
        <CampoEntrada
          rotulo="LOGIN"
          tipo="email"
          placeholder="usuario@akaer.com.br"
          valor={usuario}
          aoAlterar={setUsuario}
          tamanhoMaximo={100}
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
