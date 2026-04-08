import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Loader2, ChevronDown } from 'lucide-react'
import apiClient from '../../services/api'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const WELCOME_MESSAGE: Message = {
    role: 'assistant',
    content: 'Merhaba! 👋 Ben Çınar, IAR operasyonel yardımcı asistanıyım.\n\nSize şu konularda yardımcı olabilirim:\n- **Boş / Dolu lokasyon** sorgulama (BB, CLP, MGL, GB)\n- **Network** listesi ve network bazlı lokasyon sorgulama\n- **Rezervasyon** kontrolü (KESİN / OPSİYON)\n- **Müşteri bazlı** lokasyon sorgulama\n- **Envanter** özeti ve doluluk oranları\n\nAşağıdaki hızlı soruları deneyebilir veya direkt soru yazabilirsiniz.',
}

const QUICK_QUESTIONS = [
    'Genel CRM durumu',
    'Bu ayın rezervasyonları',
    'Boş lokasyonları göster',
    'Dolu lokasyonları listele',
    'Networkleri listele',
    'Müşteri özeti',
    'Bekleyen müşteri talepleri',
    'Aktif teklifler',
    'Envanter özetini göster',
]

export default function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [hasNewMessage, setHasNewMessage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            inputRef.current?.focus()
            setHasNewMessage(false)
        }
    }, [isOpen, messages])

    const sendMessage = async (text?: string) => {
        const userText = (text || input).trim()
        if (!userText || isLoading) return

        const userMessage: Message = { role: 'user', content: userText }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setIsLoading(true)

        try {
            const response = await apiClient.post<{ reply: string }>('/assistant/chat', {
                messages: updatedMessages,
            })
            const assistantMessage: Message = { role: 'assistant', content: response.reply }
            setMessages(prev => [...prev, assistantMessage])
            if (!isOpen) setHasNewMessage(true)
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g)
            return (
                <span key={i}>
                    {parts.map((part, j) =>
                        part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : <span key={j}>{part}</span>
                    )}
                    {i < text.split('\n').length - 1 && <br />}
                </span>
            )
        })
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    } bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white`}
                title="Çınar - Operasyonel Asistan"
            >
                <MessageCircle className="w-6 h-6" />
                {hasNewMessage && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            <div
                className={`fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] flex flex-col transition-all duration-300 origin-bottom-right ${isOpen
                    ? 'scale-100 opacity-100'
                    : 'scale-0 opacity-0 pointer-events-none'
                    }`}
                style={{ height: '560px' }}
            >
                <div className="flex flex-col h-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">

                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">Çınar</p>
                                <p className="text-xs text-blue-100 leading-tight">Operasyonel Asistan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs mt-0.5 ${msg.role === 'assistant'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                    : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                    }`}>
                                    {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                </div>

                                <div
                                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
                                        ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                                        : 'bg-blue-600 text-white rounded-tr-sm'
                                        }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="whitespace-pre-wrap font-mono text-xs">{formatText(msg.content)}</div>
                                    ) : (
                                        formatText(msg.content)
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-white border border-gray-100 shadow-sm px-3.5 py-2.5 rounded-2xl rounded-tl-sm">
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && !isLoading && (
                        <div className="px-3 pb-2 bg-gray-50 flex flex-wrap gap-1.5 shrink-0">
                            {QUICK_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1.5 rounded-full hover:bg-blue-50 transition-colors font-medium"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex items-end gap-2 bg-gray-100 rounded-xl px-3 py-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder='Müşteri adı veya soru yazın...'
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24 leading-relaxed"
                                style={{ minHeight: '24px' }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center shrink-0 transition-colors"
                            >
                                <Send className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>
                        <p className="text-center text-gray-400 text-[10px] mt-1.5">Örn: "Sushitto rezervasyonları" veya "boş BB lokasyonları"</p>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
