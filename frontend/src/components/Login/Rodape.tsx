function Rodape() {
  return (
    <footer className="rodape-login">
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M14 2L24.66 8V20L14 26L3.34 20V8L14 2Z"
          stroke="#ababa1"
          strokeWidth="1.5"
        />
        <circle cx="14" cy="14" r="4" stroke="#A1A5AB" strokeWidth="1.5" />
      </svg>
      <span className="rodape-login-texto">
        Desenvolvido por:{" "}
        <a
          href="https://github.com/janosystime"
          target="_blank"
          rel="noopener noreferrer"
          className="rodape-login-marca"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          JanoSys Technologies
        </a>
      </span>
    </footer>
  );
}

export default Rodape;