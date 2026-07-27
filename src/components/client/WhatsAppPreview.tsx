'use client'

import { useState } from 'react'
import { aiApi } from '@/lib/api'

interface Props {
  message:    string
  generating: boolean
  onRegenerate: (tone: string, language: string) => void
}

export default function WhatsAppPreview({ message, generating, onRegenerate }: Props) {
  const [translating, setTranslating] = useState(false)
  const [copied,       setCopied]     = useState(false)
  const [translated,   setTranslated] = useState('')

  const displayMessage = translated || message

  async function handleTranslate() {
    if (!displayMessage.trim()) return
    setTranslating(true)
    try {
      const res = await aiApi.translate({ text: displayMessage })
      setTranslated(res.result)
    } catch (err) {
      console.error(err)
    } finally {
      setTranslating(false)
    }
  }

  async function handleCopy() {
    if (!displayMessage.trim()) return
    await navigator.clipboard.writeText(displayMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(15,23,42,.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            WhatsApp Preview
          </h2>

          <p
            style={{
              marginTop: 5,
              color: '#64748b',
              fontSize: 14,
            }}
          >
            AI generated message ready to send
          </p>
        </div>

        <span
          style={{
            background: displayMessage ? '#dcfce7' : '#f1f5f9',
            color: displayMessage ? '#15803d' : '#64748b',
            padding: '8px 14px',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {displayMessage ? 'Ready' : 'No message yet'}
        </span>
      </div>

      {/* Phone */}

      <div
        style={{
          flex: 1,
          background: '#ece5dd',
          borderRadius: 18,
          padding: 20,
          overflowY: 'auto',
        }}
      >
        {generating && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: 20 }}>Generating message...</div>
        )}
        {!generating && !displayMessage && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 20 }}>
            Configure the update on the left and click Generate for WhatsApp.
          </div>
        )}
        {!generating && displayMessage && (
          <div
            style={{
              background: '#dcf8c6',
              padding: 18,
              borderRadius: 12,
              maxWidth: '88%',
              marginLeft: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14,
              color: '#111827',
              boxShadow: '0 2px 6px rgba(0,0,0,.08)',
            }}
          >
            {displayMessage}
          </div>
        )}
      </div>

      {/* Footer */}

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          onClick={() => onRegenerate('Reassuring', 'Hinglish (Hindi + English)')}
          disabled={generating}
          style={{ ...secondaryButton, cursor: generating ? 'not-allowed' : 'pointer' }}
        >
          <i className="ti ti-refresh" />
          Regenerate
        </button>

        <button
          onClick={handleTranslate}
          disabled={translating || !displayMessage}
          style={{ ...secondaryButton, cursor: (translating || !displayMessage) ? 'not-allowed' : 'pointer' }}
        >
          <i className="ti ti-language" />
          {translating ? 'Translating...' : 'Translate'}
        </button>

        <button
          onClick={handleCopy}
          disabled={!displayMessage}
          style={{ ...primaryButton, opacity: displayMessage ? 1 : 0.6, cursor: displayMessage ? 'pointer' : 'not-allowed' }}
        >
          <i className="ti ti-copy" />
          {copied ? 'Copied!' : 'Copy for WhatsApp'}
        </button>
      </div>
    </div>
  )
}

const primaryButton: React.CSSProperties = {
  flex: 1,
  background: '#22c55e',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  padding: '14px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
}

const secondaryButton: React.CSSProperties = {
  background: '#f8fafc',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: '14px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
}
