import { useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { Card, Spinner } from '../components/ui'

const SUGGESTIONS = [
  'Why did my profit decrease?',
  'What are my best-selling products?',
  'Who are my most valuable customers?',
  'How can I increase my sales?',
  'What should I focus on this month?',
]

export default function AIAdvisor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const ask = async (question) => {
    const q = (question || input).trim()
    if (!q || loading) return
    setMessages((m) => [...m, { role: 'user', content: q }])
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/ai/ask/', { question: q })
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }])
      setRemaining(data.remaining_queries)
    } catch (err) {
      const detail =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Sorry, I could not answer that right now.'
      setMessages((m) => [...m, { role: 'assistant', content: detail, error: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          AI Business Advisor
        </h1>
        <p className="text-sm text-slate-500">
          Ask anything about your business — I answer from your own data.
        </p>
        {remaining != null && (
          <p className="mt-1 text-xs font-medium text-brand-600">
            {remaining} of 5 AI questions left this month
          </p>
        )}
      </div>

      <Card className="flex h-[60vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl">
                🤖
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                How can I help you understand your business?
              </h2>
              <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : m.error
                      ? 'rounded-bl-md bg-red-50 text-red-700'
                      : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-slate-500">Analyzing your business…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask()
          }}
          className="flex gap-2 border-t border-slate-100 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your business…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </Card>
    </div>
  )
}
