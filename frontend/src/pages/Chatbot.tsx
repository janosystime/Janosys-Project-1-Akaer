
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Bot, Send, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown' 
import { RAG_API_BASE_URL } from '../config/api'
import '../styles/chatbot.css'


type FonteDocumento = {
  filename: string
  page: number
}

type Mensagem = {
  id: number
  tipo: 'usuario' | 'bot' | 'erro'
  texto: string
  hora: string
  fontes?: FonteDocumento[]
}

const PERGUNTAS_EXEMPLO = [
  'Quais normas se aplicam a materiais compostos?',
  'O que diz a norma sobre ensaios não destrutivos?',
  'Quais são os requisitos de rastreabilidade de peças?',
  'Como funciona o processo de qualificação de fornecedores?',
]

function horaAtual(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function IndicadorCarregamento() {
  return (
    <div className="chatbot-carregando">
      <div className="ponto" />
      <div className="ponto" />
      <div className="ponto" />
    </div>
  )
}

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
              <span className="chatbot-fonte-numero">{i + 1}</span>
              {fonte.filename} — p. {fonte.page}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CitacaoInline({
  numero,
  fonte,
}: {
  numero: number
  fonte: FonteDocumento | null
}) {
  const [visivel, setVisivel] = useState(false)

  const tooltipTexto = fonte
    ? `${fonte.filename} — p. ${fonte.page}`
    : `Trecho ${numero}`

  return (
    <span
      className="citacao-inline"
      onMouseEnter={() => setVisivel(true)}
      onMouseLeave={() => setVisivel(false)}
      onClick={() => setVisivel(!visivel)}
    >
      <span className="citacao-badge">{numero}</span>
      {visivel && (
        <span className="citacao-tooltip">
          <FileText size={11} />
          {tooltipTexto}
        </span>
      )}
    </span>
  )
}

function parsearCitacoes(
  texto: string,
  fontes: FonteDocumento[],
): ReactNode[] {
  const regex = /【(\d+)】/g
  const partes: ReactNode[] = []
  let ultimoIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimoIndex) {
      partes.push(texto.slice(ultimoIndex, match.index))
    }

    const numero = parseInt(match[1], 10)
    const fonte = fontes[numero - 1] || null

    partes.push(
      <CitacaoInline
        key={`cite-${match.index}-${numero}`}
        numero={numero}
        fonte={fonte}
      />,
    )

    ultimoIndex = regex.lastIndex
  }

  if (ultimoIndex < texto.length) {
    partes.push(texto.slice(ultimoIndex))
  }

  return partes
}

function MarkdownComCitacoes({
  texto,
  fontes,
}: {
  texto: string
  fontes: FonteDocumento[]
}) {
  // Verifica se existem citações no texto
  const temCitacoes = /【\d+】/.test(texto)

  if (!temCitacoes) {
    return <ReactMarkdown>{texto}</ReactMarkdown>
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p>{processarFilhos(children, fontes)}</p>
        ),
        li: ({ children }) => (
          <li>{processarFilhos(children, fontes)}</li>
        ),
        td: ({ children }) => (
          <td>{processarFilhos(children, fontes)}</td>
        ),
        th: ({ children }) => (
          <th>{processarFilhos(children, fontes)}</th>
        ),
      }}
    >
      {texto}
    </ReactMarkdown>
  )
}

function processarFilhos(
  children: ReactNode,
  fontes: FonteDocumento[],
): ReactNode {
  if (children == null) return children

  if (typeof children === 'string') {
    if (/【\d+】/.test(children)) {
      return <>{parsearCitacoes(children, fontes)}</>
    }
    return children
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string' && /【\d+】/.test(child)) {
        return <span key={`parsed-${i}`}>{parsearCitacoes(child, fontes)}</span>
      }
      return child
    })
  }

  return children
}

export default function Chatbot() {
  const [inputTexto, setInputTexto] = useState('')

  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    try {
      const salvas = localStorage.getItem('chatbot-mensagens')
      return salvas ? JSON.parse(salvas) : []
    } catch {
      return []
    }
  })

  const [carregando, setCarregando] = useState(false)

  const contadorId = useRef(0)

  const refFimMensagens = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mensagens.length > 0) {
      const maiorId = Math.max(...mensagens.map((m) => m.id))
      contadorId.current = maiorId
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chatbot-mensagens', JSON.stringify(mensagens))
  }, [mensagens])

  useEffect(() => {
    refFimMensagens.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

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
      const resposta = await fetch(`${RAG_API_BASE_URL}/chat`, {
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

  function handleTecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarPergunta(inputTexto)
    }
  }

  const chatVazio = mensagens.length === 0

  return (
    <div className="chatbot-container">
      <div className="chatbot-cabecalho">
        <div className="chatbot-cabecalho-icone">
          <Bot size={20} />
        </div>
        <div className="chatbot-cabecalho-texto">
          <h2>Chatbot IA — Consulta de Normas</h2>
          <p>Pergunte sobre normas aeronáuticas do acervo</p>
        </div>
      </div>

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
              <div className="chatbot-msg-bolha">
                {msg.tipo === 'bot' && msg.fontes ? (
                  <MarkdownComCitacoes texto={msg.texto} fontes={msg.fontes} />
                ) : (
                  <ReactMarkdown>{msg.texto}</ReactMarkdown>
                )}
              </div>
              
              {msg.tipo === 'bot' && msg.fontes && (
                <FontesMensagem fontes={msg.fontes} />
              )}
              <span className="chatbot-msg-hora">{msg.hora}</span>
            </div>
          ))}

          {carregando && <IndicadorCarregamento />}

          <div ref={refFimMensagens} />
        </div>
      )}

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
