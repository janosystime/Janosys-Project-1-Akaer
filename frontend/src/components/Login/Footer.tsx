import janosysLogo from '../../assets/janosys-logo.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="login-footer">
      <span className="footer-text">Desenvolvido por</span>
      <img src={janosysLogo} alt="Janosys" className="janosys-logo" />
    </footer>
  );
}

export default Footer;
