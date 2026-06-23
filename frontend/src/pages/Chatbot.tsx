// frontend/src/pages/Chatbot.tsx
import { Bot, WifiOff } from "lucide-react";
import "../styles/chatbot.css";

export default function Chatbot() {
  return (
    <div className="chatbot-container">
      <div className="chatbot-cabecalho">
        <div className="chatbot-cabecalho-icone">
          <Bot size={20} />
        </div>
        <div className="chatbot-cabecalho-texto">
          <h2>Chatbot IA — Consulta de Normas</h2>
          <p>Assistente inteligente de normas aeronáuticas</p>
        </div>
      </div>

      <div className="chatbot-boas-vindas">
        <div className="chatbot-boas-vindas-icone" style={{ color: "var(--c-text-muted)" }}>
          <WifiOff size={32} />
        </div>
        <h3>Funcionalidade indisponível nesta versão demo</h3>
        <p style={{ maxWidth: 480, textAlign: "center", color: "var(--c-text-muted)", lineHeight: 1.7 }}>
          O Chatbot de IA utiliza um servidor de processamento local (RAG — Retrieval-Augmented Generation)
          com modelos de linguagem e base vetorial, que não é compatível com hospedagem estática em nuvem, como
          esta versão online de demonstração das demais funcionalidades do sistema SIGNA.
        </p>
        <p style={{ maxWidth: 480, textAlign: "center", color: "var(--c-text-muted)", lineHeight: 1.7 }}>
          Para utilizar o Chatbot com todas as capacidades, execute o projeto localmente via Docker
          conforme instruções no <strong>README</strong> do repositório.
        </p>
        
        <a
          href="https://github.com/janosystime/Janosys-Project-1-Akaer/tree/dev-2"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ marginTop: 8 }}
        >
          
          <i className="fas fa-brands fa-github" style={{ marginRight: 6 }}></i>
          Ver repositório
        </a>
      </div>
    </div>
  );
}