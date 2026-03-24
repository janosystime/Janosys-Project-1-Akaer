import { LoginCard, Logo, Footer } from '../../components/Login';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-page">
      <div className="logo-wrapper">
        <Logo />
      </div>
      <main className="login-content">
        <LoginCard />
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
