import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import './LoginCard.css';

function LoginCard() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="login-card">
      <h1 className="login-card-title">ACESSO AO SISTEMA</h1>
      
      <form className="login-form" onSubmit={handleSubmit}>
        <Input
          label="LOGIN"
          type="email"
          placeholder="usuario@akaer.com.br"
          value={login}
          onChange={setLogin}
          maxLength={100}
        />
        
        <Input
          label="SENHA"
          type="password"
          placeholder="**********"
          value={password}
          onChange={setPassword}
          maxLength={50}
        />
        
        <a href="#" className="forgot-password-link">Esqueci minha senha.</a>
        
        <div className="button-container">
          <Button text="ENTRAR" type="submit" />
        </div>
        
        <p className="restricted-access">Acesso restrito a colaboradores AKAER</p>
      </form>
    </div>
  );
}

export default LoginCard;
