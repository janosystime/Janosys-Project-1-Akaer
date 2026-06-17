/**
 * Chatbot.tsx — Página de chat com IA para consulta de normas aeronáuticas.
 *
 * Funcionalidades:
 * - Interface de chat com histórico de mensagens
 * - Envio de perguntas para a API (POST /api/chat)
 * - Exibição de fontes/documentos usados na resposta
 * - Estado de boas-vindas com perguntas-exemplo clicáveis
 * - Indicador de carregamento com pontos animados
 * - Tratamento de erros (backend offline, etc.)
 * - Auto-scroll para a última mensagem
 * - Envio com tecla Enter
 */

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown' // <-- NOVO: Importando o renderizador de Markdown
import '../styles/chatbot.css'

// ------------------------------------------------------------
// Tipos das estruturas de dados
// ------------------------------------------------------------

/** Documento fonte retornado pela API */
type FonteDocumento = {
  filename: string
  page: number
}

/** Uma mensagem no histórico do chat */
type Mensagem = {
  id: number
  tipo: 'usuario' | 'bot' | 'erro'
  texto: string
  hora: string
  fontes?: FonteDocumento[]
}

// ------------------------------------------------------------
// Perguntas-exemplo para o estado de boas-vindas
// ------------------------------------------------------------
const PERGUNTAS_EXEMPLO = [
  'Quais normas se aplicam a materiais compostos?',
  'O que diz a norma sobre ensaios não destrutivos?',
  'Quais são os requisitos de rastreabilidade de peças?',
  'Como funciona o processo de qualificação de fornecedores?',
]

