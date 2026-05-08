import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient, { getApiErrorMessage } from '../utils/apiClient'
import { persistAuthSession } from '../utils/auth'
import etherxLogo from '../assets/etherx_transparent.png'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await apiClient.post('/api/auth/register', { name, email, password })
      if (res.data.success) {
        persistAuthSession({ token: res.data.data.token, user: res.data.data.user })
        navigate('/')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Cannot connect to server. Make sure backend is running.'))
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      <div className="auth-aurora" aria-hidden="true" />

      {/* Logo top left */}
      <div style={s.logoCorner}>
        <img src={etherxLogo} alt="EtherX Meet" style={s.cornerLogo} />
      </div>

      <button style={s.helpBtn} onClick={() => {}}>Help</button>

      <div style={s.wrap}>
        <motion.div
          style={s.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div style={s.cardHeader}>
            <img src={etherxLogo} alt="EtherX Meet" style={s.cardLogo} />
            <div style={s.cardDivider} />
            <span style={s.cardBrand}>ETHERXMEET</span>
          </div>

          <h1 style={s.title}>Create account</h1>
          <p style={s.subtitle}>Sign up to start using EtherXMeet</p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.errorBox}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>FULL NAME</label>
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Vinay GK"
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>EMAIL</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ ...s.input, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={s.eyeBtn}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>CONFIRM PASSWORD</label>
              <input
                className="auth-input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                style={s.input}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-cta" style={{ ...s.ctaBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={s.bottomText}>
            Already have an account?{' '}
            <Link to="/login" style={s.createLink}>Sign in</Link>
          </p>

          <p style={s.termsText}>
            By creating an account you agree to our{' '}
            <a href="#" style={s.createLink}>Terms</a> and{' '}
            <a href="#" style={s.createLink}>Privacy Policy</a>
          </p>
        </motion.div>
      </div>

      <footer style={s.footer}>
        <a href="#" style={s.footerLink}>Privacy</a>
        <a href="#" style={s.footerLink}>Terms</a>
        <a href="#" style={s.footerLink}>Help</a>
      </footer>
    </div>
  )
}

const css = `
  .auth-aurora {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: #000;
    overflow: hidden;
  }
  .auth-aurora::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -60%;
    left: -40%;
    background: conic-gradient(
      from 200deg at 40% 35%,
      transparent 0deg,
      rgba(180,130,40,0.18) 30deg,
      transparent 60deg,
      transparent 120deg,
      rgba(160,110,20,0.12) 150deg,
      transparent 180deg
    );
    animation: auroraRotate 18s linear infinite;
    transform-origin: 50% 50%;
  }
  .auth-aurora::after {
    content: '';
    position: absolute;
    width: 160%;
    height: 160%;
    top: 10%;
    right: -30%;
    background: conic-gradient(
      from 20deg at 70% 60%,
      transparent 0deg,
      rgba(200,150,50,0.1) 25deg,
      transparent 55deg
    );
    animation: auroraRotate 24s linear infinite reverse;
    transform-origin: 50% 50%;
  }
  @keyframes auroraRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .auth-input:focus {
    border-color: #D4B571 !important;
    outline: none;
  }
  .auth-cta:hover:not(:disabled) {
    filter: brightness(1.08);
  }
`

const s = {
  page: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, Roboto, sans-serif',
    color: '#e8eaed',
    position: 'relative',
  },
  logoCorner: {
    position: 'fixed',
    top: 16,
    left: 20,
    zIndex: 10,
  },
  cornerLogo: {
    height: 110,
    width: 'auto',
  },
  helpBtn: {
    position: 'fixed',
    top: 20,
    right: 24,
    zIndex: 10,
    background: 'transparent',
    border: '1px solid #D4B571',
    color: '#D4B571',
    padding: '6px 18px',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  wrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: 'rgba(10,10,10,0.92)',
    border: '1px solid rgba(212,181,113,0.2)',
    borderRadius: 16,
    padding: '40px 44px',
    backdropFilter: 'blur(12px)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  cardLogo: {
    height: 36,
    width: 'auto',
  },
  cardDivider: {
    width: 1,
    height: 24,
    background: 'rgba(212,181,113,0.4)',
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#D4B571',
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #C9A84C 0%, #D4B571 50%, #B8922A 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    margin: '0 0 28px',
    lineHeight: 1.5,
  },
  errorBox: {
    background: 'rgba(234,67,53,0.1)',
    border: '1px solid rgba(234,67,53,0.3)',
    color: '#f28b82',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#888',
  },
  input: {
    width: '100%',
    background: '#fff',
    border: '1.5px solid #e0e0e0',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#111',
    fontFamily: 'Inter, Roboto, sans-serif',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  ctaBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #C9A84C 0%, #D4B571 50%, #B8922A 100%)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '13px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, Roboto, sans-serif',
    letterSpacing: '0.01em',
    marginTop: 4,
    transition: 'filter 0.15s',
  },
  bottomText: {
    fontSize: 13,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  createLink: {
    color: '#4db8a0',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footer: {
    display: 'flex',
    gap: 24,
    justifyContent: 'center',
    padding: '16px 24px',
    position: 'relative',
    zIndex: 1,
  },
  footerLink: {
    fontSize: 12,
    color: '#555',
    textDecoration: 'none',
  },
}
