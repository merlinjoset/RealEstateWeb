import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import api from '../../services/api'

export interface CaptchaValue {
  token: string
  answer: string
}

/**
 * Self-contained image CAPTCHA for the public forms. Fetches a distorted-text
 * challenge from GET /api/captcha (the answer never reaches the browser — it's
 * HMAC-signed into the token) and reports { token, answer } up to the parent,
 * which sends both with the form so the server can verify.
 */
export default function Captcha({ onChange }: { onChange: (v: CaptchaValue) => void }) {
  const [image, setImage] = useState('')
  const [token, setToken] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  // Latest callback without re-creating `load` each render.
  const cb = useRef(onChange)
  cb.current = onChange

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ token: string; image: string }>('/captcha')
      setImage(data.image)
      setToken(data.token)
      setAnswer('')
      cb.current({ token: data.token, answer: '' })
    } catch {
      /* leave previous challenge; user can hit refresh */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onAnswer = (v: string) => {
    const up = v.toUpperCase()
    setAnswer(up)
    cb.current({ token, answer: up })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter the code shown *</label>
      <div className="flex items-center gap-2">
        {image
          ? <img src={image} alt="CAPTCHA" className="rounded-lg border border-gray-200 h-[54px] w-[170px] shrink-0" />
          : <div className="rounded-lg border border-gray-200 h-[54px] w-[170px] bg-gray-100 shrink-0" />}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          title="Get a new code"
          className="p-2 text-gray-400 hover:text-gray-700 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <input
          type="text"
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          maxLength={5}
          autoComplete="off"
          placeholder="Code"
          className="input-field flex-1 uppercase tracking-widest"
        />
      </div>
    </div>
  )
}
