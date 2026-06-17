import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Button, Input, Card } from '../components/ui'

export default function Login() {
  const { signIn, signUp, configured } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        setInfo('Conta criada! Verifique seu e-mail se a confirmação estiver ativa e faça login.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold tracking-tight">SENA COMERCIAL</div>
          <div className="text-sm text-neutral-500">Painel de Gestão · EUgência</div>
        </div>

        {!configured && (
          <Card className="mb-4 border-warning/40 bg-warning/10 text-sm text-neutral-700">
            Supabase ainda não configurado. Defina <code>VITE_SUPABASE_URL</code> e{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> em <code>.env.local</code>.
          </Card>
        )}

        <Card>
          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <Input
                label="Nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            )}
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            {info && <p className="text-sm text-success">{info}</p>}
            <Button type="submit" disabled={busy || !configured} className="w-full">
              {busy ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-neutral-500 mt-4">
          {mode === 'signin' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button
            className="text-brand-dark font-medium hover:underline"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setInfo('')
            }}
          >
            {mode === 'signin' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
