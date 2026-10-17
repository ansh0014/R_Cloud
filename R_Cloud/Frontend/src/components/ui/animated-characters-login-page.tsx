import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

/* ─── Types ──────────────────────────────────────────────── */
interface PupilProps {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
}

interface EyeBallProps {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
}

/* ─── Pupil ──────────────────────────────────────────────── */
const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const r = ref.current.getBoundingClientRect()
    const dx = mouseX - (r.left + r.width / 2)
    const dy = mouseY - (r.top  + r.height / 2)
    const d  = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const a  = Math.atan2(dy, dx)
    return { x: Math.cos(a) * d, y: Math.sin(a) * d }
  })()

  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{ width: size, height: size, backgroundColor: pupilColor,
        transform: `translate(${pos.x}px,${pos.y}px)`,
        transition: 'transform 0.1s ease-out' }}
    />
  )
}

/* ─── EyeBall ────────────────────────────────────────────── */
const EyeBall = ({
  size = 48, pupilSize = 16, maxDistance = 10,
  eyeColor = 'white', pupilColor = 'black',
  isBlinking = false, forceLookX, forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const r = ref.current.getBoundingClientRect()
    const dx = mouseX - (r.left + r.width / 2)
    const dy = mouseY - (r.top  + r.height / 2)
    const d  = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const a  = Math.atan2(dy, dx)
    return { x: Math.cos(a) * d, y: Math.sin(a) * d }
  })()

  return (
    <div
      ref={ref}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size,
        backgroundColor: eyeColor, overflow: 'hidden' }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
            transform: `translate(${pos.x}px,${pos.y}px)`,
            transition: 'transform 0.1s ease-out' }}
        />
      )}
    </div>
  )
}

/* ─── Main Auth Page ─────────────────────────────────────── */
interface AuthPageProps {
  mode?: 'signin' | 'signup'
}

