import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoEntrada from './CamposDeTexto';
import Botao from './BotaoEntrar';
import { salvarSessao } from '../../auth/session';
import { USUARIOS_MOCK } from './Mocks';
import ModalCredenciais from './ModalCredenciais';

function CartaoLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarCredenciais, setMostrarCredenciais] = useState(false);
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mostrarCredenciais) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMostrarCredenciais(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mostrarCredenciais]);

  const aoEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const encontrado = USUARIOS_MOCK.find(u => u.email === usuario && u.senha === senha);
    if (encontrado) {
      salvarSessao({ nome: encontrado.nome, perfil: encontrado.perfil });
      navigate('/home');
    } else {
      setErro('Login ou senha inválidos.');
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <div className="cartao-login">
        <h1 className="titulo-cartao-login">ACESSO AO SISTEMA</h1>
        <form className="formulario-login" onSubmit={aoEnviar}>
          <button
            type="button"
            style={{ fontSize: "0.72rem", padding: "4px 10px", marginBottom: 2, alignSelf: "flex-end" }}
            className="btn btn-ghost"
            onClick={() => setMostrarCredenciais(v => !v)}
          >
            <i className="fas fa-circle-info"></i> Credenciais de acesso
          </button>
          {erro && <div className="erro-login"><i className="fa-solid fa-circle-exclamation"></i> {erro}</div>}
          <CampoEntrada rotulo="LOGIN" tipo="text" placeholder="admin, checker ou usuario" valor={usuario} aoAlterar={setUsuario} tamanhoMaximo={100} erro={!!erro} icone="fa-solid fa-envelope" />
          <CampoEntrada rotulo="SENHA" tipo="password" placeholder="**********" valor={senha} aoAlterar={setSenha} tamanhoMaximo={50} erro={!!erro} icone="fa-solid fa-lock" />
          <a href="#" className="link-esqueci-senha">Esqueci minha senha</a>
          <div className="container-botao">
            <Botao texto="ENTRAR" tipo="submit" />
          </div>
          <p className="acesso-restrito"><i className="fa-solid fa-shield-halved"></i> Acesso restrito a pessoas autorizadas.</p>
        </form>
      </div>
      {mostrarCredenciais && (
        <div style={isMobile ? {
          position: "fixed", bottom: 140, right: 95, zIndex: 20
        } : {
          position: "absolute", top: "50%", transform: "translateY(-50%)", left: "calc(100% + 16px)", zIndex: 20
        }}>
          <ModalCredenciais onFechar={() => setMostrarCredenciais(false)} />
        </div>
      )}
    </div>
  );
}

export default CartaoLogin;