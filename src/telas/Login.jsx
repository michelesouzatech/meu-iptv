import { useState } from 'react'
import { supabase } from '../supabase.js'
import { Logo, IconeOlho, IconeOlhoFechado, IconeAlerta } from '../icones.jsx'

const campo =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 py-3 text-[15px] text-tinta placeholder-nevoa/50 outline-none transition focus:border-eletrico/60 focus:bg-white/[0.06]'

const rotulo = 'mb-1.5 block text-[13px] font-medium text-nevoa'

export default function Login() {
  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setCarregando(true)

    const { error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({ email, password: senha })

    setCarregando(false)

    if (error) {
      setErro(traduzirErro(error.message))
      return
    }

    if (modo === 'cadastrar') setAviso('Conta criada! Você já pode entrar.')
  }

  function traduzirErro(msg) {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha errados.'
    if (msg.includes('User already registered')) return 'Já existe uma conta com esse e-mail.'
    if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
    return msg
  }

  return (
    <div className="relative isolate flex min-h-full items-center justify-center px-5 py-10">
      <div className="brilho brilho-a" aria-hidden="true" />
      <div className="brilho brilho-b" aria-hidden="true" />

      <div className="superficie surge relative z-10 w-full max-w-sm px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Logo tamanho={34} />
          <h1 className="mt-3 font-display text-[22px] font-bold tracking-tight text-tinta">
            Meu IPTV
          </h1>
          <p className="mt-1 text-[13.5px] text-nevoa">
            {modo === 'entrar' ? 'Entre pra ver seus dados' : 'Crie sua conta pra começar'}
          </p>
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <label className="block">
            <span className={rotulo}>E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={campo}
              placeholder="voce@email.com"
            />
          </label>

          <label className="block">
            <span className={rotulo}>Senha</span>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`${campo} pr-11`}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-nevoa transition hover:text-tinta"
                aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <IconeOlhoFechado tamanho={18} /> : <IconeOlho tamanho={18} />}
              </button>
            </div>
          </label>

          {erro && (
            <p className="flex items-start gap-2 text-[13px] text-coral">
              <IconeAlerta tamanho={15} className="mt-0.5 shrink-0" />
              {erro}
            </p>
          )}
          {aviso && <p className="text-[13px] text-menta">{aviso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="pilula mt-2 w-full rounded-xl py-3 text-[15px] font-semibold"
          >
            {carregando ? 'Um instante…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo((m) => (m === 'entrar' ? 'cadastrar' : 'entrar'))
            setErro('')
            setAviso('')
          }}
          className="mt-5 w-full text-center text-[13.5px] text-nevoa transition hover:text-tinta"
        >
          {modo === 'entrar' ? (
            <>
              Ainda não tem conta? <span className="text-eletrico">Criar agora</span>
            </>
          ) : (
            <>
              Já tem conta? <span className="text-eletrico">Entrar</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
