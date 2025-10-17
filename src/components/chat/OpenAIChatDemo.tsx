'use client'

import { useState, useRef, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'

const OPENAI_MODEL = 'gpt-4o-mini'

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'user':
      return 'You'
    case 'assistant':
      return 'AI'
    case 'system':
      return 'System'
    default:
      return role
  }
}

export const OpenAIChatDemo = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    },
    onError: (error) => {
      console.error('Failed to send message:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessageMutation.isPending) return

    const messageText = input.trim()

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])

    sendMessageMutation.mutate({
      message: messageText,
      provider: 'openai',
      model: OPENAI_MODEL,
      conversationHistory: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    setInput('')
  }

  const handleClear = () => {
    setMessages([])
  }

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const totalMessages = messages.length
  const userMessages = messages.filter((m) => m.role === 'user').length
  const aiMessages = messages.filter((m) => m.role === 'assistant').length

  return (
    <div className='space-y-6'>
      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{totalMessages}</div>
          <div className='brutalist-stat-label'>Total Messages</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{userMessages}</div>
          <div className='brutalist-stat-label'>Your Messages</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{aiMessages}</div>
          <div className='brutalist-stat-label'>AI Responses</div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className='brutalist-card p-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='brutalist-heading'>Chat with OpenAI</h2>
            <p className='brutalist-text brutalist-text-secondary'>
              Model: {OPENAI_MODEL}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className='brutalist-button brutalist-button-pink'
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className='brutalist-card-sm p-6 h-96 overflow-y-auto mb-6 bg-white'>
          {messages.length > 0 ? (
            <div className='space-y-4'>
              {messages.map((message) => (
                <div key={message.id} className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`brutalist-badge ${
                        message.role === 'user'
                          ? 'brutalist-badge-blue'
                          : 'brutalist-badge-green'
                      }`}
                    >
                      {getRoleLabel(message.role)}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-50 border-2 border-black'
                        : 'bg-green-50 border-2 border-black'
                    }`}
                  >
                    <p className='brutalist-text whitespace-pre-wrap'>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className='flex h-full items-center justify-center text-center'>
              <div>
                <p className='brutalist-text brutalist-text-secondary mb-2'>
                  No messages yet
                </p>
                <p className='brutalist-text brutalist-text-secondary text-sm'>
                  Type a question below to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {sendMessageMutation.error && (
          <div className='brutalist-card-sm p-4 bg-red-50 mb-4'>
            <div className='flex items-center gap-2'>
              <span className='brutalist-badge brutalist-badge-pink'>
                Error
              </span>
              <span className='brutalist-text font-semibold'>
                {sendMessageMutation.error.message}
              </span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='brutalist-text block mb-2 font-semibold'>
              Your Message
            </label>
            <input
              type='text'
              className='brutalist-input'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g., Give me a creative title for a product launch...'
              disabled={sendMessageMutation.isPending}
              autoFocus
            />
          </div>

          <div className='flex gap-3'>
            <button
              type='submit'
              disabled={
                sendMessageMutation.isPending || input.trim().length === 0
              }
              className='brutalist-button flex-1'
            >
              {sendMessageMutation.isPending ? 'Sending...' : '💬 Send Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Card */}
      <div className='brutalist-card-sm p-6'>
        <h3 className='brutalist-text font-semibold mb-3'>Tips</h3>
        <ul className='space-y-2'>
          <li className='brutalist-text brutalist-text-secondary text-sm'>
            • Conversation history is maintained during your session
          </li>
          <li className='brutalist-text brutalist-text-secondary text-sm'>
            • Clear chat to start a fresh conversation
          </li>
          <li className='brutalist-text brutalist-text-secondary text-sm'>
            • Configure OPENAI_MODEL in .env.local to change the model
          </li>
        </ul>
      </div>
    </div>
  )
}