// ------------------------------------------------------------
// Função auxiliar: retorna a hora atual formatada (HH:MM)
// ------------------------------------------------------------
function horaAtual(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ------------------------------------------------------------
// Componente: IndicadorCarregamento
// Três pontos animados enquanto aguarda resposta da IA
// ------------------------------------------------------------
function IndicadorCarregamento() {
  return (
    <div className="chatbot-carregando">
      <div className="ponto" />
      <div className="ponto" />
      <div className="ponto" />
    </div>
  )
}

// ------------------------------------------------------------
// Componente: FontesMensagem
// Lista colapsável de documentos fonte abaixo da resposta do bot
// ------------------------------------------------------------
function FontesMensagem({ fontes }: { fontes: FonteDocumento[] }) {
  const [aberto, setAberto] = useState(false)

  if (!fontes || fontes.length === 0) return null

  return (
    <div className="chatbot-fontes">
      <div
        className="chatbot-fontes-titulo"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {fontes.length} fonte{fontes.length > 1 ? 's' : ''} consultada{fontes.length > 1 ? 's' : ''}
      </div>

      {aberto && (
        <div className="chatbot-fontes-lista">
          {fontes.map((fonte, i) => (
            <span key={i} className="chatbot-fonte-badge">
              <FileText size={12} />
              {fonte.filename} — p. {fonte.page}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------
// Componente principal: Chatbot
// ------------------------------------------------------------
export default function Chatbot() {
  // Estado do input de texto
  const [inputTexto, setInputTexto] = useState('')

  // Histórico de mensagens — carrega do localStorage se existir
  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    try {
      const salvas = localStorage.getItem('chatbot-mensagens')
      return salvas ? JSON.parse(salvas) : []
    } catch {
      return []
    }
  })

  // Flag de carregamento (aguardando resposta da API)
  const [carregando, setCarregando] = useState(false)

  // Contador para IDs únicos das mensagens
  const contadorId = useRef(0)

  // Referência para auto-scroll
  const refFimMensagens = useRef<HTMLDivElement>(null)

  // Sincroniza o contador de ID com as mensagens salvas
  useEffect(() => {
    if (mensagens.length > 0) {
      const maiorId = Math.max(...mensagens.map((m) => m.id))
      contadorId.current = maiorId
    }
  }, [])

  // Salva mensagens no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem('chatbot-mensagens', JSON.stringify(mensagens))
  }, [mensagens])

  // Auto-scroll sempre que mensagens mudam ou carregando muda
  useEffect(() => {
    refFimMensagens.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

  // ----------------------------------------------------------
  // Envia a pergunta para a API e processa a resposta
  // ----------------------------------------------------------
  async function enviarPergunta(pergunta: string) {
    const textoLimpo = pergunta.trim()
    if (!textoLimpo || carregando) return

    setInputTexto('')

    contadorId.current += 1
    const msgUsuario: Mensagem = {
      id: contadorId.current,
      tipo: 'usuario',
      texto: textoLimpo,
      hora: horaAtual(),
    }
    setMensagens((prev) => [...prev, msgUsuario])

    setCarregando(true)

    try {
      const resposta = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textoLimpo }),
      })

      if (!resposta.ok) {
        throw new Error(`Erro do servidor: ${resposta.status}`)
      }

      const dados = await resposta.json()

      const fontes: FonteDocumento[] = (dados.sources || []).map(
        (fonte: { filename?: string; page?: number }) => ({
          filename: fonte.filename || 'documento',
          page: fonte.page ?? 1,
        })
      )

      contadorId.current += 1
      const msgBot: Mensagem = {
        id: contadorId.current,
        tipo: 'bot',
        texto: dados.answer || 'Sem resposta.',
        hora: horaAtual(),
        fontes,
      }
      setMensagens((prev) => [...prev, msgBot])
    } catch (erro) {
      contadorId.current += 1
      const msgErro: Mensagem = {
        id: contadorId.current,
        tipo: 'erro',
        texto:
          'Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.',
        hora: horaAtual(),
      }
      setMensagens((prev) => [...prev, msgErro])
    } finally {
      setCarregando(false)
    }
  }

  // ----------------------------------------------------------
  // Handler do teclado: enviar com Enter
  // ----------------------------------------------------------
  function handleTecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarPergunta(inputTexto)
    }
  }

  // ----------------------------------------------------------
  // Renderização
  // ----------------------------------------------------------
  const chatVazio = mensagens.length === 0

  return (
    <div className="chatbot-container">
      {/* Cabeçalho do chat */}
      <div className="chatbot-cabecalho">
        <div className="chatbot-cabecalho-icone">
          <Bot size={20} />
        </div>
        <div className="chatbot-cabecalho-texto">
          <h2>Chatbot IA — Consulta de Normas</h2>
          <p>Pergunte sobre normas aeronáuticas do acervo</p>
        </div>
      </div>

      {/* Área de mensagens ou boas-vindas */}
      {chatVazio ? (
        <div className="chatbot-boas-vindas">
          <div className="chatbot-boas-vindas-icone">
            <Bot size={32} />
          </div>
          <h3>Bem-vindo ao Chatbot de Normas</h3>
          <p>
            Faça perguntas sobre as normas aeronáuticas cadastradas no sistema.
            A IA irá buscar nos documentos e responder com base no conteúdo das normas.
          </p>
          <div className="chatbot-exemplos">
            {PERGUNTAS_EXEMPLO.map((pergunta) => (
              <button
                key={pergunta}
                className="chatbot-exemplo-chip"
                onClick={() => enviarPergunta(pergunta)}
              >
                {pergunta}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chatbot-mensagens">
          {mensagens.map((msg) => (
            <div key={msg.id} className={`chatbot-msg ${msg.tipo}`}>
              {/* NOVO: Usando ReactMarkdown para renderizar os estilos e tópicos da resposta */}
              <div className="chatbot-msg-bolha">
                <ReactMarkdown>{msg.texto}</ReactMarkdown>
              </div>
              
              {/* Fontes: só aparecem em mensagens do bot */}
              {msg.tipo === 'bot' && msg.fontes && (
                <FontesMensagem fontes={msg.fontes} />
              )}
              <span className="chatbot-msg-hora">{msg.hora}</span>
            </div>
          ))}

          {/* Indicador de carregamento */}
          {carregando && <IndicadorCarregamento />}

          {/* Div invisível para auto-scroll */}
          <div ref={refFimMensagens} />
        </div>
      )}

      {/* Área de input */}
      <div className="chatbot-input-area">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Digite sua pergunta sobre normas..."
          value={inputTexto}
          onChange={(e) => setInputTexto(e.target.value)}
          onKeyDown={handleTecla}
          disabled={carregando}
        />
        <button
          className="chatbot-btn-enviar"
          onClick={() => enviarPergunta(inputTexto)}
          disabled={carregando || !inputTexto.trim()}
          title="Enviar pergunta"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}