import akaerLogo from '../../assets/akaer-logo.png';
import './Logo.css';

function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-header">
        <img src={akaerLogo} alt="Akaer" className="akaer-logo" />
        <div className="signa-badge">SIGNA</div>
      </div>
      <p className="logo-subtitle">Sistema Integrado de Gestão de Normativas Aeronáuticas</p>
    </div>
  );
}

export default Logo;
