import { useState, useEffect, useRef } from 'react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, GitBranch, Sparkles, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

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

/* ─── Main Login Page ────────────────────────────────────── */
interface AuthPageProps {
  onClose?: () => void
  mode?: 'signin' | 'signup'
}

function AuthPage({ onClose, mode = 'signup' }: AuthPageProps) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword]     = useState(false)
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [name, setName]                     = useState('')
  const [error, setError]                   = useState('')
  const [isLoading, setIsLoading]           = useState(false)
  const [mouseX, setMouseX]                 = useState(0)
  const [mouseY, setMouseY]                 = useState(0)
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false)
  const [isBlackBlinking, setIsBlackBlinking]   = useState(false)
  const [isTyping, setIsTyping]             = useState(false)
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking]           = useState(false)

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

  /* look at each other when typing starts */
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true)
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800)
      return () => clearTimeout(t)
    } else {
      setIsLookingAtEachOther(false)
    }
  }, [isTyping])

  /* purple sneaky peek when password is visible */
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true)
        setTimeout(() => setIsPurplePeeking(false), 800)
      }, Math.random() * 3000 + 2000)
      return () => clearTimeout(t)
    } else {
      setIsPurplePeeking(false)
    }
  }, [password, showPassword, isPurplePeeking])

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

  const hidingPassword = isTyping || (password.length > 0 && !showPassword)
  const lookingAway    = password.length > 0 && showPassword

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 400))
    // Demo: accept any non-empty creds
    if (email && password) {
      alert(`Welcome to R Agent Cloud! 🚀\n\nYou're in, ${name || email.split('@')[0]}.`)
      navigate('/')
    } else {
      setError('Please fill in all required fields.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      {/* Close button */}
      <Link
        to="/"
        className="absolute top-4 right-4 z-50 p-2 rounded-full
          bg-black/20 hover:bg-black/40 text-white transition-colors"
        aria-label="Close"
      >
        <X className="size-5" />
      </Link>

      {/* ── Left — Characters panel ──────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between
        bg-gradient-to-br from-[#7b39fc]/90 via-[#7b39fc] to-[#2b2344]/80
        p-12 text-white overflow-hidden">

        {/* Brand */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold">
          <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm
            flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span className="font-manrope">R Agent Cloud</span>
        </div>

        {/* Characters */}
        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: 550, height: 400 }}>

            {/* Purple — back */}
            <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 70, width: 180,
                height: hidingPassword ? 440 : 400,
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0', zIndex: 1,
                transform: lookingAway
                  ? 'skewX(0deg)'
                  : hidingPassword
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: lookingAway ? 20 : isLookingAtEachOther ? 55 : 45 + purplePos.faceX,
                  top:  lookingAway ? 35 : isLookingAtEachOther ? 65 : 40 + purplePos.faceY,
                }}
              >
                {[0, 1].map(i => (
                  <EyeBall key={i} size={18} pupilSize={7} maxDistance={5}
                    eyeColor="white" pupilColor="#2D2D2D"
                    isBlinking={isPurpleBlinking}
                    forceLookX={lookingAway ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                    forceLookY={lookingAway ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Black — middle */}
            <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 240, width: 120, height: 310,
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0', zIndex: 2,
                transform: lookingAway
                  ? 'skewX(0deg)'
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : `skewX(${(blackPos.bodySkew || 0) * (hidingPassword ? 1.5 : 1)}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: lookingAway ? 10 : isLookingAtEachOther ? 32 : 26 + blackPos.faceX,
                  top:  lookingAway ? 28 : isLookingAtEachOther ? 12 : 32 + blackPos.faceY,
                }}
              >
                {[0, 1].map(i => (
                  <EyeBall key={i} size={16} pupilSize={6} maxDistance={4}
                    eyeColor="white" pupilColor="#2D2D2D"
                    isBlinking={isBlackBlinking}
                    forceLookX={lookingAway ? -4 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={lookingAway ? -4 : isLookingAtEachOther ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Orange — front left */}
            <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 0, width: 240, height: 200,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0', zIndex: 3,
                transform: lookingAway ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: lookingAway ? 50 : 82 + (orangePos.faceX || 0),
                  top:  lookingAway ? 85 : 90 + (orangePos.faceY || 0),
                }}
              >
                {[0, 1].map(i => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D"
                    forceLookX={lookingAway ? -5 : undefined}
                    forceLookY={lookingAway ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Yellow — front right */}
            <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 310, width: 140, height: 230,
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0', zIndex: 4,
                transform: lookingAway ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: lookingAway ? 20 : 52 + (yellowPos.faceX || 0),
                  top:  lookingAway ? 35 : 40 + (yellowPos.faceY || 0),
                }}
              >
                {[0, 1].map(i => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D"
                    forceLookX={lookingAway ? -5 : undefined}
                    forceLookY={lookingAway ? -4 : undefined}
                  />
                ))}
              </div>
              {/* Mouth */}
              <div className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full
                transition-all duration-200 ease-out"
                style={{
                  left: lookingAway ? 10 : 40 + (yellowPos.faceX || 0),
                  top:  lookingAway ? 88 : 88 + (yellowPos.faceY || 0),
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
          {['Privacy Policy', 'Terms of Service', 'Docs'].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        {/* Decorative blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* ── Right — Form panel ───────────────────────────── */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2
            text-lg font-semibold mb-10">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span className="font-manrope">R Agent Cloud</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-manrope">
              {mode === 'signup' ? 'Create your account' : 'Welcome back!'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'signup'
                ? 'Deploy your first AI agent in minutes'
                : 'Sign in to your R Agent Cloud dashboard'}
            </p>
          </div>


          {/* Social */}
          <div className="mt-4">
            <Button variant="outline"
              className="w-full h-12 border-border/60 hover:bg-accent font-manrope"
              type="button">
              <svg className="mr-2 size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-muted-foreground mt-7">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={mode === 'signup' ? '/login' : '/signup'} className="text-foreground font-medium hover:underline">
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
