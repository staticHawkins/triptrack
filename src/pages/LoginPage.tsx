import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(196,98,45,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 20%, rgba(42,125,111,0.15) 0%, transparent 60%),
          #1A1A2E
        `,
      }}
    >
      <div className="w-full max-w-[380px] text-center">
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-[18px] mx-auto mb-7 flex items-center justify-center"
          style={{ background: '#1A1A2E', border: '1.5px solid rgba(232,137,90,0.25)' }}
        >
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '38px',
              fontWeight: 700,
              color: '#E8895A',
              lineHeight: 1,
            }}
          >
            T
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-[36px] font-bold leading-[1.15] mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8' }}
        >
          Plan trips.
          <br />
          <em style={{ color: '#E8895A', fontStyle: 'normal' }}>Track every dollar.</em>
        </h1>

        {/* Subheading */}
        <p
          className="text-[15px] leading-relaxed mb-10"
          style={{ color: '#8888A4' }}
        >
          Build day-by-day itineraries and watch your budget in real time — from planning to landing.
        </p>

        {/* Google OAuth button */}
        <button
          onClick={signInWithGoogle}
          className="w-full py-[14px] px-5 rounded-xl flex items-center justify-center gap-3 text-[15px] font-semibold cursor-pointer border-none"
          style={{
            background: '#FFFFFF',
            color: '#1A1A2E',
            fontFamily: 'inherit',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Google logo */}
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>

        <p
          className="mt-6 text-[12px] leading-relaxed"
          style={{ color: 'rgba(136,136,164,0.6)' }}
        >
          Your trips sync across all your devices.
          <br />
          No password needed.
        </p>
      </div>
    </div>
  )
}