function AuthPage({ mode = 'signup' }: AuthPageProps) {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false)
  const [isBlackBlinking, setIsBlackBlinking] = useState(false)

  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef  = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  /* mouse tracking */
  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  /* random blink — purple */
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true)
        setTimeout(() => { setIsPurpleBlinking(false); schedule() }, 150)
      }, Math.random() * 4000 + 3000)
      return t
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  /* random blink — black */
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true)
        setTimeout(() => { setIsBlackBlinking(false); schedule() }, 150)
      }, Math.random() * 4000 + 3000)
      return t
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  /* character position helper */
  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top  + r.height / 3
    const dx = mouseX - cx
    const dy = mouseY - cy
    return {
      faceX:    Math.max(-15, Math.min(15, dx / 20)),
      faceY:    Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6,  Math.min(6, -dx / 120)),
    }
  }

  const purplePos = calcPos(purpleRef)
  const blackPos  = calcPos(blackRef)
  const yellowPos = calcPos(yellowRef)
  const orangePos = calcPos(orangeRef)

  /**
   * Called by the <GoogleLogin> component with the Google credential (id_token).
   * Sends it to our Auth Service which validates it and returns the real User.
   */
  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in did not return a credential. Please try again.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const ok = await loginWithGoogle(credentialResponse.credential)
      if (ok) {
        navigate('/dashboard')
      } else {
        setError('Google sign-in was rejected by the server. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-[#05180F]">
      {/* Close button */}
      <Link
        to="/"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-[#0F3B27]/80 hover:bg-[#0F3B27] border border-[#CFF1D2]/20 text-[#F7F9F7] hover:border-[#92FF5F]/50 transition-all cursor-pointer shadow-lg"
        aria-label="Close"
      >
        <X className="size-5" />
      </Link>

      {/* ── Left — Characters panel ──────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#071F14] via-[#0F3B27] to-[#05180F] p-12 text-[#F7F9F7] overflow-hidden border-r border-[#0F3B27]">

        {/* Brand */}
        <div className="relative z-20 flex items-center gap-2.5 text-lg font-semibold">
          <div className="w-8 h-8 rounded-lg bg-[#92FF5F] flex items-center justify-center text-[#05180F] font-bold font-mono shadow-[0_0_15px_rgba(146,255,95,0.4)]">
            R
          </div>
          <span className="font-manrope font-bold text-xl tracking-tight text-[#F7F9F7]">R_Cloud</span>
        </div>

        {/* Characters */}
        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: 550, height: 400 }}>

            {/* Move Green — back */}
            <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out border border-[#CFF1D2]/20"
              style={{
                left: 70, width: 180,
                height: 400,
                backgroundColor: '#0F3B27',
                borderRadius: '12px 12px 0 0', zIndex: 1,
                transform: `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: 45 + purplePos.faceX,
                  top:  40 + purplePos.faceY,
                }}
              >
                {[0, 1].map(i => (
                  <EyeBall key={i} size={18} pupilSize={7} maxDistance={5}
                    eyeColor="#F7F9F7" pupilColor="#05180F"
                    isBlinking={isPurpleBlinking}
                  />
                ))}
              </div>
            </div>

            {/* Obsidian Slate — middle */}
            <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out border border-[#CFF1D2]/10"
              style={{
                left: 240, width: 120, height: 310,
                backgroundColor: '#172B20',
                borderRadius: '10px 10px 0 0', zIndex: 2,
                transform: `skewX(${(blackPos.bodySkew || 0)}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: 26 + blackPos.faceX,
                  top:  32 + blackPos.faceY,
                }}
              >
                {[0, 1].map(i => (
                  <EyeBall key={i} size={16} pupilSize={6} maxDistance={4}
                    eyeColor="#F7F9F7" pupilColor="#05180F"
                    isBlinking={isBlackBlinking}
                  />
                ))}
              </div>
            </div>

            {/* Coral Orange — front left */}
            <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-lg"
              style={{
                left: 0, width: 240, height: 200,
                backgroundColor: '#FF7036',
                borderRadius: '120px 120px 0 0', zIndex: 3,
                transform: `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: 82 + (orangePos.faceX || 0),
                  top:  90 + (orangePos.faceY || 0),
                }}
              >
                {[0, 1].map(i => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#05180F" />
                ))}
              </div>
            </div>

            {/* Signal Lime — front right */}
            <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-lg"
              style={{
                left: 310, width: 140, height: 230,
                backgroundColor: '#92FF5F',
                borderRadius: '70px 70px 0 0', zIndex: 4,
                transform: `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: 52 + (yellowPos.faceX || 0),
                  top:  40 + (yellowPos.faceY || 0),
                }}
              >
                {[0, 1].map(i => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#05180F" />
                ))}
              </div>
              {/* Mouth */}
              <div className="absolute w-20 h-[4px] bg-[#05180F] rounded-full
                transition-all duration-200 ease-out"
                style={{
                  left: 40 + (yellowPos.faceX || 0),
                  top:  88 + (yellowPos.faceY || 0),
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-20 flex items-center gap-6 text-xs font-mono text-[#CFF1D2]/60">
          <Link to="/privacy" className="hover:text-[#92FF5F] transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#92FF5F] transition-colors">Terms of Service</Link>
          <Link to="/about" className="hover:text-[#92FF5F] transition-colors">About R_Cloud</Link>
        </div>

        {/* Decorative glowing blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(146,255,95,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 size-72 bg-[#92FF5F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-[#0F3B27]/60 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Right — Sign-in panel ─────────────────────────── */}
      <div className="flex items-center justify-center p-8 bg-[#05180F] text-[#F7F9F7] overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 text-lg font-semibold mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#92FF5F] flex items-center justify-center text-[#05180F] font-bold font-mono">
              R
            </div>
            <span className="font-manrope font-bold text-xl text-[#F7F9F7]">R_Cloud</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 font-manrope text-[#F7F9F7]">
              {mode === 'signup' ? 'Create your account' : 'Welcome back!'}
            </h1>
            <p className="text-[#CFF1D2]/75 text-sm font-inter">
              {mode === 'signup'
                ? 'Deploy your first AI agent in minutes'
                : 'Sign in to your R_Cloud autonomous control plane'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-500/40 text-red-200 text-sm rounded-xl font-mono">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          {isLoading ? (
            <div className="w-full h-14 flex items-center justify-center gap-3 bg-[#0F3B27] border border-[#CFF1D2]/25 rounded-xl text-[#92FF5F] font-semibold text-base font-manrope">
              <Loader2 className="size-5 animate-spin" />
              Signing you in…
            </div>
          ) : (
            <div className="flex justify-center p-2 rounded-2xl bg-[#0F3B27]/40 border border-[#CFF1D2]/15 shadow-inner">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                size="large"
                width="380"
                text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                shape="rectangular"
                logo_alignment="left"
                theme="filled_black"
              />
            </div>
          )}

          <p className="text-center text-xs text-[#CFF1D2]/60 mt-6 px-4 leading-relaxed font-inter">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-[#92FF5F] hover:underline font-medium">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[#92FF5F] hover:underline font-medium">Privacy Policy</Link>.
            We only use your Google account to verify your identity.
          </p>

          {/* Switch mode */}
          <p className="text-center text-sm text-[#CFF1D2]/75 mt-8 font-inter">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={mode === 'signup' ? '/login' : '/signup'} className="text-[#92FF5F] font-bold hover:underline font-manrope ml-1">
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export { AuthPage }
export type { AuthPageProps }
