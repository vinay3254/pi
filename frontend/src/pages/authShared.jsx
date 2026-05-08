export const AUTH_CSS = `
  .a-placeholder::placeholder { color: #666; }
  .a-social:hover  { background: #f0f0f0 !important; }
  .a-cta:hover:not(:disabled) { background: #2a2a2c !important; }
  .a-close:hover   { color: #e5e1e4 !important; }
  .a-input:focus   { border-color: #555 !important; }
`

export const s = {
  page: {
    minHeight: '100vh',
    background: '#131315',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center top, rgba(255,255,255,0.15) 0%, rgba(19,19,21,0) 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoCorner: {
    position: 'fixed',
    top: 20,
    left: 24,
    zIndex: 10,
  },
  center: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#e5e1e4',
    textAlign: 'center',
    margin: '0 0 32px',
    fontFamily: 'Inter, sans-serif',
  },
  socialGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  socialBtn: {
    width: '100%',
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  errorBox: {
    width: '100%',
    background: 'rgba(147,0,10,0.35)',
    border: '1px solid rgba(255,180,171,0.3)',
    color: '#ffb4ab',
    padding: '10px 14px',
    borderRadius: 8,
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1.45,
    boxSizing: 'border-box',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  inputWrap: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    background: '#171717',
    border: '1px solid #333333',
    borderRadius: 12,
    padding: '12px 16px 12px 44px',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#e5e1e4',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    color: '#666',
  },
  ctaBtn: {
    width: '100%',
    background: '#1c1b1d',
    color: '#c8c8c8',
    border: 'none',
    borderRadius: 12,
    padding: '13px 16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'background 0.15s',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#aaa',
    cursor: 'pointer',
    marginTop: 20,
    padding: 0,
    transition: 'color 0.15s',
  },
  footer: {
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    color: '#aaa',
    marginTop: 16,
    textAlign: 'center',
  },
  footerLink: {
    color: '#D4B571',
    textDecoration: 'underline',
    fontWeight: 500,
  },
}

export function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.56.06 2.89.62 3.77 1.81-3.21 1.95-2.69 6.27.68 7.62-.7 1.68-1.57 3.32-3.03 3.54zm-4.32-15.1c-.2-1.6 1.15-3.13 2.68-3.35.43 1.76-1.16 3.26-2.68 3.35z" />
    </svg>
  )
}

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
