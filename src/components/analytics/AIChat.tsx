'use client'

import { useState, useEffect, useRef } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi } from '@/lib/api'

const QUICK_PROMPTS = [
  { icon: 'ti-file-text',    label: 'Case Summary',        message: 'Give me a complete summary of this case including parties, current stage, strengths and weaknesses.' },
  { icon: 'ti-scale',        label: 'Legal Research',      message: 'Find the most relevant Supreme Court and High Court judgments for this case with how to use each one.' },
  { icon: 'ti-gavel',        label: 'Cross Exam',          message: 'Generate 20 cross-examination questions for the opposing party\'s key witness based on the case facts.' },
  { icon: 'ti-target-arrow', label: 'Next Steps',          message: 'What are the 5 most critical actions I must take in the next 7 days for this case?' },
  { icon: 'ti-shield-check', label: 'Evidence Gaps',       message: 'What documents and evidence are missing from this case that could weaken our position?' },
  { icon: 'ti-currency-rupee', label: 'Maintenance Calc', message: 'Calculate the recommended maintenance amount based on Rajnesh v. Neha standard and the financial facts in this case.' },
]

interface Message {
  role: 'user' | 'assistant'
  text: string
  time: string
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function AIChat() {
  const { selectedCaseId } = useCaseStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [copied,   setCopied]   = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setError('')
    const history = messages.map(m => m.text)
    setMessages(prev => [...prev, { role: 'user', text, time: now() }])
    setInput('')
    setLoading(true)
    try {
      const res = await aiApi.chat({ message: text, caseId: selectedCaseId || undefined, history })
      const reply = res.response ?? res.result ?? ''
      setMessages(prev => [...prev, { role: 'assistant', text: reply, time: now() }])
      // Save to history
      const stored = JSON.parse(localStorage.getItem('clausio_ai_history') || '[]')
      stored.unshift({ query: text, response: reply, time: new Date().toISOString(), caseId: selectedCaseId })
      localStorage.setItem('clausio_ai_history', JSON.stringify(stored.slice(0, 100)))
    } catch (err: any) {
      setError(err.message || 'Failed to get AI response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copyMessage(idx: number, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setError('')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>AI Chat</h2>
          <p style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>
            Ask Clausio anything about your case, law, or court procedure.
            {selectedCaseId && <span style={{ color: '#2563eb', fontWeight: 600 }}> · Case loaded</span>}
          </p>
        </div>
        <button onClick={clearChat} style={{ height: 36, padding: '0 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-plus" /> New Chat
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p.label} onClick={() => send(p.message)} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
            <i className={`ti ${p.icon}`} style={{ fontSize: 18, color: '#3b82f6', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: 20, minHeight: 380, maxHeight: 480, overflowY: 'auto' }}>

          {/* Welcome */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="ti ti-robot" style={{ fontSize: 18, color: '#fff' }} />
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, fontSize: 14 }}>Clausio AI</div>
                <div style={{ color: '#475569', fontSize: 13, lineHeight: 1.8 }}>
                  Namaste! I am your AI legal assistant with deep knowledge of Indian law.
                  {selectedCaseId
                    ? ' I have your selected case loaded — ask me anything about it.'
                    : ' Select a case from the dashboard for case-specific answers, or ask any legal question.'}
                  <br /><br />
                  You can ask me to: summarize your case, find judgments, draft documents, calculate maintenance, generate cross-examination questions, or anything else you need.
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: m.role === 'user' ? '#0f172a' : 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={m.role === 'user' ? 'ti ti-user' : 'ti ti-robot'} style={{ fontSize: 15, color: '#fff' }} />
              </div>
              <div style={{ flex: 1, maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{m.role === 'user' ? 'You' : 'Clausio AI'}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.time}</span>
                </div>
                <div style={{ background: m.role === 'user' ? '#eff6ff' : '#f8fafc', border: `1px solid ${m.role === 'user' ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 12, padding: 14, position: 'relative' }}>
                  <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  {m.role === 'assistant' && (
                    <button onClick={() => copyMessage(i, m.text)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: 4 }}>
                      <i className={`ti ${copied === i ? 'ti-check' : 'ti-copy'}`} style={{ color: copied === i ? '#22c55e' : '#94a3b8' }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-robot" style={{ fontSize: 15, color: '#fff' }} />
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#64748b' }}>
                Clausio AI is thinking...
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', margin: '8px 0' }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{ flex: 1, resize: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ height: 44, padding: '0 18px', border: 'none', borderRadius: 10, background: loading || !input.trim() ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 600, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', flexShrink: 0 }}>
            <i className="ti ti-send" /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
