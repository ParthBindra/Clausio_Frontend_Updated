'use client'

import { useState } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi } from '@/lib/api'

const prompts = [
  { icon: 'ti-file-text', title: 'Summarize Case',    description: 'Generate an AI case summary',    message: 'Summarize this case.' },
  { icon: 'ti-scale',     title: 'Legal Research',     description: 'Search judgments & precedents',  message: 'Find relevant judgments and precedents for this case.' },
  { icon: 'ti-users',     title: 'Cross Examination',  description: 'Generate witness questions',     message: 'Generate cross-examination questions for this case.' },
  { icon: 'ti-bulb',      title: 'Strategy',           description: 'Suggest litigation strategy',    message: 'Suggest a litigation strategy for this case.' },
  { icon: 'ti-shield-check', title: 'Evidence Review', description: 'Analyze evidence strength',      message: 'Analyze the strength of the evidence in this case.' },
]

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function AIChat() {
  const { selectedCaseId } = useCaseStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function send(text: string) {
    if (!text.trim() || loading) return
    setError('')
    const history = messages.map(m => m.text)
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await aiApi.chat({ message: text, caseId: selectedCaseId || undefined, history })
      setMessages(prev => [...prev, { role: 'assistant', text: res.result }])
    } catch (err: any) {
      setError(err.message || 'Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setError('')
  }

  return (
    <div>

      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
            AI Chat
          </h2>
          <p style={{ marginTop: 2, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            Ask Clausio anything about your cases, legal research or court documents.
          </p>
        </div>

        <button
          className="glass-button"
          onClick={clearChat}
          style={{ height: 38, padding: '0 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
        >
          <i className="ti ti-plus" />
          New Conversation
        </button>
      </div>

      {/* ================= SUGGESTED PROMPTS ================= */}

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
          Suggested Prompts
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {prompts.map((item) => (
            <div
              key={item.title}
              className="glass-card"
              onClick={() => send(item.message)}
              style={{
                padding: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.4)'
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 20, color: '#3b82f6' }} />
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CONVERSATION ================= */}
      <div
        className="glass-card"
        style={{
          padding: 20,
          minHeight: 420,
        }}
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-robot" />
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 18, flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>Clausio AI</div>
              <div style={{ color: '#334155', lineHeight: 1.8 }}>
                Hello 👋
                <br /><br />
                I'm your AI legal assistant. I can help you with:
                <ul style={{ marginTop: 12 }}>
                  <li>Legal Research</li>
                  <li>Case Analysis</li>
                  <li>Cross Examination</li>
                  <li>Evidence Review</li>
                  <li>Strategy Suggestions</li>
                  <li>Document Understanding</li>
                </ul>
                Start by asking me a question below.
              </div>
            </div>
          </div>
        )}

        {/* Conversation history */}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: m.role === 'user' ? '#0f172a' : '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={m.role === 'user' ? 'ti ti-user' : 'ti ti-robot'} />
            </div>
            <div style={{ background: m.role === 'user' ? '#eff6ff' : '#f8fafc', borderRadius: 14, padding: 18, flex: 1, whiteSpace: 'pre-wrap' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>{m.role === 'user' ? 'You' : 'Clausio AI'}</div>
              <div style={{ color: '#334155', lineHeight: 1.8 }}>{m.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Clausio AI is thinking...</div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* ================= INPUT AREA ================= */}
        <div style={{ marginTop: 24, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16 }}>
          {/* Chat Input */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Ask Clausio anything... (e.g. Summarize this petition, find relevant judgments, generate cross-examination questions...)"
              rows={3}
              style={{
                flex: 1, resize: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10,
                padding: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.6)',
                color: '#0f172a', boxSizing: 'border-box'
              }}
            />

            <button
              className="glass-button"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                height: 48, padding: '0 20px', border: 'none', borderRadius: 10, background: loading ? '#93c5fd' : '#3b82f6', color: '#fff',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <i className="ti ti-send" />
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
